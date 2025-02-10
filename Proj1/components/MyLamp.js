import * as THREE from 'three';

class MyLamp {
    constructor(displacement) {
        this.displacement = displacement;

        // lamp related attributes
        this.lampBottom = null;
        this.lampTube = null;
        this.lampTop = null;
        this.lampBulb = null;

        this.lampEnabled = true;
        this.lastLampEnabled = null;
    }

    /**
     * Creates a cane like curve for the lamp support
     * @returns {THREE.CubicBezierCurve3} Curve for the cane
     */
    createCaneCurve() {
        // Define control points for the Cubic Bezier curve
        const p0 = new THREE.Vector3(0, 0, 0);   // Start at the base of the cane
        const p1 = new THREE.Vector3(0, 5, 0);   // Control point 1
        const p2 = new THREE.Vector3(2, 7, 0);   // Control point 2
        const p3 = new THREE.Vector3(2.5, 6.5, 0);   // End of the curve
 
        return new THREE.CubicBezierCurve3(p0, p1, p2, p3);
    }

    /**
     * Creates the curve of the top of the lamp to be used in LatheGeometry
     * @returns {Array} Array of points for the top curve of the lamp
     */
    createTopCurve() {
        const points = [];
        points.push(new THREE.Vector2(1.2, 1.25));
        points.push(new THREE.Vector2(1.2, 2)); 
        points.push(new THREE.Vector2(0.5, 3)); 
        points.push(new THREE.Vector2(0.35, 3.2)); 
        points.push(new THREE.Vector2(0.2, 3.3)); 
        points.push(new THREE.Vector2(0, 3.3));

        return points
    }

    /**
     * Creates the curve of the base of the lamp to be used in LatheGeometry
     * @returns {Array} Array of points for the base curve of the lamp
     */
    createBaseCurve(){
        const points = [
            new THREE.Vector3(1.5, 0, 0),
            new THREE.Vector3(1.375, 0.375, 0),
            new THREE.Vector3(1.25, 0.5, 0),
            new THREE.Vector3(1.125, 0.625, 0),
            new THREE.Vector3(1, 0.75, 0),
            new THREE.Vector3(0.875, 0.875, 0),
            new THREE.Vector3(0.75, 1, 0),
            new THREE.Vector3(0.625, 1, 0),
            new THREE.Vector3(0.5, 1, 0),
            new THREE.Vector3(0.375, 1, 0),
            new THREE.Vector3(0.25, 1, 0),
            new THREE.Vector3(0.125, 1, 0),
            new THREE.Vector3(0, 1, 0),
        ];

        return points
    }

    buildLamp() {
        // Create metallic material for the base and top of the lamp
        const lampMaterial = new THREE.MeshStandardMaterial({ color: 0x355E3B, metalness: 0.5, roughness: 0.2, side: THREE.DoubleSide });

        // Create base curve
        const baseCurve = this.createBaseCurve();

        // Create a geometry from the curve
        const lampBottomGeometry = new THREE.LatheGeometry(baseCurve, 50);

        // Create the lamp base mesh
        this.lampBottom = new THREE.Mesh(lampBottomGeometry, lampMaterial);
        this.lampBottom.receiveShadow = false; // Deactivated due to no objects casting shadow on it
        this.lampBottom.castShadow = true;

        // Create support curve
        const caneCurve = this.createCaneCurve();
          
        // Create a tube from the curve
        const tubeGeometry = new THREE.TubeGeometry(caneCurve, 50, 0.2, 32, false);    
        tubeGeometry.scale(0.5, 0.5, 0.5);

        // Create a different metallic material for the support
        const tubeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 1, roughness: 0.3 });
        
        // Create the lamp tube support mesh
        this.lampTube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        this.lampTube.rotation.set(0, Math.PI / 4, 0);
        this.lampTube.position.set(0, 1, 0);
        this.lampTube.receiveShadow = true;
        this.lampTube.castShadow = true;

        // Create top of the lamp curve
        const topCurve = this.createTopCurve();

        // Create a geometry from the curve
        const lampTopGeometry = new THREE.LatheGeometry(topCurve, 30);

        // Create the lamp top mesh
        this.lampTop = new THREE.Mesh(lampTopGeometry, lampMaterial);

        // Change rotation order and set rotation
        this.lampTop.rotation.order = 'ZXY';
        this.lampTop.rotation.set(Math.PI/4, 0, Math.PI/3.8);
        this.lampTop.position.set(3.6*Math.cos(Math.PI/4), 2.6, -4.4*Math.sin(Math.PI/4));
        this.lampTop.receiveShadow = false; // Deactivated due to no objects casting shadow on it
        this.lampTop.castShadow = true;

        // Create spherical lamp bulb geometry
        const bulbGeometry = new THREE.SphereGeometry(0.75, 32, 32);

        // Create basic bulb material, as it is a light source
        const bulbMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

        //  Create the lamp bulb mesh
        this.lampBulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        this.lampBulb.position.set(2 * Math.cos(Math.PI / 4), 3.5, Math.sin(Math.PI / 4) * -2.4);

        // Create lamp group
        this.lamp = new THREE.Group();
        this.lamp.add(this.lampBottom);
        this.lamp.add(this.lampTube);
        this.lamp.add(this.lampTop);
        this.lamp.add(this.lampBulb);
        this.lamp.position.set(this.displacement.x, this.displacement.y, this.displacement.z);
        this.lamp.rotation.set(0, -Math.PI / 12, 0);
    }

    addToScene(scene) {
        if(this.lamp) scene.add(this.lamp);
    }

    removeFromScene(scene) {
        if(this.lamp) scene.remove(this.lamp);
    }

    /**
     * Rebuilds Lamp mesh if required
     */
    rebuildLamp(scene) {
        this.removeFromScene(scene);
        this.buildLamp();
        this.addToScene(scene);
        this.lastLampEnabled = null;
    }

    /**
     * Updates Lamp mesh if required
     */
    updateLampIfRequired(scene) {
        if(this.lampEnabled != this.lastLampEnabled) {
            this.lastLampEnabled = this.lampEnabled;
            if (this.lampEnabled) {
                scene.add(this.lamp);
            }
            else {
                scene.remove(this.lamp);
            }
        }
    }
}

export { MyLamp };