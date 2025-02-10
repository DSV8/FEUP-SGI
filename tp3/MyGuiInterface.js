import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

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

        this.cameraFolder = null;
        this.cameraList = [];

        this.fogFolder = null;

        this.lights = [];
        this.lightFolders = [];

        this.gameState = this.app.getGameState();
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {
        const pickFolder = this.datgui.addFolder('Picking');
        pickFolder.add(this.contents.raycaster, 'near', 0, 5)
        pickFolder.add(this.contents.raycaster, 'far', 5, 80)
        pickFolder.open()

        this.updateInterface();
    }

    updateInterface() {
        this.addCameraFolder();

        this.addFogFolder();

        this.addLightsFolders();
    }

    addCameraFolder() {
        if (this.cameraFolder) {
            this.cameraFolder.destroy(); // Properly remove the folder
        }
    
        this.cameraFolder = this.datgui.addFolder('Camera');
    
        // Add dropdown
        this.cameraFolder.add(this.app, 'activeCameraName', [...this.cameraList])
            .name("active camera")
            .onChange((value) => {
                this.app.setActiveCamera(value);
            });
    
        // Add position controls
        const activeCameraPosition = this.app.activeCamera.position;
        this.cameraFolder.add(activeCameraPosition, 'x', -70, 100).name("x coord");
        this.cameraFolder.add(activeCameraPosition, 'y', 0.1, 30).name("y coord");
        this.cameraFolder.add(activeCameraPosition, 'z', -40, 40).name("z coord");
    
        this.cameraFolder.open();
    }

    addFogFolder() {
        if (this.fogFolder) {
            this.fogFolder.destroy(); // Remove existing fog folder if present
        }
    
        this.fogFolder = this.datgui.addFolder('Fog');
    
        const fogParams = {
            enableFog: !!this.app.scene.fog,
            color: this.app.scene.fog ? `#${this.app.scene.fog.color.getHexString()}` : '#ffffff',
            near: this.app.scene.fog && this.app.scene.fog instanceof THREE.Fog ? this.app.scene.fog.near : 1,
            far: this.app.scene.fog && this.app.scene.fog instanceof THREE.Fog ? this.app.scene.fog.far : 1000,
        };
    
        // Enable/disable fog
        this.fogFolder.add(fogParams, 'enableFog').name('Enable Fog').onChange((value) => {
            if (value) {
                this.app.scene.fog = new THREE.Fog(fogParams.color, fogParams.near, fogParams.far);
            } else {
                this.app.scene.fog = null; // Disable fog
            }
        });
    
        // Fog color
        this.fogFolder.addColor(fogParams, 'color').name('Fog Color').onChange((value) => {
            if (this.app.scene.fog) {
                this.app.scene.fog.color.set(value);
            }
        });
    
        // Fog near
        this.fogFolder.add(fogParams, 'near', 0.1, 100).name('Fog Near').onChange((value) => {
            if (this.app.scene.fog && this.app.scene.fog instanceof THREE.Fog) {
                this.app.scene.fog.near = value;
            }
        });
    
        // Fog far
        this.fogFolder.add(fogParams, 'far', 1, 2000).name('Fog Far').onChange((value) => {
            if (this.app.scene.fog && this.app.scene.fog instanceof THREE.Fog) {
                this.app.scene.fog.far = value;
            }
        });
    
        this.fogFolder.open();
    }

    addLightsFolders(newLights) {
        if (!Array.isArray(newLights) || newLights.length === 0) {
            return; // Exit if no valid lights are passed
        }
    
        newLights.forEach((light, index) => {
            const lightFolder = this.datgui.addFolder(`Light ${this.lights.indexOf(light) + 1} (${light.type})`);
            this.lightFolders.push(lightFolder);
    
            // Track helper visibility
            const lightParams = {
                enabled: light.visible,
                color: `#${light.color.getHexString()}`,
                intensity: light.intensity,
                showHelper: false, // Helper visibility state
            };
    
            // Add toggle for enabling/disabling the light
            lightFolder.add(lightParams, 'enabled').name('Enabled').onChange((value) => {
                light.visible = value;
            });
    
            // Add color control
            lightFolder.addColor(lightParams, 'color').name('Color').onChange((value) => {
                light.color.set(value);
            });
    
            // Add intensity control (if applicable)
            if (light.intensity !== undefined) {
                lightFolder.add(lightParams, 'intensity', 0, 100).name('Intensity').onChange((value) => {
                    light.intensity = value;
                });
            }
    
            // Add position controls (if applicable)
            if (light.position) {
                const lightPosition = light.position;
                lightFolder.add(lightPosition, 'x', -100, 100).name('Position X');
                lightFolder.add(lightPosition, 'y', 0.1, 50).name('Position Y');
                lightFolder.add(lightPosition, 'z', -100, 100).name('Position Z');
            }
    
            // Add specific controls for SpotLight
            if (light instanceof THREE.SpotLight) {
                const spotlightParams = {
                    distance: light.distance,
                    angle: THREE.MathUtils.radToDeg(light.angle),
                    decay: light.decay,
                    penumbra: light.penumbra,
                };
    
                // Add distance control
                lightFolder.add(spotlightParams, 'distance', 0, 100).name('Distance').onChange((value) => {
                    light.distance = value;
                });
    
                // Add angle control
                lightFolder.add(spotlightParams, 'angle', 0, 90).name('Angle').onChange((value) => {
                    light.angle = THREE.MathUtils.degToRad(value);
                });
    
                // Add decay control
                lightFolder.add(spotlightParams, 'decay', 0, 2).name('Decay').onChange((value) => {
                    light.decay = value;
                });
    
                // Add penumbra control
                lightFolder.add(spotlightParams, 'penumbra', 0, 1).name('Penumbra').onChange((value) => {
                    light.penumbra = value;
                });
            }
    
            // Add helper toggle
            let helper = null; // Store the helper instance for this light
            lightFolder.add(lightParams, 'showHelper').name('Show Helper').onChange((value) => {
                if (value) {
                    // Create the helper and add it to the scene
                    if (light instanceof THREE.PointLight) {
                        helper = new THREE.PointLightHelper(light, 2.5);
                    } else if (light instanceof THREE.DirectionalLight) {
                        helper = new THREE.DirectionalLightHelper(light, 2.5);
                    } else if (light instanceof THREE.SpotLight) {
                        helper = new THREE.SpotLightHelper(light);
                    }
    
                    if (helper) {
                        this.app.scene.add(helper);
                    }
                } else {
                    // Remove the helper from the scene
                    if (helper) {
                        this.app.scene.remove(helper);
                        helper.dispose(); // Clean up resources
                        helper = null;
                    }
                }
            });
    
            // Open the folder by default
            lightFolder.open();
        });
    }
    
       
    
    // Update the wireframe mode for all materials in the scene
    updateWireframe(value) {
        // Traverse all objects in the scene
        this.app.scene.traverse((object) => {
            if (object.isMesh) {
                // If the object has materials (it might have multiple)
                if (Array.isArray(object.material)) {
                    object.material.forEach((material) => {
                        // Check if the material supports wireframe
                        if (material instanceof THREE.MeshBasicMaterial || material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshLambertMaterial || material instanceof THREE.MeshPhongMaterial) {
                            material.wireframe = value; // Toggle wireframe
                        }
                    });
                } else {
                    // If it's a single material
                    const material = object.material;
                    if (material instanceof THREE.MeshBasicMaterial || material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshLambertMaterial || material instanceof THREE.MeshPhongMaterial) {
                        material.wireframe = value; // Toggle wireframe
                    }
                }
            }
        });
    }

    /**
     * Update the camera list
     */
    updateCameraList(camera) {
        // check if camera is already in the list
        if (this.cameraList.includes(camera)) {
            return;
        }
        this.cameraList.push(camera);
        this.updateInterface();
    }

    // Clear all folders
    clear(){
        this.lights = [];

        for(let i = 0; i < this.lightFolders.length; i++){
            this.lightFolders[i].destroy();
        }   
        
        this.cameraList = [];
    }
}

export { MyGuiInterface };