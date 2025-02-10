import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyFileReader } from './parser/MyFileReader.js';
import { MyLights } from './MyLights.js';
import { MyPrimitiveBuilder } from './MyPrimitiveBuilder.js';
import { MySkybox } from './MySkybox.js';

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
        this.skyboxBuilder = new MySkybox(this.app);

        this.sceneData = null;
        this.visitedNodeGroups = new Map();

        this.reader = new MyFileReader(this.onSceneLoaded.bind(this));
        this.reader.open("scenes/scene/scene.json");
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
        this.renderGraph(this.sceneData.getGraph());

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
            newCamera.lookAt(new THREE.Vector3(camera.target[0], camera.target[1], camera.target[2]));
        }
        // render orthogonal camera
        else if(camera.type === 'orthogonal') {
            newCamera = new THREE.OrthographicCamera(camera.left, camera.right, camera.top, camera.bottom, camera.near, camera.far);
            newCamera.position.set(camera.location[0], camera.location[1], camera.location[2]);
            newCamera.lookAt(new THREE.Vector3(camera.target[0], camera.target[1], camera.target[2]));
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
            case 'polygon':
                // draw polygon
                primitiveObj = this.primitiveBuilder.buildPolygon(primitive, material);
                break;
            case 'nurbs':
                // draw nurbs
                primitiveObj = this.primitiveBuilder.buildNurbs(primitive, material);
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
    createObject(node, graph, material, castShadows, receiveShadows) {
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
                switch (node.children[childId].type) {
                    // when the child is a node, recursively create a new group and look through the children of that node
                    case 'node':
                        object = this.createObject(node.children[childId], graph, newMaterial, castshadows, receiveshadows);
                        group.add(object);
                        break;
                    // when the child is a primitive, create the object and add it to the group
                    case 'primitive':
                        object = this.createPrimitive(node.children[childId], newMaterial, castshadows, receiveshadows);
                        group.add(object);
                        break;
                    // when the child is a point light, create the light and add it to the scene if enabled
                    case 'pointlight':
                        var light = this.lights.createPointlight(node.children[childId]);
                        group.add(light);
                        // add to lights array
                        this.app.lights.push(light);
                        break;
                    // when the child is a spotlight, create the light and add it to the scene if enabled
                    case 'spotlight':
                        var light = this.lights.createSpotlight(node.children[childId]);
                        group.add(light);
                        // add to lights array
                        this.app.lights.push(light);
                        break;
                    // when the child is a directional light, create the light and add it to the scene if enabled
                    case 'directionallight':
                        var light = this.lights.createDirectionalLight(node.children[childId]);
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
                            const object = this.createObject(child, graph, newMaterial, castshadows, receiveshadows);
                            // add them to LOD object with respective minimum distance
                            lod.addLevel(object, child.mindist);
                        }
                        // add to group
                        group.add(lod);
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

    renderGraph(graph){
        //find root node
        var root = graph[this.sceneData.rootId];

        // Render nodes from root
        var group = this.createObject(root, graph, null, false, false);
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
        
    }
}

export { MyContents };