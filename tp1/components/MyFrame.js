import * as THREE from 'three';

class MyFrame {
    constructor(width, height, depth, thickness, displacement, angle, castShadow = true) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.thickness = thickness;
        this.displacement = displacement;
        this.angle = angle;
        this.castShadow = castShadow;

        // frame related attributes
        this.frameTop = null;
        this.frameBottom = null;
        this.frameLeft = null;
        this.frameRight = null;

        this.frameEnabled = true;
        this.frameLastEnabled = null;
    }

    /**
     * Create a side of the frame mesh
     * @param {number} size 
     * @returns {THREE.Mesh} Singular side of frame mesh
     */
    buildFrame(size) {
        // Create frame material
        let frameMaterial = new THREE.MeshStandardMaterial({ color: "#28282b", metalness: 0.8, roughness: 0.2 });

        // Create frame geometry    
        let frameGeometry = new THREE.BoxGeometry(size, this.depth, this.thickness);

        return new THREE.Mesh(frameGeometry, frameMaterial);
    }

    /**
     * Build all frame meshes
     */
    buildAll() {
        // Create top side frame
        this.frameTop = this.buildFrame(this.width);
        this.frameTop.position.set(this.displacement.x, this.displacement.y + this.height / 2 + this.depth / 2, this.displacement.z);
        this.frameTop.rotation.y = this.angle;
        this.frameTop.receiveShadow = true;
        this.frameTop.castShadow = this.castShadow;

        // Create bottom side frame
        this.frameBottom = this.buildFrame(this.width);
        this.frameBottom.position.set(this.displacement.x, this.displacement.y - this.height / 2 - this.depth / 2, this.displacement.z);
        this.frameBottom.rotation.y = this.angle;
        this.frameBottom.receiveShadow = true;
        this.frameBottom.castShadow = this.castShadow;

        // Create left side frame
        this.frameLeft = this.buildFrame(this.height + 2 * this.depth);
        
        // Position left side frame according to the wall it is attached to
        if (this.angle === 0 || this.angle === Math.PI || this.angle === - Math.PI) {
            this.frameLeft.position.set(this.displacement.x + this.width / 2 + this.depth / 2, this.displacement.y, this.displacement.z);
        }
        else if (this.angle === Math.PI / 2 || this.angle === 3 * Math.PI / 2 || this.angle === -Math.PI / 2) { 
            this.frameLeft.position.set(this.displacement.x, this.displacement.y, this.displacement.z + this.width / 2 + this.depth / 2);
        }
        this.frameLeft.rotation.z = Math.PI / 2;
        this.frameLeft.rotation.y = Math.PI / 2;
        this.frameLeft.receiveShadow = true;
        this.frameLeft.castShadow = this.castShadow;

        // Create right side frame
        this.frameRight = this.buildFrame(this.height + 2 * this.depth);

        // Position right side frame according to the wall it is attached to
        if (this.angle === 0 || this.angle === Math.PI || this.angle === - Math.PI) {
            this.frameRight.position.set(this.displacement.x - this.width / 2 - this.depth / 2, this.displacement.y, this.displacement.z);
        }
        else if (this.angle === Math.PI / 2 || this.angle === 3 * Math.PI / 2  || this.angle === -Math.PI / 2) {
            this.frameRight.position.set(this.displacement.x, this.displacement.y, this.displacement.z - this.width / 2 - this.depth / 2);
        }
        this.frameRight.rotation.z = Math.PI / 2;
        this.frameRight.rotation.y = Math.PI / 2;
        this.frameRight.receiveShadow = true;
        this.frameRight.castShadow = this.castShadow;

        // Create frame group
        this.frame = new THREE.Group();
        this.frame.add(this.frameTop);
        this.frame.add(this.frameBottom);
        this.frame.add(this.frameLeft);
        this.frame.add(this.frameRight);
    }

    addToScene(scene) {
        if (this.frame) scene.add(this.frame);
    }

    removeFromScene(scene) {
        if (this.frame) scene.remove(this.frame);
    }

    /**
     * Rebuilds frame mesh if required
     */
    rebuildFrame(scene) {
        this.removeFromScene(scene);
        this.buildAll();
        this.addToScene(scene);
        this.lastFrameEnabled = null;
    }

    /**
     * Updates frame mesh if required
     */
    updateFrameIfRequired(scene) {
        if (this.frameEnabled !== this.lastFrameEnabled) {
            this.lastFrameEnabled = this.frameEnabled;
            if (this.frameEnabled) {
                scene.add(this.frame);
            }
            else {
                scene.remove(this.frame);
            }
        }
    }
}

export { MyFrame };
