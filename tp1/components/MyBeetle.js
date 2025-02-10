import * as THREE from 'three';

class MyBeetle {
    constructor(scene, displacement) {
        this.scene = scene;
        this.displacement = displacement;

        // variables to hold the curves
        this.wheelCurveLeft = null;
        this.wheelCurveRight = null;
        this.backSideCurve = null;
        this.frontSideWindShield = null;
        this.frontSideHood = null;
    }

    buildBeetle() {
        // number of samples to use for the curves (not for polyline)
        this.numberOfSamples = 32

        // hull material and geometry
        this.hullMaterial =
            new THREE.MeshBasicMaterial( {color: 0xffffff,
                opacity: 0.25, transparent: true} );

        // curve recomputation
        this.recompute();
    }

    // Deletes the contents of the line if it exists and recreates them
    recompute() {
        if (this.wheelCurve !== null)
            this.scene.remove(this.wheelCurve)
        this.initwheelCurves(5/3.5)
        if (this.backSideCurve !== null)
            this.scene.remove(this.backSideCurve)
        this.initBackSideCurve(15/3.5)
        if (this.frontSideWindShield !== null)
            this.scene.remove(this.frontSideWindShield)
        if (this.frontSideHood !== null)
            this.scene.remove(this.frontSideHood)
        this.initFrontSide(7.5/3.5)
    }

    drawHull(position, points) {
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        let line = new THREE.Line( geometry, this.hullMaterial );

        // set initial position
        line.position.set(position.x,position.y,position.z)
        this.scene.add( line );
    }

    /**
     * Calculate h based on half or quarter of a circle
     */
    calculateH(r, halfCircle){
        if(halfCircle){
            return 4/3*r
        } else {
            return (4/3) * (Math.sqrt(2) - 1) * r
        }
    }

    /**
     * Draw the curves representing the wheels of the beetle
     */
    initwheelCurves(r) {
        var h = this.calculateH(r, true);

        // Define control points for a cubic Bezier curve representing half a circle
        let points = [
            new THREE.Vector3(-r, 0, 0), // Start point
            new THREE.Vector3(-r, h, 0), // Control point 1
            new THREE.Vector3(r, h, 0), // Control point 2
            new THREE.Vector3(r, 0, 0) // End point
        ];

        let positionLeft = new THREE.Vector3(-r*2, 0, 0);
        //this.drawHull(position, points);

        let positionRight = new THREE.Vector3(r*2, 0, 0);

        // Create a cubic Bezier curve
        let curve = new THREE.CubicBezierCurve3(
            points[0], // Start point
            points[1], // Control point 1
            points[2], // Control point 2
            points[3]  // End point
        );

        // Sample a number of points on the curve
        let sampledPoints = curve.getPoints(this.numberOfSamples);

        // Create a line geometry and material
        this.curveGeometry = new THREE.BufferGeometry().setFromPoints(sampledPoints);
        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

        // Create the left wheel curve     
        this.wheelCurveLeft = new THREE.Line(this.curveGeometry, this.lineMaterial);
        this.wheelCurveLeft.position.set(positionLeft.x + this.displacement.x, positionLeft.y + this.displacement.y, positionLeft.z + this.displacement.z);

        // Create the right wheel curve
        this.wheelCurveRight = new THREE.Line(this.curveGeometry, this.lineMaterial);
        this.wheelCurveRight.position.set(positionRight.x + this.displacement.x, positionRight.y + this.displacement.y, positionRight.z + this.displacement.z);

        this.scene.add(this.wheelCurveLeft);
        this.scene.add(this.wheelCurveRight);
    }

    /**
     * Draw the curve representing the back side of the beetle
     */
    initBackSideCurve(r){
        var h = this.calculateH(r, false);

        // Define control points for a cubic Bezier curve representing quarter of a circle
        let points = [
            new THREE.Vector3(0, r, 0), // Start point
            new THREE.Vector3(-h, r, 0), // Control point 1
            new THREE.Vector3(-r, h, 0), // Control point 2
            new THREE.Vector3(-r, 0, 0) // End Point
        ];

        let position = new THREE.Vector3(0, 0, 0);
        //this.drawHull(position, points);

        // Create a cubic Bezier curve
        let curve = new THREE.CubicBezierCurve3(
            points[0], // Start point
            points[1], // Control point 1
            points[2], // Control point 2
            points[3] // End Point
        );

        // Sample a number of points on the curve
        let sampledPoints = curve.getPoints(this.numberOfSamples);

        // Create a line geometry and material
        this.curveGeometry = new THREE.BufferGeometry().setFromPoints(sampledPoints);
        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

        // Create the back side curve
        this.backSideCurve = new THREE.Line(this.curveGeometry, this.lineMaterial);
        this.backSideCurve.position.set(position.x + this.displacement.x, position.y + this.displacement.y, position.z + this.displacement.z);

        this.scene.add(this.backSideCurve);
    }

    /**
     * Draw the curves representing the front side of the beetle
     */
    initFrontSide(r){
        var h = this.calculateH(r, false);

        // Define control points for a cubic Bezier curve representing quarter of a circle
        let points = [
            new THREE.Vector3(0, r, 0), // Start point
            new THREE.Vector3(h, r, 0), // Control point 1
            new THREE.Vector3(r, h, 0), // Control point 2
            new THREE.Vector3(r, 0, 0) // End Point
        ];

        let positionWindShield = new THREE.Vector3(0, r, 0);
        //this.drawHull(position, points);

        let positionHood = new THREE.Vector3(r, 0, 0);

        // Create a cubic Bezier curve
        let curve = new THREE.CubicBezierCurve3(
            points[0], // Start point
            points[1], // Control point 1
            points[2], // Control point 2
            points[3] // End Point
        );

        // Sample a number of points on the curve
        let sampledPoints = curve.getPoints(this.numberOfSamples);

        // Create a line geometry and material
        this.curveGeometry = new THREE.BufferGeometry().setFromPoints(sampledPoints);
        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

        // Create the front side windshield curve
        this.frontSideWindShield = new THREE.Line(this.curveGeometry, this.lineMaterial);
        this.frontSideWindShield.position.set(positionWindShield.x + this.displacement.x, positionWindShield.y + this.displacement.y, positionWindShield.z + this.displacement.z);

        // Create the front side hood curve
        this.frontSideHood = new THREE.Line(this.curveGeometry, this.lineMaterial);
        this.frontSideHood.position.set(positionHood.x + this.displacement.x, positionHood.y + this.displacement.y, positionHood.z + this.displacement.z);

        this.scene.add(this.frontSideWindShield);
        this.scene.add(this.frontSideHood);
    }

    update() {}
}

export { MyBeetle };
