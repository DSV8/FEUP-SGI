import * as THREE from 'three';

class MyGame {
    constructor(app, track, routes, balloons, selectedBalloon, oppBalloon, powerups, obstacles, clouds) {
        this.app = app;

        // game attributes
        this.track = track;
        this.routes = routes;
        this.balloons = balloons;
        this.powerups = powerups;
        this.obstacles = obstacles;
        this.clouds = clouds;

        // Set the selected balloon and opponent balloon
        this.selectedBalloon = this.balloons[selectedBalloon];
        this.oppBalloon = this.balloons[oppBalloon];

        // Set the selected balloon position to 0, so that it moves with the group
        this.selectedBalloon.position.set(0, 0, 0);

        // Create a group for the selected balloon to later add the camera and update the camera's position
        this.selectedBalloonGroup = new THREE.Group();
        this.selectedBalloonGroup.add(this.selectedBalloon);

        this.app.scene.add(this.selectedBalloonGroup); // Add the selected balloon group to the scene

        this.keys = {}; // Object to track key states
        this.cannotCrossFinishLine = true; // Flag to track if the player cannot cross the finish line yet
        this.isPaused = false; // Flag to track if the game is paused

        // Dictionary to map height levels to directions
        this.levelDirections = {
            2: { x: 0, z: 0 },   // No movement
            6: { x: 0, z: -1 },  // N direction
            10: { x: 0, z: 1 },  // S direction
            14: { x: 1, z: 0 },   // E direction
            18: { x: -1, z: 0 }   // W direction
        };

        this.app.clock = new THREE.Clock(); // Create a clock for timing
        this.collisionCooldowns = new Map(); // Map to track cooldowns for collisions
        this.isOffTrackCooldown = false; // Flag to track if the balloon is off-track
        this.vouchers = 0; // Number of vouchers collected
        this.elapsedTime = 0; // Elapsed time in seconds
        this.lapsCompleted = 0; // Number of laps completed (can only do 1 lap)

        this.finishLineXMax = this.track.width; // Finish line max X position
        this.finishLineXMin = -this.track.width; // Finish line min X position

        this.escapePressed = false; // Track if the Escape key is pressed

        this.init(); // Initialize the game
    }

    init(){
        console.log("Initializing game...");

        // Set initial balloon positions
        this.selectedBalloonGroup.position.set(this.app.gameState.startingPoint.x, 2, 0);

        // Create 1st and 3rd person cameras
        this.createCameras();

        // Set initial oppBalloon position (inverse of selected starting position)
        this.oppBalloon.position.set(-this.app.gameState.startingPoint.x, 2, 0);

        // Create mixer for the opponent balloon
        this.mixer = new THREE.AnimationMixer(this.oppBalloon);

        // Add event listeners for keyboard inputs
        window.addEventListener('keydown', (event) => this.onKeyDown(event), false);
        window.addEventListener('keyup', (event) => this.onKeyUp(event), false);

        // Create Game State Display
        this.createGameStateDisplay();

        // Create balloon shadow
        this.createBalloonShadow();

        // Create balloon position marker
        this.createBalloonMarker();

        // Start the game loop
        this.startGame();

        return;
    }

    createCameras(){        
        // Create 1st for the selected balloon
        var camera1 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera1.updateProjectionMatrix();
        this.app.addCamera(camera1, '1stPerson');

        // 3rd person camera
        var camera3 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera3.updateProjectionMatrix();
        this.app.addCamera(camera3, '3rdPerson');

        this.app.setActiveCamera('1stPerson'); // Set active camera to update the controls target

        // Place the 1st Person camera
        this.app.cameras['1stPerson'].position.set(this.selectedBalloonGroup.position.x - 8, this.selectedBalloonGroup.position.y + 3, this.selectedBalloonGroup.position.z - 1);

        // Update control target differently for simple and modern balloons
        if(this.selectedBalloon.name.includes('simple')){
            this.app.updateControlsTarget(new THREE.Vector3(this.selectedBalloonGroup.position.x, this.selectedBalloonGroup.position.y + 4, this.selectedBalloonGroup.position.z - 20));
        }
        else{
            this.app.updateControlsTarget(new THREE.Vector3(this.selectedBalloonGroup.position.x, this.selectedBalloonGroup.position.y + 5, this.selectedBalloonGroup.position.z - 20));
        }

        // Add the 1st Person camera to the selected balloon group
        this.selectedBalloonGroup.add(this.app.cameras['1stPerson']);

        this.app.setActiveCamera('3rdPerson'); // Set active camera to update the controls target

        // Place the 3rd Person camera and update the controls target
        this.app.cameras['3rdPerson'].position.set(this.selectedBalloonGroup.position.x - 8, this.selectedBalloonGroup.position.y + 50, this.selectedBalloonGroup.position.z + 50);
        this.app.updateControlsTarget(new THREE.Vector3(this.selectedBalloonGroup.position.x, this.selectedBalloonGroup.position.y, this.selectedBalloonGroup.position.z));
        this.selectedBalloonGroup.add(this.app.cameras['3rdPerson']); // Add the 3rd Person camera to the selected balloon group
    }

    // Toggle between 1st and 3rd person cameras
    toggleCamera(){
        if(this.app.activeCameraName === '1stPerson'){
            this.app.setActiveCamera('3rdPerson');
        }
        else{
            this.app.setActiveCamera('1stPerson');
        }
    }

    // Create a marker to indicate both balloon's positions
    createBalloonMarker() {
        const markerGeometry = new THREE.SphereGeometry(1, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x01ffff });
        this.balloonMarker = new THREE.Mesh(markerGeometry, markerMaterial);
        this.balloonMarker.position.set(this.selectedBalloonGroup.position.x, this.selectedBalloonGroup.position.y + 22.5, this.selectedBalloonGroup.position.z);
        this.app.scene.add(this.balloonMarker);

        const marker2Material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
        this.balloon2Marker = new THREE.Mesh(markerGeometry, marker2Material);
        this.balloon2Marker.position.set(this.oppBalloon.position.x, this.oppBalloon.position.y + 22.5, this.oppBalloon.position.z);
        this.app.scene.add(this.balloon2Marker);
    }

    // Create a shadow for the selected balloon to check for off track collisions
    createBalloonShadow() {
        const shadowGeometry = new THREE.CircleGeometry(5.45, 32); // radius that best fits the balloon model
        const shadowMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.6, transparent: true, side: THREE.DoubleSide });
        this.balloonShadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.balloonShadow.rotation.x = -Math.PI / 2;
        this.balloonShadow.position.set(this.selectedBalloonGroup.position.x, 0.8, this.selectedBalloonGroup.position.z); // Set below the balloon, close to the ground
        this.app.scene.add(this.balloonShadow);
    }

    // Create outdoor display
    createGameStateDisplay() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
    
        const context = canvas.getContext('2d');
        context.font = 'bold 60px Inter';
        context.fillStyle = 'green';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Loading...', canvas.width / 2, canvas.height / 2);
    
        const texture = new THREE.CanvasTexture(canvas);

        // Create a plane geometry and material
        const geometry = new THREE.PlaneGeometry(80, 40);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });

        // Create the mesh
        this.gameCanvasMesh = new THREE.Mesh(geometry, material);

        // Position the canvas in the scene
        this.gameCanvasMesh.position.set(-80, 50, -130);
        //this.gameCanvasMesh.rotation.set(0, Math.PI/2, 0);
        this.app.scene.add(this.gameCanvasMesh);
    
        this.canvasContext = context;
        this.canvasTexture = texture;
    }

    // Update the outdoor display with the game state
    updateGameStateDisplay() {
        const gameState = this.app.getGameState();
        
        // Calculate minutes and seconds of the elapsed time
        const minutes = Math.floor(gameState.elapsedTime / 60);
        const seconds = Math.floor(gameState.elapsedTime % 60).toString().padStart(2, '0');
    
        // Clear the canvas
        this.canvasContext.clearRect(0, 0, 2048, 1024);
    
        // Fill the canvas with a black background
        this.canvasContext.fillStyle = 'black';
        this.canvasContext.fillRect(0, 0, 2048, 1024);

        this.canvasContext.fillStyle = 'white';
        this.canvasContext.font = 'bold 60px Inter';
        this.canvasContext.textAlign = 'center';
        this.canvasContext.textBaseline = 'middle';

        // Calculate the center and line height
        const centerX = 2048 / 2;
        const lineHeight = 80;

        // Display the game state information
        this.canvasContext.fillText(`==============================================`, centerX, lineHeight);
        this.canvasContext.fillText(`Balloon Road Rage`, centerX, lineHeight * 2);
        this.canvasContext.fillText(`==============================================`, centerX, lineHeight * 3);
        this.canvasContext.fillText(``, centerX, lineHeight * 4);
        this.canvasContext.fillText(`${gameState.playerName} vs CPU`, centerX, lineHeight * 5);
        this.canvasContext.fillText(`----------------------------`, centerX, lineHeight * 6);
        this.canvasContext.fillText(`Time - ${minutes}:${seconds}`, centerX, lineHeight * 7);
        this.canvasContext.fillText(`Laps - ${gameState.lapsCompleted}/1`, centerX, lineHeight * 8);
        this.canvasContext.fillText(`Current Air Layer - ${gameState.airLayer}`, centerX, lineHeight * 9);
        this.canvasContext.fillText(`Vouchers - x${gameState.availableVouchers}`, centerX, lineHeight * 10);
        this.canvasContext.fillText(`Game Status - ${gameState.gamePaused ? 'Paused' : 'Running'}`, centerX, lineHeight * 11);
    
        this.canvasTexture.needsUpdate = true; // Update the texture
    }    

    // Handle key down events
    onKeyDown(event) {
        this.keys[event.key] = true; // Set the key state to true

        if (event.key === 'Escape') { // If Escape key is pressed, track it to exit the game back to home menu
            this.escapePressed = true;
            this.endGame(); // End the game prematurely
        } else if (event.key === ' ') { // If Space key is pressed, toggle pause
            this.togglePause();
        }
        else if (event.key === 'c' || event.key === 'C') { // If C key is pressed, toggle between 1st and 3rd person cameras
            this.toggleCamera();
        }
    }

    // Handle key up events
    onKeyUp(event) {
        this.keys[event.key] = false; // Set the key state to false
    }

    startGame(){
        console.log("Starting game...");

        // Create and play the animation with variability
        this.createAndPlayAnimation();

        const gameLoop = () => {
            // Check if the game is still running
            if (!this.app.gameState.gameStarted && this.app.gameState.gameWinner !== null && this.app.gameState.finalMenuActive) {
                // Deactivate arrows
                this.deactivateArrows();
                
                // Show the final menu and particles
                this.app.menu.showFinalMenu();
                return;
            }

            // Check if the game is paused
            if (!this.isPaused) {
                // Update the game state
                this.update();

                // Render the scene
                this.app.renderer.render(this.app.scene, this.app.activeCamera);
            }

            // Request the next frame
            requestAnimationFrame(gameLoop);
        };

        // Start the loop
        requestAnimationFrame(gameLoop);
    }

    createAndPlayAnimation() {
        // Random lap time between 60 and 150 seconds
        const lapTime = Math.random() * 90 + 60;

        // Select random route
        var line = null;
        if(this.oppBalloon.position.x === -8){
            // select random route from routesA
            line = this.routes.routesA[Math.floor(Math.random() * this.routes.routesA.length)];
        }
        else{
            // select random route from routesB
            line = this.routes.routesB[Math.floor(Math.random() * this.routes.routesB.length)];
        }

        // make route visible
        line.visible = true;

        // Extract waypoints from the selected route
        const waypoints = line.userData.points; // Assuming route is an array of {x, y, z} objects

        // Create keyframe times and values
        const times = [];
        const values = [];
        const timeStep = lapTime / (waypoints.length - 1);

        waypoints.forEach((waypoint, index) => {
            times.push(index * timeStep);
            values.push(waypoint.x, waypoint.y, waypoint.z);
        });

        // Define keyframes for position with variable lap time
        const positionKF = new THREE.VectorKeyframeTrack('.position', times, values);

        // Create an animation clip with the variable lap time
        const clip = new THREE.AnimationClip('move', lapTime, [positionKF]);

        // Create an action and play it
        this.action = this.mixer.clipAction(clip);
        this.action.setLoop(THREE.LoopOnce); // Loop the animation
        this.action.clampWhenFinished = true; // Keep the last frame when finished
        this.action.play();
    }

    update(){
        // Check the current direction based on the balloon's height
        var direction = this.checkDirection();

        // Update the game state
        const delta = this.app.clock.getDelta(); // Get the time elapsed since the last frame
        this.updateElapsedTime(); // Update the elapsed time in the game state
        this.mixer.update(delta); // Update the animation mixer

        // Move the selected balloon based on key inputs
        this.moveSelectedBalloon(delta, direction);

        // Update camera target
        this.updateCameraTarget(direction);

        // Update marker position
        this.updateMarkerPosition(direction);

        // Update wind arrow visuals
        this.updateWindArrow(direction);

        // Update air layer for outdoor display
        this.updateAirLayer(direction);

        // Update shadow position
        this.updateShadowPosition();

        // Update balloons bounding boxes
        this.updateBoundingBoxes(this.balloons);

        // Check for collisions with the selected balloon
        this.checkCollisions();

        // Check if the balloon is off-track
        this.checkOffTrack();

        // Change the balloon billboards angles to always pan to the camera
        this.updateBalloonBillboardsAngles();

        // Update the outdoor display
        this.updateGameStateDisplay();
        
        // Check for winner
        this.checkWinner(direction);
    }

    updateCameraTarget(direction) {
        var balloonPosition = this.selectedBalloonGroup.position;

        // Determine the direction letter based on the direction vector
        var directionLetter;
        if (direction.x === 0 && direction.z === 0) {
            directionLetter = '';
        }
        else if (direction.x === 0 && direction.z === -1) {
            directionLetter = 'N';
        }
        else if (direction.x === 0 && direction.z === 1) {
            directionLetter = 'S';
        }
        else if (direction.x === 1 && direction.z === 0) {
            directionLetter = 'E';
        }
        else if (direction.x === -1 && direction.z === 0) {
            directionLetter = 'W';
        }

        // Update camera position based on the balloon's direction letter
        if (this.app.activeCameraName === '1stPerson') {
            switch(directionLetter) {
                case 'N':
                    balloonPosition = new THREE.Vector3(balloonPosition.x, balloonPosition.y + 4, balloonPosition.z - 10); // Point the camera forward
                    break;
                case 'S':
                    balloonPosition = new THREE.Vector3(balloonPosition.x, balloonPosition.y + 2, balloonPosition.z + 10); // Point the camera backward
                    break;
                case 'E':
                    balloonPosition = new THREE.Vector3(balloonPosition.x + 10, balloonPosition.y + 2, balloonPosition.z); // Point the camera right
                    break;
                case 'W':
                    balloonPosition = new THREE.Vector3(balloonPosition.x - 10, balloonPosition.y + 2, balloonPosition.z); // Point the camera left
                    break;
                default:
                    break;
            }
        }

        if(directionLetter !== ''){
            // Update controls with the new position and target
            this.app.updateControlsTarget(balloonPosition);
        }
    }
        
    // Update the wind arrow visuals based on the wind direction
    updateWindArrow(direction) {
        // If no direction, deactivate all arrows
        if (direction.x === 0 && direction.z === 0) {
            this.deactivateArrows();
        }
        // If N, activate the up arrow
        else if (direction.x === 0 && direction.z === -1) {
            const upArrow = document.getElementById('upArrowBox'); // get html element
            upArrow.style.display = ''; // show the arrow
            this.deactivateArrows('upArrowBox'); // deactivate other arrows
        }
        // If S, activate the down arrow
        else if (direction.x === 0 && direction.z === 1) {
            const downArrow = document.getElementById('downArrowBox'); // get html element
            downArrow.style.display = ''; // show the arrow
            this.deactivateArrows('downArrowBox'); // deactivate other arrows
        }
        // If E, activate the right arrow
        else if (direction.x === 1 && direction.z === 0) {
            const rightArrow = document.getElementById('rightArrowBox'); // get html element
            rightArrow.style.display = ''; // show the arrow
            this.deactivateArrows('rightArrowBox'); // deactivate other arrows
        }
        // If W, activate the left arrow
        else if (direction.x === -1 && direction.z === 0) {
            const leftArrow = document.getElementById('leftArrowBox'); // get html element
            leftArrow.style.display = ''; // show the arrow 
            this.deactivateArrows('leftArrowBox'); // deactivate other arrows
        }
        else {
            this.deactivateArrows(); // deactivate all arrows
        }
        return;
    }

    // Update the air layer based on the wind direction
    updateAirLayer(direction) {
        if (direction.x === 0 && direction.z === 0) {
            this.app.setGameState({airLayer: 0});
        } else if (direction.x === 0 && direction.z === -1) {
            this.app.setGameState({airLayer: 1});
        } else if (direction.x === 0 && direction.z === 1) {
            this.app.setGameState({airLayer: 2});
        } else if (direction.x === 1 && direction.z === 0) {
            this.app.setGameState({airLayer: 3});
        } else if (direction.x === -1 && direction.z === 0) {
            this.app.setGameState({airLayer: 4});
        } else {
            this.app.setGameState({airLayer: undefined});
        }
        return;
    }

    // Deactivate all arrows except the one specified (or none)
    deactivateArrows(except = null) {
        const arrows = ['upArrowBox', 'downArrowBox', 'leftArrowBox', 'rightArrowBox'];
        for (const arrow of arrows) {
            if (arrow !== except) {
                const arrowElement = document.getElementById(arrow);
                arrowElement.style.display = 'none';
            }
        }

        return;
    }

    // Update the marker positions based on the balloon positions
    updateMarkerPosition() {
        this.balloonMarker.position.set(this.selectedBalloonGroup.position.x, this.selectedBalloonGroup.position.y + 22.5, this.selectedBalloonGroup.position.z);
        this.balloon2Marker.position.set(this.oppBalloon.position.x, this.oppBalloon.position.y + 22.5, this.oppBalloon.position.z);
    }

    // Update the shadow position based on the selected balloon position
    updateShadowPosition() {
        this.balloonShadow.position.set(this.selectedBalloonGroup.position.x, 0.8, this.selectedBalloonGroup.position.z);
    }

    // Update the bounding boxes for all objects
    updateBoundingBoxes(objects) {
        for (const key in objects) {
            const object = objects[key];

            if (object.userData.boundingBox) {
                // Recalculate bounding box
                object.userData.boundingBox.setFromObject(object);
    
                // Update the BoxHelper visualization
                if (object.userData.boundingBoxHelper) {
                    object.userData.boundingBoxHelper.setFromObject(object);
                }
            }
        };
    }

    // Move the selected balloon based on key inputs
    moveSelectedBalloon(delta, direction) {
        if (this.balloonStopped) {
            return; // Skip movement if the balloon is stopped
        }

        const speed = 15;
        const moveDistance = speed * delta;

        // If W is pressed, move the balloon upwards unless it reaches the top
        if ((this.keys['w'] || this.keys['W']) && this.selectedBalloonGroup.position.y + moveDistance < 22) {
            this.selectedBalloonGroup.position.y += moveDistance;
        }
        // If S is pressed, move the balloon downwards unless it reaches the bottom
        if ((this.keys['s'] || this.keys['S']) && this.selectedBalloonGroup.position.y - moveDistance > 2) {
            this.selectedBalloonGroup.position.y -= moveDistance;
        }

        if (direction) {
            // Move the balloon based on the direction of the wind
            this.selectedBalloonGroup.position.x += direction.x * moveDistance;
            this.selectedBalloonGroup.position.z += direction.z * moveDistance;
        }
    }

    // Stop the selected balloon
    stopBalloon() {
        this.balloonStopped = true;
    }
    
    // Resume the selected balloon
    resumeBalloon() {
        this.balloonStopped = false;
    }
    
    // Check the current direction based on the balloon's height
    checkDirection(){
        const height = this.selectedBalloonGroup.position.y;
        
        // Determine the current level based on height
        var currentLevel = null;
        for(var level in this.levelDirections){
            if(height >= level && height < parseFloat(level) + 4){
                currentLevel = level;
                break;
            }
        }

        return this.levelDirections[currentLevel];
    }

    checkWinner(direction){
        // Check if the player's balloon has reached the finish line
        const finishLineXMin = this.finishLineXMin; // Finish line min X position
        const finishLineXMax = this.finishLineXMax; // Finish line max X position
        const finishLineZMin = 0.5; // Finish line min Z position
        const finishLineZMax = 1.5; // Finish line max Z position
        const winningDirection = { x: 0, z: -1 }; // Winning direction is N
        
        // Check if the player's balloon has reached the finish line
        if(this.checkFinalPosition(finishLineXMin, finishLineXMax, finishLineZMin, finishLineZMax, direction, winningDirection)){
            if(!this.cannotCrossFinishLine && this.app.gameState.gameWinner === null){ // If the player is allowed to cross the finish line and there is no game winner yet
                this.lapsCompleted++; // Increment the number of laps completed
                console.log("Winner!");
                this.app.setGameState({ gameWinner: this.app.gameState.playerName, gameStarted: false, finalMenuActive: true, lapsCompleted: this.lapsCompleted }); // Set the player as the winner
                this.cannotCrossFinishLine = true; // Prevent the player from crossing the finish line again
            }
        } else if (this.selectedBalloonGroup.position.z > finishLineZMin && this.selectedBalloonGroup.position.z < finishLineZMax && this.selectedBalloonGroup.position.x < -20) { // If the player reaches the middle of the track, allow crossing the finish line to avoid passing the line backwards and bugging a game win.
            this.cannotCrossFinishLine = false;
        }

         // Check if the autonomous balloon's animation is over and Escape key is not pressed
         if (this.action.isRunning() === false && this.app.gameState.gameWinner === null && !this.escapePressed) {
            // Handle winning logic for autonomous balloon
            this.app.setGameState({ gameWinner: "CPU", gameStarted: false, finalMenuActive: true });
        }
    }

    // Check if the player's balloon has reached the finish line and with the correct direction (forward)
    checkFinalPosition(finishLineXMin, finishLineXMax, finishLineZMin, finishLineZMax, direction, winningDirection){
        return this.selectedBalloonGroup.position.x > finishLineXMin && this.selectedBalloonGroup.position.x < finishLineXMax 
            && this.selectedBalloonGroup.position.z > finishLineZMin && this.selectedBalloonGroup.position.z < finishLineZMax &&
        direction.x === winningDirection.x && direction.z === winningDirection.z;
    }

    // End the game prematurely
    endGame() {
        this.elapsedTime = this.app.clock.getElapsedTime(); // Get the elapsed time
        this.deactivateArrows(); // Deactivate all arrows

        if(this.action){
            this.action.stop(); // Stop the autonomous balloon animation
        }

        this.app.resetGame(); // Reset the game state and back to the home menu
    }

    // Toggle pause
    togglePause() {
        this.isPaused = !this.isPaused; // Toggle the pause state
        this.app.setGameState({ gamePaused: this.isPaused }); // Update the game state
        const pauseOverlay = document.getElementById('pauseOverlay');
        if (this.isPaused) {
            this.app.clock.stop(); // Stop the clock
            this.elapsedTime = this.app.clock.getElapsedTime(); // get current elapsed time
            this.action.paused = true; // Pause the autonomous balloon animation
            pauseOverlay.style.display = ''; // Show the pause overlay to indicate the game is paused
        } else {
            this.action.paused = false; // Resume the autonomous balloon animation
            pauseOverlay.style.display = 'none'; // Hide the pause overlay
            this.app.clock.start(); // Start the clock (sets elapsed time to 0)
            this.app.clock.elapsedTime = this.elapsedTime; // Set the elapsed time to the previous value
        }
        // Update the outdoor display
        this.updateGameStateDisplay();
    }

    // Update the elapsed time in the game state
    updateElapsedTime() {
        if (this.isPaused) { // If the game is paused, use the elapsed time, because the clock is stopped or might be reset to 0
            this.app.setGameState({ elapsedTime: this.elapsedTime });
        } else { // Otherwise, use the clock's elapsed time
            this.app.setGameState({ elapsedTime: this.app.clock.getElapsedTime() });
        }
    }

    // Check for collisions with the selected balloon
    checkCollisions() {
        const selectedBoundingBox = this.selectedBalloon.userData.boundingBox; // Get the selected balloon's bounding box
        const gameState = this.app.getGameState(); // Get the game state

        // Check collision with opponent balloon
        if (selectedBoundingBox.intersectsBox(this.oppBalloon.userData.boundingBox)) {
            console.log("Collision detected with opponent balloon!");
            this.handleCollision(this.oppBalloon, gameState["cooldown"]);
        }

        // Check collisions with obstacles
        for (const obstacle of this.obstacles.obstacleObjects) {
            if (selectedBoundingBox.intersectsBox(obstacle.userData.boundingBox)) {
                this.handleCollision(obstacle, gameState["cooldown"]);
            }
        }

        // Check collisions with powerups
        for (const powerUp of this.powerups.powerupObjects) {
            if (selectedBoundingBox.intersectsBox(powerUp.userData.boundingBox)) {
                console.log("Collision detected with powerup!");
                this.collectVoucher(powerUp, gameState["cooldown"]); // Collect voucher from the powerup
            }
        }
    }

    // Handle collisions with objects
    handleCollision(object, cooldown) {
        const now = Date.now(); // Get the current time in milliseconds
    
        // Check if the object is already in cooldown
        if (this.collisionCooldowns.has(object) && now < this.collisionCooldowns.get(object)) {
            return; // Ignore collision during cooldown
        }

        // Set cooldown expiration time
        this.collisionCooldowns.set(object, now + cooldown * 1000);

        // Use a voucher if available
        if (this.vouchers > 0) {
            this.vouchers -= 1;
            this.app.setGameState({ availableVouchers: this.vouchers });
            console.log(`Used a voucher to avoid cooldown! Remaining vouchers: ${this.vouchers}`);
            return; // Skip the cooldown penalty
        }
    
        // Stop balloon movement
        console.log("Collision detected! Stopping balloon...");
        this.stopBalloon();
    
        // Resume movement after cooldowns
        setTimeout(() => {
            console.log("Resuming balloon movement...");
            this.resumeBalloon();
        }, cooldown * 1000);
    }

    // Collect a voucher from a powerup
    collectVoucher(powerUp, cooldown) {
        const now = Date.now(); // Get the current time in milliseconds
    
        // Check if the powerup is already in cooldown
        if (this.collisionCooldowns.has(powerUp) && now < this.collisionCooldowns.get(powerUp)) {
            return; // Ignore collection during cooldown
        }
    
        // Increment voucher count
        this.vouchers += 1;
        this.app.setGameState({ availableVouchers: this.vouchers });
        console.log(`Collected a voucher! Total vouchers: ${this.vouchers}`);
    
        // Set cooldown to prevent continuous collection
        this.collisionCooldowns.set(powerUp, now + cooldown * 1000);
    }

    // Check if the balloon is off-track
    checkOffTrack() {
        const shadowPosition = new THREE.Vector2(this.balloonShadow.position.x, this.balloonShadow.position.z); // Get shadow position

        // Get track data
        const trackCurve = this.track.getTrackCurve();
        const trackWidth = this.track.getTrackWidth();
    
        // Sample the curve into a large number of points for better accuracy
        const points = trackCurve.getPoints(500);
    
        // Initialize variables to track the closest point
        let minDistance = Infinity;
        let closestPoint = null;
    
        // Iterate over sampled points to find the closest point
        points.forEach(point => {
            const trackPoint2D = new THREE.Vector2(point.x, point.z);
            const distance = shadowPosition.distanceTo(trackPoint2D);
    
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = point;
            }
        });
    
        // Check if the shadow is off-track
        if (minDistance > trackWidth / 0.95) {
            this.handleOffTrack(closestPoint);
        }
    }
    
    // Handle off-track situations, repositioning the balloon to the nearest point on the track
    handleOffTrack(nearestPoint) {
        const gameState = this.app.getGameState(); // Get the game state

        if (this.vouchers > 0) { // If a voucher is available, use it to not be on cooldown
            this.vouchers -= 1; // Use a voucher
            this.app.setGameState({ availableVouchers: this.vouchers });
            this.selectedBalloonGroup.position.set(nearestPoint.x, 2.0, nearestPoint.z);  // Place the balloon back on the track
            this.app.updateControlsTarget(new THREE.Vector3(nearestPoint.x, 4.0, nearestPoint.z - 10)); // Update the controls target
            console.log(`Used a voucher to stay on track! Remaining vouchers: ${this.vouchers}`);
            return;
        }

        // Prevent repeated cooldown application
        if (this.isOffTrackCooldown) {
            return;
        }
    
        console.log("Off-track detected! Applying cooldown...");

        // Set cooldown flags
        this.isOffTrackCooldown = true;
    
        this.stopBalloon(); // Stop the balloon
        setTimeout(() => {
            this.selectedBalloonGroup.position.set(nearestPoint.x, 2.0, nearestPoint.z); // Place the balloon back on the track
            this.app.updateControlsTarget(new THREE.Vector3(nearestPoint.x, 4.0, nearestPoint.z - 10)); // Update the controls target
            console.log("Balloon repositioned to the track axis.");
            this.resumeBalloon();
            this.isOffTrackCooldown = false; // Reset cooldown flag after repositioning
        }, (gameState["cooldown"]) * 1000);
    }
    
    // Update the balloons' billboards angles to always pan to the camera
    updateBalloonBillboardsAngles() {
        const cameraPosition = this.app.getActiveCamera().position; // Get the active camera position
    
        // Iterate over all balloons
        for (const balloonName in this.balloons) {
            const balloon = this.balloons[balloonName];
            const billboardGroup = balloon.children[0].children[1]; // Access the billboard group
    
            if (!billboardGroup) {
                console.warn(`Billboard group not found for balloon: ${balloonName}`);
                continue;
            }
    
            // Calculate direction vector
            const direction = new THREE.Vector3().subVectors(cameraPosition, billboardGroup.position);
            direction.y = 0; // Ignore the Y component for 2D rotation
    
            // Compute the angle and update rotation
            const angle = Math.atan2(direction.x, direction.z);
            billboardGroup.rotation.y = angle;
        }
    }    
}

export { MyGame };