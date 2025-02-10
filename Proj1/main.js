import * as THREE from 'three';
import { MyApp } from './MyApp.js';
import { MyGuiInterface } from './MyGuiInterface.js';
import { MyContents } from './MyContents.js';
import { MyLights } from './components/MyLights.js';

// create the application object
let app = new MyApp()
// initializes the application
app.init()

// create the contents object
let contents = new MyContents(app)
// create the light objects
let lights = new MyLights(app.scene, new THREE.Vector3(-19.99, 12, 0), new THREE.Vector3(19, 18.5, -7.5), new THREE.Vector3(19, 18.5, 7.5), new THREE.Vector3(0, 16.5, -18.9))
// initializes the contents
contents.init(lights)
// hooks the contents object in the application object
app.setContents(contents);
// create the gui interface object
let gui = new MyGuiInterface(app)
// set the contents object in the gui interface object
gui.setContents(contents)
gui.setLights(lights)

// we call the gui interface init 
// after contents were created because
// interface elements may control contents items
gui.init();

// main animation loop - calls every 50-60 ms.
app.render()
