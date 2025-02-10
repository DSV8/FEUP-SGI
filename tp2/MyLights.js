import * as THREE from 'three';

class MyLights {
    constructor(app) {
        this.app = app;
        this.lights = [];
        this.convertColor = null;
    }

    /**
     * Convert color using the passed convertColor function
     * @param {Object} color The color object to convert
     * @returns {THREE.Color} The converted THREE.Color object
     */
    convertColor(color) {
        if (this.convertColor) { // if convertColor function was passed from MySceneData
            return this.convertColor(color); // execute the function
        } else {
            console.error('convertColor function is not defined'); // function was not passed from MySceneData
            return new THREE.Color(0, 0, 0); // Return black color as default
        }
    }

    /**
     * Function that receives a pointlight node and returns a pointlight object
     * @param {*} light node with type 'pointlight'
     * @returns pointlight object
     */
    createPointlight(light){
        var lightObj = new THREE.PointLight(
            this.convertColor(light.color),
            light.intensity,
            light.distance,
            light.decay);

        // set initial position
        lightObj.position.set(light.position[0], light.position[1], light.position[2]);

        // set shadow properties if enabled
        if (light.castshadow) {
            lightObj.castShadow = light.castshadow;
            lightObj.shadow.mapSize.width = light.shadowmapsize;
            lightObj.shadow.mapSize.height = light.shadowmapsize;
            lightObj.shadow.camera.far = light.shadowfar;
        }

        // declare if object is visible
        lightObj.visible = light.enabled;

        return lightObj;
    }

    /**
     * Function that receives a spotlight node and returns a spotlight object
     * @param {*} light node with type 'spotlight'
     * @returns spotlight object
     */
    createSpotlight(light){
        var lightObj = new THREE.SpotLight(
            this.convertColor(light.color),
            light.intensity,
            light.distance,
            THREE.MathUtils.degToRad(light.angle),
            light.penumbra,
            light.decay);

        // set initial position and target position
        lightObj.position.set(light.position[0], light.position[1], light.position[2]);
        lightObj.target.position.set(light.target[0], light.target[1], light.target[2]);

        // update target position
        this.app.scene.add(lightObj.target);

        // set shadow properties if enabled
        if (light.castshadow) {
            lightObj.castShadow = light.castshadow;
            lightObj.shadow.mapSize.width = light.shadowmapsize;
            lightObj.shadow.mapSize.height = light.shadowmapsize;
            lightObj.shadow.camera.far = light.shadowfar;
        }

        // declare if object is visible
        lightObj.visible = light.enabled;

        return lightObj;
    }

    createDirectionalLight(light){
        var lightObj = new THREE.DirectionalLight(
            this.convertColor(light.color),
            light.intensity);

        // set initial position
        lightObj.position.set(light.position[0], light.position[1], light.position[2]);

        // set shadow properties if enabled
        if (light.castshadow) {
            lightObj.castShadow = light.castshadow;
            lightObj.shadow.mapSize.width = light.shadowmapsize;
            lightObj.shadow.mapSize.height = light.shadowmapsize;
            lightObj.shadow.camera.far = light.shadowfar;
            lightObj.shadow.camera.left = light.shadowleft;
            lightObj.shadow.camera.right = light.shadowright;
            lightObj.shadow.camera.top = light.shadowtop;
            lightObj.shadow.camera.bottom = light.shadowbottom;
        }

        // declare if object is visible
        lightObj.visible = light.enabled;

        return lightObj;
    }
}

export { MyLights };