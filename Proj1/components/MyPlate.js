import * as THREE from 'three';

class MyPlate {
    constructor(radiusTop, radiusBottom, height, radialSegments, displacement) {
        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.height = height;
        this.radialSegments = radialSegments;
        this.displacement = displacement;

        // plate related attributes
        this.plateBottom = null;
        this.plateCheek = null;
        this.plateBorder = null;

        this.plateEnabled = true;
        this.lastPlateEnabled = null;
    }

    buildPlate() {
        // Create plate material
        var plateMaterial = new THREE.MeshPhongMaterial({ color: "#ffffff", specular: "#000000", emissive: "#000000", shininess: 40, side: THREE.DoubleSide });

        // Create plate base geometry
        var plateBottomGeometry = new THREE.CylinderGeometry(this.radiusTop, this.radiusBottom, this.height, this.radialSegments);

        // Create plate base mesh
        this.plateBottom = new THREE.Mesh(plateBottomGeometry, plateMaterial);
        this.plateBottom.position.set(this.displacement.x, this.displacement.y + this.height, this.displacement.z);
        this.plateBottom.receiveShadow = true;
        this.plateBottom.castShadow = false;

        // Create plate cheek geometry  
        var plateCheekGeometry = new THREE.CylinderGeometry(this.radiusTop + 0.125, this.radiusBottom, this.height, this.radialSegments, 2, true, Math.PI * 0.00, Math.PI * 2.00);

        // Create plate cheek mesh
        this.plateCheek = new THREE.Mesh(plateCheekGeometry, plateMaterial);
        this.plateCheek.position.set(this.displacement.x, this.displacement.y + this.height * 2, this.displacement.z);
        this.plateCheek.receiveShadow = true;
        this.plateCheek.castShadow = true;

        // Create plate border geometry
        var plateBorderGeometry = new THREE.RingGeometry(this.radiusTop + 0.125, this.radiusTop + 0.75, this.radialSegments);

        // Create plate border mesh
        this.plateBorder = new THREE.Mesh(plateBorderGeometry, plateMaterial);
        this.plateBorder.position.set(this.displacement.x, this.displacement.y + this.height * 2 + 0.0625, this.displacement.z);
        this.plateBorder.rotation.x = -Math.PI / 2;
        this.plateBorder.receiveShadow = true;
        this.plateBorder.castShadow = true;

        // Create plate group
        this.plate = new THREE.Group();
        this.plate.add(this.plateBottom);
        this.plate.add(this.plateCheek);
        this.plate.add(this.plateBorder);
    }

    addToScene(scene) {
        if(this.plate) scene.add(this.plate);
    }

    removeFromScene(scene) {
        if(this.plate) scene.remove(this.plate);
    }

    /**
     * Rebuilds Plate mesh if required
     */
    rebuildPlate(scene) {
        this.removeFromScene(scene);
        this.buildPlate();
        this.addToScene(scene);
        this.lastPlateEnabled = null;
    }

    /**
     * Updates Plate mesh if required
     */
    updatePlateIfRequired(scene) {
        if(this.plateEnabled != this.lastPlateEnabled) {
            this.lastPlateEnabled = this.plateEnabled;
            if (this.plateEnabled) {
                scene.add(this.plate);
            }
            else {
                scene.remove(this.plate);
            }
        }
    }
}

export { MyPlate };