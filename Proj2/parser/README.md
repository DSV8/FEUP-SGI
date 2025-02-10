# SGI Json Reader

Library to read and parse a YASF file for SGI.

# Using the Parser

1. In the MyContents.js class, the constructor call:

```javascript
this.reader = new MyFileReader(this.onSceneLoaded.bind(this));
this.reader.open("scenes/scene/scene.json");	
```

The last argumet in the constructor is a method that is called when the json
file is loaded and parsed.

2. In the MyContents.js class, the method with signature: 

```javascript
onSceneLoaded(data) {
}
```

This method is called once the json file is loaded and parsed successfully. The
data argument is the entire scene data object. 