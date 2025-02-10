import * as THREE from 'three';

class MyKnife {
    constructor(width, height, radius, segments, thetaStart, thetaLength, displacement, angle) {
        this.width = width;
        this.height = height;
        this.radius = radius;
        this.segments = segments;
        this.thetaStart = thetaStart;
        this.thetaLength = thetaLength;
        this.displacement = displacement;
        this.angle = angle;

        // knife related attributes
        this.knifeHandle = null;
        this.knifeBlade = null;
        this.knifeBladeTip = null;

        this.knifeEnabled = true;
        this.lastKnifeEnabled = null;
    }

    buildKnife() {
        // Create blade material
        var bladeMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 1, roughness: 0.3});

        // Create handle material
        var handleMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0, roughness: 0.7, side: THREE.DoubleSide });

        // Create knife handle geometry
        var handleGeometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, this.segments);

        // Create knife handle mesh  
        this.knifeHandle = new THREE.Mesh(handleGeometry, handleMaterial);
        this.knifeHandle.rotation.x = Math.PI / 2;
        this.knifeHandle.position.set(this.displacement.x, this.displacement.y, this.displacement.z);
        this.knifeHandle.receiveShadow = true;
        this.knifeHandle.castShadow = true;

        // Create knife blade geometry
        var bladeGeometry = new THREE.PlaneGeometry(this.width, this.height);

        // Create knife blade mesh
        this.knifeBlade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        this.knifeBlade.rotation.x = - Math.PI / 2;
        this.knifeBlade.position.set(this.displacement.x + this.width / 4, this.displacement.y, this.displacement.z - this.height);
        this.knifeBlade.receiveShadow = true;
        this.knifeBlade.castShadow = true;

        // Create knife blade tip geometry  
        var bladeTipGeometry = new THREE.CircleGeometry( 4 * this.radius, this.segments, this.thetaStart, this.thetaLength);

        // Create knife blade tip mesh
        this.knifeBladeTip = new THREE.Mesh(bladeTipGeometry, bladeMaterial);
        this.knifeBladeTip.rotation.x = - Math.PI / 2;
        this.knifeBladeTip.position.set(this.displacement.x + 3 * this.width / 4, this.displacement.y, this.displacement.z - 2 * this.height + 4 * this.radius);
        this.knifeBladeTip.receiveShadow = true;
        this.knifeBladeTip.castShadow = true;

        // Create knife group
        this.knife = new THREE.Group();
        this.knife.add(this.knifeHandle);
        this.knife.add(this.knifeBlade);
        this.knife.add(this.knifeBladeTip);

        this.knife.scale.set(1.3, 1.3, 1.3);
        this.knife.rotation.y = this.angle;
    }

    addToScene(scene) {
        if (this.knife) scene.add(this.knife);
    }

    removeFromScene(scene) {
        if (this.knife) scene.remove(this.knife);
    }

    /**
     * Rebuilds knife mesh if required
     */
    rebuildKnife(scene) {
        this.removeFromScene(scene);
        this.buildKnife();
        this.addToScene(scene);
        this.lastKnifeEnabled = null;
    }

    /**
     * Updates knife mesh if required
     */
    updateKnifeIfRequired(scene) {
        if (this.knifeEnabled !== this.lastKnifeEnabled) {
            this.lastKnifeEnabled = this.knifeEnabled;
            if (this.knifeEnabled) {
                scene.add(this.knife);
            }
            else {
                scene.remove(this.knife);
            }
        }
    }
}

export { MyKnife };