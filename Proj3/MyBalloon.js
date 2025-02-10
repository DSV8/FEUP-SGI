import * as THREE from 'three';

class MyBalloon {
    constructor(app) {
        this.app = app;
        this.balloonObjects = {};
    }

    /**
     * Add balloon to the list
     * @param {*} name balloon name
     * @param {*} obj balloon object
     */
    addNewBalloon(name, obj) {
        this.balloonObjects[name] = obj;
    }

    /**
     * Clear the balloon list
     */
    clearBalloons() {
        this.balloonObjects = {};
    }
}

export { MyBalloon };