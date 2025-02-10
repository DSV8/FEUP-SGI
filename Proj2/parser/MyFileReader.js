import * as THREE from 'three';
import { MySceneData } from './MySceneData.js';

class MyFileReader {

	/**
	   constructs the object
	*/
	constructor(onSceneLoadedCallback) {
		this.data = new MySceneData();
		this.errorMessage = null;
		this.onSceneLoadedCallback = onSceneLoadedCallback;
	}

	open(jsonfile) {
		fetch(jsonfile)
			.then((res) => {
				if (!res.ok) {
					throw new Error(`HTTP error! Status: ${res.status}`);
				}
				return res.json();
			})
			.then((data) => {
				this.readJson(data); // read the yasf format
				this.onSceneLoadedCallback(this.data); // head to scene loader
			})
			.catch((error) =>
				console.error("Unable to fetch data:", error));
	};

	/**
	 * Read the json file and loads the data
	 */
	readJson(data) {
		try {
			let rootElement = data["yasf"];

			this.loadGlobals(rootElement); // load global elements
			this.loadTextures(rootElement); // load texture elements
			this.loadMaterials(rootElement); // load materials
			this.loadCameras(rootElement); // load cameras
			this.loadNodes(rootElement); // load all nodes in graph
		}
		catch (error) {
			this.errorMessage = error;
		}
	}

	/**
	 * checks if any unknown node is child a given element
	 * @param {*} parentElem 
	 * @param {Array} list an array of strings with the valid node names
	 */
	checkForUnknownNodes(parentElem, list) {
		// for each of the elem's children
		for (let i = 0; i < parentElem.children.length; i++) {
			let elem = parentElem.children[i]
			// is element's tag name not present in the list?
			if (list.includes(elem.tagName) === false) {
				// unkown element. Report!
				throw new Error("unknown json element '" + elem.tagName + "' descendent of element '" + parentElem.tagName + "'")
			}
		}
	}

	/**
	 *  checks if any unknown attributes exits at a given element
	 * @param {*} elem 
	 *  @param {Array} list an array of strings with the valid attribute names	  
	*/
	checkForUnknownAttributes(elem, list) {
		// for each elem attributes
		for (let attrib in elem) {
			if (list.includes(attrib) === false) {
				// report!
				throw new Error("unknown attribute '" + attrib + "' in element");
			}
		}
	}

	/**
	 * Converts the descriptor objects to an array of names
	 * @param {*} descriptor 
	 * @returns a list of strings with the names of the attributes
	 */
	toArrayOfNames(descriptor) {
		let list = []
		// for each descriptor, get the value
		for (let i = 0; i < descriptor.length; i++) {
			list.push(descriptor[i].name)
		}
		return list
	}

	/**
	 * returns the index of a string in a list. -1 if not found
	 * @param {Array} list an array of strings
	 * @param {*} searchString the searched string
	 * @returns the zero-based index of the first occurrence of the specified string, or -1 if the string is not found
	 */
	indexOf(list, searchString) {
		if (Array.isArray(list)) {
			return list.indexOf(searchString)
		}
		return -1;
	}

	/**
	 * extracts the color (rgb) from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {String} attributeName the attribute name
	 * @param {Boolean} required if the attribte is required or not
	 * @returns {THREE.Color} the color encoded in a THREE.Color object
	 */
	getRGB(element, attributeName, required) {
		if (required == undefined) required = true;

		if (element == null) {
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			throw new Error("rgb attribute name is null.");
		}

		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element.id + "': rgb value is null for attribute '" + attributeName + "' in element '" + element.id + "'.");
			}
			return null;
		}

		return this.getVectorN(value, ["r", "g", "b"]);
	}

	/**
	 * returns a rectangle2D from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {String} attributeName the attribute name 
	 * @param {boolean} required if the attribte is required or not
	 * @returns {Array} an array object with 4 elements: x1, y1, x2, y2
	 */
	getRectangle2D(element, attributeName, required) {

		if (required == undefined) required = true;

		if (element == null) {
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			throw new Error("rectangle2D attribute name is null.");
		}

		let value = element.getAttribute(attributeName);
		if (value == null) {
			if (required) {
				throw new Error("element '" + element.id + ": rectangle2D value is null for attribute " + attributeName + ".");
			}
			return null;
		}

		let temp = value.split(' ');
		if (temp.length != 4) {
			throw new Error("element '" + element.id + ": invalid " + temp.length + " number of components for a rectangle2D, in attribute " + attributeName + ".");
		}

		let rect = {};
		rect.x1 = parseFloat(temp[0]);
		rect.y1 = parseFloat(temp[1]);
		rect.x2 = parseFloat(temp[2]);
		rect.y2 = parseFloat(temp[3]);
		return rect;
	}

	/**
	 * Converts an object with N components to an array
	 * @param {*} value 
	 * @param {*} keys 
	 * @returns a vector with the components of the value object
	 */
	getVectorN(value, keys) {
		let vector = new Array();
		for (let i = 0; i < keys.length; ++i) {
			const key = keys[i];
			const component = value[key];
			if (component === null || component === undefined) {
				throw new Error("element '" + value + "': vector" + keys.length + " value is null for '" + key);
			}
			vector.push(component);
		}
		return vector;
	}

	/**
	 * returns a vector3 from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the attribute name 
	 * @param {*} required if the attribte is required or not
	 * @returns {THREE.vector3} the vector3 encoded in a THREE.Vector3 object
	 */
	getVector3(element, attributeName, required) {
		if (required == undefined) required = true;

		if (element == null) {
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			throw new Error("vector3 attribute name is null.");
		}

		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element.id + "': vector3 value is null for attribute '" + attributeName + "' in element '" + element.id + "'.");
			}
			return null;
		}
		return this.getVectorN(value, ["x", "y", "z"]);
	}

	/**
	 * returns a vector2 from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the attribute name 
	 * @param {*} required if the attribte is required or not
	 * @returns {THREE.vector3} the vector2 encoded in a THREE.Vector3 object
	 */
	getVector2(element, attributeName, required) {

		if (required == undefined) required = true;

		if (element == null) {
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			throw new Error("vector3 attribute name is null.");
		}

		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element.id + ": vector2 value is null for attribute " + attributeName + ".");
			}
			return null;
		}

		return this.getVectorN(value, ["x", "y"]);
	}
	/**
	 * returns an item from an element for a particular attribute and checks if the item is in the list of choices
	 * @param {*} element the xml element
	 * @param {*} attributeName the
	 * @param {*} choices the list of choices
	 * @param {*} required if the attribte is required or not
	 * @returns {String} the item
	 */
	getItem(element, attributeName, choices, required) {

		if (required == undefined) required = true;

		if (element == null) {
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			throw new Error("item attribute name is null.");
		}

		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element.id + ": item value is null for attribute " + attributeName + ".");
			}
			return null;
		}

		value = value.toLowerCase();
		let index = this.indexOf(choices, value);
		if (index < 0) {
			throw new Error("element '" + element.id + ": value '" + value + "' is not a choice in [" + choices.toString() + "]");
		}

		return value;
	}

	/**
	 * returns a string from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the attribute name
	 * @param {*} required if the attribte is required or not
	 * @returns {String} the string
	 */
	getString(element, attributeName, required) {

		if (required == undefined) required = true;

		if (element == null) {
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			throw new Error("string attribute name is null.");
		}

		let value = element[attributeName];
		if (value == null && required) {
			throw new Error("element '" + element + ": in element '" + element + "' string value is null for attribute '" + attributeName + "'.");
		}
		return value;
	}

	/**
	 * checks if an element has a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName 
	 * @returns {boolean} if the element has the attribute
	 */
	hasAttribute(element, attributeName) {
		if (element == null) {
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			throw new Error("string attribute name is null.");
		}

		let value = element.getAttribute(attributeName);
		return (value != null);
	}

	/**
	 * returns a boolean from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the 
	 * @param {*} required if the attribte is required or not
	 * @returns {boolean} the boolean value
	 */
	getBoolean(element, attributeName, required) {
		if (required == undefined) required = true;

		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element + ": in element '" + element + "' bool value is null for attribute '" + attributeName + "'.");
			}
			return null;
		}
		if (typeof value !== "boolean") {
			throw new Error("element '" + element + ": in element '" + element + "' attribute '" + attributeName + "' should be bool but is '" + (typeof value) + "'")
		}

		return value
	}

	/**
	 * returns a integer from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the 
	 * @param {*} required if the attribte is required or not
	 * @returns {Integer} the integer value
	 */
	getInteger(element, attributeName, required) {
		if (required == undefined) required = true;

		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element + ": in element '" + element + "' integer value is null for attribute '" + attributeName + "'.");
			}
			return null;
		}
		if (!Number.isInteger(value)) {
			throw new Error("element '" + element + ": in element '" + element + "' attribute '" + attributeName + "' should be integer but is '" + (typeof value) + "'")
		}

		return value
	}

	/**
	 * returns a float from an element for a particular attribute
	 * @param {*} element the xml element
	 * @param {*} attributeName the 
	 * @param {*} required if the attribte is required or not
	 * @returns {Float} the float value
	 */
	getFloat(element, attributeName, required) {
		if (required == undefined) required = true;

		let value = element[attributeName];
		if (value == null) {
			if (required) {
				throw new Error("element '" + element + ": in element '" + element + "' float value is null for attribute '" + attributeName + "'.");
			}
			return null;
		}
		if (typeof value !== "number") {
			throw new Error("element '" + element + ": in element '" + element + "' attribute '" + attributeName + "' should be float but is '" + (typeof value) + "'")
		}

		return value
	}

	/**
	 * Load the attributes of an item based on a descriptor:
	 *	Example: options = {elem: elem, descriptor: descriptor, extras: [["type", "pointlight"]]}
	 *	where elem is the name of the element, descriptor is an array of all the attributes description and extras are extra
	 *	attributes to add to the resulting object.
	 * @param {*} options object with the element to parse, the descriptor and the extras
	 * @returns the parsed object
	 */
	loadJsonItem(options) {
		// create an empty object
		let obj = {}

		if (options === null || options === undefined) {
			throw new Error("unable to load json item because arguments are null or undefined");
		}

		if (options.elem === null || options.elem === undefined) {
			throw new Error("unable to load json item because json element is null or undefined");
		}

		if (options.descriptor === null || options.descriptor === undefined) {
			throw new Error("unable to load json item because descriptor to parse element '" + options.elem.id + "' is null or undefined");
		}

		if (options.elem.id !== null && options.elem.id !== undefined) {
			throw new Error("unable to load json item because id is already set in the item");
		}

		// Add the id to the element if the descriptor requires it
		for (let i in options.descriptor) {
			const attr = options.descriptor[i];
			if (attr.name == "id") {
				options.elem["id"] = options.key;
			}
		}

		this.checkForUnknownAttributes(options.elem, this.toArrayOfNames(options.descriptor))

		// for each descriptor, get the value
		for (let i = 0; i < options.descriptor.length; i++) {
			let value = null;
			let descriptor = options.descriptor[i]
			if (descriptor.type === "string") {
				value = this.getString(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "boolean") {
				value = this.getBoolean(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "integer") {
				value = this.getInteger(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "float") {
				value = this.getFloat(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "vector3") {
				value = this.getVector3(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "vector2") {
				value = this.getVector2(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "rgb") {
				value = this.getRGB(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "rectangle2D") {
				value = this.getRectangle2D(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "item") {
				value = this.getItem(options.elem, descriptor.name, descriptor.choices, descriptor.required);
			}
			else if (descriptor.type === "list") {
				value = [];
				// get the descriptor for the members of the list
				const listDescriptor = descriptor.listOf;
				for (let key in options.elem[descriptor.name]) {
					// name the elem "position" to avoid errors
					var newElem = {"position": options.elem[descriptor.name][key]};
					let newObj = this.loadJsonItem({
						elem: newElem,
						descriptor:  this.data.descriptors[descriptor.listOf],
						extras: []
					});
					value.push(newObj);
				}
			}
			else {
				throw new Error("element '" + options.elem + " invalid type '" + descriptor.type + "' in descriptor");
			}

			// if the value is null and the attribute is not required, then use the default value
			if (value == null && descriptor.required == false && descriptor.default != undefined) {
				value = descriptor.default;
			}

			// store the value in the object
			obj[descriptor.name] = value;
		}
		// append extra parameters if any
		for (let i = 0; i < options.extras.length; i++) {
			let extra = options.extras[i]
			obj[extra[0]] = extra[1]
		}

		// return the object
		return obj;
	}

	/**
	 * If a json element has many elements, like materials and textures, load them all
	 * @param {*} parentElemen 
	 * @param {*} tagName 
	 * @param {*} descriptor 
	 * @param {*} extras 
	 * @param {*} addFunc 
	 */
	loadJsonItems(parentElemen, tagName, descriptor, extras, addFunc) {
		for (let elem in parentElemen) {
			let obj = this.loadJsonItem({
				key: elem,
				elem: parentElemen[elem],
				descriptor: descriptor,
				extras: extras
			});
			addFunc.bind(this.data)(obj);
		}
	}

	/*
	 * Load globals element
	 * 
	 */
	loadGlobals(rootElement) {
		let globals = rootElement["globals"];
		let fog = globals["fog"]; // fog is loaded by a different method and not in globals, so we need to remove it
		let skybox = globals["skybox"]; // skybox is loaded by a different method and not in globals, so we need to remove it

		// remove fog from globals
		delete globals["fog"];

		// remove skybox from globals
		delete globals["skybox"];

		// load items in globals (background and ambient)
		this.data.setOptions(this.loadJsonItem({
			key: "globals",
			elem: globals,
			descriptor: this.data.descriptors["globals"],
			extras: [["type", "globals"]]
		}));

		// load fog
		this.data.setFog(this.loadJsonItem({
			key: "fog",
			elem: fog,
			descriptor: this.data.descriptors["fog"],
			extras: [["type", "fog"]]
		}));

		// load skybox
		this.data.setSkybox(this.loadJsonItem({
			key: "skybox",
			elem: skybox,
			descriptor: this.data.descriptors["skybox"],
			extras: [["type", "skybox"]]
		}));
	}

	/**
	 * Load the textures element
	 * @param {*} rootElement 
	 */
	loadTextures(rootElement) {
		let elem = rootElement["textures"];
		this.loadJsonItems(elem, 'texture', this.data.descriptors["texture"], [["type", "texture"]], this.data.addTexture)
	}

	/**
	 * Load the materials element
	 * @param {*} rootElement 
	 */
	loadMaterials(rootElement) {
		let elem = rootElement["materials"];
		this.loadJsonItems(elem, 'material', this.data.descriptors["material"], [["type", "material"]], this.data.addMaterial)
	}

	/**
	 * Load the cameras element
	 * @param {*} rootElement 
	 */
	loadCameras(rootElement) {
		let camerasElem = rootElement["cameras"]; // get cameras root node

		// traverse all camera elements
		for (let key in camerasElem) {
			let elem = camerasElem[key];
			// set the active camera
			if (key == "initial") {
				this.data.setActiveCameraId(elem);
				console.log("active camera id: " + elem)
				continue;
			}
			// get the camera type
			let camType = elem["type"];

			// load orthogonal cameras
			if (camType == "orthogonal") {
				this.data.addCamera(this.loadJsonItem({
					key: key,
					elem: elem,
					descriptor: this.data.descriptors["orthogonal"],
					extras: [["type", "orthogonal"]]
				}));
			}
			// load perspective cameras
			else if (camType == "perspective") {
				this.data.addCamera(this.loadJsonItem({
					key: key,
					elem: elem,
					descriptor: this.data.descriptors["perspective"],
					extras: [["type", "perspective"]]
				}));
			}
			else {
				throw new Error("Unrecognized camera type '" + camType + "' in camera '" + key + "'");
			}
		}
	}

	/**
	 * Load the nodes element
	 * @param {*} rootElement 
	 */
	loadNodes(rootElement) {
		let graphElem = rootElement["graph"]; // load graph root node

		// traverse all graph keys
		for (let key in graphElem) {
			let elem = graphElem[key];

			// set the root node
			if (key == "rootid") {
				this.data.setRootId(elem);
				continue;
			}

			this.loadNode(key, elem);
		}
	}

	/**
	 * Load the data for a particular node element
	 * @param {*} nodeElement the node object
	 */
	loadNode(id, nodeElement) {
		// get if node previously added (for instance because it was a child ref in other node)
		let obj = this.data.getNode(id);
		if (obj == null) {
			// otherwise add a new node
			obj = this.data.createEmptyNode(id);
		}

		// load transformations
		let transforms = nodeElement["transforms"];
		if (transforms !== null && transforms !== undefined) {
			this.loadTransforms(obj, transforms);
		}

		// load material refeences
		let materialsRef = nodeElement["materialref"];
		if (materialsRef != null) {
			if (materialsRef["materialId"] === null || materialsRef["materialId"] === undefined) {
				throw new Error("node " + id + " has a materialref but not a materialId");
			}

			let materialId = this.getString(materialsRef, "materialId");
			obj['materialIds'].push(materialId);
		}

		// load cast shadows properties
		let castShadows = nodeElement["castshadows"];
		if (castShadows != null) {
			obj['castshadows'] = castShadows;
		}

		// load receive shadow properties
		let receiveShadows = nodeElement["receiveshadows"];
		if (receiveShadows != null) {
			obj['receiveshadows'] = receiveShadows;
		}

		// load children (primitives or other node references)
		let children = nodeElement["children"];
		if (children == null) {
			// if there is no children, node might be a type lod node, therefore we check for the existence of lodNodes
			children = nodeElement["lodNodes"];
			if (children == null) {
				throw new Error("node " + id + " has no children or lodNodes");
			}
		}
		this.loadChildren(obj, children);
		obj.loaded = true; // set the object as loaded to avoid repeated loading
	}

	/**
	 * Load the transformations for a particular node element
	 * @param {*} obj the node object
	 * @param {*} transformsElement the transformations object
	 * @returns 
	 */
	loadTransforms(obj, transformsElement) {
		for (let i in transformsElement) {
			const transform = transformsElement[i];
			const transformType = transform["type"];
			if (!["translate", "rotate", "scale"].includes(transformType)) {
				return "unrecognized transformation " + transformType + ".";
			}
			if (transformType == "translate") {
				let translate = this.getVector3(transform, "amount");
				// add a translation
				obj.transformations.push({ type: "T", translate: translate });
			}
			else if (transformType == "rotate") {
				let factor = this.getVector3(transform, "amount");
				// add a rotation
				obj.transformations.push({ type: "R", rotation: factor });
			}
			else if (transformType == "scale") {
				let factor = this.getVector3(transform, "amount");
				// add a scale
				obj.transformations.push({ type: "S", scale: factor });
			}
		}
	}

	/**
	 * Load the children for a particular node element
	 * @param {*} nodeObj the node object
	 * @param {*} childrenElement the xml children element
	 */

	loadChildren(nodeObj, childrenElement) {
		for (let child in childrenElement) {
			let childElement = childrenElement[child];
			var nodeType = childElement["type"]; // get the type of the child

			// if the parent is a lod node and the children does not have a type, then the children is a lod node, so it can be identified properly
			if(nodeObj.type === "lod" && nodeType === undefined){
				nodeType = "lod";
			}

			// if the child is named lodsList, then it is a list of lod nodes, which will have to be loaded as such
			if(child === 'lodsList'){
				// traverse lod nodes
				for(let i in childElement) {
					let child = childElement[i];
					// add a node ref: if the node does not exist
					// create an empty one and reference it.
					let reference = this.data.getNode(child);
					if (reference === null) {
						// does not exist, yet. create it!
						reference = this.data.createEmptyNode(child, true); // the true boolean will tell createEmptyNode that this is a lod node
					}
					// reference it.
					this.data.addChildToNode(nodeObj, reference)
				}
			}
			// if the child is named nodesList, then it is a list of nodes, and will be loaded as a normal noderef
			else if (child === 'nodesList') {
				for(let i in childElement) {
					let child = childElement[i];
					// add a node ref: if the node does not exist
					// create an empty one and reference it.
					let reference = this.data.getNode(child);
					if (reference === null) {
						// does not exist, yet. create it!
						reference = this.data.createEmptyNode(child); // Does not need a false boolean, because the method parameter is, by default, false
					}
					// reference it.
					this.data.addChildToNode(nodeObj, reference)
				}
			}
			// if the child is a primitive, then load the primitive
			else if (this.data.primitiveIds.includes(nodeType)) {
				let primitiveObj = this.data.createEmptyPrimitive();
				this.loadPrimitive(childElement, primitiveObj, nodeType);
				this.data.addChildToNode(nodeObj, primitiveObj);
			}
			// if the child is a light node, then load the light object
			else if (this.data.lightIds.includes(nodeType)) {
				let lightObj = this.loadLight(child, childElement, nodeType)
				this.data.addChildToNode(nodeObj, lightObj)
			}
			/* Because the lod node does not have a children attribute, the children are stored in the lodNodes attribute.
			* Inside children there are 2 types of arrays: lodsList and nodesList, which have their own if cases, to distinguish between 'lod' and 'node' types.
			* To distinguish if the childrenElement object is a children object or a lodNodes object, we check if the child is a lod node.
			* Even though the child is a 'lod' node for easier separation in the parser, it needs to be loaded as a normal node for the following reasons: 
			* - Loading as a normal node will allow these child nodes to be processed like any other primitives,
			*	without having to adapt the rest of the code to detect 'lod' types, which have no useful info apart from its children.
			* - The lod children also allows transformations and materials, similarly to the original node.
			*/
			else if(nodeType === "lod"){
				// add a node ref: if the node does not exist
				// create an empty one and reference it.
				let reference = this.data.getNode(childElement.nodeId);
				if (reference === null) {
					// does not exist, yet. create it!
					// Does not need a true boolean to indicate a lod node, as it will be loaded as a normal node
					// mindist must be given to be later added to the LOD object 
					// mindist is defaulted for all nodes as 0, but it will only be accessed when a node is a children of a lod node
					reference = this.data.createEmptyNode(childElement.nodeId, false, childElement.mindist);
				}
				// update min dist for already created nodes that are part of the lod node
				reference = this.data.updateMinDist(reference, childElement.mindist);
				// reference it.
				this.data.addChildToNode(nodeObj, reference)
			}
			else {
				throw new Error("unrecognized child type '" + nodeType + "'.");
			}
		}
	}

	/**
	 * Loads a light object into a new object
	 * @param {*} elem 
	 * @returns 
	 */
	loadLight(id, elem, lightType) {
		let descriptor = this.data.descriptors[lightType];
		let obj = this.loadJsonItem({
			elem: elem,
			key: id,
			descriptor: descriptor,
			extras: [["type", lightType]]
		})
		return obj;
	}

	/**
	 * For a given primitive element, loads the available representations into the primitive object
	 * @param {XML element} parentElem 
	 * @param {*} primitiveObj the primitive object to load data into
	 */
	loadPrimitive(parentElem, primitiveObj, primType) {
		const descriptor = this.data.descriptors[primType];
		const obj = this.loadJsonItem({
			elem: parentElem,
			descriptor: descriptor,
			extras: [["type", "primitive"], ["subtype", primType]]
		})
		primitiveObj.subtype = primType; // as type is 'primitive', we need to set the primitive we will actually draw (rectangle, triangle, etc.)
		primitiveObj.representations.push(obj); // array with points, radius, etc., depending on the primitive

		this.data.objects.push(primitiveObj); // add the primitive to the list of objects for checks
		return;
	}
}

export { MyFileReader };
