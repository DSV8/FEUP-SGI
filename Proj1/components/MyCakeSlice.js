import * as THREE from 'three';

class MyCakeSlice {
    constructor(radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaEnd, displacement) {
        this.radius = radius;
        this.height = height;
        this.radialSegments = radialSegments;
        this.heightSegments = heightSegments;
        this.openEnded = openEnded;
        this.thetaStart = thetaStart;
        this.thetaEnd = thetaEnd;
        this.displacement = displacement;

        // Cake slice related attributes
        this.cakeSlice = null;
        this.cakeSlicePlane1 = null;
        this.cakeSlicePlane2 = null;

        this.cakeEnabled = true;
        this.lastCakeEnabled = null;

        // Cake Exterior Texture
        this.cakeSliceTexture = new THREE.TextureLoader().load('./textures/cake_exterior.jpg');
        this.cakeSliceTexture.wrapS = THREE.RepeatWrapping;
        this.cakeSliceTexture.wrapT = THREE.RepeatWrapping;
        this.cakeSliceTexture.repeat.set(3, 3);

        // Cake Interior Texture
        this.cakeSlicePlaneTexture = new THREE.TextureLoader().load('./textures/cake_interior.jpg');
        this.cakeSlicePlaneTexture.wrapS = THREE.RepeatWrapping;
        this.cakeSlicePlaneTexture.wrapT = THREE.RepeatWrapping;
        this.cakeSlicePlaneTexture.repeat.set(1, 1);
    }

    buildCakeSlice() {
        // Create the cake slice geometry and material
        var cakeSliceMaterial = new THREE.MeshPhongMaterial({ color: "#3b1d14", specular: "#000000", emissive: "#000000", shininess: 0, map: this.cakeSliceTexture });
        var cakeSlicePlaneMaterial = new THREE.MeshPhongMaterial({ color: "#3b1d14", specular: "#000000", emissive: "#000000", shininess: 0, side: THREE.DoubleSide, map: this.cakeSlicePlaneTexture });
        var cakeSliceGeometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, this.radialSegments, this.heightSegments, this.openEnded, this.thetaStart, this.thetaEnd);

        // Invert the normals of the cake slice geometry
        cakeSliceGeometry.scale(1, 1, -1);

        // Create the cake slice mesh
        this.cakeSlice = new THREE.Mesh(cakeSliceGeometry, cakeSliceMaterial);
        this.cakeSlice.position.set(this.displacement.x, this.displacement.y, this.displacement.z);
        this.cakeSlice.rotation.y = Math.PI + this.thetaEnd
        this.cakeSlice.receiveShadow = true;
        this.cakeSlice.castShadow = true;

        // Create the cake slice plane meshes so that the inside of the cake cylinder is not visible
        var cakeSlicePlaneGeometry = new THREE.PlaneGeometry(this.radius, this.height);

        this.cakeSlicePlane1 = new THREE.Mesh(cakeSlicePlaneGeometry, cakeSlicePlaneMaterial);
        this.cakeSlicePlane1.position.set(this.displacement.x, this.displacement.y, this.displacement.z + this.radius / 2);
        this.cakeSlicePlane1.rotation.y = Math.PI / 2;
        this.cakeSlicePlane1.receiveShadow = true;
        this.cakeSlicePlane1.castShadow = true;

        this.cakeSlicePlane2 = new THREE.Mesh(cakeSlicePlaneGeometry, cakeSlicePlaneMaterial);
        this.cakeSlicePlane2.rotation.y = - Math.PI * 0.70;
        this.cakeSlicePlane2.position.set(this.displacement.x + Math.cos(this.cakeSlicePlane2.rotation.y) * this.radius / 2, this.displacement.y, this.displacement.z - Math.sin(this.cakeSlicePlane2.rotation.y) * this.radius / 2);
        this.cakeSlicePlane2.receiveShadow = true;
        this.cakeSlicePlane2.castShadow = true;

        // Create the cake group
        this.cake = new THREE.Group();
        this.cake.add(this.cakeSlice);
        this.cake.add(this.cakeSlicePlane1);
        this.cake.add(this.cakeSlicePlane2);
    }

    addToScene(scene) {
        if(this.cake) scene.add(this.cake);
    }

    removeFromScene(scene) {
        if(this.cake) scene.remove(this.cake);
    }

    /**
     * Rebuilds cake slice mesh if required
     */
    rebuildCakeSlice(scene) {
        this.removeFromScene(scene);
        this.buildCakeSlice();
        this.addToScene(scene);
        this.lastCakeEnabled = null;
    }

    /**
     * Updates cake slice mesh if required
     */
    updateCakeSliceIfRequired(scene) {
        if (this.cakeEnabled !== this.lastCakeEnabled) {
            this.lastCakeEnabled = this.cakeEnabled;
            if (this.cakeEnabled) {
                scene.add(this.cake);
            }
            else {
                scene.remove(this.cake);
            }
        }
    }
}

export { MyCakeSlice };
