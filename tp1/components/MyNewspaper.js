import * as THREE from 'three';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js'

class MyNewspaper {
    constructor(height, width, displacement) {
        this.height = height;
        this.width = width;
        this.displacement = displacement;
    
        // newspaper related attributes
        this.newspaper = null;
        this.newspaperEnabled = true;
        this.lastNewspaperEnabled = null;
        
        this.newspaperUpper = null;
        this.newspaperLower = null;
        
        // Old newspaper texture
        const map = new THREE.TextureLoader().load( './textures/newspaper_texture.png' );

        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;
        map.colorSpace = THREE.SRGBColorSpace;

        // Create newspaper material
        this.material = new THREE.MeshStandardMaterial({
            map: map,
            side: THREE.DoubleSide,
            transparent: false,
            opacity: 1,
            roughness: 0.8,
            metalness: 0
        });

        this.builder = new MyNurbsBuilder()
        this.meshes = []
        this.samplesU = 20 
        this.samplesV = 20
    }
    
    /**
     * Creates a singular newspaper page surface
     * @param {number} orderU 
     * @param {number} orderV 
     * @returns {THREE.Mesh} Newspaper page mesh
     */
    createNurbsSurface(orderU, orderV){
        // build nurb #1
        var controlPoints = [
            [ // U = 0
                [-2.0, -2.0, -1.0, 1], // Edge curving downwards
                [-2.0, 0.0, 0.0, 1], // Middle section
                [-2.0, 2.0, -1.0, 1] // Edge curving downwards
            ],
            [ // U = 1
                [0.0, -2.0, 0.0, 1], // Middle section
                [0.0, 0.0, -2.0, 1], // Center lower
                [0.0, 2.0, 0.0, 1] // Middle section
            ],
            [ // U = 2
                [2.0, -2.0, -1.0, 1], // Edge curving downwards
                [2.0, 0.0, 0.0, 1], // Middle section
                [2.0, 2.0, -1.0, 1] // Edge curving downwards
            ],
            [ // U = 3
                [4.0, -2.0, 0.0, 1], // Middle section
                [4.0, 0.0, -2.0, 1], // Center lower
                [4.0, 2.0, 0.0, 1] // Middle section
            ],
            [ // U = 4
                [6.0, -2.0, -1.0, 1], // Edge curving downwards
                [6.0, 0.0, 0.0, 1], // Middle section
                [6.0, 2.0, -1.0, 1] // Edge curving downwards
            ]
        ];

        var surfaceData = this.builder.build(controlPoints,
                      orderU, orderV, this.samplesU,
                      this.samplesV, this.material)

        return new THREE.Mesh( surfaceData, this.material );
    }

    buildNewspaper(scene) {
        // are there any meshes to remove?
        if (this.meshes !== null) {
            // traverse mesh array
            for (let i=0; i<this.meshes.length; i++) {
                // remove all meshes from the scene
                scene.remove(this.meshes[i])
            }
            this.meshes = [] // empty the array  
        }

        // declare local variables
        let orderU = 3;
        let orderV = 2;
        const numPages = 10; // Number of pages to create
        const pageOffset = 0.05; // Offset between pages
    
        // Create a group to hold all pages
        this.newspaper = new THREE.Group();
    
        for (let i = 0; i < numPages; i++) {
            // Create left page
            const newspaperLeft = this.createNurbsSurface(orderU, orderV);
            newspaperLeft.position.x = 2;
            newspaperLeft.position.y = i * pageOffset * 0.5; // Offset each page slightly
            newspaperLeft.rotation.x = -Math.PI / 2;
            newspaperLeft.receiveShadow = true;
            newspaperLeft.castShadow = true;
            this.newspaper.add(newspaperLeft);
            this.meshes.push(newspaperLeft);
    
            // Create right page
            const newspaperRight = this.createNurbsSurface(orderU, orderV);
            newspaperRight.position.x = -2;
            newspaperRight.position.y = i * pageOffset * 0.5; // Offset each page slightly
            newspaperRight.rotation.set(-Math.PI / 2, 0, Math.PI);
            newspaperRight.receiveShadow = true;
            newspaperRight.castShadow = true;
            this.newspaper.add(newspaperRight);
            this.meshes.push(newspaperRight);
        }

        this.newspaper.position.set(this.displacement.x, this.displacement.y, this.displacement.z)
        this.newspaper.scale.set(0.85, 0.85, 0.85)
    }

    addToScene(scene) {
        if(this.newspaper) scene.add(this.newspaper);
    }

    removeFromScene(scene) {
        if(this.newspaper) scene.remove(this.newspaper);
    }

    /**
     * Rebuilds newspaper mesh if required
     */
    rebuildNewspaper(scene) {
        this.removeFromScene(scene);
        this.buildNewspaper();
        this.addToScene(scene);
        this.lastNewspaperEnabled = null;
    }

    /**
     * Updates newspaper mesh if required
     */
    updateNewspaperIfRequired(scene) {
        if (this.newspaperEnabled !== this.lastNewspaperEnabled) {
            this.lastNewspaperEnabled = this.newspaperEnabled;
            if (this.newspaperEnabled) {
                scene.add(this.newspaper);
            }
            else {
                scene.remove(this.newspaper);
            }
        }
    }
}

export { MyNewspaper };