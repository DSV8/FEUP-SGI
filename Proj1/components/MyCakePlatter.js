import * as THREE from 'three';

class MyCakePlatter {
    constructor(radiusTop, radiusBottom, height, radialSegments, displacement) {
        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.height = height;
        this.radialSegments = radialSegments;
        this.displacement = displacement;

        // Platter related attributes
        this.platterBase = null;
        this.platterTop = null;

        this.cakePlatterEnabled = true;
        this.lastCakePlatterEnabled = null;
    }

    buildCakePlatter() {
        // Create platter material and geometry 
        var platterMaterial = new THREE.MeshPhongMaterial({ color: "#ffffff", specular: "#000000", emissive: "#000000", shininess: 30 });
        var platterBaseGeometry = new THREE.CylinderGeometry(this.radiusTop, this.radiusBottom, this.height, this.radialSegments);

        // Create platter base mesh  
        this.platterBase = new THREE.Mesh(platterBaseGeometry, platterMaterial);
        this.platterBase.position.set(this.displacement.x, this.displacement.y, this.displacement.z);
        this.platterBase.receiveShadow = true;
        this.platterBase.castShadow = true;

        // Create platter top Geometry
        var platterTopGeometry = new THREE.CylinderGeometry(this.radiusTop + 1.5, this.radiusBottom + 1.2, this.height - 0.95, this.radialSegments);

        // Create platter top mesh
        this.platterTop = new THREE.Mesh(platterTopGeometry, platterMaterial);
        this.platterTop.position.set(this.displacement.x, this.displacement.y + this.height - 0.475, this.displacement.z);
        this.platterTop.rotation.x = Math.PI;
        this.platterTop.receiveShadow = true;
        this.platterTop.castShadow = true;

        // Create cake platter group
        this.cakePlatter = new THREE.Group();
        this.cakePlatter.add(this.platterBase);
        this.cakePlatter.add(this.platterTop);
    }

    addToScene(scene) {
        if(this.cakePlatter) scene.add(this.cakePlatter);
    }

    removeFromScene(scene) {
        if(this.cakePlatter) scene.remove(this.cakePlatter);
    }

    /**
     * Rebuilds Cake Platter mesh if required
     */
    rebuildCakePlatter(scene) {
        this.removeFromScene(scene);
        this.buildCakePlatter();
        this.addToScene(scene);
        this.lastCakePlatterEnabled = null;
    }

    /**
     * Updates Cake Platter mesh if required
     */
    updateCakePlatterIfRequired(scene) {
        if (this.cakePlatterEnabled !== this.lastCakePlatterEnabled) {
            this.lastCakePlatterEnabled = this.cakePlatterEnabled;
            if (this.cakePlatterEnabled) {
                scene.add(this.cakePlatter);
            }
            else {
                scene.remove(this.cakePlatter);
            }
        }
    }
}

export { MyCakePlatter };