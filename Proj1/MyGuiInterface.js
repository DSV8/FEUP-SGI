import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';
import { MyLights } from './components/MyLights.js'

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
        this.contents = null
        this.lights = null
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Set the lights object
     * @param {MyLights} lights the lights objects
     */ 
    setLights(lights) {
        this.lights = lights
    }

    /**
     * Initialize the gui interface
     */
    init() {
        const data = {  
            'diffuse color': this.contents.diffusePlaneColor,
            'specular color': this.contents.specularPlaneColor,
        };

        const textureData = {
            'wrap mode U': 'Repeat',
            'wrap mode V': 'Repeat',
            'repeat U' : this.contents.planeTexture.repeat.x,
            'repeat V' : this.contents.planeTexture.repeat.y,
            'offset U' : this.contents.planeTexture.offset.x,
            'offset V' : this.contents.planeTexture.offset.y,
            'rotation' : this.contents.planeTexture.rotation
        };

        // adds a folder to the gui interface for the plane
        const planeFolder = this.datgui.addFolder( 'Plane' );
        planeFolder.addColor( data, 'diffuse color' ).onChange( (value) => { this.contents.updateDiffusePlaneColor(value) } );
        planeFolder.addColor( data, 'specular color' ).onChange( (value) => { this.contents.updateSpecularPlaneColor(value) } );
        planeFolder.add(this.contents, 'planeShininess', 0, 1000).name("shininess").onChange( (value) => { this.contents.updatePlaneShininess(value) } );
        planeFolder.open();

        // adds a folder to the gui interface for the texture
        const textureFolder = this.datgui.addFolder('Plane Texture');
        textureFolder.add(textureData, 'wrap mode U', [ 'Repeat', 'Clamp to Edge', 'Mirrored Repeat' ] ).onChange( (value) => { this.contents.updatePlaneTextureWrapModeU(value) } ).name("wrap mode U");
        textureFolder.add(textureData, 'wrap mode V', [ 'Repeat', 'Clamp to Edge', 'Mirrored Repeat' ] ).onChange( (value) => { this.contents.updatePlaneTextureWrapModeV(value) } ).name("wrap mode V");
        textureFolder.add(textureData, 'repeat U', 0.1, 10).onChange((value) => { this.contents.updatePlaneTextureRepeatU(value) });
        textureFolder.add(textureData, 'repeat V', 0.1, 10).onChange((value) => { this.contents.updatePlaneTextureRepeatV(value) });
        textureFolder.add(textureData, 'offset U', 0, 1).onChange((value) => { this.contents.updatePlaneTextureOffsetU(value) });
        textureFolder.add(textureData, 'offset V', 0, 1).onChange((value) => { this.contents.updatePlaneTextureOffsetV(value) });
        textureFolder.add(textureData, 'rotation', 0, Math.PI * 2).onChange((value) => { this.contents.updatePlaneTextureRotation(value) });

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective 1', 'Perspective 2', 'Left', 'Right', 'Top', 'Front', 'Back' ] ).name("active camera");
        // note that we are using a property from the app 
        cameraFolder.add(this.app.activeCamera.position, 'x', -15, 15).name("x coord")
        cameraFolder.add(this.app.activeCamera.position, 'y', 0.1, 15).name("y coord")
        cameraFolder.add(this.app.activeCamera.position, 'z', -15, 15).name("z coord")
        cameraFolder.open()

        // adds a folder to the gui interface for the cake spotlight
        const spotlightFolder = this.datgui.addFolder('Cake Spotlight');

        // cake spotlight data
        const spotlight_data = {
            'color': this.lights.spotlightCakeColor,
            'intensity': this.lights.spotlightCakeIntensity,
            'distance': this.lights.spotlightCakeDistance,
            'angle': this.lights.spotlightCakeAngle,
            'penumbra': this.lights.spotlightCakePenumbra,
            'decay': this.lights.spotlightCakeDecay,
            'targetX': this.lights.spotlightCakeTargetX,
            'targetY': this.lights.spotlightCakeTargetY
        };

        spotlightFolder.addColor(spotlight_data, 'color').onChange( (value) => { 
            this.lights.updateSpotlightColor(value) 
        });
        spotlightFolder.add(spotlight_data, 'intensity', 0, 100).onChange( (value) => {
            this.lights.updateSpotlightIntensity(value);
        });
        spotlightFolder.add(spotlight_data, 'distance', 0, 100).onChange( (value) => {
            this.lights.updateSpotlightDistance(value);
        });
        spotlightFolder.add(spotlight_data, 'angle', 0, 90).onChange( (value) => {
            this.lights.updateSpotlightAngle(value);
        });
        spotlightFolder.add(spotlight_data, 'penumbra', 0, 1).onChange( (value) => {
            this.lights.updateSpotlightPenumbra(value);
        });
        spotlightFolder.add(spotlight_data, 'decay', 0, 2).onChange( (value) => {
            this.lights.updateSpotlightDecay(value);
        });
        spotlightFolder.add(spotlight_data, 'targetX', -5, 10).onChange( (value) => {
            this.lights.updateSpotlightTargetX(value);
        });
        spotlightFolder.add(spotlight_data, 'targetY', 4, 10).onChange( (value) => {
            this.lights.updateSpotlightTargetY(value);
        });

        // adds a folder to the gui interface for the directional light
        const directionalFolder = this.datgui.addFolder('Directional Light');

        // directional light data
        const directionalLight_data = {
            'color': this.lights.windowLightColor,
            'intensity': this.lights.windowLightIntensity,
            'positionX': this.lights.windowLightDisplacementX,
            'positionY': this.lights.windowLightDisplacementY,
            'targetX': this.lights.windowLightTargetX,
            'targetY': this.lights.windowLightTargetY
        };

        directionalFolder.addColor(directionalLight_data, 'color').onChange( (value) => { 
            this.lights.updateWindowLightColor(value) 
        });
        directionalFolder.add(directionalLight_data, 'intensity', 0, 100).onChange( (value) => {
            this.lights.updateWindowLightIntensity(value);
        });
        directionalFolder.add(directionalLight_data, 'positionX', -20, 20).onChange( (value) => {
            this.lights.updateWindowLightDisplacementX(value);
        });
        directionalFolder.add(directionalLight_data, 'positionY', -20, 20).onChange( (value) => {
            this.lights.updateWindowLightDisplacementY(value);
        });
        directionalFolder.add(directionalLight_data, 'targetX', -20, 20).onChange( (value) => {
            this.lights.updateWindowLightTargetX(value);
        });
        directionalFolder.add(directionalLight_data, 'targetY', -20, 20).onChange( (value) => {
            this.lights.updateWindowLightTargetY(value);
        });

        // adds a folder to the gui interface for the left frame light
        const leftFrameLightFolder = this.datgui.addFolder('Left Frame Light')

        // left frame light data
        const leftFrameLight_data = {
            'color': this.lights.leftSpotlightFrameColor,
            'intensity': this.lights.leftSpotlightFrameIntensity,
            'distance': this.lights.leftSpotlightFrameDistance,
            'angle': this.lights.leftSpotlightFrameAngle,
            'penumbra': this.lights.leftSpotlightFramePenumbra,
            'decay': this.lights.leftSpotlightFrameDecay,
            'targetX': this.lights.leftSpotlightFrameTargetX,
            'targetY': this.lights.leftSpotlightFrameTargetY
        }

        leftFrameLightFolder.addColor(leftFrameLight_data, 'color').onChange( (value) => {
            this.lights.updateLeftFrameLightColor(value)
        });
        leftFrameLightFolder.add(leftFrameLight_data, 'intensity', 0, 100).onChange( (value) => {
            this.lights.updateLeftFrameLightIntensity(value)
        });
        leftFrameLightFolder.add(leftFrameLight_data, 'distance', 0, 100).onChange( (value) => {
            this.lights.updateLeftFrameLightDistance(value)
        });
        leftFrameLightFolder.add(leftFrameLight_data, 'angle', 0, 90).onChange( (value) => {
            this.lights.updateLeftFrameLightAngle(value)
        });
        leftFrameLightFolder.add(leftFrameLight_data, 'penumbra', 0, 1).onChange( (value) => {
            this.lights.updateLeftFrameLightPenumbra(value)
        });
        leftFrameLightFolder.add(leftFrameLight_data, 'decay', 0, 2).onChange( (value) => {
            this.lights.updateLeftFrameLightDecay(value)
        });
        leftFrameLightFolder.add(leftFrameLight_data, 'targetX', 16, 20).onChange( (value) => {
            this.lights.updateLeftFrameLightTargetX(value)
        });
        leftFrameLightFolder.add(leftFrameLight_data, 'targetY', 0, 17.55).onChange( (value) => {
            this.lights.updateLeftFrameLightTargetY(value)
        });

        // adds a folder to the gui interface for the right frame light
        const rightFrameLightFolder = this.datgui.addFolder('Right Frame Light')

        // right frame light data
        const rightFrameLight_data = {
            'color': this.lights.rightSpotlightFrameColor,
            'intensity': this.lights.rightSpotlightFrameIntensity,
            'distance': this.lights.rightSpotlightFrameDistance,
            'angle': this.lights.rightSpotlightFrameAngle,
            'penumbra': this.lights.rightSpotlightFramePenumbra,
            'decay': this.lights.rightSpotlightFrameDecay,
            'targetX': this.lights.rightSpotlightFrameTargetX,
            'targetY': this.lights.rightSpotlightFrameTargetY
        }

        rightFrameLightFolder.addColor(rightFrameLight_data, 'color').onChange( (value) => {
            this.lights.updateRightFrameLightColor(value)
        });
        rightFrameLightFolder.add(rightFrameLight_data, 'intensity', 0, 100).onChange( (value) => {
            this.lights.updateRightFrameLightIntensity(value)
        });
        rightFrameLightFolder.add(rightFrameLight_data, 'distance', 0, 100).onChange( (value) => {
            this.lights.updateRightFrameLightDistance(value)
        });
        rightFrameLightFolder.add(rightFrameLight_data, 'angle', 0, 90).onChange( (value) => {
            this.lights.updateRightFrameLightAngle(value)
        });
        rightFrameLightFolder.add(rightFrameLight_data, 'penumbra', 0, 1).onChange( (value) => {
            this.lights.updateRightFrameLightPenumbra(value)
        });
        rightFrameLightFolder.add(rightFrameLight_data, 'decay', 0, 2).onChange( (value) => {
            this.lights.updateRightFrameLightDecay(value)
        });
        rightFrameLightFolder.add(rightFrameLight_data, 'targetX', 16, 20).onChange( (value) => {
            this.lights.updateRightFrameLightTargetX(value)
        });
        rightFrameLightFolder.add(rightFrameLight_data, 'targetY', 0, 17.55).onChange( (value) => {
            this.lights.updateRightFrameLightTargetY(value)
        });

        // adds a folder to the gui interface for the car frame light
        const carFrameLightFolder = this.datgui.addFolder('Car Frame Light')

        // car frame light data
        const carFrameLight_data = {
            'color': this.lights.carSpotlightFrameColor,
            'intensity': this.lights.carSpotlightFrameIntensity,
            'distance': this.lights.carSpotlightFrameDistance,
            'angle': this.lights.carSpotlightFrameAngle,
            'penumbra': this.lights.carSpotlightFramePenumbra,
            'decay': this.lights.carSpotlightFrameDecay,
            'targetZ': this.lights.carSpotlightFrameTargetZ,
            'targetY': this.lights.carSpotlightFrameTargetY
        }

        carFrameLightFolder.addColor(carFrameLight_data, 'color').onChange( (value) => {
            this.lights.updateCarFrameLightColor(value)
        });
        carFrameLightFolder.add(carFrameLight_data, 'intensity', 0, 100).onChange( (value) => {
            this.lights.updateCarFrameLightIntensity(value)
        });
        carFrameLightFolder.add(carFrameLight_data, 'distance', 0, 100).onChange( (value) => {
            this.lights.updateCarFrameLightDistance(value)
        });
        carFrameLightFolder.add(carFrameLight_data, 'angle', 0, 90).onChange( (value) => {
            this.lights.updateCarFrameLightAngle(value)
        });
        carFrameLightFolder.add(carFrameLight_data, 'penumbra', 0, 1).onChange( (value) => {
            this.lights.updateCarFrameLightPenumbra(value)
        });
        carFrameLightFolder.add(carFrameLight_data, 'decay', 0, 2).onChange( (value) => {
            this.lights.updateCarFrameLightDecay(value)
        });
        carFrameLightFolder.add(carFrameLight_data, 'targetZ', -19, -17).onChange( (value) => {
            this.lights.updateCarFrameLightTargetZ(value)
        });
        carFrameLightFolder.add(carFrameLight_data, 'targetY', 0, 16.5).onChange( (value) => {
            this.lights.updateCarFrameLightTargetY(value)
        });

        // adds a folder to the gui interface for the ceiling point light
        const topPointLightFolder = this.datgui.addFolder('Ceiling Point Light')

        // ceiling point light data
        const topPointLight_data = {
            'color': this.lights.topPointLightColor,
            'intensity': this.lights.topPointLightIntensity,
            'distance': this.lights.topPointLightDistance
        }

        topPointLightFolder.addColor(topPointLight_data, 'color').onChange( (value) => {
            this.lights.updateTopPointLightColor(value)
        });
        topPointLightFolder.add(topPointLight_data, 'intensity', 0, 100).onChange( (value) => {
            this.lights.updateTopPointLightIntensity(value)
        }
        );
        topPointLightFolder.add(topPointLight_data, 'distance', 0, 100).onChange( (value) => {
            this.lights.updateTopPointLightDistance(value)
        }); 
    }
}

export { MyGuiInterface };