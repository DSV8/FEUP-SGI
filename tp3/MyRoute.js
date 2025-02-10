import * as THREE from 'three';

class MyRoute {
    constructor(app) {
        this.app = app;
        this.lineMaterial = null;

        this.routesA = []; // Array to store the routes from starting point A
        this.routesB = []; // Array to store the routes from starting point B
    }

    // Method to create a random color for the route line
    createCurveMaterialsTextures() {
        // define a random color
        const color = new THREE.Color(Math.random(), Math.random(), Math.random());

        this.lineMaterial = new THREE.LineBasicMaterial({ color: color });
    }

    /**
     * Method to create track
     * @param {*} trackData 
     * @returns the track object
     */
    buildRoute(primitive){
        // Create the material and texture for the route
        this.createCurveMaterialsTextures();

        // Get the routepoints from the primitive
        const routepoints = primitive.representations[0].routepoints;

        // Create the points for the route
        var points = [];
        for (let i = 0; i < routepoints.length; i++) {
            let routepoint = new THREE.Vector3(routepoints[i].position[0], routepoints[i].position[1], routepoints[i].position[2]);
            points.push(routepoint);
        }

        // Close the route by adding the first point to the end
        points.push(points[0]);

        // Create the path
        const path = new THREE.CatmullRomCurve3(points);

        // Get the points from the path
        points = path.getPoints(100);

        // Create the geometry
        let bGeometry = new THREE.BufferGeometry().setFromPoints(points);

        // Create the final object to add to the scene
        var line = new THREE.Line(bGeometry, this.lineMaterial);
        line.userData.points = points; // Store the points in the line object
        line.visible = false; // Only the used route will be visible in game

        // Create a group to store the line
        var curve = new THREE.Group();
        curve.add(line);

        // Store the route in the correct array depending on starting point
        if(points[0].x === -8){
            this.routesA.push(line);
        }
        else {
            this.routesB.push(line);
        }

        return curve;
    }

    // Method to clear the routes
    clearRoutes(){
        this.routesA = [];
        this.routesB = [];
    }

}

export { MyRoute };