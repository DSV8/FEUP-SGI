import * as THREE from 'three';

class MyCeilingLamp {
    constructor(displacement) {
        this.displacement = displacement;

        this.ceilingLampEnabled = true;
        this.lastCeilingLampEnabled = null;
    }

    /**
     * Create a half-sphere ceiling lamp
     */
    buildCeilingLamp() {
        var r = 1;
        var h = 4/3;

        let points = [
            new THREE.Vector3(-r, 0, 0), // Start point
            new THREE.Vector3(-r, h, 0), // Control point 1
            new THREE.Vector3(r, h, 0), // Control point 2
            new THREE.Vector3(r, 0, 0) // End point
        ];

        // Create a cubic Bezier curve
        let curve = new THREE.CubicBezierCurve3(
            points[0], // Start point
            points[1], // Control point 1
            points[2], // Control point 2
            points[3]  // End point
        );

        // Sample a number of points on the curve
        let numPoints = 100;    
        let pointsOnCurve = curve.getPoints(numPoints);

        // Create the geometry  
        var ceilingLampGeometry = new THREE.LatheGeometry(pointsOnCurve, 30);
        var ceilingLampMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide});
        this.ceilingLamp = new THREE.Mesh(ceilingLampGeometry, ceilingLampMaterial);

        // Position the ceiling lamp
        this.ceilingLamp.position.set(this.displacement.x, this.displacement.y, this.displacement.z);
        this.ceilingLamp.rotation.x = Math.PI;
    }

    addToScene(scene) {
        if(this.ceilingLamp) scene.add(this.ceilingLamp);
    }

    removeFromScene(scene) {
        if(this.ceilingLamp) scene.remove(this.ceilingLamp);
    }

    /**
     * Rebuilds CeilingLamp mesh if required
     */
    rebuildCeilingLamp(scene) {
        this.removeFromScene(scene);
        this.buildCeilingLamp();
        this.addToScene(scene);
        this.lastCeilingLampEnabled = null;
    }

    /**
     * Updates CeilingLamp mesh if required
     */
    updateCeilingLampIfRequired(scene) {
        if(this.ceilingLampEnabled != this.lastCeilingLampEnabled) {
            this.lastCeilingLampEnabled = this.ceilingLampEnabled;
            if (this.ceilingLampEnabled) {
                scene.add(this.ceilingLamp);
            }
            else {
                scene.remove(this.ceilingLamp);
            }
        }
    }
}

export { MyCeilingLamp };