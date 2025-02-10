import * as THREE from 'three';

class MyCake {
    constructor(radius, displacement) {
        this.radius = radius;
        this.displacement = displacement;

        // Cake related attributes
        this.slicedCake = null;
        this.cakeBlock1 = null;
        this.cakeBlock2 = null;

        this.cakeEnabled = true;
        this.lastCakeEnabled = null;

        // Cake Exterior Texture
        this.cakeOuterTexture = new THREE.TextureLoader().load('./textures/cake_exterior.jpg');
        this.cakeOuterTexture.wrapS = THREE.RepeatWrapping;
        this.cakeOuterTexture.wrapT = THREE.RepeatWrapping;
        this.cakeOuterTexture.repeat.set(3, 3);

        // Cake Interior Texture
        this.cakeInnerTexture = new THREE.TextureLoader().load('./textures/cake_interior.jpg');
        this.cakeInnerTexture.wrapS = THREE.RepeatWrapping;
        this.cakeInnerTexture.wrapT = THREE.RepeatWrapping;
        this.cakeInnerTexture.repeat.set(1, 1);
    }

    buildCake() {
        // Cake Material
        var cakeMaterial = new THREE.MeshPhongMaterial({ color: "#3b1d14", specular: "#000000", emissive: "#000000", shininess: 0, map: this.cakeOuterTexture });
        var cakeBlockMaterial = new THREE.MeshPhongMaterial({ color: "#3b1d14", specular: "#000000", emissive: "#000000", shininess: 0, side: THREE.DoubleSide, map: this.cakeInnerTexture });

        // Cake Geometry
        var cakeGeometry = new THREE.CylinderGeometry(this.radius, this.radius, 1, 50, 2, false, 0, Math.PI * 1.80);
        var cakePlaneBlockGeometry = new THREE.PlaneGeometry(this.radius, 1);

        // Cake Mesh
        this.slicedCake = new THREE.Mesh(cakeGeometry, cakeMaterial);
        this.slicedCake.position.set(this.displacement.x, this.displacement.y, this.displacement.z);
        this.slicedCake.receiveShadow = true;
        this.slicedCake.castShadow = true;

        // Cake Blocks Mesh so that the inside of the cake cylinder is not visible
        this.cakeBlock1 = new THREE.Mesh(cakePlaneBlockGeometry, cakeBlockMaterial);
        this.cakeBlock1.position.set(this.displacement.x, this.displacement.y, this.displacement.z + this.radius / 2);
        this.cakeBlock1.rotation.y = Math.PI / 2;
        this.cakeBlock1.receiveShadow = true;
        this.cakeBlock1.castShadow = true;

        this.cakeBlock2 = new THREE.Mesh(cakePlaneBlockGeometry, cakeBlockMaterial);
        this.cakeBlock2.rotation.y = Math.PI * 0.8 + Math.PI / 2;
        this.cakeBlock2.position.set(this.displacement.x + Math.cos(this.cakeBlock2.rotation.y) * this.radius / 2, this.displacement.y, this.displacement.z - Math.sin(this.cakeBlock2.rotation.y) * this.radius / 2);
        this.cakeBlock2.receiveShadow = true;
        this.cakeBlock2.castShadow = true;

        // Create Cake Group
        this.cake = new THREE.Group();
        this.cake.add(this.slicedCake);
        this.cake.add(this.cakeBlock1);
        this.cake.add(this.cakeBlock2);
    }

    addToScene(scene) {
        if(this.cake) scene.add(this.cake);
    }

    removeFromScene(scene) {
        if(this.cake) scene.remove(this.cake);
    }

    /**
     * Rebuilds cake mesh if required
     */
    rebuildCake(scene) {
        this.removeFromScene(scene);
        this.buildCake();
        this.addToScene(scene);
        this.lastCakeEnabled = null;
    }

    /**
     * Updates cake mesh if required
     */
    updateCakeIfRequired(scene) {
        if (this.cakeEnabled !== this.lastCakeEnabled) {
            this.lastCakeEnabled = this.cakeEnabled;
            if (this.cakeEnabled) {
                scene.add(this.cake);
            }
            else {
                scene.remove(this.cake);
            }
        }
    }
}

export { MyCake };