import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyNewspaper } from './components/MyNewspaper.js';
import { MySpiral } from './components/MySpiral.js';
import { MyWalls } from './components/MyWalls.js';
import { MyCake } from './components/MyCake.js';
import { MyCandle } from './components/MyCandle.js';
import { MyTable } from './components/MyTable.js';
import { MyChair } from './components/MyChair.js';
import { MyPlate } from './components/MyPlate.js'
import { MyCakePlatter } from './components/MyCakePlatter.js';
import { MyCakeSlice } from './components/MyCakeSlice.js';
import { MyCarpet } from './components/MyCarpet.js';
import { MyLandscape } from './components/MyLandscape.js';
import { MyFrame } from './components/MyFrame.js';
import { MyFlower } from './components/MyFlower.js';
import { MyFrameLights } from './components/MyFrameLights.js';
import { MyBeetle } from './components/MyBeetle.js';
import { MyJar } from './components/MyJar.js';
import { MyLamp } from './components/MyLamp.js';
import { MyCeilingLamp } from './components/MyCeilingLamp.js';
import { MyKnife } from './components/MyKnife.js';

class MyContents  {
    constructor(app) {
        this.app = app
        this.axis = null

        // newspaper related attributes
        this.newspaper = new MyNewspaper(10, 10, new THREE.Vector3(0, 7.7, -4.3))

        // flower related attributes
        this.flower = new MyFlower(5, 2, 200, 0.15, 8, 1.3, 32, 0xE30B5C, new THREE.Vector3(-7, 7, -5));

        // lights related attributes
        this.lights = null;

        // walls related attributes
        this.walls = new MyWalls(40, 40, new THREE.Vector3(0,10,0), 4.075, 12, 11.2, 24);

        // cake attributes
        this.cake = new MyCake(2, new THREE.Vector3(-2, 8.4, 0));

        // candle attributes
        this.candle = new MyCandle(0.1, 0.75, new THREE.Vector3(-1.85, 9.55, -0.5));

        // table related attributes
        this.table = new MyTable(17, 12, 0.5, 0.45, 0.25, 25, new THREE.Vector3(0, 6.6, 0));

        // chair related attributes
        this.chair = new MyChair(3.5, 5, 0.3, 0.35, 0.25, 25, Math.PI, new THREE.Vector3(0, 4.1, 6.5));

        // plate related attributes
        this.plate = new MyPlate(1.15, 1.15, 0.125, 40, new THREE.Vector3(5.5, 6.8, 0));

        // cake platter related attributes
        this.cakePlatter = new MyCakePlatter(0.5, 0.95, 1.2, 35, new THREE.Vector3(-2, 7.2, 0));

        // cake slice related attributes
        this.cakeSlice = new MyCakeSlice(2, 1, 50, 1, false, 0, - Math.PI * 0.20, new THREE.Vector3(5.75, 7.5, -0.95));

        // carpet related attributes
        this.carpet = new MyCarpet(17, 20, new THREE.Vector3(0, 0.01, 0));

        // window landscape related attributes
        this.windowLandscape = new MyLandscape(25.6 * 13, 14.4 * 13, new THREE.Vector3(-40, 43, 0), Math.PI / 2, './textures/landscape.jpg');
        
        // window frame related attributes
        this.windowFrame = new MyFrame(5.68 * 3, 3.78 * 3, 0.3, 0.5, new THREE.Vector3(-19.99, 12, 0), Math.PI / 2, false);

        // painting one related attributes
        this.paintingOneLandscape = new MyLandscape(9.71 / 2, 19.73 / 2, new THREE.Vector3(19.95, 13, 7.5), - Math.PI / 2, './textures/Diogo_Viana.jpg');
        
        // painting one frame related attributes
        this.paintingOneFrame = new MyFrame(9.71 / 2, 19.73 / 2, 0.4, 0.4, new THREE.Vector3(19.795, 13, 7.5), - Math.PI / 2);

        // painting two related attributes
        this.paintingTwoLandscape = new MyLandscape(1.6 * 6, 1.63 * 6, new THREE.Vector3(19.95, 13, -7.5), - Math.PI / 2, './textures/Goncalo_Martins.jpg');

        // painting two frame related attributes
        this.paintingTwoFrame = new MyFrame(1.6 * 6, 1.63 * 6, 0.4, 0.4, new THREE.Vector3(19.795, 13, -7.5), - Math.PI / 2);

        // painting three related attributes
        this.paintingThreeLandscape = new MyLandscape(10, 6.5, new THREE.Vector3(0, 12.5, -19.95), 0, './textures/plain_white.jpg');

        // painting three frame related attributes
        this.paintingThreeFrame = new MyFrame(10, 6.5, 0.4, 0.4, new THREE.Vector3(0, 12.5, -19.795), 0);

        // spiral related attributes
        this.spiral = new MySpiral(1, 4, 6, 200, 0.15, 8, new THREE.Vector3(2, 7.42, 3));

        // frame lights related attributes
        this.frameLights = new MyFrameLights(0.1, 0.15, 9.71 / 2, 1.6 * 6, 10, new THREE.Vector3(19, 18.5, 7.5), new THREE.Vector3(19, 18.5, -7.5), new THREE.Vector3(0, 16.5, -18.9));

        // beetle related attributes
        this.beetle = new MyBeetle(this.app.scene, new THREE.Vector3(0, 10.5, -19.94));

        // jar related attributes
        this.jar = new MyJar(new THREE.Vector3(-7, 7.9, -5));

        // lamp related attributes
        this.lamp = new MyLamp(new THREE.Vector3(-7, 6.8, 4));

        // ceiling lamp related attributes
        this.ceilingLamp = new MyCeilingLamp(new THREE.Vector3(0, 20, 0));

        // knife related attributes
        this.knife = new MyKnife(0.5, 1, 0.125, 30, Math.PI / 2, Math.PI / 2, new THREE.Vector3(0.7, 5.395, 1.7), Math.PI / 5);

        // plane related attributes
            // texture
        this.planeTexture = new THREE.TextureLoader().load('./textures/light_wood.jpg');
        this.planeTexture.wrapS = THREE.RepeatWrapping;
        this.planeTexture.wrapT = THREE.RepeatWrapping;
            // material
        this.diffusePlaneColor = "rgb(128,128,128)"
        this.specularPlaneColor = "rgb(0,0,0)"
        this.planeShininess = 0
            // relating texture and material:
        this.planeMaterial = new THREE.MeshPhongMaterial({
            color: this.diffusePlaneColor,
            specular: this.specularPlaneColor,
            emissive: "#000000",
            shininess: this.planeShininess,
            map: this.planeTexture,
            side: THREE.DoubleSide
        });
    }

    /**
     * initializes the contents
     */
    init(lights) {
        this.lights = lights;
       
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }

        this.newspaper.buildNewspaper(this.app.scene);

        this.lights.buildLights();

        this.walls.buildAll();

        this.cake.buildCake();
        
        this.candle.buildCandle();

        this.table.buildTable();

        this.chair.buildChair();

        this.plate.buildPlate();

        this.cakePlatter.buildCakePlatter();

        this.cakeSlice.buildCakeSlice();

        this.carpet.buildCarpet(this.app.scene);

        this.windowLandscape.buildLandscape();
        this.windowFrame.buildAll();

        this.paintingOneLandscape.buildLandscape();
        this.paintingOneFrame.buildAll();

        this.paintingTwoLandscape.buildLandscape();
        this.paintingTwoFrame.buildAll();

        this.paintingThreeLandscape.buildLandscape();
        this.paintingThreeFrame.buildAll();

        this.spiral.buildSpiral()
        
        this.flower.buildFlower()

        this.frameLights.buildFrameLights();

        this.beetle.buildBeetle();

        this.jar.buildJar(this.app.scene);

        this.lamp.buildLamp();

        this.ceilingLamp.buildCeilingLamp();

        this.knife.buildKnife();

        // Create a Plane Mesh with basic material
        let planeSizeU = 40;
        let planeSizeV = 40;
        let planeUVRate = planeSizeV / planeSizeU;

        let planeTextureUVRate = 3354 / 2385; // image dimensions
        let planeTextureRepeatU = 1;
        let planeTextureRepeatV = planeTextureRepeatU * planeUVRate * planeTextureUVRate;
        this.planeTexture.repeat.set(planeTextureRepeatU, planeTextureRepeatV);
        this.planeTexture.rotation = 0;
        this.planeTexture.offset = new THREE.Vector2(0,0);

        // floor
        var plane = new THREE.PlaneGeometry(planeSizeU, planeSizeV);
        this.planeMesh = new THREE.Mesh(plane, this.planeMaterial);
        this.planeMesh.rotation.x = - Math.PI / 2;
        this.planeMesh.position.y = 0;
        this.planeMesh.receiveShadow = true;
        this.planeMesh.castShadow = false;
        this.app.scene.add(this.planeMesh);

        // ceiling
        var plane = new THREE.PlaneGeometry(planeSizeU, planeSizeV);
        this.ceilingMesh = new THREE.Mesh(plane, this.planeMaterial);
        this.ceilingMesh.rotation.x = Math.PI / 2;
        this.ceilingMesh.position.y = 20;
        this.ceilingMesh.receiveShadow = true;
        this.ceilingMesh.castShadow = false;
        this.app.scene.add(this.ceilingMesh);
    }

    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value 
     */
    updateDiffusePlaneColor(value) {
        this.diffusePlaneColor = value
        this.planeMaterial.color.set(this.diffusePlaneColor)
    }
    /**
     * updates the specular plane color and the material
     * @param {THREE.Color} value 
     */
    updateSpecularPlaneColor(value) {
        this.specularPlaneColor = value
        this.planeMaterial.specular.set(this.specularPlaneColor)
    }
    /**
     * updates the plane shininess and the material
     * @param {number} value 
     */
    updatePlaneShininess(value) {
        this.planeShininess = value
        this.planeMaterial.shininess = this.planeShininess
    }

    /**
     * Updates the plane texture wrap mode in U
     * @param {*} value
     */
    updatePlaneTextureWrapModeU(value) {
        switch (value) {
            case 'ClampToEdge':
                this.planeTexture.wrapS = THREE.ClampToEdgeWrapping;
                break;
            case 'Repeat':
                this.planeTexture.wrapS = THREE.RepeatWrapping;
                break;
            case 'MirroredRepeat':
                this.planeTexture.wrapS = THREE.MirroredRepeatWrapping;
                break;
            default:
                break;
        }
    }

    /**
     * Updates the plane texture wrap mode in V
     * @param {*} value 
     */
    updatePlaneTextureWrapModeV(value) {
        switch (value) {
            case 'ClampToEdge':
                this.planeTexture.wrapT = THREE.ClampToEdgeWrapping;
                break;
            case 'Repeat':
                this.planeTexture.wrapT = THREE.RepeatWrapping;
                break;
            case 'MirroredRepeat':
                this.planeTexture.wrapT = THREE.MirroredRepeatWrapping;
                break;
            default:
                break;
        }
    }

    /**
     * Updates the plane texture repeat U
     * @param {*} value 
     */
    updatePlaneTextureRepeatU(value) {
        this.planeTexture.repeat.x = value
    }

    /**
     * Updates the plane texture repeat V
     * @param {*} value
     */
    updatePlaneTextureRepeatV(value) {
        this.planeTexture.repeat.y = value
    }

    /**
     * Updates the plane texture offset U
     * @param {*} value
     */
    updatePlaneTextureOffsetU(value) {
        this.planeTexture.offset.x = value
    }

    /**
     * Updates the plane texture offset V
     * @param {*} value
     */
    updatePlaneTextureOffsetV(value) {
        this.planeTexture.offset.y = value
    }

    /**
     * Updates the plane texture rotation
     * @param {*} value 
     */
    updatePlaneTextureRotation(value) {
        this.planeTexture.rotation = value
    }
    
    /**
     * updates the contents
     * this method is called from the render method of the app
     */
    update() {

        // check if lights need to be updates
        this.lights.updateLightsIfRequired(this.app.scene);

        // check if wall mesh needs to be updated
        this.walls.updateWallsIfRequired(this.app.scene);
        
        // check if cake mesh needs to be updated
        this.cake.updateCakeIfRequired(this.app.scene);

        // check if candle mesh needs to be updated
        this.candle.updateCandleIfRequired(this.app.scene);

        // check if table mesh needs to be updated
        this.table.updateTableIfRequired(this.app.scene);

        // check if chair mesh needs to be updated
        this.chair.updateChairIfRequired(this.app.scene);

        // check if plate mesh needs to be updated
        this.plate.updatePlateIfRequired(this.app.scene);

        // check if cake platter mesh needs to be updated
        this.cakePlatter.updateCakePlatterIfRequired(this.app.scene);

        // check if cake slice mesh needs to be updated
        this.cakeSlice.updateCakeSliceIfRequired(this.app.scene)

        // check if carpet mesh needs to be updated
        this.carpet.updateCarpetIfRequired(this.app.scene);

        // check if window landscape mesh needs to be updated
        this.windowLandscape.updateLandscapeIfRequired(this.app.scene);
        // check if window frame mesh needs to be updated
        this.windowFrame.updateFrameIfRequired(this.app.scene);

        // check if painting one landscape mesh needs to be updated
        this.paintingOneLandscape.updateLandscapeIfRequired(this.app.scene);
        // check if painting one frame mesh needs to be updated
        this.paintingOneFrame.updateFrameIfRequired(this.app.scene);

        // check if painting two landscape mesh needs to be updated
        this.paintingTwoLandscape.updateLandscapeIfRequired(this.app.scene);
        // check if painting two frame mesh needs to be updated
        this.paintingTwoFrame.updateFrameIfRequired(this.app.scene);

        // check if painting three landscape mesh needs to be updated
        this.paintingThreeLandscape.updateLandscapeIfRequired(this.app.scene);
        // check if painting three frame mesh needs to be updated
        this.paintingThreeFrame.updateFrameIfRequired(this.app.scene);

        // check if spiral mesh needs to be updated
        this.spiral.updateSpiralIfRequired(this.app.scene);

        // check if flower mesh needs to be updated
        this.flower.updateFlowerIfRequired(this.app.scene);

        // check if frame lights mesh needs to be updated
        this.frameLights.updateFrameLightsIfRequired(this.app.scene);

        // check if jar mesh needs to be updated
        this.jar.updateJarIfRequired(this.app.scene);

        // check if newspaper mesh needs to be updated
        this.newspaper.updateNewspaperIfRequired(this.app.scene);

        // check if lamp mesh needs to be updated
        this.lamp.updateLampIfRequired(this.app.scene);
        
        // check if ceiling lamp mesh needs to be updated
        this.ceilingLamp.updateCeilingLampIfRequired(this.app.scene);

        // check if knife mesh needs to be updated
        this.knife.updateKnifeIfRequired(this.app.scene);
    }
}


export { MyContents };


