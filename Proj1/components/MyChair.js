import * as THREE from 'three';

class MyChair {
    constructor(width, height, depth, radiusTop, radiusBottom, radialSegments, angle, displacement) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.radialSegments = radialSegments;
        this.angle = angle;
        this.displacement = displacement;

        // chair related attributes
        this.chairSeat = null;
        this.chairHeadrest = null;
        this.chairBackpostLeft = null;
        this.chairBackpostRight = null;
        this.chairLegBackLeft = null;
        this.chairLegBackRight = null;
        this.chairLegFrontLeft = null;
        this.chairLegFrontRight = null;

        this.chairEnabled = true;
        this.lastChairEnabled = null;

        // Wood texture
        this.woodTexture = new THREE.TextureLoader().load('./textures/dark_glossy_oak_wood.jpg');
        this.woodTexture.wrapS = THREE.RepeatWrapping;
        this.woodTexture.wrapT = THREE.RepeatWrapping;
        this.woodTexture.repeat.set(1, 1);
    }

    buildChair() {
        // Material creation
        let woodMaterial = new THREE.MeshPhongMaterial({ color: "rgb(128,128,128)", specular: "rgb(0,0,0)", emissive: "rgb(0,0,0)", shininess: 0, map: this.woodTexture });
        let metalMaterial = new THREE.MeshStandardMaterial({ color: "#28282b", metalness: 0.8, roughness: 0.2 });

        // Create chair seat mesh
        let chairSeatGeometry = new THREE.BoxGeometry(this.width + 0.5, 6 * this.height / 7, this.depth);
        this.chairSeat = new THREE.Mesh(chairSeatGeometry, woodMaterial);
        this.chairSeat.rotation.x = -Math.PI / 2;
        this.chairSeat.position.set(this.displacement.x, this.displacement.y, this.displacement.z - 0.3);
        this.chairSeat.receiveShadow = true;
        this.chairSeat.castShadow = true;

        // Create chair headrest mesh
        let chairHeadrestGeometry = new THREE.BoxGeometry(this.width + 1.25, 3.25 * this.height / 9, this.depth);
        this.chairHeadrest = new THREE.Mesh(chairHeadrestGeometry, woodMaterial);
        this.chairHeadrest.position.set(this.displacement.x, this.displacement.y + 2 * this.height / 3, this.displacement.z + this.height / 2 - this.depth * 2);
        this.chairHeadrest.rotation.x = Math.PI / 12;
        this.chairHeadrest.receiveShadow = true;
        this.chairHeadrest.castShadow = true;

        // Create chair backpost geometry
        let chairBackpostGeometry = new THREE.CylinderGeometry(this.radiusTop, this.radiusBottom, 5 * this.height / 6, this.radialSegments);

        // Create left sided chair backpost mesh
        this.chairBackpostLeft = new THREE.Mesh(chairBackpostGeometry, metalMaterial);
        this.chairBackpostLeft.position.set(this.displacement.x + this.width/2 - 0.35, this.displacement.y + this.height/2.5, this.displacement.z + this.width/2);
        this.chairBackpostLeft.rotation.x = 13 * Math.PI / 12;
        this.chairBackpostLeft.receiveShadow = true;
        this.chairBackpostLeft.castShadow = true;

        // Create right sided chair backpost mesh
        this.chairBackpostRight = new THREE.Mesh(chairBackpostGeometry, metalMaterial);
        this.chairBackpostRight.position.set(this.displacement.x - this.width/2 + 0.35, this.displacement.y + this.height/2.5, this.displacement.z + this.width/2);
        this.chairBackpostRight.rotation.x = 13 * Math.PI / 12;
        this.chairBackpostRight.receiveShadow = true;
        this.chairBackpostRight.castShadow = true;

        // Create chair leg geometry
        let chairLegGeometry = new THREE.CylinderGeometry(this.radiusTop, this.radiusBottom, 6 * this.height / 7, this.radialSegments);

        // Create back left sided chair leg mesh
        this.chairLegBackLeft = new THREE.Mesh(chairLegGeometry, metalMaterial);
        this.chairLegBackLeft.position.set(this.displacement.x + this.width/2 + 0.2, this.displacement.y - this.height / 2 + 0.5, this.displacement.z + this.width / 2 - 0.05);
        this.chairLegBackLeft.rotation.x = - Math.PI / 12;
        this.chairLegBackLeft.rotation.z = Math.PI / 12;
        this.chairLegBackLeft.receiveShadow = true;
        this.chairLegBackLeft.castShadow = true;

        // Create back right sided chair leg mesh
        this.chairLegBackRight = new THREE.Mesh(chairLegGeometry, metalMaterial);
        this.chairLegBackRight.position.set(this.displacement.x - this.width/2 - 0.2, this.displacement.y - this.height / 2 + 0.5, this.displacement.z + this.width / 2 - 0.05);
        this.chairLegBackRight.rotation.x = - Math.PI / 12;
        this.chairLegBackRight.rotation.z = - Math.PI / 12;
        this.chairLegBackRight.receiveShadow = true;
        this.chairLegBackRight.castShadow = true;

        // Create front left sided chair leg mesh
        this.chairLegFrontLeft = new THREE.Mesh(chairLegGeometry, metalMaterial);
        this.chairLegFrontLeft.position.set(this.displacement.x + this.width / 2 + 0.2, this.displacement.y - this.height / 2 + 0.5, this.displacement.z - this.width / 2 - 0.65);
        this.chairLegFrontLeft.rotation.x = Math.PI / 12;
        this.chairLegFrontLeft.rotation.z = Math.PI / 12;
        this.chairLegFrontLeft.receiveShadow = true;
        this.chairLegFrontLeft.castShadow = true;

        // Create front right sided chair leg mesh
        this.chairLegFrontRight = new THREE.Mesh(chairLegGeometry, metalMaterial);
        this.chairLegFrontRight.position.set(this.displacement.x - this.width / 2 - 0.2, this.displacement.y - this.height / 2 + 0.5, this.displacement.z - this.width / 2 - 0.65);
        this.chairLegFrontRight.rotation.x = Math.PI / 12;
        this.chairLegFrontRight.rotation.z = - Math.PI / 12;
        this.chairLegFrontRight.receiveShadow = true;
        this.chairLegFrontRight.castShadow = true;

        // Create chair group
        this.chair = new THREE.Group();
        this.chair.add(this.chairSeat);
        this.chair.add(this.chairHeadrest);
        this.chair.add(this.chairBackpostLeft);
        this.chair.add(this.chairBackpostRight);
        this.chair.add(this.chairLegBackLeft);
        this.chair.add(this.chairLegBackRight);
        this.chair.add(this.chairLegFrontLeft);
        this.chair.add(this.chairLegFrontRight);
        
        this.chair.rotation.y = this.angle;
    }

    addToScene(scene) {
        if (this.chair) scene.add(this.chair);
    }

    removeFromScene(scene) {
        if (this.chair) scene.remove(this.chair);
    }
    
    /**
     * Rebuilds chair mesh if required
     */
    rebuildChair(scene) {
        this.removeFromScene(scene);
        this.buildChair();
        this.addToScene(scene);
        this.lastChairEnabled = null;
    }

    /**
     * updates the chair mesh if required
     */
    updateChairIfRequired(scene) {
        if (this.chairEnabled !== this.lastChairEnabled) {
            this.lastChairEnabled = this.chairEnabled;
            if (this.chairEnabled) {
                scene.add(this.chair);
            }
            else {
                scene.remove(this.chair);
            }
        }
    }
}

export { MyChair };