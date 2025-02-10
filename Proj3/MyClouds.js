import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class MyClouds {
    constructor(app) {
        this.app = app;
        
        this.cloudObjects = [];

        this.loader = new GLTFLoader();
    }

    // Add a new cloud to the list and to the scene
    addNewCloud(obj) {
        this.cloudObjects.push(obj);
        this.app.scene.add(obj);
    }

    // Build a new cloud and add it to the list
    async buildCloud(position) {
        console.log('called buildCloud');
        try {
            const object = await this.loadGLTFModel('scenes/scene/models/cloud/scene.gltf');
            console.log('Loaded cloud model');
            object.scale.set(2, 2, 2);
            object.position.set(position[0], position[1], position[2]);
            object.rotation.y = Math.PI;
            this.addNewCloud(object);
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
    
    // Clear the cloud list
    clearClouds() {
        this.cloudObjects = [];
    }
}

export { MyClouds };