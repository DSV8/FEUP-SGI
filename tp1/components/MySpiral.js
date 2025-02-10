import * as THREE from 'three';

class MySpiral {
    constructor(radius, height, turns, tubularSegments, tubeRadius, radialSegments, displacement) {
        this.radius = radius;
        this.height = height;
        this.turns = turns;
        this.tubularSegments = tubularSegments;
        this.tubeRadius = tubeRadius;
        this.radialSegments = radialSegments;

        this.displacement = displacement;
        
        // spiral related variables
        this.spiral = null;
        this.spiralEnabled = true;
        this.lastSpiralEnabled = null;
    }

    buildSpiral(){
        // Define the control points for the spiral
        const points = [];
        const numPoints = 100;

        // Create the points for the spiral using an helical shape
        for (let i = 0; i < numPoints; i++) {
            const angle = i * (this.turns * 2 * Math.PI) / numPoints;
            const x = this.radius * Math.cos(angle);
            const y = (i / numPoints) * this.height;
            const z = this.radius * Math.sin(angle);
            points.push(new THREE.Vector3(x, y, z));
        }

        // Create a CatmullRom curve from the points
        const spiralCurve = new THREE.CatmullRomCurve3(points);

        // Create a tube from the curve
        const spiralGeometry = new THREE.TubeGeometry(spiralCurve, this.tubularSegments, this.tubeRadius, this.radialSegments, false);
        spiralGeometry.scale(0.5, 0.5, 0.5);

        // Create a metallic material for the spiral
        const spiralMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 1, roughness: 0.3});

        // Create the spiral mesh from the geometry and material
        this.spiral = new THREE.Mesh(spiralGeometry, spiralMaterial);

        // Position the spiral
        this.spiral.position.set(this.displacement.x, this.displacement.y, this.displacement.z);
        this.spiral.rotation.set(0, Math.PI / 3, Math.PI / 2);

        this.spiral.receiveShadow = true;
        this.spiral.castShadow = true;
    }

    addToScene(scene) {
        if(this.spiral) scene.add(this.spiral);
    }

    removeFromScene(scene) {
        if(this.spiral) scene.remove(this.spiral);
    }

    /**
     * Rebuilds Spiral mesh if required
     */
    rebuildSpiral(scene) {
        this.removeFromScene(scene);
        this.buildPlate();
        this.addToScene(scene);

        this.lastSpiralEnabled = null;
    }

    /**
     * Updates Spiral mesh if required
     */
    updateSpiralIfRequired(scene) {
        if(this.spiralEnabled != this.lastSpiralEnabled) {
            this.lastSpiralEnabled = this.spiralEnabled;
            if (this.spiralEnabled) {
                scene.add(this.spiral);
            }
            else {
                scene.remove(this.spiral);
            }
        }
    }
}

export { MySpiral };
