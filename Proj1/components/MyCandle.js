import * as THREE from 'three';

class MyCandle {
    constructor(radius, height, displacement) {
        this.radius = radius;
        this.height = height;
        this.displacement = displacement;

        // candle related attributes
        this.candle = null;
        this.candleWick = null;
        this.candleFlame = null;
        this.candleFlameSphere = null;

        this.candleEnabled = true;
        this.lastCandleEnabled = null;
    }

    buildCandle() {
        // Create candle wax material and geometry
        var candleMaterial = new THREE.MeshPhongMaterial({ color: "#ffffff", specular: "#000000", emissive: "#A9A9A9", shininess: 90, side: THREE.DoubleSide });
        var candleGeometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 25, 2, false);
        
        // Create candle wick material and geometry
        var candleWickGeometry = new THREE.CylinderGeometry(this.radius / 5, this.radius / 5, this.height / 10, 20, 2, false);
        var candleWickMaterial = new THREE.MeshPhongMaterial({ color: "#000000", specular: "#000000", emissive: "#000000", shininess: 90, side: THREE.DoubleSide});

        // Create candle wax mesh
        this.candleWax = new THREE.Mesh(candleGeometry, candleMaterial);
        this.candleWax.position.set(this.displacement.x, this.displacement.y  - this.height / 3, this.displacement.z);
        this.candleWax.receiveShadow = true;
        this.candleWax.castShadow = true;

        // Create candle wick mesh
        this.candleWick = new THREE.Mesh(candleWickGeometry, candleWickMaterial);
        this.candleWick.position.set(this.displacement.x, this.displacement.y + this.height / 6, this.displacement.z);
        this.candleWick.receiveShadow = true;
        this.candleWick.castShadow = true;

        // Create candle flame cone material and geometry (top part of the plame)
        var candleFlameMaterial = new THREE.MeshBasicMaterial({ color: "#fb7604" });
        var candleFlameGeometry = new THREE.ConeGeometry(0.05, 0.18, 25);

        // Create candle flame mesh
        this.candleFlame = new THREE.Mesh(candleFlameGeometry, candleFlameMaterial);
        this.candleFlame.position.set(this.displacement.x, this.displacement.y + 1.95 * this.height / 5, this.displacement.z);

        // Create candle flame sphere material and geometry (bottom part of the flame)
        var candleFlameSphereGeometry = new THREE.SphereGeometry(0.05, 25, 8, Math.PI * 0.25, Math.PI * 2, 0, Math.PI *0.5);
        
        // Create candle flame sphere mesh
        this.candleFlameSphere = new THREE.Mesh(candleFlameSphereGeometry, candleFlameMaterial);
        this.candleFlameSphere.position.set(this.displacement.x, this.displacement.y + 1.4 * this.height / 5, this.displacement.z)
        this.candleFlameSphere.rotation.x = Math.PI;

        // Create candle group
        this.candle = new THREE.Group();
        this.candle.add(this.candleWax);
        this.candle.add(this.candleWick);
        this.candle.add(this.candleFlame);
        this.candle.add(this.candleFlameSphere);
    }

    addToScene(scene) {
        if(this.candle) scene.add(this.candle);
    }

    removeFromScene(scene) {
        if(this.candle) scene.remove(this.candle);
    }

    /**
     * Rebuilds Candle mesh if required
     */
    rebuildCandle(scene) {
        this.removeFromScene(scene);
        this.buildCandle();
        this.addToScene(scene);
        this.lastCandleEnabled = null;
    }

    /**
     * Updates Candle mesh if required
     */
    updateCandleIfRequired(scene) {
        if (this.candleEnabled !== this.lastCandleEnabled) {
            this.lastCandleEnabled = this.candleEnabled;
            if (this.candleEnabled) {
                scene.add(this.candle);
            }
            else {
                scene.remove(this.candle);
            }
        }
    }
}

export { MyCandle };