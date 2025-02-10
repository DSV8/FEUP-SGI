import * as THREE from 'three';
import { MyMaterialBuilder } from '../MyMaterialBuilder.js';

class MySceneData {

  constructor() {
    // global attributes
    this.options = null;
    this.fog = null;
    this.skybox = null;

    // visual attributes
    this.materials = []
    this.lights = [];
    this.textures = [];
    this.objects = [];

    // camera attributes
    this.cameras = [];
    this.activeCameraId = null;

    // graph attributes
    this.nodes = [];
    this.rootId = null;

    this.descriptors = [];

    this.materialBuilder = new MyMaterialBuilder(this);

    this.customAttributeName = "custom"

    this.descriptors["globals"] = [
      { name: "background", type: "rgb" },
      { name: "ambient", type: "rgb" },
    ]

    this.descriptors["fog"] = [
      { name: "color", type: "rgb" },
      { name: "near", type: "float" },
      { name: "far", type: "float" },
    ]

    this.descriptors["texture"] = [
      { name: "id", type: "string" },
      { name: "filepath", type: "string" },
      { name: "isVideo", type: "boolean", required: false, default: false }, // a nice way to see if the texture is a video or not            
      { name: "magFilter", type: "string", required: false, default: "LinearFilter" },
      { name: "minFilter", type: "string", required: false, default: "LinearMipmapLinearFilter" },
      { name: "mipmaps", type: "boolean", required: false, default: true }, // by default threejs generates mipmaps for you
      { name: "anisotropy", type: "integer", required: false, default: 1 }, // default is 1. A higher value gives a less blurry result than a basic mipmap, at the cost of more texture samples being used
      { name: "mipmap0", type: "string", required: false, default: "" },
      { name: "mipmap1", type: "string", required: false, default: "" },
      { name: "mipmap2", type: "string", required: false, default: "" },
      { name: "mipmap3", type: "string", required: false, default: "" },
      { name: "mipmap4", type: "string", required: false, default: "" },
      { name: "mipmap5", type: "string", required: false, default: "" },
      { name: "mipmap6", type: "string", required: false, default: "" },
      { name: "mipmap7", type: "string", required: false, default: "" },
    ]


    this.descriptors["material"] = [
      { name: "id", type: "string" },
      { name: "color", type: "rgb" },
      { name: "emissive", type: "rgb" },
      { name: "specular", type: "rgb" },
      { name: "shininess", type: "float" },
      { name: "transparent", type: "boolean", required: false, default: false },
      { name: "opacity", type: "float", required: false, default: 1.0 },
      { name: "wireframe", type: "boolean", required: false, default: false },
      { name: "shading", type: "boolean", required: false, default: false },
      { name: "textureref", type: "string", required: false, default: null }, // The color map. May optionally include an alpha channel. The texture map color is modulated by the diffuse color. Default null.
      { name: "texlength_s", type: "float", required: false, default: 1.0 },
      { name: "texlength_t", type: "float", required: false, default: 1.0 },
      { name: "twosided", type: "boolean", required: false, default: false },
      { name: "bumpref", type: "string", required: false, default: null },
      { name: "bumpscale", type: "float", required: false, default: 1.0 },
      { name: "specularref", type: "string", required: false, default: null },
      { name: "specularscale", type: "float", required: false, default: 1.0 },
    ]

    this.descriptors["orthogonal"] = [
      { name: "id", type: "string" },
      { name: "type", type: "string" },
      { name: "near", type: "float" },
      { name: "far", type: "float" },
      { name: "location", type: "vector3" },
      { name: "target", type: "vector3" },
      { name: "left", type: "float" },
      { name: "right", type: "float" },
      { name: "bottom", type: "float" },
      { name: "top", type: "float" },
    ]

    this.descriptors["perspective"] = [
      { name: "id", type: "string" },
      { name: "type", type: "string" },
      { name: "angle", type: "float" },
      { name: "near", type: "float" },
      { name: "far", type: "float" },
      { name: "location", type: "vector3" },
      { name: "target", type: "vector3" }
    ]

    this.descriptors["cylinder"] = [
      { name: "type", type: "string" },
      { name: "base", type: "float" },
      { name: "top", type: "float" },
      { name: "height", type: "float" },
      { name: "slices", type: "integer" },
      { name: "stacks", type: "integer" },
      { name: "capsclose", type: "boolean", required: false, default: true },
      { name: "thetastart", type: "float", required: false, default: 0.0 },
      { name: "thetalength", type: "float", required: false, default: 360.0 }
    ]

    /*
        In the following primitives, distance is to be used with LODs (later classes)
    */
    this.descriptors["rectangle"] = [
      { name: "type", type: "string" },
      { name: "xy1", type: "vector2" },
      { name: "xy2", type: "vector2" },
      { name: "parts_x", type: "integer", required: false, default: 1 },
      { name: "parts_y", type: "integer", required: false, default: 1 }
    ]

    this.descriptors["triangle"] = [
      { name: "type", type: "string" },
      { name: "xyz1", type: "vector3" },
      { name: "xyz2", type: "vector3" },
      { name: "xyz3", type: "vector3" }
    ]

    this.descriptors["circle"] = [
      { "name": "type", type: "string" },
      { name: "radius", type: "float" },
      { name: "segments", type: "integer", required: false, default: 32 },
      { name: "thetastart", type: "float", required: false, default: 0.0 },
      { name: "thetalength", type: "float", required: false, default: 360.0 }
    ]

    this.descriptors["model3d"] = [
      { name: "type", type: "string" },
      { name: "filepath", type: "string" },
      { name: "distance", type: "float", required: false, default: 0.0 } // The distance at which to display this level of detail. Default 0.0.  
    ]

    this.descriptors["sphere"] = [
      { name: "type", type: "string" },
      { name: "radius", type: "float" },
      { name: "slices", type: "integer" },
      { name: "stacks", type: "integer" },
      { name: "thetastart", type: "float", required: false, default: 0.0 },
      { name: "thetalength", type: "float", required: false, default: 180.0 },
      { name: "phistart", type: "float", required: false, default: 0.0 },
      { name: "philength", type: "float", required: false, default: 360.0 }
    ]

    this.descriptors["box"] = [
      { name: "type", type: "string" },
      { name: "xyz1", type: "vector3" },
      { name: "xyz2", type: "vector3" },
      { name: "parts_x", type: "integer", required: false, default: 1 },
      { name: "parts_y", type: "integer", required: false, default: 1 },
      { name: "parts_z", type: "integer", required: false, default: 1 }
    ]

    this.descriptors["lathe"] = [
      { name: "type", type: "string" },
      { name: "segments", type: "integer", required: false, default: 12 },
      { name: "phistart", type: "float", required: false, default: 0.0 },
      { name: "philength", type: "float", required: false, default: 360.0 }
    ]

    this.descriptors["torus"] = [
      { name: "type", type: "string" },
      { name: "radius", type: "float", required: false, default: 1.0 },
      { name: "tuberadius", type: "float", required: false, default: 0.4 },
      { name: "radialsegments", type: "integer", required: false, default: 12 },
      { name: "tubularsegments", type: "integer", required: false, default: 48 }
    ]

    this.descriptors["coil"] = [
      { name: "type", type: "string" },
      { name: "radius", type: "float", required: false, default: 1.0 },
      { name: "height", type: "float", required: false, default: 4.0 },
      { name: "turns", type: "float", required: false, default: 6.0 },
      { name: "tubularsegments", type: "integer", required: false, default: 200 },
      { name: "tuberadius", type: "float", required: false, default: 0.15 },
      { name: "radialsegments", type: "integer", required: false, default: 8 },
      { name: "closed", type: "boolean", required: false, default: false },
    ]

    this.descriptors["nurbs"] = [
      { name: "type", type: "string" },
      { name: "degree_u", type: "integer" },
      { name: "degree_v", type: "integer" },
      { name: "parts_u", type: "integer" },
      { name: "parts_v", type: "integer" },
      { name: "controlpoints", type: "list", listOf: "controlpoint" }
    ]

    this.descriptors["controlpoint"] = [
      { name: "position", type: "vector3" }
    ]

    this.descriptors["track"] = [
      { name: "type", type: "string" },
      { name: "width", type: "float" },
      { name: "trackpoints", type: "list", listOf: "point" }
    ]

    this.descriptors["route"] = [
      { name: "type", type: "string" },
      { name: "routepoints", type: "list", listOf: "point" }
    ]

    this.descriptors["point"] = [
      { name: "position", type: "vector3" }
    ]

    this.descriptors["skybox"] = [
      { name: "size", type: "vector3" },
      { name: "center", type: "vector3" },
      { name: "emissive", type: "rgb" },
      { name: "intensity", type: "float" },
      { name: "front", type: "string" }, // front textureref
      { name: "back", type: "string" }, // back textureref
      { name: "up", type: "string" }, // up textureref
      { name: "down", type: "string" }, // down textureref
      { name: "left", type: "string" }, // left textureref
      { name: "right", type: "string" } // right textureref
    ]

    this.descriptors["polygon"] = [
      { name: "type", type: "string" },
      { name: "radius", type: "float" },
      { name: "stacks", type: "integer" },
      { name: "slices", type: "integer" },
      { name: "color_c", type: "rgb" },
      { name: "color_p", type: "rgb" },
    ]

    this.descriptors["spotlight"] = [
      { name: "type", type: "string" },
      { name: "id", type: "string" },
      { name: "color", type: "rgb" },
      { name: "position", type: "vector3" },
      { name: "target", type: "vector3" },
      { name: "angle", type: "float" },
      { name: "enabled", type: "boolean", required: false, default: true },
      { name: "intensity", type: "float", required: false, default: 1.0 },
      { name: "distance", type: "float", required: false, default: 1000 },
      { name: "decay", type: "float", required: false, default: 2.0 },
      { name: "penumbra", type: "float", required: false, default: 1.0 },
      { name: "castshadow", type: "boolean", required: false, default: false },
      { name: "shadowfar", type: "float", required: false, default: 500.0 },
      { name: "shadowmapsize", type: "integer", required: false, default: 512 }
    ]

    this.descriptors["pointlight"] = [
      { name: "type", type: "string" },
      { name: "id", type: "string" },
      { name: "color", type: "rgb" },
      { name: "position", type: "vector3" },
      { name: "enabled", type: "boolean", required: false, default: true },
      { name: "intensity", type: "float", required: false, default: 1.0 },
      { name: "distance", type: "float", required: false, default: 1000 },
      { name: "decay", type: "float", required: false, default: 2.0 },
      { name: "castshadow", type: "boolean", required: false, default: false },
      { name: "shadowfar", type: "float", required: false, default: 500.0 },
      { name: "shadowmapsize", type: "integer", required: false, default: 512 }
    ]

    this.descriptors["directionallight"] = [
      { name: "type", type: "string" },
      { name: "id", type: "string" },
      { name: "color", type: "rgb" },
      { name: "position", type: "vector3" },
      { name: "enabled", type: "boolean", required: false, default: true },
      { name: "intensity", type: "float", required: false, default: 1.0 },
      { name: "castshadow", type: "boolean", required: false, default: false },
      { name: "shadowleft", type: "float", required: false, default: -5.0 },
      { name: "shadowright", type: "float", required: false, default: 5.0 },
      { name: "shadowbottom", type: "float", required: false, default: -5.0 },
      { name: "shadowtop", type: "float", required: false, default: 5.0 },
      { name: "shadowfar", type: "float", required: false, default: 500.0 },
      { name: "shadowmapsize", type: "integer", required: false, default: 512 }
    ]

    this.primaryNodeIds = ["globals", "fog", "textures", "materials", "cameras", "graph"]

    this.primitiveIds = ["box", "sphere", "cylinder", "triangle", "rectangle", "circle", "polygon", "lathe", "torus", "coil", "nurbs", "model3d", "skybox", "track", "route"]

    this.lightIds = ["spotlight", "pointlight", "directionallight"]
  }

  clear(){
    // visual attributes
    this.materials = []
    this.lights = [];
    this.textures = [];
    this.objects = [];

    // camera attributes
    this.cameras = [];
  }

  getGraph() {
    return this.nodes;
  }

  /**
   * Creates a custom attribute apart from the already existing ones, if needed
   * @param {*} obj 
   */
  createCustomAttributeIfNotExists(obj) {
    if (obj[this.customAttributeName] === undefined || obj[this.customAttributeName] === null) obj[this.customAttributeName] = {}
  }

  setOptions(options) {
    this.options = options;
    this.createCustomAttributeIfNotExists(options)
    //console.debug("added options " + JSON.stringify(options));
  }

  getOptions() {
    return this.options;
  }

  setFog(fog) {
    this.fog = fog;
    this.createCustomAttributeIfNotExists(fog)
    //console.debug("added fog " + JSON.stringify(fog));
  }

  getFog() {
    return this.fog;
  }

  setSkybox(skybox) {
    this.skybox = skybox;
    this.createCustomAttributeIfNotExists(skybox)
    //console.debug("added skybox " + JSON.stringify(skybox));
  }

  getSkybox() {
    return this.skybox;
  }

  setRootId(rootId) {
    //console.debug("set graph root id to '" + rootId + "'");
    this.rootId = rootId;
  }

  getMaterial(id) {
    let value = this.materials[id]
    if (value === undefined) return null
    return value
  }

  addMaterial(material) {
    let obj = this.getMaterial(material.id);
    if (obj !== null && obj !== undefined) {
      throw new Error("inconsistency: a material with id " + material.id + " already exists!");
    }
    this.materials[material.id] = material;
    this.createCustomAttributeIfNotExists(material)
    //console.debug("added material " + JSON.stringify(material));
  };

  addTexture(texture) {
    let obj = this.getTexture(texture.id);
    if (obj !== null && obj !== undefined) {
      throw new Error("inconsistency: a texture with id " + texture.id + " already exists!");
    }
    this.textures[texture.id] = texture;
    this.createCustomAttributeIfNotExists(texture)
    //console.debug("added texture" + JSON.stringify(texture))
  };

  getTexture(id) {
    let value = this.textures[id]
    if (value === undefined) return null
    return value
  };

  setActiveCameraId(id) {
    console.debug("set active camera id to '" + id + "'");
    return this.activeCameraId = id;
  }

  getCamera(id) {
    let value = this.cameras[id]
    if (value === undefined) return null
    return value
  };

  setActiveCamera(id) {
    this.activeCameraId = id;
  }

  addCamera(camera) {
    if (camera.type !== "orthogonal" && camera.type !== "perspective") {
      throw new Error("inconsistency: unsupported camera type " + camera.type + "!");
    }

    let obj = this.getCamera(camera.id);
    if (obj !== null && obj !== undefined) {
      throw new Error("inconsistency: a camera with id " + camera.id + " already exists!");
    }
    this.cameras[camera.id] = camera;

    this.createCustomAttributeIfNotExists(camera)
    //console.debug("added camera " + JSON.stringify(camera))
  }

  getCameras() {
    return this.cameras
  }

  getLight(id) {
    let value = this.lights[id]
    if (value === undefined) return null
    return value
  }

  addLight(light) {
    var obj = this.getLight(light.id);
    if (obj !== null && obj !== undefined) {
      throw new Error("inconsistency: a light with id " + light.id + " already exists!");
    }
    this.lights[light.id] = light;
    this.createCustomAttributeIfNotExists(light)
    //console.debug("added light " + JSON.stringify(light));
  }

  getNode(id) {
    let value = this.nodes[id];
    if (value === undefined) return null
    return value
  }

  /**
   * Creates an empty node to be filled later
   * @param {*} id 
   * @param {*} isLod is defaulted as false
   * @param {*} mindist is defaulted as 0, only used if the parent is a lod node
   * @returns the node object
   */
  createEmptyNode(id, isLod = false, mindist = 0) {
    let obj = this.getNode(id)
    if (obj !== null && obj !== undefined) {
      throw new Error("inconsistency: a node with id " + id + " already exists!");
    }

    var type = isLod ? "lod" : "node"
    obj = { id: id, transformations: [], materialIds: [], children: [], position:[], loaded: false, type: type, castshadows: false, receiveshadows: false, mindist: mindist };
    this.addNode(obj);
    return obj;
  }

  addNode(node) {
    let obj = this.getNode(node.id)
    if (obj !== null && obj !== undefined) {
      throw new Error("inconsistency: a node with id " + node.id + " already exists!");
    }
    this.nodes[node.id] = node;
    this.createCustomAttributeIfNotExists(node)
    //console.debug("added node " + JSON.stringify(node));
  };

  addChildToNode(node, child) {
    if (child === undefined) {
      throw new Error("inconsistency: undefined child add to node!");
    }

    if (node.children === undefined) {
      throw new Error("inconsistency: a node has an undefined array of children!");
    }
    node.children.push(child)
    this.createCustomAttributeIfNotExists(child)
    //console.debug("added node child" + JSON.stringify(child));
  }

  createEmptyPrimitive() {
    let obj = { type: "primitive", subtype: null, representations: [], loaded: false }
    return obj
  }

  /**
   * Update minimum distance for LOD's on the given node
   * @param {*} node 
   * @param {*} mindist 
   * @returns node with updated minimum distance
   */
  updateMinDist(node, mindist) {
    node.mindist = mindist;
    return node;
  }

  /**
   * Convert the parsed color array to a three.js color object
   * @param {*} color 
   * @returns a three.js color object
   */
  convertColor(color) {
    if (color === undefined) {
      return null
    }
    return new THREE.Color(color[0], color[1], color[2]);
  }

  // Do final checks and consolidate data structures
  async onLoadFinished(app, contents) {
    console.info("------------------ consolidating data structures ------------------");

    // check material refs and replace references with material objects
    for (var id in this.materials) {
      var mat = this.materials[id];
      if (mat !== null && mat !== undefined) {
        var material = await this.materialBuilder.createMaterial(mat)

        // swap material in material list
        this.materials[id] = material
      }
    }

    // check the skybox exists
    if (this.getSkybox() === null || this.getSkybox() === undefined) {
      throw new Error("inconsistency: skybox not found!");
    }

    //check fog exists
    if (this.getFog() === null || this.getFog() === undefined) {
      throw new Error("inconsistency: fog not found!")
    }

    // check the root not null and exists
    this.root = this.getNode(contents.rootId);
    if (this.root === null || this.root === undefined) {
      throw new Error("inconsistency: root node not found!");
    }

    // check active camera not null and exists
    this.activeCamera = this.getCamera(contents.activeCameraId);
    if (this.activeCamera === null || this.activeCamera === undefined) {
      throw new Error("inconsistency: active camera not found!");
    }

    // filter objects for sphere or cylinders
    var filteredObjects = this.objects.filter(obj => obj.subtype === "sphere" || obj.subtype === "cylinder" || obj.subtype === "lathe");

    // check phi and theta values for sphere, cylinder and lathe
    for (var i = 0; i < filteredObjects.length; i++) {
      var obj = filteredObjects[i];
      switch (obj.subtype) {
        case "sphere":
          if (obj.representations[0].phistart < 0 || obj.representations[0].phistart > 360) {
            throw new Error("inconsistency: phistart values for sphere are invalid");
          }
          if (obj.representations[0].thetastart < 0 || obj.representations[0].thetastart > 180) {
            throw new Error("inconsistency: thetastart values for sphere are invalid");
          }
          if (obj.representations[0].philength < 0 || obj.representations[0].philength > 360) {
            throw new Error("inconsistency: philength values for sphere are invalid");
          }
          if (obj.representations[0].thetalength < 0 || obj.representations[0].thetalength > 180) {
            throw new Error("inconsistency: thetalength values for sphere are invalid");
          }
          break;
        case "cylinder":
          if (obj.representations[0].thetalength < 0 || obj.representations[0].thetalength > 360) {
            throw new Error("inconsistency: thetalength values for cylinder are invalid");
          }
          if (obj.representations[0].thetastart < 0 || obj.representations[0].thetastart > 360) {
            throw new Error("inconsistency: thetastart values for cylinder are invalid");
          }
          break;
        case "lathe":
          if (obj.representations[0].phistart < 0 || obj.representations[0].phistart > 360) {
            throw new Error("inconsistency: phistart values for sphere are invalid");
          }
          if (obj.representations[0].philength < 0 || obj.representations[0].philength > 360) {
            throw new Error("inconsistency: philength values for sphere are invalid");
          }
          break;
      }
    }
    console.info("------------------ data structures consolidated ------------------");
  }
}
export { MySceneData };

