import * as THREE from 'three';

class MyTable {
    constructor(width, height, depth, radiusTop, radiusBottom, radialSegments, displacement) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.radialSegments = radialSegments;
        this.displacement = displacement;

        // table related attributes
        this.tableTop = null;
        this.frontLeftLeg = null;
        this.frontRightLeg = null;
        this.backLeftLeg = null;
        this.backRightLeg = null;

        this.tableEnabled = true;
        this.lastTableEnabled = null;

        // Dark wood texture for the table top
        this.tableTopTexture = new THREE.TextureLoader().load('./textures/dark_glossy_oak_wood.jpg');
        this.tableTopTexture.wrapS = THREE.RepeatWrapping;
        this.tableTopTexture.wrapT = THREE.RepeatWrapping;
        this.tableTopTexture.repeat.set(1, 1);
    }

    /**
     * Build a singular leg
     * @returns {THREE.Mesh} Leg mesh
     */
    buildLeg() {
        // Create metallic material for the legs
        let metalMaterial = new THREE.MeshStandardMaterial({ color: "#28282b", metalness: 0.8, roughness: 0.2 });

        // Create cylindrical leg geometry with different radius for top and bottom bases
        let legGeometry = new THREE.CylinderGeometry(this.radiusTop, this.radiusBottom, this.height - 5.4, this.radialSegments);

        // Create leg mesh
        const leg = new THREE.Mesh(legGeometry, metalMaterial);
        leg.receiveShadow = true;
        leg.castShadow = true;

        return leg;
    }

    buildTable() {
        // Create wooden material for the table top
        let woodMaterial = new THREE.MeshPhongMaterial({ color: "rgb(128,128,128)", specular: "rgb(0,0,0)", emissive: "rgb(0,0,0)", shininess: 0, map: this.tableTopTexture });

        // Create table top geometry
        let tableTopGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);

        // Create table top mesh
        this.tableTop = new THREE.Mesh(tableTopGeometry, woodMaterial);
        this.tableTop.rotation.x = - Math.PI / 2;
        this.tableTop.position.set(this.displacement.x, this.displacement.y, this.displacement.z);
        this.tableTop.receiveShadow = true;
        this.tableTop.castShadow = true;

        // Create front left leg
        this.frontLeftLeg = this.buildLeg();
        this.frontLeftLeg.position.set(this.displacement.x + 7, this.displacement.y - 3.295, this.displacement.z + 4.5);

        // Create front right leg
        this.frontRightLeg = this.buildLeg();
        this.frontRightLeg.position.set(this.displacement.x + 7, this.displacement.y - 3.295, - this.displacement.z - 4.5);

        // Create back left leg
        this.backLeftLeg = this.buildLeg();
        this.backLeftLeg.position.set(- this.displacement.x - 7, this.displacement.y - 3.295, this.displacement.z + 4.5);

        // Create back right leg
        this.backRightLeg = this.buildLeg();
        this.backRightLeg.position.set(- this.displacement.x - 7, this.displacement.y - 3.295, - this.displacement.z - 4.5);

        // Create table group
        this.table = new THREE.Group();
        this.table.add(this.tableTop);
        this.table.add(this.frontLeftLeg);
        this.table.add(this.frontRightLeg);
        this.table.add(this.backLeftLeg);
        this.table.add(this.backRightLeg);
    }

    addToScene(scene) {
        if(this.table) scene.add(this.table);
    }

    removeFromScene(scene) {
        if(this.table) scene.remove(this.table);
    }

    /**
     * Rebuilds table mesh if required
     */
    rebuildTable(scene) {
        this.removeFromScene(scene);
        this.buildTable();
        this.addToScene(scene);
        this.lastTableEnabled = null;
    }

    /**
     * updates the table mesh if required
     */
    updateTableIfRequired(scene) {
        if (this.tableEnabled !== this.lastTableEnabled) {
            this.lastTableEnabled = this.tableEnabled;
            if (this.tableEnabled) {
                scene.add(this.table);
            }
            else {
                scene.remove(this.table);
            }
        }
    }
}

export { MyTable };