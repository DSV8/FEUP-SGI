import * as THREE from 'three';

class MySkybox {
    constructor(app) {
        this.app = app;
    }

    /**
     * Method to create skybox
     * @param {*} skyboxData 
     * @returns the skybox object
     */
    createSkybox(skyboxData) {
        // Load textures for all sides
        const loader = new THREE.TextureLoader();
        const textures = {
            front: loader.load(skyboxData.front),
            back: loader.load(skyboxData.back),
            up: loader.load(skyboxData.up),
            down: loader.load(skyboxData.down),
            left: loader.load(skyboxData.left),
            right: loader.load(skyboxData.right)
        };
    
        // Create materials for different sides (has to be in the right order)
        const materials = [
            new THREE.MeshBasicMaterial({ map: textures.front, side: THREE.BackSide }), // front
            new THREE.MeshBasicMaterial({ map: textures.back, side: THREE.BackSide }),  // back
            new THREE.MeshBasicMaterial({ map: textures.up, side: THREE.BackSide }),    // up
            new THREE.MeshBasicMaterial({ map: textures.down, side: THREE.BackSide }),  // down
            new THREE.MeshBasicMaterial({ map: textures.left, side: THREE.BackSide }),  // left
            new THREE.MeshBasicMaterial({ map: textures.right, side: THREE.BackSide })  // right
        ];
    
        // Create box geometry
        const size = skyboxData.size;
        const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
    
        // Create mesh with geometry and materials
        const skybox = new THREE.Mesh(geometry, materials);
    
        // Set position
        const center = skyboxData.center;
        skybox.position.set(center[0], center[1], center[2]);
    
        // return skybox
        return skybox;
    }
}

export { MySkybox };