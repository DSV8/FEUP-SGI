import * as THREE from 'three';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js'

class MyCarpet {
    constructor(width, height, displacement) {
        this.width = width;
        this.height = height;
        this.displacement = displacement;

        this.carpetSurface = null;
        this.carpetEdgeLeft = null;
        this.carpetEdgeRight = null;

        this.carpetEnabled = true;
        this.lastCarpetEnabled = null;

        // Plane texture
        this.carpetTexture = new THREE.TextureLoader().load('./textures/grey_carpet.jpg');
        this.carpetTexture.wrapS = THREE.RepeatWrapping;    
        this.carpetTexture.wrapT = THREE.RepeatWrapping;
        this.carpetTexture.repeat.set(1, 1);

        // Surface texture
        this.carpetTextureEdge = new THREE.TextureLoader().load('./textures/grey_carpet.jpg');
        this.carpetTextureEdge.wrapS = THREE.ClampToEdgeWrapping;
        this.carpetTextureEdge.wrapT = THREE.ClampToEdgeWrapping;
        this.carpetTextureEdge.repeat.set(0.2, 1); // Scale texture to the size of the surface

        // Carpet plane material
        this.carpetMaterial = new THREE.MeshPhongMaterial({ color: "rgb(128,128,128)", specular: "rgb(75,75,75)", emissive: "rgb(0,0,0)", shininess: 0, map: this.carpetTexture, side: THREE.DoubleSide });
        
        // Carpet surface material
        this.carpetMaterialEdge = new THREE.MeshPhongMaterial({ color: "rgb(128,128,128)", specular: "rgb(75,75,75)", emissive: "rgb(0,0,0)", shininess: 0, map: this.carpetTextureEdge, side: THREE.DoubleSide });

        this.builder = new MyNurbsBuilder();
        this.meshes = [];
        this.samplesU = 30; 
        this.samplesV = 30;
    }

    /**
     * Returns a mesh of the created NURBS Surface with the given control points and orders
     * @param {number} orderU 
     * @param {number} orderV 
     * @param {array} controlPoints 
     * @returns {THREE.Mesh} Edge surface mesh
     */
    createNurbsSurface(orderU, orderV, controlPoints) {
        var surfaceData = this.builder.build(
            controlPoints, orderU, orderV, this.samplesU, this.samplesV, this.carpetMaterialEdge
        );

        return new THREE.Mesh(surfaceData, this.carpetMaterialEdge);
    }

    /**
     * Defines the control points and orders, returning the mesh of the created NURBS Surface
     * @param {*} scene 
     * @returns {THREE.Mesh} Edge surface mesh
     */
    buildNurbs(scene) {
        // Remove any existing meshes from the scene
        if (this.meshes !== null) {
            for (let i = 0; i < this.meshes.length; i++) {
                scene.remove(this.meshes[i]);
            }
            this.meshes = []; // Empty the array
        }

        // Define control points
        let orderU = 3;
        let orderV = 2;

        // Control points for a simple upward curve at the ends
        let controlPoints = [
            [
                [-1.5, 0, -20 / 2, 1],
                [-1.5, 0, 0, 1],
                [-1.5, 0, 20 / 2, 1]
            ],
            [
                [0, 0, -20 / 2, 1],
                [0, 0, 0, 1],
                [0, 0, 20 / 2, 1]
            ],
            [
                [5 / 2, 0, -20 / 2, 1],
                [5 / 2, 0, 0, 1],
                [5 / 2, 0, 20 / 2, 1]
            ],
            [
                [5 / 2, -0.5, -20 / 2, 1], // Curve upwards at the end
                [5 / 2, -0.5, 0, 1], // Curve upwards at the end
                [5 / 2, -0.5, 20 / 2, 1] // Curve upwards at the end
            ]
        ];

        // Create surface
        return this.createNurbsSurface(orderU, orderV, controlPoints);
    }

    buildCarpet(scene) {
        // Create plane carpet geometry   
        let carpetGeometry = new THREE.PlaneGeometry(this.width, this.height); 

        // Create left side carpet edge surface  
        this.carpetEdgeLeft = this.buildNurbs(scene);   
        this.meshes.push(this.carpetEdgeLeft);
        this.carpetEdgeLeft.receiveShadow = true;
        this.carpetEdgeLeft.castShadow = true;
        this.carpetEdgeLeft.rotation.x = -Math.PI;
        this.carpetEdgeLeft.position.set((this.width + 3)/ 2, 0, 0);     

        // Create right side carpet edge surface
        this.carpetEdgeRight = this.buildNurbs(scene);
        this.meshes.push(this.carpetEdgeRight);
        this.carpetEdgeRight.receiveShadow = true;
        this.carpetEdgeRight.castShadow = false;
        this.carpetEdgeRight.rotation.set(-Math.PI, Math.PI, 0);  
        this.carpetEdgeRight.position.set(-(this.width + 3)/ 2, 0, 0);

        // Create carpet plane mesh    
        this.carpetSurface = new THREE.Mesh(carpetGeometry, this.carpetMaterial);
        this.carpetSurface.rotation.x = -Math.PI / 2;
        this.carpetSurface.receiveShadow = true;
        this.carpetSurface.castShadow = false;

        // Create carpet group
        this.carpet = new THREE.Group();
        this.carpet.add(this.carpetSurface);
        this.carpet.add(this.carpetEdgeLeft);
        this.carpet.add(this.carpetEdgeRight);
        this.carpet.position.set(this.displacement.x, this.displacement.y, this.displacement.z);
    }

    addToScene(scene) {
        if(this.carpet) scene.add(this.carpet);
    }

    removeFromScene(scene) {
        if(this.carpet) scene.remove(this.carpet);
    }

    /**
     * Rebuilds carpet mesh if required
     */
    rebuildCarpet(scene) {
        this.removeFromScene(scene);
        this.buildCarpet(scene);
        this.addToScene(scene);
        this.lastCarpetEnabled = null;
    }

    /**
     * updates the carpet mesh if required
     */
    updateCarpetIfRequired(scene) {
        if (this.carpetEnabled !== this.lastCarpetEnabled) {
            this.lastCarpetEnabled = this.carpetEnabled;
            if (this.carpetEnabled) {
                scene.add(this.carpet);
            }
            else {
                scene.remove(this.carpet);
            }
        }
    }
}

export { MyCarpet };