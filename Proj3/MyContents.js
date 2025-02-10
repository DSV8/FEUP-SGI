import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyFileReader } from './parser/MyFileReader.js';
import { MyLights } from './MyLights.js';
import { MyPrimitiveBuilder } from './MyPrimitiveBuilder.js';
import { MySkybox } from './MySkybox.js';
import { MyTrack } from './MyTrack.js';
import { MyPowerUp } from './MyPowerUp.js';
import { MyObstacles } from './MyObstacles.js';
import { MyBalloon } from './MyBalloon.js';
import { MyRoute } from './MyRoute.js';
import { MyClouds } from './MyClouds.js';
import { MyGame } from './MyGame.js';
import { MyShader } from './MyShader.js';

/**
 *  This class contains the contents of out application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app
        this.axis = null

        // import factories
        this.lights = new MyLights(this.app);
        this.primitiveBuilder = new MyPrimitiveBuilder(this.app);
        this.track = new MyTrack(this.app)
        this.skyboxBuilder = new MySkybox(this.app);
        this.powerups = new MyPowerUp(this.app);
        this.obstacles = new MyObstacles(this.app);
        this.balloons = new MyBalloon(this.app);
        this.routes = new MyRoute(this.app);
        this.clouds = new MyClouds(this.app);

        // Create "shadow" object for each starting position for selection
        const shadowGeometry = new THREE.CircleGeometry(5.45, 32);
        const shadowMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.6, transparent: true, side: THREE.DoubleSide });
        this.balloonShadowA = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.balloonShadowA.rotation.x = -Math.PI / 2;
        this.balloonShadowA.position.set(8, 5, 0); // position at starting point A

        this.balloonShadowB = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.balloonShadowB.rotation.x = -Math.PI / 2;
        this.balloonShadowB.position.set(-8, 5, 0); // position at starting point B
       
        this.balloonShadowA.name = "starting_point_A";
        this.balloonShadowB.name = "starting_point_B";
        
        // Initialize raycaster for picking balloons and starting point
        this.raycaster = new THREE.Raycaster();
        this.raycaster.near = 1;
        this.raycaster.far = 500;

        // Initialize pointer and intersected object
        this.pointer = new THREE.Vector2();
        this.intersectedObj = null;
        this.pickingColor = 0xffffff;
        this.lastPickedObj = null;

        // Layers for picking balloons and starting point
        this.availableLayers = ['Your Balloon', 'Opp Balloon', 'Starting Position']
        this.selectedLayer = this.availableLayers[0]

        // Objects that cannot be picked 
        this.notPickableObjIds = []
        this.pickableObjs = [
            "player_blue_modern_balloon",
            "player_purple_modern_balloon",
            "player_green_modern_balloon",
            "player_blue_simple_balloon",
            "player_purple_simple_balloon",
            "player_green_simple_balloon",
            "opponent_red_modern_balloon",
            "opponent_orange_modern_balloon",
            "opponent_yellow_modern_balloon",
            "opponent_red_simple_balloon",
            "opponent_orange_simple_balloon",
            "opponent_yellow_simple_balloon",
            "starting_point_A",
            "starting_point_B"
        ];

        // Create marker for balloon selection
        const markerGeometry = new THREE.SphereGeometry(1, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x01ffff });
        this.marker = new THREE.Mesh(markerGeometry, markerMaterial);
        this.marker.visible = true; // Initially invisible
        this.marker.position.set(0, 10, 0);

        // Register events
        document.addEventListener("pointerdown", this.onPointerDown.bind(this));

        this.sceneData = null;
        this.visitedNodeGroups = new Map();

        /*
        this.pulsatingShader = new MyShader(
            this.app,
            "Pulsating Shader",
            "scenes/scene/shaders/pulsating.vert",
            "scenes/scene/shaders/pulsating.frag",
            {
                timeFactor: { type: 'f', value: 0.0 },
                pulseScale: { type: 'f', value: 1.5 },
                uSampler: {type: 'sampler2D', value: new THREE.TextureLoader().load('scenes/scene/textures/block.png' ) },
                normScale: {type: 'f', value: 0.1 },
                displacement: {type: 'f', value: 0.0 },
                normalizationFactor: {type: 'f', value: 1 },
            }
        );
        */
    }

    /**
     * initializes the contents
     */
    init() {
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }
    }

    checkGameState() {
        // Hide menus again if they are visible
        this.app.menu.hideFinalMenu();
        this.app.menu.hideMenu();
        
        // Check game state (gameStarted will be true in case "Restart" button is clicked)
        if(this.app.gameState.pickingBalloons || this.app.gameState.gameStarted){
            // Load the scene from json file
            this.reader = new MyFileReader(this.onSceneLoaded.bind(this));
            this.reader.open('scenes/scene/scene.json');
        }
        return;
    }

    /**
     * Called when the scene xml file load is complete
     * @param {MySceneData} data the entire scene data object
     */
    async onSceneLoaded(data) {
        console.info("Scene loaded.")
        this.onAfterSceneLoadedAndBeforeRender(data);

        // store scene data in class variable
        this.sceneData = data;

        // pass convert color function to lights and primitive builder
        this.lights.convertColor = this.sceneData.convertColor.bind(this.sceneData);
        this.primitiveBuilder.convertColor = this.sceneData.convertColor.bind(this.sceneData);

        // do final checkups before rendering
        await this.sceneData.onLoadFinished(this.app, this.sceneData);

        // Render scene globals
        this.renderGlobals(this.sceneData.getOptions());

        // Render scene fog
        this.renderFog(this.sceneData.getFog());

        // Render skybox
        this.renderSkybox(this.sceneData.getSkybox());
        
        // Render scene cameras
        this.renderCameras(this.sceneData.getCameras());

        // Render scene graph
        await this.renderGraph(this.sceneData.getGraph());

        // Traverse graph and find nodes that are not in the pickable list
        for(var nodeKey in this.sceneData.getGraph()){
            var node = this.sceneData.getGraph()[nodeKey];
            this.populateNotPickableObjIds(node);
        }

        // add skybox to not pickable objects
        this.populateNotPickableObjIds(this.sceneData.getSkybox());

        // Picking balloons and starting point
        if(this.app.gameState.pickingBalloons){
            console.log("Picking balloons...")

            // Add shadows and marker to scene
            this.app.scene.add(this.balloonShadowA);
            this.app.scene.add(this.balloonShadowB);
            this.app.scene.add(this.marker);
            this.marker.visible = false; // Hide marker

            // Enable layers for balloon objects
            for(var i in this.balloons.balloonObjects){
                if(this.balloons.balloonObjects[i].name.includes('player')){
                    this.balloons.balloonObjects[i].layers.enable(1);
                }
                else{
                    this.balloons.balloonObjects[i].layers.enable(2);
                }
            }

            // Enable layers for shadows
            this.balloonShadowA.layers.enable(3);
            this.balloonShadowB.layers.enable(3);

            // Set selected layer to 'Your Balloon'
            this.selectedLayer = 'Your Balloon';

            // Show picking instructions html elements
            document.getElementById('pickingInstructions').style.display = 'block';
            document.getElementById('your_balloon').style.display = 'block';
        }

        // Start game after loading object (for Restart button)
        if(this.app.gameState.gameStarted){
            this.startGame();
        }

        return;
    }

    /**
     * Start the game after picking balloons or restarting the game
     */
    startGame(){
        // Remove marker if it exists
        if (this.marker !== null && this.app.scene.getObjectByName(this.marker.name)) {
            this.app.scene.remove(this.marker);
        }
        // Remove shadows if they exist
        if (this.balloonShadowA !== null && this.app.scene.getObjectByName(this.balloonShadowA.name)) {
            this.app.scene.remove(this.balloonShadowA);
        }
        if (this.balloonShadowB !== null && this.app.scene.getObjectByName(this.balloonShadowB.name)) {
            this.app.scene.remove(this.balloonShadowB);
        }

        // Start game loop if no game exists
        if(this.app.gameState.gameStarted && (this.app.game === null || this.app.game === undefined)){
            this.app.game = new MyGame(this.app, this.track, this.routes, this.balloons.balloonObjects, this.app.gameState.selectedBalloon, this.app.gameState.selectedOppBalloon, this.powerups, this.obstacles, this.clouds);
        }
    }

    /**
     * Check node is not pickable and add it to the list of not pickable objects and traverse the children
     * @param {*} node scene graph node
     */
    populateNotPickableObjIds(node) {
        if (!this.pickableObjs.includes(node.id) && node.id !== "scene") {
            this.notPickableObjIds.push(node.id);
        }

        if (node.children && node.children.nodesList) {
            node.children.nodesList.forEach(childName => {
                const childNode = this.sceneData.getNodeByName(childName);
                this.populateNotPickableObjIds(childNode);
            });
        }
    }

    /**
     * Print to console information about the intersected objects
     */
    transverseRaycastProperties(intersects) {
        for (var i = 0; i < intersects.length; i++) {

            console.log(intersects[i]);

            /*
            An intersection has the following properties :
                - object : intersected object (THREE.Mesh)
                - distance : distance from camera to intersection (number)
                - face : intersected face (THREE.Face3)
                - faceIndex : intersected face index (number)
                - point : intersection point (THREE.Vector3)
                - uv : intersection point in the object's UV coordinates (THREE.Vector2)
            */
        }
    }

    /**
     * Update the selected layer for picking balloons and starting point
     */
    updateSelectedLayer() {
        this.raycaster.layers.enableAll()
        if (this.selectedLayer !== 'none') {
            const selectedIndex = this.availableLayers[parseInt(this.selectedLayer)]
            this.raycaster.layers.set(selectedIndex)
        }
    }

    /**
     * Handle mouse click event for picking balloons and starting point
     * @param {*} event mouse click
     */
    onPointerDown(event) {
        if (event.button !== 2) return;

        // Calculate pointer position in normalized device coordinates
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Set the picking ray from the camera position and mouse coordinates
        this.raycaster.setFromCamera(this.pointer, this.app.getActiveCameraObject());

        this.updateSelectedLayer();

        // Compute intersections
        const intersects = this.raycaster.intersectObjects(this.app.scene.children);

        // Handle picking
        this.pickingHelper(intersects);
    }

    /**
     * Handle picking of balloons and starting point
     * @param {*} intersects intersections of the raycaster with the scene objects
     */
    pickingHelper(intersects) {
        if (intersects.length > 0) {
            var obj = intersects[0].object;

            // Traverse up the hierarchy to find the parent group
            while (obj.parent && !(obj.name.includes("player") || obj.name.includes("starting_point_") || obj.name.includes("opponent"))) {
                obj = obj.parent;
            }

            if (this.notPickableObjIds.includes(obj.name)) {
                this.marker.visible = false; // Hide marker
                console.log("Object cannot be picked!");
            } else {
                this.changeMarkerOfFirstPickedObj(obj);
                this.handlePickedObject(obj);
            }
        } else {
            this.marker.visible = false; // Hide marker
        }
    }

    /**
     * Change gameState based on the picked object
     * @param {*} obj intersected scene object
     */
    handlePickedObject(obj) {
        // Update game state based on the picked object
        if (this.selectedLayer === 'Your Balloon' && obj.name.startsWith("player_")) { // if a player balloon is picked, update the selected balloon in game state
            this.app.gameState.selectedBalloon = obj.name;
            console.log("Balloon picked:", this.app.gameState.selectedBalloon);
        } else if (this.selectedLayer === 'Starting Position' && obj.name.startsWith("starting_point_")) { // if a starting point is picked, update the starting point in game state
            this.app.gameState.startingPoint = new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z);
            console.log("Starting position picked:", this.app.gameState.startingPoint);
        } else if (this.selectedLayer === 'Opp Balloon' && obj.name.startsWith("opponent_")) { // if an opponent balloon is picked, update the selected opponent balloon in game state
            this.app.gameState.selectedOppBalloon = obj.name;
            console.log("Opponent balloon picked:", this.app.gameState.selectedOppBalloon);
        }
    }

    /**
     * Position the marker above the selected object
     * @param {*} obj selected object
     */
    changeMarkerOfFirstPickedObj(obj) {
        if (this.lastPickedObj != obj) {
            this.lastPickedObj = obj;
            this.positionMarkerAboveObject(obj);
            console.log("Changed marker for object:", obj.name); // Debug: Print color change
        }
    }

    /**
     * Position the marker above the selected object
     * @param {*} obj selected object
     */
    positionMarkerAboveObject(obj) {
        this.marker.position.set(obj.position.x, obj.position.y + 20, obj.position.z); // Position marker above the object
        this.marker.visible = true; // Make marker visible
    }

    renderGlobals(globals) {
        // render background
        if (globals.background !== undefined) {
            var background = this.sceneData.convertColor(globals.background);
            this.app.scene.background = background;
        }

        // render ambient light
        if (globals.ambientLight !== undefined) {
            this.app.scene.add(new THREE.AmbientLight(this.sceneData.convertColor(globals.ambientLight)));
        }
    }

    renderFog(fog) {
        // render fog
        if (fog !== undefined) {
            this.app.scene.fog = new THREE.Fog(this.sceneData.convertColor(fog.color),
                fog.near,
                fog.far);
        }
    }

    renderSkybox(skybox) {
        // render skybox
        if (skybox !== undefined) {
            this.app.scene.add(this.skyboxBuilder.createSkybox(skybox));
        }
    }

    /**
     * Create a new camera object
     * @param {*} camera 
     */
    createCamera(camera) {
        var newCamera = null;

        const aspect = window.innerWidth / window.innerHeight;

        // render perspective camera
        if(camera.type === 'perspective') {
            newCamera = new THREE.PerspectiveCamera(camera.angle, aspect, camera.near, camera.far);
            newCamera.position.set(camera.location[0], camera.location[1], camera.location[2]);
            this.app.updateControlsTarget(new THREE.Vector3(camera.target[0], camera.target[1], camera.target[2]));
        }
        // render orthogonal camera
        else if(camera.type === 'orthogonal') {
            newCamera = new THREE.OrthographicCamera(camera.left, camera.right, camera.top, camera.bottom, camera.near, camera.far);
            newCamera.position.set(camera.location[0], camera.location[1], camera.location[2]);
            this.app.updateControlsTarget(new THREE.Vector3(camera.target[0], camera.target[1], camera.target[2]));
        }
        else{
            throw Error('Unknown camera type: ' + camera.type);
        }
        
        this.app.renderer.render(this.app.scene, newCamera);
        return newCamera;
    }
    
    /**
     * Render all camera objects
     * @param {*} cameras 
     */
    renderCameras(cameras) {
        // render cameras
        for (var cameraKey in cameras) {
            // get camera object
            var camera = cameras[cameraKey];

            // create camera
            var cameraObject = this.createCamera(camera);
            this.app.addCamera(cameraObject, cameraKey);

            // set active camera
            if(cameraKey === this.sceneData.activeCameraId) {
                this.app.setActiveCamera(camera.id);
            }
        }
    }

    createPrimitive(primitive, material, castShadows, receiveShadows) {
        var primitiveObj = null;

        // switch case to check what primitive to render
        switch(primitive.subtype){
            case 'box':
                // draw box
                primitiveObj = this.primitiveBuilder.buildBox(primitive, material);
                break;
            case 'sphere':
                // draw sphere
                primitiveObj = this.primitiveBuilder.buildSphere(primitive, material);
                break;
            case 'cylinder':
                // draw cylinder
                primitiveObj = this.primitiveBuilder.buildCylinder(primitive, material);
                break;
            case 'triangle':
                // draw triangle
                primitiveObj = this.primitiveBuilder.buildTriangle(primitive, material);
                break;
            case 'rectangle':
                // draw rectangle
                primitiveObj = this.primitiveBuilder.buildRectangle(primitive, material);
                break;
            case 'circle':
                // draw circle
                primitiveObj = this.primitiveBuilder.buildCircle(primitive, material);
                break;
            case 'polygon':
                // draw polygon
                primitiveObj = this.primitiveBuilder.buildPolygon(primitive, material);
                break;
            case 'lathe':
                // draw lathe
                primitiveObj = this.primitiveBuilder.buildLathe(primitive, material);
                break;
            case 'torus':
                // draw torus
                primitiveObj = this.primitiveBuilder.buildTorus(primitive, material);
                break;
            case 'coil':
                // draw coil
                primitiveObj = this.primitiveBuilder.buildCoil(primitive, material);
                break;
            case 'nurbs':
                // draw nurbs
                primitiveObj = this.primitiveBuilder.buildNurbs(primitive, material);
                break;
            case 'track':
                // draw track
                primitiveObj = this.track.buildTrack(primitive);
                break;
            case 'route':
                // draw route
                primitiveObj = this.routes.buildRoute(primitive);
                break;
            default:
                throw Error('Unknown primitive shape: ' + primitive.shape);
        }

        // set cast shadows
        if(castShadows){
            primitiveObj.castShadow = true;
        }
        else{
            primitiveObj.castShadow = false;
        }
        // set receive shadows
        if(receiveShadows){
            primitiveObj.receiveShadow = true;
        }
        else{
            primitiveObj.receiveShadow = false;
        }
        
        return primitiveObj;
    }

    /**
     * Apply transformations to a group, multiplying/adding to preexisting transformations (or multiple transformations of the same type)
     * @param {*} group 
     * @param {*} node 
     * @returns the transformed group
     */
    applyTransformations(group, node) { 
        // Apply all scalings first, to avoid scaling rotations or translations
        node.transformations.filter(t => t.type === 'S').forEach(scaling => {
            group.scale.x *= scaling.scale[0];
            group.scale.y *= scaling.scale[1];
            group.scale.z *= scaling.scale[2];
        });

        // Apply all rotations secondly, to avoid rotations out of position
        node.transformations.filter(t => t.type === 'R').forEach(rotation => {
            group.rotation.x += THREE.MathUtils.degToRad(rotation.rotation[0]);
            group.rotation.y += THREE.MathUtils.degToRad(rotation.rotation[1]);
            group.rotation.z += THREE.MathUtils.degToRad(rotation.rotation[2]);
        });

        // Apply all translations at the end
        node.transformations.filter(t => t.type === 'T').forEach(translation => {
            group.position.x += translation.translate[0];
            group.position.y += translation.translate[1];
            group.position.z += translation.translate[2];
        });
    
        return group;
    }

    /**
     * Recursive function that will create all children first, add them to parent's group, 
     * up to the root node and apply transformations and materials up and down the tree.
     * @param {*} node 
     * @param {*} graph 
     * @param {*} material passes down the material to the children
     * @param {*} castShadows passes down the cast shadows property to the children
     * @param {*} receiveShadows passes down the receive shadows property to the children
     * @returns the group object, after creating the primitive objects and adding them to the group, applying transformations, etc.
     */
    async createObject(node, graph, material, castShadows, receiveShadows) {
        var object = null;

        // load current material
        var newMaterial = material;

        // apply parent's material if current child has no material referenced
        if (node.materialIds.length > 0) {
            newMaterial = this.sceneData.materials[node.materialIds[0]];
        }

        const castshadows = castShadows === true ? true : (node.castshadows ?? false);
        const receiveshadows = receiveShadows === true ? true : (node.receiveshadows ?? false);
        const materialName = newMaterial ? newMaterial.name : null;
        const auxNodeKey = JSON.stringify([node.id, materialName, castshadows, receiveshadows]);

        // if the node has been visited, return a clone of the group to avoid duplication and memory waste
        if(this.visitedNodeGroups.has(auxNodeKey)){
            // check the props are different
            return this.visitedNodeGroups.get(auxNodeKey).clone();
        }

        // create a new group for new unvisited node
        var group = new THREE.Group();

        // apply transformations to current group before recursivelly creating children
        if(group !== null) group = this.applyTransformations(group, node);

        // traverse the children of the node
        for(var childId in node.children){
            // if the child is a list of nodes, recursively create all nodes in the list
            if(childId === 'nodesList'){
                for(var i = 0; i < node.children.nodesList.length; i++){
                    var child = node.children.nodesList[i];
                    this.createObject(child, graph, newMaterial, castshadows, receiveshadows);
                }
            }
            // if the child is not a reference, but the actual node, create the object or recursively create the children of that node
            else{
                var boundingBox, boundingBoxCenter, boundingBoxSize;

                switch (node.children[childId].type) {
                    // when the child is a node, recursively create a new group and look through the children of that node
                    case 'node':
                        object = await this.createObject(node.children[childId], graph, newMaterial, castshadows, receiveshadows);
                        group.add(object);
                        group.name = node.children[childId].id;
                        break;
                    // when the child is a powerup, recursively create the object and add it to the group, changing it's position
                    case 'powerup':
                        object = await this.createObject(node.children[childId], graph, newMaterial, castshadows, receiveshadows);
                        if(node.children[childId].position.length !== 0) { // Check for position object
                            object.position.set(node.children[childId].position[0], node.children[childId].position[1], node.children[childId].position[2]); // set object position
                            this.powerups.addNewPowerUp(object); // add to power up list
                        }

                        // Create object bounding box to check for collisions
                        boundingBox = new THREE.Box3().setFromObject(object);
                        boundingBoxCenter = new THREE.Vector3();
                        boundingBoxSize = new THREE.Vector3();
                        boundingBox.getCenter(boundingBoxCenter);
                        boundingBox.getSize(boundingBoxSize);
                        object.userData.boundingBox = boundingBox;

                        /*
                        var boundingBoxHelper = new THREE.BoxHelper(object, 0xffffff);
                        object.userData.boundingBoxHelper = boundingBoxHelper;
                        group.add(boundingBoxHelper);
                        */

                        group.add(object);

                        // name the object for picking purposes
                        group.name = node.children[childId].id;
                        break;
                    case 'balloon':
                        object = await this.createObject(node.children[childId], graph, newMaterial, castshadows, receiveshadows);
                        this.balloons.addNewBalloon(node.children[childId].id, object); // add to balloon list

                        // Create object bounding box to check for collisions
                        boundingBox = new THREE.Box3().setFromObject(object);
                        boundingBoxCenter = new THREE.Vector3();
                        boundingBoxSize = new THREE.Vector3();
                        boundingBox.getCenter(boundingBoxCenter);
                        boundingBox.getSize(boundingBoxSize);
                        object.userData.boundingBox = boundingBox;

                        /*
                        var boundingBoxHelper = new THREE.BoxHelper(object, 0xffffff);
                        object.userData.boundingBoxHelper = boundingBoxHelper;
                        group.add(boundingBoxHelper);
                        */

                        group.add(object);

                        // name the object for picking purposes
                        object.name = node.children[childId].id;
                        break;
                    // when the child is an obstacle, recursively create the object and add it to the group, changing it's position
                    case 'obstacle':
                        // obstacle primitive is a list of positions, so we create multiple GLTF objects and change their positions
                        for(var i = 0; i < node.children[childId].position.length; i++){
                            object = await this.obstacles.buildObstacle(node.children[childId].position[i]);

                            // Create object bounding box to check for collisions
                            boundingBox = new THREE.Box3().setFromObject(object);
                            boundingBoxCenter = new THREE.Vector3();
                            boundingBoxSize = new THREE.Vector3();
                            boundingBox.getCenter(boundingBoxCenter);
                            boundingBox.getSize(boundingBoxSize);
                            object.userData.boundingBox = boundingBox;

                            /*
                            var boundingBoxHelper = new THREE.BoxHelper(object, 0xffffff);
                            object.userData.boundingBoxHelper = boundingBoxHelper;
                            group.add(boundingBoxHelper);
                            */

                            group.add(object);
                        }
                        break;
                    // when the child is a cloud, recursively create the object and add it to the group, changing it's position
                    case 'cloud':
                        // cloud primitive is a list of positions, so we create multiple GLTF objects and change their positions
                        for(var i = 0; i < node.children[childId].position.length; i++) {
                            object = await this.clouds.buildCloud(node.children[childId].position[i]);
                            group.add(object);
                        }
                        break;
                    // when the child is a primitive, create the object and add it to the group
                    case 'primitive':
                        object = await this.createPrimitive(node.children[childId], newMaterial, castshadows, receiveshadows);
                        group.add(object);
                        break;
                    // when the child is a point light, create the light and add it to the scene if enabled
                    case 'pointlight':
                        var light = await this.lights.createPointlight(node.children[childId]);
                        group.add(light);
                        // add to lights array
                        this.app.lights.push(light);
                        break;
                    // when the child is a spotlight, create the light and add it to the scene if enabled
                    case 'spotlight':
                        var light = await this.lights.createSpotlight(node.children[childId]);
                        group.add(light);
                        // add to lights array
                        this.app.lights.push(light);
                        break;
                    // when the child is a directional light, create the light and add it to the scene if enabled
                    case 'directionallight':
                        var light = await this.lights.createDirectionalLight(node.children[childId]);
                        group.add(light);
                        // add to lights array
                        this.app.lights.push(light);
                        break;
                    // when the child is a lod node, it means we have to render the children of the lod node
                    case 'lod':
                        // create lod object
                        const lod = new THREE.LOD();

                        // process children and add them to the LOD object
                        for(var i = 0; i < node.children[childId].children.length; i++){
                            const child = node.children[childId].children[i];
                            // recursively create the objects
                            const object = await this.createObject(child, graph, newMaterial, castshadows, receiveshadows);
                            // add them to LOD object with respective minimum distance
                            lod.addLevel(object, child.mindist);
                        }
                        // add to group
                        group.add(lod);

                        // name the object for picking purposes
                        group.name = node.children[childId].id;
                        break;
                    default:
                        break;
                }
            }
        }

        var nodeKey = null;
        if(newMaterial !== null){
            // create a NodeKey with material, castShadows and receiveShadows
            nodeKey = JSON.stringify([node.id, materialName, castshadows, receiveshadows]);
        }
        else{
            // create a NodeKey with material, castShadows and receiveShadows
            nodeKey = JSON.stringify([node.id, null, castshadows, receiveshadows]);
        }

        // add group to visited nodes, referencing the node id
        this.visitedNodeGroups.set(nodeKey, group);
        return group;
    }

    async renderGraph(graph){
        //find root node
        var root = graph[this.sceneData.rootId];

        // Render nodes from root
        var group = await this.createObject(root, graph, null, false, false);
        this.app.scene.add(group);

        this.renderLights();
    }

    renderLights(){
        // render lights
        for (var lightKey in this.app.lights) {
            // get light object
            var light = this.app.lights[lightKey];

            // add light to scene
            this.app.scene.add(light);
        }
    }

    printYASF(data, indent = '') {
        for (let key in data) {
            if (typeof data[key] === 'object' && data[key] !== null) {
                console.log(`${indent}${key}:`);
                this.printYASF(data[key], indent + '\t');
            } else {
                console.log(`${indent}${key}: ${data[key]}`);
            }
        }
    }

    // Remove the comment to print the tree structure of the scene in the console
    onAfterSceneLoadedAndBeforeRender(data) {
        //this.printYASF(data) 
    }

    update() {
        /*
        var t;
        if (this.app.clock !== null) {
            t = this.app.clock.getElapsedTime();
        }

        // Update pulsating shader
        if (this.pulsatingShader.hasUniform("timeFactor")) {
            this.pulsatingShader.updateUniformsValue("timeFactor", t );
        }
        */
    }

    /**
     * Unload the contents of the scene to later be reloaded (Menu swapping)
     */
    unloadContents() {
        // Remove all objects from the scene
        this.app.scene.clear();

        // Remove all cameras
        this.app.clearCameras();

        // Remove all lights
        this.app.clearLights();

        // Remove all balloons
        this.balloons.clearBalloons();

        // Remove all powerups
        this.powerups.clearPowerUps();

        // Remove all obstacles
        this.obstacles.clearObstacles();

        // Remove all routes
        this.routes.clearRoutes();

        // Remove all clouds
        this.clouds.clearClouds();

        // Remove all visited nodes
        this.visitedNodeGroups.clear();

        // Reset scene data
        this.sceneData = null;

        // Reset file reader
        this.fileReader = null;
    }       
}

export { MyContents };