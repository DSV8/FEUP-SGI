import * as THREE from 'three';

class MyLandscape {
    constructor(width, height, displacement, angle, texturePath) {
        this.width = width;
        this.height = height;
        this.displacement = displacement;
        this.angle = angle;
        this.texturePath = texturePath;

        // Landscape related attributes
        this.landscape = null;

        this.landscapeEnabled = true;
        this.lastLandscapeEnabled = null;

        // Landscape texutre
        this.landscapeTexture = new THREE.TextureLoader().load(this.texturePath);
        this.landscapeTexture.wrapS = THREE.ClampToEdgeWrapping;
        this.landscapeTexture.wrapT = THREE.ClampToEdgeWrapping;
    }

    buildLandscape() {
        // Create landscape material
        let landscapeMaterial = new THREE.MeshPhongMaterial({ color: "rgb(128,128,128)", specular: "rgb(0,0,0)", emissive: "rgb(0,0,0)", shininess: 10, map: this.landscapeTexture });

        // Create landscape geometry
        let landscapeGeometry = new THREE.PlaneGeometry(this.width, this.height);

        // Create landscape mesh
        this.landscape = new THREE.Mesh(landscapeGeometry, landscapeMaterial);
        this.landscape.position.set(this.displacement.x, this.displacement.y, this.displacement.z);
        this.landscape.rotation.y = this.angle;
    }

    addToScene(scene) {
        if(this.landscape) scene.add(this.landscape);
    }

    removeFromScene(scene) {
        if(this.landscape) scene.remove(this.landscape);
    }

    /**
     * Rebuilds landscape mesh if required
     */
    rebuildLandscape(scene) {
        if (this.landscapeEnabled !== this.lastLandscapeEnabled) {
            this.lastLandscapeEnabled = this.landscapeEnabled;
            if (this.landscapeEnabled) {
                scene.add(this.landscape);
            }
            else {
                scene.remove(this.landscape);
            }
        }
    }

    /**
     * updates the landscape mesh if required
     */
    updateLandscapeIfRequired(scene) {
        this.rebuildLandscape(scene);
    }
}

export { MyLandscape };