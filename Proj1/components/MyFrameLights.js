import * as THREE from 'three';

class MyFrameLights {
    constructor(radius, casketRadius, heightRight, heightLeft, heightCar, rightFrameDisplacement, leftFrameDisplacement, carFrameDisplacement) {
        this.radius = radius;
        this.casketRadius = casketRadius;
        this.heightRight = heightRight;
        this.heightLeft = heightLeft;
        this.heightCar = heightCar;
        this.rightFrameDisplacement = rightFrameDisplacement;
        this.leftFrameDisplacement = leftFrameDisplacement;
        this.carFrameDisplacement = carFrameDisplacement;

        // frame light related attributes
        this.leftFrameLights = null;
        this.rightFrameLights = null;
        this.carFrameLights = null;

        // frame casket related attributes
        this.leftFrameCasket = null;
        this.rightFrameCasket = null;

        // car frame casket related attributes
        this.carFrameCasket = null;

        // frame light support related attributes
        this.leftSupport = null;
        this.rightSupport = null;
        this.carSupport = null;

        // frame lights group
        this.frameLights = null;
        this.frameLightsEnabled = true;
        this.lastFrameLightsEnabled = null;

    }

    /**
     * Create the frame light
     * @param {number} height 
     * @returns {THREE.Mesh} Singular frame light mesh
     */
    buildFrameLight(height){
        // create cylindrical frame light
        var frameLightGeometry = new THREE.CylinderGeometry(this.radius, this.radius, height, 25, 2, false);

        // create basic frame light material, as it is a light source
        var frameLightMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff" });

        return new THREE.Mesh(frameLightGeometry, frameLightMaterial);
    }
    
    /**
     * Creates a cylindrical frame casket to hold the frame light
     * @param {number} height 
     * @returns {THREE.Mesh} Singular frame casket mesh
     */
    buildFrameCasket(height){
        // create cylindrical frame casket
        var frameCasketGeometry = new THREE.CylinderGeometry(this.casketRadius, this.casketRadius, height + 0.01, 25, 2, false, Math.PI * 0.6, Math.PI);

        // create metallic frame casket material 
        var frameCasketMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 1, roughness: 0.3});

        return new THREE.Mesh(frameCasketGeometry, frameCasketMaterial);
    }

    /**
     * Creates a rectangular support to attach the casket and light to the wall
     * @param {number} height 
     * @returns {THREE.Mesh} Singular light support mesh
     */
    buildLightSupports(height){
        // create rectangular support geometry
        var supportGeometry = new THREE.PlaneGeometry(20 - this.rightFrameDisplacement.x, height / 2);

        // create metallic support material
        var supportMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 1, roughness: 0.3, side: THREE.DoubleSide});

        return new THREE.Mesh(supportGeometry, supportMaterial);
    }

    /**
     * Builds frame lights for all frames
     */
    buildFrameLights() {
        // Create left frame light  
        this.leftFrameLights = this.buildFrameLight(this.heightLeft);
        this.leftFrameLights.position.set(this.leftFrameDisplacement.x, this.leftFrameDisplacement.y, this.leftFrameDisplacement.z);
        this.leftFrameLights.rotation.set(Math.PI / 2, 0, 0);

        this.leftFrameLights.receiveShadow = true;
        this.leftFrameLights.castShadow = true;

        // Create right frame light 
        this.rightFrameLights = this.buildFrameLight(this.heightRight);
        this.rightFrameLights.position.set(this.rightFrameDisplacement.x, this.rightFrameDisplacement.y, this.rightFrameDisplacement.z);
        this.rightFrameLights.rotation.set(Math.PI / 2, 0, 0);

        this.rightFrameLights.receiveShadow = true;
        this.rightFrameLights.castShadow = true;

        // Create car frame light
        this.carFrameLights = this.buildFrameLight(this.heightCar);
        this.carFrameLights.position.set(this.carFrameDisplacement.x, this.carFrameDisplacement.y, this.carFrameDisplacement.z);
        this.carFrameLights.rotation.set(0, 0, Math.PI / 2);

        this.carFrameLights.receiveShadow = true;
        this.carFrameLights.castShadow = true;

        // Create left frame casket
        this.leftFrameCasket = this.buildFrameCasket(this.heightLeft);
        this.leftFrameCasket.position.set(this.leftFrameDisplacement.x, this.leftFrameDisplacement.y, this.leftFrameDisplacement.z);
        this.leftFrameCasket.rotation.set(Math.PI / 2, 0, 0);

        this.leftFrameCasket.receiveShadow = true;
        this.leftFrameCasket.castShadow = true;

        // Create right frame casket
        this.rightFrameCasket = this.buildFrameCasket(this.heightRight);
        this.rightFrameCasket.position.set(this.rightFrameDisplacement.x, this.rightFrameDisplacement.y, this.rightFrameDisplacement.z);
        this.rightFrameCasket.rotation.set(Math.PI / 2, 0, 0);

        this.rightFrameCasket.receiveShadow = true;
        this.rightFrameCasket.castShadow = true;

        // Create car frame casket
        this.carFrameCasket = this.buildFrameCasket(this.heightCar);
        this.carFrameCasket.position.set(this.carFrameDisplacement.x, this.carFrameDisplacement.y, this.carFrameDisplacement.z);
        this.carFrameCasket.rotation.set(4.5 * Math.PI / 6, 0, Math.PI / 2);

        this.carFrameCasket.receiveShadow = true;
        this.carFrameCasket.castShadow = true;

        // Create left frame support
        this.leftSupport = this.buildLightSupports(this.heightLeft);
        this.leftSupport.position.set(this.leftFrameDisplacement.x + 0.5, this.leftFrameDisplacement.y + 0.07, this.leftFrameDisplacement.z);
        this.leftSupport.rotation.set(Math.PI / 2, 0, 0);

        this.leftSupport.receiveShadow = true;
        this.leftSupport.castShadow = true;

        // Create right frame support   
        this.rightSupport = this.buildLightSupports(this.heightRight);
        this.rightSupport.position.set(this.rightFrameDisplacement.x + 0.5, this.rightFrameDisplacement.y + 0.07, this.rightFrameDisplacement.z);
        this.rightSupport.rotation.set(Math.PI / 2, 0, 0);

        this.rightSupport.receiveShadow = true;
        this.rightSupport.castShadow = true;

        // Create car frame support
        this.carSupport = this.buildLightSupports(this.heightCar);
        this.carSupport.position.set(this.carFrameDisplacement.x, this.carFrameDisplacement.y + 0.09, this.carFrameDisplacement.z - 0.6);
        this.carSupport.rotation.set(Math.PI / 2, 0, Math.PI / 2);

        this.carSupport.receiveShadow = true;
        this.carSupport.castShadow = true;

        // Create frame group for display
        this.frameLights = new THREE.Group();
        this.frameLights.add(this.leftFrameLights);
        this.frameLights.add(this.rightFrameLights);
        this.frameLights.add(this.leftFrameCasket);
        this.frameLights.add(this.rightFrameCasket);
        this.frameLights.add(this.leftSupport);
        this.frameLights.add(this.rightSupport);
        this.frameLights.add(this.carFrameCasket);
        this.frameLights.add(this.carSupport);
        this.frameLights.add(this.carFrameLights);
    }

    addToScene(scene) {
        if (this.frameLights) scene.add(this.frameLights);
    }

    removeFromScene(scene) {
        if (this.frameLights) scene.remove(this.frameLights);
    }

    /**
     * Rebuilds frame mesh if required
     */
    rebuildFrameLights(scene) {
        this.removeFromScene(scene);
        this.buildAll();
        this.addToScene(scene);
        this.lastFrameLightsEnabled = null;
    }

    /**
     * Updates frame mesh if required
     */
    updateFrameLightsIfRequired(scene) {
        if (this.frameLightsEnabled !== this.lastFrameLightsEnabled) {
            this.lastFrameLightsEnabled = this.frameLightsEnabled;
            if (this.frameLightsEnabled) {
                scene.add(this.frameLights);
            }
            else {
                scene.remove(this.frameLights);
            }
        }
    }
}

export { MyFrameLights };
