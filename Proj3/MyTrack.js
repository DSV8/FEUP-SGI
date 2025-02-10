import * as THREE from 'three';

class MyTrack {
    constructor(app) {
        this.app = app;
        
        this.material = null;
        this.lineMaterial = null;
        this.finishLineMaterial = null;

        this.trackpoints = null; // Array to store the trackpoints
        this.width = null; // Width of the track
    }

    // Method to create the track, line and finish line materials
    createCurveMaterialsTextures() {
        const trackTexture = new THREE.TextureLoader().load("scenes/scene/textures/asphalt.jpg");
        trackTexture.wrapS = THREE.RepeatWrapping;

        const finishLineTexture = new THREE.TextureLoader().load("scenes/scene/textures/finish_line.jpg");
        finishLineTexture.wrapS = THREE.RepeatWrapping;
        finishLineTexture.wrapT = THREE.RepeatWrapping;

        this.material = new THREE.MeshBasicMaterial({ map: trackTexture });
        this.material.map.repeat.set(3, 3);
        this.material.map.wrapS = THREE.RepeatWrapping;
        this.material.map.wrapT = THREE.RepeatWrapping;
    
        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

        this.finishLineMaterial = new THREE.MeshBasicMaterial({ map: finishLineTexture });
        this.finishLineMaterial.map.repeat.set(5, 1);
    }

    /**
     * Method to create track
     * @param {*} trackData 
     * @returns the track object
     */
    buildTrack(primitive){
        // Create the material and texture for the track
        this.createCurveMaterialsTextures();

        // Get the trackpoints and width from the primitive
        this.trackpoints = primitive.representations[0].trackpoints;
        this.width = primitive.representations[0].width;
        
        // Create the points for the track
        var points = [];
        for (let i = 0; i < this.trackpoints.length; i++) {
            let trackpoint = new THREE.Vector3(this.trackpoints[i].position[0], this.trackpoints[i].position[1], this.trackpoints[i].position[2]);
            points.push(trackpoint);
        }
        // Close the track by adding the first point to the end
        points.push(points[0]);

        // Create the path
        let path = new THREE.CatmullRomCurve3(points);

        // Create the geometry
        let geometry = new THREE.TubeGeometry(
            path,
            100,
            this.width,
            3,
            false
          );

        // Create the mesh and invert so that the top is plain
        var mesh = new THREE.Mesh(geometry, this.material);
        mesh.scale.set(1, -1, 1);
        mesh.position.y = -7.0; // Lower the track to the ground

        // Create the line to represent the track
        points = path.getPoints(100);
        let trackShape = new THREE.BufferGeometry().setFromPoints(points);

        // Create the final object to add to the scene
        var line = new THREE.Line(trackShape, this.lineMaterial);

        // Create a plane to represent the finish line
        var planeGeometry = new THREE.PlaneGeometry(this.width * 1.75, this.width / 2);

        // Create the finish line
        var plane = new THREE.Mesh(planeGeometry, this.finishLineMaterial);
        plane.position.set(points[0].x, points[0].y + 3.5, points[0].z); // Slightly above the track
        plane.rotation.x = -Math.PI / 2;

        // Create a group to store the track
        var curve = new THREE.Group();
        curve.add(mesh);
        curve.add(line);
        curve.add(plane);

        curve.scale.set(1, 0.2, 1);

        return curve;
    }

    // Method to get the track width
    getTrackWidth() {
        return this.width;
    }

    // Method to get the track curve
    getTrackCurve() {
        var points = [];
        for (let i = 0; i < this.trackpoints.length; i++) {
            let trackpoint = new THREE.Vector3(this.trackpoints[i].position[0], this.trackpoints[i].position[1], this.trackpoints[i].position[2]);
            points.push(trackpoint);
        }

        points.push(points[0]);

        const path = new THREE.CatmullRomCurve3(points);

        return path;
    }
}

export { MyTrack };