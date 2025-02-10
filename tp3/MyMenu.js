import * as THREE from 'three';
import { MySpritesheetText } from './MySpritesheetText.js';
import { MyFirework } from './MyFirework.js';

class MyMenu {
    constructor(app) {
        this.app = app;
        this.playerName = '';  // Player name input value
        this.inputElement = null;  // Reference to the input element
        this.logoElement = null;  // Reference to the logo element
        this.restartButton = null; // Reference to the restart button element
        this.backButton = null; //  Reference to the back button element

        this.spritesheetText = new MySpritesheetText('scenes/scene/textures/spritesheet.png', 464 / 16, 594 / 18, 16);
        this.spritesheetText.loadSpritesheet(() => {
            // Callback function to render the menu once the spritesheet is loaded
            console.log('Spritesheet loaded callback called');
            this.showMenu();
        });

        this.fireworks = [] // Array to store fireworks
        this.count = 0; // Counter to add fireworks when x time has passed
        this.animationFrameId = null; // Animation frame id
    }

    // Function to show the main menu
    showMenu() {
        // Clear the scene (optional, you can choose to clear previous objects if needed)
        while(this.app.scene.children.length > 0){ 
            this.app.scene.remove(this.app.scene.children[0]); 
        }

        // Create a gradient background
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Create gradient
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#ff0000'); // Start color
        gradient.addColorStop(1, '#0000ff'); // End color

        // Fill with gradient
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Use canvas as texture
        const texture = new THREE.CanvasTexture(canvas);
        this.app.scene.background = texture;

        // Render main menu text using the spritesheet text renderer
        this.spritesheetText.renderText(this.app.scene, "Balloon Road Rage", -400, 300, 2);  // Show the title at the top
        this.spritesheetText.renderText(this.app.scene, "Enter Your Name:", -200, 150);  // Player input prompt
        this.spritesheetText.renderText(this.app.scene, "Press Enter to Start", -250, 0);  // Instructions to start the game
        this.spritesheetText.renderText(this.app.scene, "Diogo Silveira Viana", -600, -300, 0.8);
        this.spritesheetText.renderText(this.app.scene, "Gonçalo Martins", 200, -300, 0.8);
        this.spritesheetText.renderText(this.app.scene, "@ FEUP, SGI 2024/2025", -150, -400, 0.8);

        // Set up player name input element
        this.createPlayerNameInput();

        // Create the FEUP logo
        this.createFEUPLogo();

        // Set the active camera to the orthogonal camera (used for menus)
        this.app.setActiveCamera('Orthogonal');
    }

    // Function to create the HTML input for player name
    createPlayerNameInput() {
        if (this.inputElement) return;  // Don't create multiple inputs

        // Create the HTML input for player name
        this.inputElement = document.createElement('input');
        this.inputElement.type = 'text';
        this.inputElement.id = 'playerNameInput';
        this.inputElement.placeholder = 'Enter your name here';
        this.inputElement.style.position = 'absolute';
        this.inputElement.style.top = '40%'; 
        this.inputElement.style.left = '50%';
        this.inputElement.style.transform = 'translateX(-50%)';
        this.inputElement.style.padding = '10px';
        this.inputElement.style.fontSize = '16px';
        this.inputElement.style.border = '2px solid #fff';
        this.inputElement.style.background = '#000';
        this.inputElement.style.color = '#fff';

        // Add the input to the DOM
        document.body.appendChild(this.inputElement);

        // Listen for changes in the input field (optional)
        this.inputElement.addEventListener('input', (event) => {
            this.playerName = event.target.value;
        });

        // Focus on the input box when menu is shown
        this.inputElement.focus();
    }

    // Function to create the FEUP logo
    createFEUPLogo() {
        if (this.logoElement) return;  // Don't create multiple logos
        // Create the FEUP logo
        this.logoElement = document.createElement('img');
        this.logoElement.src = 'scenes/scene/textures/feup_logo.png';
        this.logoElement.style.position = 'absolute';
        this.logoElement.style.bottom = '3%';
        this.logoElement.style.right = '22.5%';
        this.logoElement.style.width = '100px';
        this.logoElement.style.height = 'auto';
        this.logoElement.style.border = '2px solid #fff';
        this.logoElement.style.borderRadius = '10px';
        this.logoElement.style.background = '#000';
        this.logoElement.style.padding = '10px';
        // Add the logo to the DOM
        document.body.appendChild(this.logoElement);
    }

    // Function to hide the menu and the input field
    hideMenu() {
        this.app.scene.clear(); // Clear the scene (if needed)

        // Remove the input element
        if (this.inputElement) {
            document.body.removeChild(this.inputElement);
            this.inputElement = null;
        }

        // Remove the FEUP logo
        if (this.logoElement) {
            document.body.removeChild(this.logoElement);
            this.logoElement = null;
        }
    }

    // Show Final Menu
    showFinalMenu() {
        // Clear the scene (optional, you can choose to clear previous objects if needed)
        while (this.app.scene.children.length > 0) {
            this.app.scene.remove(this.app.scene.children[0]);
        }

        // Create a gradient background
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Create gradient
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#ff0000'); // Start color
        gradient.addColorStop(1, '#0000ff'); // End color

        // Fill with gradient
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Use canvas as texture
        const texture = new THREE.CanvasTexture(canvas);
        this.app.scene.background = texture;

        // Calculate elapsed time in minutes and seconds
        const minutes = Math.floor(this.app.gameState.elapsedTime / 60);
        const seconds = Math.floor(this.app.gameState.elapsedTime % 60).toString().padStart(2, '0');

        // Create the final menu text strings
        var title = "Balloon Road Rage";
        var winnerString = this.app.gameState.gameWinner + " wins!";
        var selectedBalloon = this.app.gameState.playerName + " chose " + this.app.gameState.selectedBalloon;
        var oppBalloon = "CPU Balloon: " + this.app.gameState.selectedOppBalloon;
        var elapsedTime = "Lap completed in: " + minutes + ":" + seconds; 

        // Render main menu text using the spritesheet text renderer
        this.spritesheetText.renderText(this.app.scene, title, -400, 300, 2);  // Show the title at the top
        this.spritesheetText.renderText(this.app.scene, winnerString, -200, 200);  // Player input prompt
        this.spritesheetText.renderText(this.app.scene, elapsedTime, -250, 50, 0.8); // Elapsed Time
        this.spritesheetText.renderText(this.app.scene, selectedBalloon, -525, 150);  // Selected Balloon Name
        this.spritesheetText.renderText(this.app.scene, oppBalloon, -525, -50);  // Opponent Balloon Name

        // Remove buttons if they previously existed
        if (this.restartButton !== null) {
            document.body.removeChild(this.restartButton);
            this.restartButton = null;
        }
        if (this.backButton !== null) {
            document.body.removeChild(this.backButton);
            this.backButton = null;
        }

        // Create restart button
        this.restartButton = document.createElement('button');
        this.restartButton.innerText = 'Restart Game';
        this.restartButton.style.position = 'absolute';
        this.restartButton.style.top = '65%';
        this.restartButton.style.left = '55%';
        this.restartButton.style.transform = 'translate(-50%, -50%)';
        this.restartButton.style.padding = '10px 20px';
        this.restartButton.style.fontSize = '16px';
        this.restartButton.style.cursor = 'pointer';

        // Create back button
        this.backButton = document.createElement('button');
        this.backButton.innerText = 'Back to Menu';
        this.backButton.style.position = 'absolute';
        this.backButton.style.top = '65%';
        this.backButton.style.left = '45%';
        this.backButton.style.transform = 'translate(-50%, -50%)';
        this.backButton.style.padding = '10px 20px';
        this.backButton.style.fontSize = '16px';
        this.backButton.style.cursor = 'pointer';

        // Add event listeners
        this.restartButton.addEventListener('click', () => {
            this.app.restartGame(); // Assuming restartGame restarts the game with the same options
        });

        this.backButton.addEventListener('click', () => {
            this.app.resetGame(); // Call resetGame to go back to the starting menu
        });

        // Add buttons to the DOM
        document.body.appendChild(this.restartButton);
        document.body.appendChild(this.backButton);

        // Set the active camera to the orthogonal camera (used for menus)
        this.app.setActiveCamera('Orthogonal');

        // implement fireworks
        // Update fireworks in the animation loop
        const animate = () => {
            this.animationFrameId = requestAnimationFrame(animate);

            // Add new fireworks every 150 calls
            if (this.count === 0) {
                this.fireworks.push(new MyFirework(this.app));
                //console.log("firework added");
            }

            // Update each firework
            for (let i = 0; i < this.fireworks.length; i++) {
                // Check if the firework is done
                if (this.fireworks[i].done) {
                    // Remove the firework
                    this.fireworks.splice(i, 1);
                    //console.log("firework removed");
                    continue;
                }
                // Otherwise, update the firework
                this.fireworks[i].update();
            }

            // Increment count
            this.count += 1;

            // Reset count every 150 calls
            if (this.count === 150) {
                this.count = 0;
            }
        };

        animate();
    }

    // Hide Final Menu
    hideFinalMenu() {
        // Cancel the animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Clear the scene
        while (this.app.scene.children.length > 0) {
            this.app.scene.remove(this.app.scene.children[0]);
        } 
        // Clear the fireworks array and count
        this.fireworks = [];
        this.count = 0;

        // Remove the buttons from the DOM
        if (this.restartButton !== null) {
            document.body.removeChild(this.restartButton);
            this.restartButton = null;
        }
        if (this.backButton !== null) {
            document.body.removeChild(this.backButton);
            this.backButton = null;
        }
    }
}

export { MyMenu };
