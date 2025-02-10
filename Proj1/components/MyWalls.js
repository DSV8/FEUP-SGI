import * as THREE from 'three';

class MyWalls {
    constructor(width, height, displacement, heightTop = 0, heightBottom = 0, widthSides = 0, heightSides = 0) {
        this.width = width;
        this.height = height;
        this.displacement = displacement;
        this.heightTop = heightTop;
        this.heightBottom = heightBottom;
        this.widthSides = widthSides;
        this.heightSides = heightSides;

        // walls related attributes
        this.frontWall = null;
        this.backWall = null;
        this.leftWall = null;
        this.rightWall = null;
        
        // windowed wall related attributes in order to create a hole in the wall
        this.rightWallTop = null;
        this.rightWallBottom = null;
        this.rightWallLeft = null;
        this.rightWallRight = null;

        this.wallsEnabled = true
        this.lastWallsEnabled = null
    }

    /**
     * Creates a singular wall mesh
     * @param {number} width 
     * @param {number} height 
     * @returns {THREE.Mesh} Wall mesh
     */
    buildWall(width, height) {
        // Create wall material
        let wallMaterial = new THREE.MeshLambertMaterial({ color: 0x333333, side: THREE.DoubleSide });

        // Create wall geometry
        let wallGeometry = new THREE.PlaneGeometry(width, height / 2);

        return new THREE.Mesh(wallGeometry, wallMaterial);
    }

    /**
     * Builds all the walls
     */
    buildAll() {
        // Create front wall
        this.frontWall = this.buildWall(this.width, this.height);
        this.frontWall.position.set(this.displacement.x, this.displacement.y, this.displacement.z + this.width / 2);

        this.frontWall.receiveShadow = true;
        this.frontWall.castShadow = false;

        // Create back wall
        this.backWall = this.buildWall(this.width, this.height);
        this.backWall.position.set(this.displacement.x, this.displacement.y, this.displacement.z - this.width / 2);

        this.backWall.receiveShadow = true;
        this.backWall.castShadow = false;

        // Create left wall
        this.leftWall = this.buildWall(this.width, this.height);
        this.leftWall.rotation.y = Math.PI / 2;
        this.leftWall.position.set(this.displacement.x + this.width / 2, this.displacement.y, this.displacement.z);

        this.leftWall.receiveShadow = true;
        this.leftWall.castShadow = false;

        // Create right wall top part
        this.rightWallTop = this.buildWall(this.width, this.heightTop);
        this.rightWallTop.rotation.y = Math.PI / 2;
        this.rightWallTop.position.set(this.displacement.x - this.width / 2, this.displacement.y + this.height / 2 - this.heightTop * 2.7 - 0.0175, this.displacement.z);

        this.rightWallTop.receiveShadow = true;
        this.rightWallTop.castShadow = false;

        // Create right wall bottom part
        this.rightWallBottom = this.buildWall(this.width, this.heightBottom);
        this.rightWallBottom.rotation.y = Math.PI / 2;
        this.rightWallBottom.position.set(this.displacement.x - this.width / 2, this.displacement.y - this.height / 5 + this.heightBottom / 12, this.displacement.z);

        this.rightWallBottom.receiveShadow = true;
        this.rightWallBottom.castShadow = false;

        // Create right wall left part
        this.rightWallLeft = this.buildWall(this.widthSides, this.heightSides);
        this.rightWallLeft.rotation.y = Math.PI / 2;
        this.rightWallLeft.position.set(this.displacement.x - this.width / 2, this.displacement.y + this.height / 20, this.displacement.z + this.width / 3 + this.widthSides / 11 + 0.05);

        this.rightWallLeft.receiveShadow = true;
        this.rightWallLeft.castShadow = false;

        // Create right wall right part
        this.rightWallRight = this.buildWall(this.widthSides, this.heightSides);
        this.rightWallRight.rotation.y = Math.PI / 2;
        this.rightWallRight.position.set(this.displacement.x - this.width / 2, this.displacement.y + this.height / 20, this.displacement.z - this.width / 3 - this.widthSides / 11 - 0.05);

        this.rightWallRight.receiveShadow = true;
        this.rightWallRight.castShadow = false;

        // Create right wall group
        this.rightWall = new THREE.Group();
        this.rightWall.add(this.rightWallTop);
        this.rightWall.add(this.rightWallBottom);
        this.rightWall.add(this.rightWallLeft);
        this.rightWall.add(this.rightWallRight);

        // Create walls group
        this.walls = new THREE.Group();
        this.walls.add(this.frontWall);
        this.walls.add(this.backWall);
        this.walls.add(this.leftWall);
        this.walls.add(this.rightWall);
    }

    addToScene(scene) {
        if (this.walls) scene.add(this.walls);
    }

    removeFromScene(scene) {
        if (this.walls) scene.remove(this.walls);
    }

    /**
    * Rebuilds the walls mesh if required
    */
    rebuildWalls(scene) {
        this.removeFromScene(scene);
        this.buildAll();
        this.addToScene(scene);
        this.lastWallsEnabled = null;
    }

    /**
    * updates the walls mesh if required
    */
    updateWallsIfRequired(scene) {
        if (this.wallsEnabled !== this.lastWallsEnabled) {
            this.lastWallsEnabled = this.wallsEnabled;
            if (this.wallsEnabled) {
                scene.add(this.walls);
            } else {
                scene.remove(this.walls);
            }
        }
    }
}

export { MyWalls };