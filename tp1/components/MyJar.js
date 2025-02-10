import * as THREE from 'three';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js'

class MyJar {
    constructor(displacement) {
        this.displacement = displacement;
    
        // jar related attributes
        this.jar = null;
        this.jarBase = null;

        this.jarEnabled = true;
        this.lastJarEnabled = null;

        this.jarBaseEnabled = true;
        this.lastJarBaseEnabled = null;
        
        this.leftSurface = null;
        this.rightSurface = null;
        
        // jar clay texture
        const map = new THREE.TextureLoader().load( './textures/clay.jpg' );

        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;
        map.colorSpace = THREE.SRGBColorSpace;

        // create jar material
        this.material = new THREE.MeshStandardMaterial({
            map: map,
            side: THREE.DoubleSide,
            transparent: false,
            opacity: 1,
            roughness: 0.9,
            metalness: 0.1
        });

        this.builder = new MyNurbsBuilder();
        this.meshes = [];
        this.samplesU = 30;
        this.samplesV = 30;
    }
    
    /**
     * Creates a part of the jar surface mesh using NURBS surfaces, with given control points and orders
     * @param {number} orderU 
     * @param {number} orderV 
     * @param {array} controlPoints 
     * @returns {THREE.Mesh} Jar surface mesh
     */
    createNurbsSurface(orderU, orderV, controlPoints) {
        var surfaceData = this.builder.build(
            controlPoints, orderU, orderV, this.samplesU, this.samplesV, this.material
        );

        return new THREE.Mesh(surfaceData, this.material);
    }

    buildJar(scene) {
        // Remove any existing jar meshes from the scene
        if (this.meshes !== null) {
            for (let i = 0; i < this.meshes.length; i++) {
                scene.remove(this.meshes[i]);
            }
            this.meshes = []; // Empty the array
        }

        // Define control points for the left surface of the jar
        let controlPointsLeft = [
            [ // U = 0
                [0.8, -2.0, 0.0, 1], // V = 0
                [3.3, 1.75, 0.0, 1],  // V = 1
                [0.15, 2.0, 0.0, 1],   // V = 2
                [0.6, 3.0, 0.0, 1]   // V = 3
            ],
            [ // U = 1
                [0.805, -2.0, 1.05, 1], // V = 0
                [3.5, 1.75, 3.5, 1],   // V = 1
                [0.15, 2.0, 0.25, 1],   // V = 2
                [0.5, 3.0, 0.75, 1]   // V = 3
            ],
            [ // U = 2
                [-0.805, -2.0, 1.05, 1], // V = 0
                [-3.5, 1.75, 3.5, 1],   // V = 1
                [-0.15, 2.0, 0.25, 1],   // V = 2
                [-0.5, 3.0, 0.75, 1]   // V = 3
            ],
            [ // U = 3
                [-0.8, -2.0, 0.0, 1], // V = 0
                [-3.3, 1.75, 0.0, 1],   // V = 1
                [-0.15, 2.0, 0.0, 1],   // V = 2
                [-0.6, 3.0, 0.0, 1]   // V = 3
            ]
        ];

        // Define control points for the right surface of the jar
        let controlPointsRight = [
            [ // U = 0
                [0.8, -2.0, 0.0, 1], // V = 0
                [3.3, 1.75, 0.0, 1],  // V = 1
                [0.15, 2.0, 0.0, 1],   // V = 2
                [0.6, 3.0, 0.0, 1]   // V = 3
            ],
            [ // U = 1
                [0.805, -2.0, -1.05, 1], // V = 0
                [3.5, 1.75, -3.5, 1],   // V = 1
                [0.15, 2.0, -0.25, 1],   // V = 2
                [0.5, 3.0, -0.75, 1]   // V = 3
            ],
            [ // U = 2
                [-0.805, -2.0, -1.05, 1], // V = 0
                [-3.5, 1.75, -3.5, 1],   // V = 1
                [-0.15, 2.0, -0.25, 1],   // V = 2
                [-0.5, 3.0, -0.75, 1]   // V = 3
            ],
            [ // U = 3
                [-0.8, -2.0, 0.0, 1], // V = 0
                [-3.3, 1.75, 0.0, 1],   // V = 1
                [-0.15, 2.0, 0.0, 1],   // V = 2
                [-0.6, 3.0, 0.0, 1]   // V = 3
            ]
        ];

        let orderU = 3;
        let orderV = 3;

        // Create left side surface
        const jarLeft = this.createNurbsSurface(orderU, orderV, controlPointsLeft);
        this.meshes.push(jarLeft);
        jarLeft.receiveShadow = true;
        jarLeft.castShadow = true;
        scene.add(jarLeft);

        // Create right side surface
        const jarRight = this.createNurbsSurface(orderU, orderV, controlPointsRight);
        this.meshes.push(jarRight);
        jarRight.receiveShadow = true;
        jarRight.castShadow = true;
        scene.add(jarRight);

        // Create cylindrical jar base geometry
        const jarBaseGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.15, 40);

        // Create jar base mesh
        const jarBase = new THREE.Mesh(jarBaseGeometry, this.material);
        jarBase.position.set(0, -2.05, 0);
        jarBase.rotation.x = 0;
        jarBase.receiveShadow = true;
        jarBase.castShadow = true;
        scene.add(jarBase);

        // Group the surfaces together for the jar
        this.jar = new THREE.Group();
        this.jar.add(jarLeft);
        this.jar.add(jarRight);
        this.jar.add(jarBase);

        this.jar.position.set(this.displacement.x, this.displacement.y, this.displacement.z);
        this.jar.rotation.y = Math.PI / 2;
        this.jar.scale.set(0.5, 0.5, 0.5);
    }

    addToScene(scene) {
        if (this.jar) scene.add(this.jar);
    }

    removeFromScene(scene) {
        if (this.jar) scene.remove(this.jar);
    }

    rebuildJar(scene) {
        this.removeFromScene(scene);
        this.buildJar(scene);
        this.addToScene(scene);
        this.lastJarEnabled = null;
    }

    updateJarIfRequired(scene) {
        if (this.jarEnabled !== this.lastJarEnabled) {
            this.lastJarEnabled = this.jarEnabled;
            if (this.jarEnabled) {
                scene.add(this.jar);
            } else {
                scene.remove(this.jar);
            }
        }
    }
}

export { MyJar };