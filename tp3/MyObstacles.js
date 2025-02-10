import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class MyObstacles {
    constructor(app) {
        this.app = app;
        
        this.obstacleObjects = [];

        this.loader = new GLTFLoader();
    }

    // Add a new obstacle to the list and to the scene
    addNewObstacle(obj) {
        this.obstacleObjects.push(obj);
        this.app.scene.add(obj);
    }

    // Build a new obstacle and add it to the list
    async buildObstacle(position) {
        try {
            const object = await this.loadGLTFModel('scenes/scene/models/piranha_plant/scene.gltf');
            object.scale.set(2, 2, 2);
            object.position.set(position[0], position[1], position[2]);
            object.rotation.y = Math.PI;
            this.addNewObstacle(object);
            return object; // Ensure the object is returned
        } catch (error) {
            console.error('An error happened while loading the GLTF model:', error);
            throw error; // Ensure the error is propagated
        }
    }

    // Load a GLTF model from a URL
    loadGLTFModel(url) {
        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (gltf) => {
                    const object = gltf.scene;

                    resolve(object);
                },
                (xhr) => {},
                (error) => {
                    console.error('An error happened while loading the GLTF model:', error);
                    reject(error);
                }
            );
        });
    }
    
    // Clear the obstacle list
    clearObstacles() {
        this.obstacleObjects = [];
    }
}

export { MyObstacles };