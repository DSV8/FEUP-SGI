import * as THREE from 'three';

class MyMaterialBuilder {
    constructor(sceneData) {
        this.sceneData = sceneData;
        console.log(this.sceneData)
    }

    /**
   * Processes an input image to extract its raw pixel data in RGBA format
   * @param {*} image 
   * @returns Raw pixel data (RGBA format)
   */
  convertImageToData(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext('2d');

    // Draw the image, flipping it vertically
    context.save();  // Save the current context state
    context.scale(1, -1);  // Flip the canvas vertically
    context.drawImage(image, 0, -image.height);  // Draw the image at the inverted y-coordinate
    context.restore();  // Restore the context to original state

    const imageData = context.getImageData(0, 0, image.width, image.height);
    return imageData.data;
  }

  /**
   * Load a mipmap texture from the parsed texture object
   * @param {*} texture 
   * @returns texture with loaded mipmaps
   */
  async createMipmapTexture(texture) {
    const loader = new THREE.TextureLoader(); // Create a new texture loader
    const mipmaps = [];
    let level = 0; // Start at base level
    const mipmapPromises = [];

    while (texture[`mipmap${level}`] && level < 8) { // Load up to 7 mipmaps
      const mipmapFilepath = texture[`mipmap${level}`]; // Get the mipmap filepath
      if (!mipmapFilepath) break; // Stop if there is no mipmap

      const promise = new Promise((resolve, reject) => { // Create a promise for each mipmap
        loader.load(
          mipmapFilepath,
          (texture) => resolve(texture),
          undefined,
          (err) => reject(err)
        );
      });

      mipmapPromises.push(promise); // Add the promise to the list
      level++; // Move to the next mipmap level
    }

    try {
      const loadedMipmaps = await Promise.all(mipmapPromises); // Await all mipmap promises to be resolved

      if (!loadedMipmaps[0] || !loadedMipmaps[0].image) { // Ensure the base mipmap is loaded
        throw new Error('Base mipmap is required.');
      }

      const textureLoad = new THREE.DataTexture(); // Create a new data texture

      textureLoad.mipmaps = loadedMipmaps.map((mipmap) => { // Load the rest of the mipmaps (level 1 to any remaining mipmaps)
        if (mipmap && mipmap.image) { // Ensure the mipmap exists
          const rawData = this.convertImageToData(mipmap.image); // Convert to raw pixel data
          return {
            data: rawData, // Now contains raw pixel data
            width: mipmap.image.width,
            height: mipmap.image.height
          };
        }
        return null;
      }).filter((img) => img !== null);

      textureLoad.format = THREE.RGBAFormat; // Assuming 8-bit RGBA textures
      textureLoad.type = THREE.UnsignedByteType; // Assuming 8-bit RGBA textures
      textureLoad.wrapS = THREE.ClampToEdgeWrapping;
      textureLoad.wrapT = THREE.ClampToEdgeWrapping;
      textureLoad.minFilter = THREE.LinearMipMapLinearFilter; // Use linear filtering for mipmaps
      textureLoad.magFilter = THREE.LinearFilter; // Use linear filtering for magnification
      textureLoad.generateMipmaps = false; // Do not generate mipmaps as they are already loaded

      return textureLoad;
    } catch (err) {
      console.error('Error loading mipmaps:', err);
      return null;
    }
  }


  /**
   * Creates a material object from the parsed material
   * @param {*} mat material to be created
   * @returns material object
   */
  async createMaterial(mat) {
    var hasTex = false; // boolean to verify the existence of a texture
    var textureLoad = null; // texture object to be loaded

    // check if there is a texture reference

    if (mat.textureref !== null && mat.textureref !== undefined) {
      var texture = this.sceneData.getTexture(mat.textureref); // get texture object
      if (texture !== null) { // if the object exists
        hasTex = true; // there is a texture to be loaded to the material

        if (texture.isVideo) { // if the texture is a video
          var video = document.createElement('video'); // create a video element, as the video texture loader uses an HTML video element as its data source
          video.autoplay = true; // ensures the video starts playing immediately when loaded
          video.muted = true; // some browsers require videos to be muted for autoplay to work without user interaction. It also prevents the video from playing sound (if it has any)
          video.preload = "auto"; // instructs the browser to load the video file before playback begins.
          video.loop = true; // replays the video in a loop when it reaches the end.

          var source = document.createElement('source'); // a <source> element is created and appended to the <video> element, which specifies the video file to be played.
          source.src = texture.filepath; // set the video's file path
          source.type = "video/mp4"; // indicates the MIME type 
          video.appendChild(source); // append to the video element

          textureLoad = new THREE.VideoTexture(video); // load the video texture, does not need await/promise, as we want to load it as soon as possible

          // Set appropriate filters
          textureLoad.minFilter = THREE.LinearFilter; // Linear filtering is used for minification
          textureLoad.magFilter = THREE.LinearFilter; // Linear filtering is used for magnification

        } else if (texture.mipmap0 && texture.mipmap0 !== "") { // if the texture has mipmaps, at least the base level will need to be loaded
          // Load a mipmap texture
          textureLoad = await this.createMipmapTexture(texture); // await all mipmaps to be loaded
        } else {
          // Load a normal image texture
          textureLoad = new THREE.TextureLoader().load(texture.filepath); // Does not require a promise/await, because we want to load the texture immediately
        }
      }
    }

    // convert material color variables
    mat.color = this.sceneData.convertColor(mat.color);
    mat.emissive = this.sceneData.convertColor(mat.emissive);
    mat.specular = this.sceneData.convertColor(mat.specular);

    // create the material object
    var material = new THREE.MeshPhongMaterial({
      color: mat.color,
      emissive: mat.emissive,
      specular: mat.specular,
      shininess: mat.shininess,
      transparent: mat.transparent,
      opacity: mat.opacity,
      wireframe: mat.wireframe,
      flatShading: mat.shading,
      side: mat.twosided ? THREE.DoubleSide : THREE.FrontSide, // if twosided is true, set the side to double side, else display only the front side
      map: hasTex ? textureLoad : null // if there is a texture, load it
    });

    // set extra attributes to the material for future use (loading texture to primitive objects)
    material.texlength_s = mat.texlength_s;
    material.texlength_t = mat.texlength_t;

    // Check for and add bump mapping
    if (mat.bumpref) {
      const bumpTexture = this.sceneData.getTexture(mat.bumpref); // get the bump texture
      if (bumpTexture) {
        const bumpMap = new THREE.TextureLoader().load(bumpTexture.filepath); // load the bump texture
        material.bumpMap = bumpMap; // apply the bump map to the material
        material.bumpScale = mat.bumpscale; // set the bump scale to the material
      } else {
        console.error('Bump texture not found:', mat.bumpref);
      }
    }

    // Check for and add specular map
    if (mat.specularref) {
      const specularTexture = this.sceneData.getTexture(mat.specularref); // get the specular texture
      if (specularTexture) {
        const specularMap = new THREE.TextureLoader().load(specularTexture.filepath); // load the specular texture
        material.specularMap = specularMap; // apply the specular map to the material
      } else {
        console.error('Specular texture not found:', mat.specularref);
      }
    }

    material.name = mat.id; // set the material id for future checks

    return material
  }
}

export { MyMaterialBuilder };