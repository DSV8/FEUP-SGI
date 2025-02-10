
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MyContents } from './MyContents.js';
import { MyGuiInterface } from './MyGuiInterface.js';
import Stats from 'three/addons/libs/stats.module.js';
import { MyMenu } from './MyMenu.js';

/**
 * This class contains the application object
 */
class MyApp  {
    /**
     * the constructor
     */
    constructor() {
        this.scene = null
        this.stats = null

        // camera related attributes
        this.activeCamera = null
        this.activeCameraName = null
        this.lastCameraName = null 
        this.cameras = []
        this.lights = []
        this.frustumSize = 20

        // other attributes
        this.renderer = null
        this.controls = null
        this.gui = null
        this.axis = null
        this.contents == null

        this.clock = null;

        // game attributes
        this.gameState = {
            "gameStarted": false,
            "gamePaused": false,
            "pickingBalloons": false,
            "gameWinner": null,
            "startingPoint": null,
            "playerName": null,
            "selectedBalloon": null,
            "selectedOppBalloon": null,
            "airLayer": 0,
            "elapsedTime": 0,
            "lapsCompleted": 0,
            "availableVouchers": 0,
            "homeMenuActive": true,
            "finalMenuActive": false,
            "cooldown": 3
        }
    }
    /**
     * initializes the application
     */
    init() {
                
        // Create an empty scene
        this.scene = new THREE.Scene();

        this.stats = new Stats()
        this.stats.showPanel(1) // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom)

        this.initCameras();
        this.setActiveCamera('Orthogonal');

        // Create a renderer with Antialiasing
        this.renderer = new THREE.WebGLRenderer({antialias:true});
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setClearColor("#000000");

        // Configure renderer size
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        // Enable shadows in the renderer
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // search for other alternatives

        // Append Renderer to DOM
        document.getElementById("canvas").appendChild( this.renderer.domElement );

        // manage window resizes
        window.addEventListener('resize', this.onResize.bind(this), false );

        this.setupEnterEventListener(); // Set up the Enter key event listener

        // Set up the home menu and player name input
        if(this.gameState.homeMenuActive){
            this.menu = new MyMenu(this);
        }
    }

    setupEnterEventListener() {
        // Add event listener for "Enter" key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                if(this.gameState.homeMenuActive){
                    this.handleEnterKeyMenu();  // Handle the Enter key event for Menu
                }
                else if(this.gameState.pickingBalloons){
                    console.log("Picking entered")
                    this.handleEnterKeyPicking();  // Handle the Enter key event for balloon picking
                }
            }
        });
    }

    /**
     * Event handler when Enter key is pressed in the menu
     */
    handleEnterKeyMenu() {
        if (this.menu !== undefined && this.menu.playerName.trim() !== '') {
            this.gameState.playerName = this.menu.playerName; // Store the player name
            this.menu.hideMenu(); // Hide the menu after entering the name
            this.startGame(); // Start the game after entering the name
        } else {
            console.log("Please enter a valid name.");
        }
    }

    /**
     * Event handler when Enter key is pressed in the picking state
     * This function is called when the player is picking a balloon to play with 
     *  and presses the Enter key to confirm the selection
     */
    handleEnterKeyPicking() {
        if(this.gameState.selectedBalloon !== null){
            this.contents.selectedLayer = 'Opp Balloon'; // Switch to opponent layer to pick the opponent balloon
            document.getElementById('your_balloon').style.display = 'none'; // hide the player balloon selection text
            document.getElementById('opp_balloon').style.display = 'block'; // show the opponent balloon selection text
        }
        
        if(this.gameState.selectedOppBalloon !== null){
            this.contents.selectedLayer = 'Starting Position'; // Switch to starting position layer to pick the starting position
            document.getElementById('opp_balloon').style.display = 'none'; // hide the opponent balloon selection text
            document.getElementById('starting_point').style.display = 'block'; // show the starting position selection text
            document.getElementById('enter').style.display = 'block'; // show the start game enter key text
        }

        if(this.gameState.startingPoint !== null){
            this.gameState.pickingBalloons = false; // Stop picking balloons
            this.gameState.gameStarted = true; // Set the game started flag to true
            this.contents.startGame(); // Start the game
            document.getElementById('starting_point').style.display = 'none'; // hide the starting position selection text
            document.getElementById('enter').style.display = 'none'; // hide the start game enter key text
            document.getElementById('pickingInstructions').style.display = 'none'; // hide the picking instructions div
        }
    }


    startGame(){
        // Transition to the game state from the home menu state
        this.gameState.homeMenuActive = false;
        this.gameState.pickingBalloons = true; // Start picking balloons

        this.scene.clear(); // Clear the scene (if needed)

        // Initialize game objects and start the game loop
        this.initializeGame();
    }

    initializeGame(){
        this.contents.checkGameState(); // Check the game state and initialize the game objects
    }

    resetGame(){
        // Reset the game state
        this.game = null;
        this.setGameState({
            gameStarted: false,
            gamePaused: false,
            pickingBalloons: false,
            homeMenuActive: true,
            finalMenuActive: false,
            startingPoint: null,
            gameWinner: null,
            playerName: null,
            selectedBalloon: null,
            selectedOppBalloon: null,
            airLayer: 0,
            elapsedTime: 0,
            lapsCompleted: 0,
            availableVouchers: 0,
            cooldown: 3
        });

        this.scene.clear(); // Clear the scene (if needed)

        this.contents.unloadContents(); // Unload the game objects

        this.gui.clear(); // Clear the GUI (if needed)

        this.menu.hideFinalMenu(); // Hide the final menu (if needed)

        this.menu.showMenu(); // Show the home menu
    }

    restartGame(){
        this.menu.hideFinalMenu(); // Hide the final menu (if needed)

        // Reset the game state
        this.game = null;
        this.setGameState({
            gameStarted: true,
            gamePaused: false,
            pickingBalloons: false,
            homeMenuActive: false,
            finalMenuActive: false,
            gameWinner: null,
            airLayer: 0,
            elapsedTime: 0,
            lapsCompleted: 0,
            availableVouchers: 0,
            cooldown: 3
        });

        this.scene.clear(); // Clear the scene (if needed)

        this.contents.unloadContents(); // Clear the game objects and contents

        this.gui.clear(); // Clear the GUI (if needed)

        this.contents.checkGameState(); // Check the game state and initialize the game objects
    }
    
    /**
     * Set the keys in gameState object to the app gameState object
     * @param {*} gameState array of keys and values to set in gameState object
     */
    setGameState(gameState) {
        for (let key in gameState) {
            this.gameState[key] = gameState[key]
        } 
    }

    getGameState() {
        return this.gameState
    }

    /**
     * initializes all the cameras
     */
    initCameras() {
        // Create a basic perspective camera
        const orthogonal =  new THREE.OrthographicCamera(
            window.innerWidth / -2, window.innerWidth / 2,
            window.innerHeight / 2, window.innerHeight / -2,
            1, 1000
        );
        orthogonal.position.set(0,0,500)
        this.cameras['Orthogonal'] = orthogonal

        this.setActiveCamera('Orthogonal')
    }

    /**
     * Gets the currently active camera object.
     */
    getActiveCameraObject() {
        return this.cameras[this.activeCameraName]
    }

    /**
     * Gets the currently active camera.
     * @returns {THREE.Camera} The active camera object.
     */
    getActiveCamera() {
        return this.activeCamera;
    }

    /**
     * sets the active camera by name
     * @param {String} cameraName 
     */
    setActiveCamera(cameraName) {   
        this.activeCameraName = cameraName
        this.activeCamera = this.cameras[this.activeCameraName]

        this.activeCamera.updateMatrixWorld()
    }

    /**
     * updates the active camera if required
     * this function is called in the render loop
     * when the active camera name changes
     * it updates the active camera and the controls
     */
    updateCameraIfRequired() {
        // camera changed?
        if (this.lastCameraName !== this.activeCameraName) {
            this.lastCameraName = this.activeCameraName;
            this.activeCamera = this.cameras[this.activeCameraName]
            document.getElementById("camera").innerHTML = this.activeCameraName
           
            // call on resize to update the camera aspect ratio
            // among other things
            this.onResize()

            // are the controls yet?
            if (this.controls === null) {
                // Orbit controls allow the camera to orbit around a target.
                this.controls = new OrbitControls( this.activeCamera, this.renderer.domElement );
                this.controls.enableZoom = true; // Enable zoom for all cameras
                this.controls.update();
            }
            else {
                this.controls.object = this.activeCamera
            }
        }
    }

    /**
     * Function to update active camera target
     * @param {*} target New Camera Target
     */
    updateControlsTarget(target){
        // Update the controls target by copying the target and updating the controls
        this.controls.target.copy(target);
        this.controls.update();

        // Deactivate zoom and pan for 1st person camera
        if(this.activeCameraName === '1stPerson'){
            this.controls.enableZoom = false;
            this.controls.enablePan = false;
            this.controls.enableRotation = true;
        }
    }

    /**
     * Update the GUI lights if required
     * The function checks if the lights array in GUI has all lights from App
     * If not, add them and update the folders
     */
    updateGUILightsIfRequired() {
        const appLights = this.lights; // Lights array in MyApp
        const guiLights = this.gui.lights; // Lights tracked by the GUI
    
        // Find lights that are in app but not in GUI
        const newLights = appLights.filter(light => !guiLights.includes(light));
    
        if (newLights.length > 0) {
            this.gui.lights.push(...newLights); // Add them to the GUI tracking list
            this.gui.addLightsFolders(newLights); // Add GUI controls for these lights
        }
    }
            

    /**
     * the window resize handler
     */
    onResize() {
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.activeCamera.aspect = window.innerWidth / window.innerHeight;
            this.activeCamera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        }
    }
    /**
     * 
     * @param {MyContents} contents the contents object 
     */
    setContents(contents) {
        this.contents = contents;

        window.addEventListener('pointermove', this.onPointerMove)
    }

    /**
     * @param {MyGuiInterface} contents the gui interface object
     */
    setGui(gui) {   
        this.gui = gui
    }

    /**
    * the main render function. Called in a requestAnimationFrame loop
    */
    render () {
        this.stats.begin()
        this.updateCameraIfRequired()
        this.updateGUILightsIfRequired()

        // update the animation if contents were provided
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.contents.update()
        }

        // required if controls.enableDamping or controls.autoRotate are set to true
        this.controls.update();

        // render the scene
        this.renderer.render(this.scene, this.activeCamera);

        // subsequent async calls to the render loop
        requestAnimationFrame( this.render.bind(this) );

        this.lastCameraName = this.activeCameraName
        this.stats.end()
    }

    /**
     * Add camera to the list
     * @param {*} camera 
     * @param {*} cameraName 
     */
    addCamera(camera, cameraName) {
        this.cameras[cameraName] = camera 
        if(this.gui !== null) {
            this.gui.updateCameraList(cameraName);
        }
    }

    /**
     * Clear all cameras except 'Orthogonal', used for menus
     */
    clearCameras() {
        // Remove from scene
        for (let cameraName in this.cameras) {
            if(cameraName !== 'Orthogonal'){
                this.scene.remove(this.cameras[cameraName]);
            }
        }
        // clear all cameras except 'Orthogonal'   
        this.activeCamera = null
        this.cameras = []
        this.initCameras()
    }

    /**
     * Clear scene lights
     */
    clearLights() {
        // Remove from scene
        for (let light of this.lights) {
            this.scene.remove(light);
        }
        this.lights = []
    }
}


export { MyApp };