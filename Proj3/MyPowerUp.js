import * as THREE from 'three';

class MyPowerUp {
    constructor(app) {
        this.app = app;
        this.powerupObjects = [];
    }

    // Add a new powerup to the list
    addNewPowerUp(obj) {
        this.powerupObjects.push(obj);
    }

    // Clear the powerup list
    clearPowerUps() {
        this.powerupObjects = [];
    }
}

export { MyPowerUp };