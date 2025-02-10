import * as THREE from 'three';

class MyFlower {
    constructor(stemHeight, stemWidth, tubularSegments, tubeRadius, radialSegments, centreRadius, centreSegments, petalColor, displacement) {
        this.displacement = displacement;

        // flower related attributes
        this.flower = null;
        this.flowerEnabled = true;
        this.lastFlowerEnabled = null;
        
        // flowerStem related attributes
        this.flowerStem = null;
        this.stemHeight = stemHeight;
        this.stemWidth = stemWidth;
        this.tubularSegments = tubularSegments;
        this.tubeRadius = tubeRadius;
        this.radialSegments = radialSegments;
        this.stemAngle = null;

        // flowerPetals related attributes
        this.flowerPetals = null;
        this.petalColor = petalColor;

        // flowerCentre related attributes
        this.flowerCentre = null;
        this.centreRadius = centreRadius;
        this.centreSegments = centreSegments;

        // flowerCentreBack related attributes
        this.flowerCentreBack = null;
    }
    
    /**
     * Creates a flower stem
     * @returns {THREE.Mesh} flowerStem
     */
    buildFlowerStem(){
        // Define the control points for the flowerStem
        this.controlPoints = [
            new THREE.Vector3(0, 0, 0), // Start point
            new THREE.Vector3(-this.stemWidth / 2, this.stemHeight / 2, 0), // Control point 1
            new THREE.Vector3(-this.stemWidth, this.stemHeight, 0), // Control point 2
            new THREE.Vector3(0.5, this.stemHeight * 2, 0) // End point
        ];

        // Create a cubic Bezier curve from the control points
        const flowerStemCurve = new THREE.CubicBezierCurve3(
            this.controlPoints[0],
            this.controlPoints[1],
            this.controlPoints[2],
            this.controlPoints[3]
        );
        
        // Create a tube from the curve
        const flowerStemGeometry = new THREE.TubeGeometry(flowerStemCurve, this.tubularSegments, this.tubeRadius, this.radialSegments, false);

        // Create a material for the flowerStem
        const flowerStemMaterial = new THREE.MeshPhongMaterial({ color: 0x4F7942, specular: 0x000000, emissive: 0x000000, shininess: 10, side: THREE.DoubleSide});

        // Calculate the tangent vector at the end of the curve
        const t = 1; // End of the curve
        const tangent = flowerStemCurve.getTangent(t);

        // Calculate the angle from the tangent vector
        this.stemAngle = Math.atan2(tangent.y, tangent.x);

        // Create the flowerStem mesh
        const flowerStem = new THREE.Mesh(flowerStemGeometry, flowerStemMaterial);
        flowerStem.receiveShadow = false;
        flowerStem.castShadow = true;

        return flowerStem;
    }

    /**
     * Creates a singular petal mesh
     * @param {*} petalColor HexCode of the petal color
     * @returns {THREE.Mesh} Singular Petal Mesh
     */
    buildPetal(petalColor){
        const petalShape = new THREE.Shape();
        
        // Adjust the coordinates so that the tip of the petal is at the center (0, 0)
        petalShape.moveTo( 0, 0 );
        petalShape.bezierCurveTo( -5, 5, -10, 5, -10, 15 );
        petalShape.bezierCurveTo( -10, 22, -5, 30, 0, 35 );
        petalShape.bezierCurveTo( 5, 30, 10, 22, 10, 15 );
        petalShape.bezierCurveTo( 10, 5, 5, 5, 0, 0 );
        
        // Create the geometry for the petal
        const petalGeometry = new THREE.ShapeGeometry( petalShape );
        petalGeometry.scale(0.05, 0.05, 0.05);

        // Create the material for the petal
        const petalMaterial = new THREE.MeshPhongMaterial( { color: this.petalColor, side: THREE.DoubleSide} );

        // Create the petal mesh
        const petal = new THREE.Mesh( petalGeometry, petalMaterial );
        petal.receiveShadow = false;
        petal.castShadow = true;

        return petal;
    }

    /**
     * Creates the center of the flower
     * @param {*} centreColor HexCode of the flower center's color
     * @returns {THREE.Mesh} Flower Centre Mesh
     */
    buildFlowerCentre(centreColor){
        // Create the geometry for the flower centre
        const flowerCentreGeometry = new THREE.CircleGeometry(this.centreRadius, this.centreSegments);

        // Create the material for the flower centre
        const flowerCentreMaterial = new THREE.MeshPhongMaterial({ color: centreColor, side: THREE.DoubleSide });

        // Create the flower centre mesh
        const flowerCentre = new THREE.Mesh(flowerCentreGeometry, flowerCentreMaterial);
        flowerCentre.receiveShadow = false;
        flowerCentre.castShadow = true;

        return flowerCentre;
    }

    buildFlower(){
        // Create the flower stem
        this.flowerStem = this.buildFlowerStem();

        // Create a group to hold the petals
        this.flowerPetals = new THREE.Group();

        // Create and position the petals
        const numPetals = 16;
        for (let i = 0; i < numPetals; i++) {
            const petal = this.buildPetal();
            const angle = (i / numPetals) * Math.PI * 2;
            petal.position.set(-Math.cos(angle), Math.sin(angle), 0);
            petal.rotation.set(Math.PI, 0, angle + Math.PI / 2); // Rotate to point towards the center and upside down
            this.flowerPetals.add(petal);
        }

        // Change the order of rotation
        this.flowerPetals.rotation.order = 'YXZ';

        // Set the rotation angle to 45 degrees and set it at the top of the stem
        this.flowerPetals.rotation.set(-this.stemAngle, Math.PI / 2, 0);
        this.flowerPetals.position.set(0.5, this.stemHeight * 2, 0);

        // Create the flower centre (yellow)
        this.flowerCentre = this.buildFlowerCentre(0xffff00);
        this.flowerCentre.position.set(0.51, this.stemHeight * 2, 0);

        // Change the order of rotation
        this.flowerCentre.rotation.order = 'YXZ';
        this.flowerCentre.rotation.set(-this.stemAngle, Math.PI / 2, 0);
        this.flowerCentre.scale.set(0.7, 0.7, 0.7);

        // Add a plane behind the centre to close the back side of the flower
        this.flowerCentreBack = this.buildFlowerCentre(this.petalColor);
        this.flowerCentreBack.position.set(0.49, this.stemHeight * 2, 0);

        // Change the order of rotation
        this.flowerCentreBack.rotation.order = 'YXZ';
        this.flowerCentreBack.rotation.set(-this.stemAngle, Math.PI / 2, 0);

        // Create a group to hold the flower components
        this.flower = new THREE.Group();
        this.flower.add(this.flowerStem);
        this.flower.add(this.flowerPetals);
        this.flower.add(this.flowerCentre);
        this.flower.add(this.flowerCentreBack);

        this.flower.scale.set(0.3, 0.3, 0.3);
        this.flower.position.set(this.displacement.x, this.displacement.y, this.displacement.z);
    }

    addToScene(scene) {
        if(this.flower) scene.add(this.flower);
    }

    removeFromScene(scene) {
        if(this.flower) scene.remove(this.flower);
    }

    /**
     * Rebuilds Flower mesh if required
     */
    rebuildFlower(scene) {
        this.removeFromScene(scene);
        this.buildFlower();
        this.addToScene(scene);

        this.lastFlowerEnabled = null;
    }

    /**
     * Updates Flower mesh if required
     */
    updateFlowerIfRequired(scene) {
        if(this.flowerEnabled != this.lastFlowerEnabled) {
            this.lastFlowerEnabled = this.flowerEnabled;
            if (this.flowerEnabled) {
                scene.add(this.flower);
            }
            else {
                scene.remove(this.flower);
            }
        }
    }
}

export { MyFlower };
