import * as THREE from 'three'

class MyFirework {

    constructor(app, scene) {
        this.app = app
        this.scene = scene

        this.done = false 
        this.dest = [] 
        
        this.vertices = null
        this.colors = null
        this.geometry = null
        this.points = null
        
        // Create a new material for the points
        this.material = new THREE.PointsMaterial({
            size: 5.0,
            color: 0xffffff,
            opacity: 1,
            vertexColors: true,
            transparent: true,
            depthTest: false
        });
        
        // Set the initial height and speed of the firework particle
        this.height = 300
        this.speed = new THREE.Vector3((Math.random() - 0.5) * 5, 12, (Math.random() - 0.5) * 5)
        
        // flag attributes
        this.active = false
        this.exploded = false

        this.gravity = new THREE.Vector3(0, -9.81, 0); // Acceleration due to gravity in m/s²
        this.clock = new THREE.Clock(); // Create a clock to track time to calculate speed and position

        this.velocities = [] // Particle velocities

        this.launch() 
    }

    /**
     * compute particle launch
     */
    launch() {
        if (this.points) {
            // If a firework is already launched, do not launch another one
            return;
        }

        // Generate a random color for the particle
        let color = new THREE.Color()
        color.setHSL( THREE.MathUtils.randFloat( 0.1, 0.9 ), 1, 0.9 )
        let colors = [ color.r, color.g, color.b ]

        // Define initial launch position
        const initialX = THREE.MathUtils.randFloat(-200, 200);
        const initialY = THREE.MathUtils.randFloat(-300, -100);
        const initialZ = THREE.MathUtils.randFloat(-200, 200);

        let y = THREE.MathUtils.randFloat( this.height * 0.6, this.height * 1.1) // Only the final random height is needed to explode the particle
        this.dest.push( 0, y, 0 ) 
        let vertices = [initialX, initialY, initialZ]
        
        // Create the geometry and points
        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(vertices), 3 ) ); // Set the initial position of the particle
        this.geometry.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array(colors), 3 ) ); // Set the color of the particle
        this.points = new THREE.Points( this.geometry, this.material )
        this.points.castShadow = true;
        this.points.receiveShadow = true;
        this.app.scene.add( this.points )  

        // Set the active particle flag to true
        this.active = true;
    }

    /**
     * Compute explosion
     * @param {*} origin origin point of explosion
     * @param {*} n number of particles to explode
     * @param {*} rangeBegin beginning of range for explosion
     * @param {*} rangeEnd end of range for explosion
     */
    explode(origin, n, rangeBegin, rangeEnd) {
        // Remove existing points
        if (this.points) {
            this.app.scene.remove(this.points);
            this.points.geometry.dispose();
        }

        // Generate explosion particles
        const vertices = [];
        const colors = [];
        const color = new THREE.Color();
        this.velocities = []; // Reset velocities

        for (let i = 0; i < n; i++) {
            // Random offset from origin
            const offsetX = Math.random() * (rangeEnd - rangeBegin) - (rangeEnd - rangeBegin) / 2;
            const offsetY = Math.random() * (rangeEnd - rangeBegin) - (rangeEnd - rangeBegin) / 2;
            const offsetZ = Math.random() * (rangeEnd - rangeBegin) - (rangeEnd - rangeBegin) / 2;

            // Start all particles at the explosion origin
            vertices.push(origin[0], origin[1], origin[2]);

            // Random color for each particle
            color.setHSL(Math.random(), 1.0, 0.5);
            colors.push(color.r, color.g, color.b);

            // Set velocity based on offset (directional movement)
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            const speed = Math.random() * 0.1;
            const vx = speed * Math.sin(phi) * Math.cos(theta) + offsetX;
            const vy = speed * Math.sin(phi) * Math.sin(theta) + offsetY;
            const vz = speed * Math.cos(phi) + offsetZ;

            this.velocities.push(vx * 0.05, vy * 0.05, vz * 0.05);
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

        this.points = new THREE.Points(this.geometry, this.material);
        this.app.scene.add(this.points);
        this.active = true; // Set the active flag to true
        this.exploded = true; // Set the exploded flag to true

        this.updateParticles();
    }

    /**
     * Update particle positions over time
     */
    updateParticles() {
        if (!this.geometry || !this.geometry.attributes.position || !this.geometry.attributes.color) {
            console.error("Geometry or attributes are not initialized.");
            return;
        }
    
        // Get the positions array from the geometry
        const positions = this.geometry.attributes.position.array;
    
        // Animate the particles
        const animate = () => {
            // Check if the geometry still exists
            if (!this.geometry) {
                cancelAnimationFrame(this.animationFrameId);
                return;
            }

            // Update particle positions based on velocity (gravity is not used here)
            for (let i = 0; i < positions.length; i += 3) {
                const index = i / 3;

                // Update position based on velocity
                positions[i] += this.velocities[index * 3];        // X-axis
                positions[i + 1] += this.velocities[index * 3 + 1];  // Y-axis
                positions[i + 2] += this.velocities[index * 3 + 2];  // Z-axis
            }

            // Mark color as needing an update
            this.geometry.attributes.position.needsUpdate = true;

            // Decrease the material's opacity over time
            this.material.opacity -= 0.01; // Fade out the material's opacity

            // If all particles have fully faded out, reset the firework
            if (this.material.opacity <= 0) {
                this.reset();
                this.done = true;
            }

            this.animationFrameId = requestAnimationFrame(animate); // Store the animation frame ID for later cleanup
        };

        animate();
    } 

    /**
     * cleanup
     */
    reset() {
        // Remove the firework points from the scene
        this.app.scene.remove(this.points);
        this.points.geometry.dispose(); // Dispose of the geometry
        this.points.material.dispose(); // Dispose of the material
        this.points = null;

        // Reset other properties
        this.dest = [];
        this.vertices = null;
        this.colors = null;
        this.geometry = null;
        this.active = false;
        this.exploded = false;
        this.velocities = []; // Clear velocities
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId); // Cancel any ongoing animation frame
            this.animationFrameId = null;
        }
    }

    /**
     * update firework
     * @returns 
     */
    update() {
        // Get the time delta since the start of the firework
        const delta = this.clock.getElapsedTime();
        // Do only if points and geometry exist
        if (this.points && this.geometry) {
            let verticesAttribute = this.geometry.getAttribute('position');
            let vertices = verticesAttribute.array;
            let count = verticesAttribute.count; // Number of points in the geometry 
    
            // If the firework hasn't exploded yet (launch phase)
            if (!this.exploded) {
                // Move the single particle based on equation of motion
                for (let i = 0; i < vertices.length; i += 3) {
                    vertices[i] = vertices[i] + this.speed.x * delta; // X-axis
                    vertices[i + 1] = vertices[i + 1] + this.speed.y * delta + 0.5 * this.gravity.y * delta**2 // Y-axis
                    vertices[i + 2] = vertices[i + 2] + this.speed.x * delta; // Z-axis
                }
    
                verticesAttribute.needsUpdate = true; // force update of the attribute
    
                // Check if the firework has reached its destination
                if (count === 1 && Math.ceil(vertices[1]) > (this.dest[1] * 0.95)) {
                    // Trigger explosion
                    this.explode(vertices, 100, this.height * 0.05, this.height * 0.9);
                    return;
                }
            }
        }
    }
}

export { MyFirework }