import * as THREE from 'three'

class MyLights {
    constructor(scene, windowLightDisplacement, frameSpotlightLeftDisplacement, frameSpotlightRightDisplacement, carFrameSpotlightDisplacement) {
        this.scene = scene

        this.mapSize = 1024

        // ambient light related attributes
        this.ambientLight = null
        this.ambientLightEnabled = true
        this.lastAmbientLightEnabled = null
        
        // directional window light related attributes
        this.windowLight = null
        this.windowLightEnabled = true
        this.lastWindowLightEnabled = null
        
        this.windowLightColor = 0xeeaf61
        this.windowLightIntensity = 10
        this.windowLightTargetX = -10
        this.windowLightTargetY = 0

        this.windowLightDisplacement = windowLightDisplacement
        this.windowLightDisplacementX = windowLightDisplacement.x
        this.windowLightDisplacementY = windowLightDisplacement.y

        // top point light related attributes
        this.topPointLight = null
        this.topPointLightEnabled = true
        this.lastTopPointLightEnabled = null

        this.topPointLightColor = 0xffffff
        this.topPointLightIntensity = 80
        this.topPointLightDistance = 50

        // candle point light related attributes
        this.pointLightCandle = null
        this.pointLightCandleEnabled = true
        this.lastPointLightCandleEnabled = null

        this.pointLightCandleColor = 0xffffff
        this.pointLightCandleIntensity = 1
        this.pointLightCandleDistance = 4
        this.pointLightCandleDecay = 2

        // cake spotlight related attributes
        this.spotLightCake = null
        this.spotLightCakeEnabled = true
        this.lastSpotLightCakeEnabled = null

        this.spotlightCakeColor = 0xffffff
        this.spotlightCakeIntensity = 40
        this.spotlightCakeDistance = 25
        this.spotlightCakeAngle = 80
        this.spotlightCakePenumbra = 0.6
        this.spotlightCakeDecay = 0.6
        this.spotlightCakePositionX = 2.4 * Math.cos(Math.PI / 4) - 7
        this.spotlightCakePositionY = 8.5
        this.spotlightCakeTargetX = -2
        this.spotlightCakeTargetY = 7

        // left frame spotlight related attributes
        this.spotLightFrameLeft = null
        this.spotLightFrameLeftEnabled = true
        this.lastSpotLightFrameLeftEnabled = null

        this.leftSpotlightFrameColor = 0xffffff
        this.leftSpotlightFrameIntensity = 70
        this.leftSpotlightFrameDistance = 30
        this.leftSpotlightFrameAngle = 40
        this.leftSpotlightFramePenumbra = 0.6
        this.leftSpotlightFrameDecay = 0.6
        this.leftSpotlightFrameTargetX = 19.95
        this.leftSpotlightFrameTargetY = 14

        this.frameSpotlightLeftDisplacement = frameSpotlightLeftDisplacement

        // right side frame spotlight related attributes
        this.spotLightFrameRight = null
        this.spotLightFrameRightEnabled = true
        this.lastSpotLightFrameRightEnabled = null

        this.rightSpotlightFrameColor = 0xffffff
        this.rightSpotlightFrameIntensity = 70
        this.rightSpotlightFrameDistance = 30
        this.rightSpotlightFrameAngle = 40
        this.rightSpotlightFramePenumbra = 0.6
        this.rightSpotlightFrameDecay = 0.6
        this.rightSpotlightFrameTargetX = 19.95
        this.rightSpotlightFrameTargetY = 14
        
        this.frameSpotlightRightDisplacement = frameSpotlightRightDisplacement

        // car frame spotlight related attributes
        this.spotLightCarFrame = null
        this.spotLightCarFrameEnabled = true
        this.lastSpotLightCarFrameEnabled = null

        this.carSpotlightFrameColor = 0xffffff
        this.carSpotlightFrameIntensity = 70
        this.carSpotlightFrameDistance = 30
        this.carSpotlightFrameAngle = 50
        this.carSpotlightFramePenumbra = 0.6
        this.carSpotlightFrameDecay = 0.6
        this.carSpotlightFrameTargetY = 14.5 
        this.carSpotlightFrameTargetZ = -19

        this.carFrameSpotlightDisplacement = carFrameSpotlightDisplacement
    }

    buildLights() {
        // add a point light on top of the scene
        this.topPointLight = new THREE.PointLight( this.topPointLightColor, this.topPointLightIntensity, this.topPointLightDistance)
        this.topPointLight.position.set(0, 20, 0)

        // add shadow to the top point light
        this.topPointLight.castShadow = true
        this.topPointLight.shadow.mapSize.width = this.mapSize
        this.topPointLight.shadow.mapSize.height = this.mapSize
        this.topPointLight.shadow.camera.near = 0.5
        this.topPointLight.shadow.camera.far = 100
  
        // add a spotlight to point at the cake (a.k.a lamp light)
        this.spotLightCake = new THREE.SpotLight(this.spotlightCakeColor, this.spotlightCakeIntensity, this.spotlightCakeDistance, 
            this.degreesToRadians(this.spotlightCakeAngle), this.spotlightCakePenumbra, this.spotlightCakeDecay)
        this.spotLightCake.position.set(this.spotlightCakePositionX, this.spotlightCakePositionY, Math.sin(Math.PI / 4) * -2.4 + 4.5)
        this.spotLightCake.target.position.set(this.spotlightCakeTargetX, this.spotlightCakeTargetY, 0.5)
        this.scene.add(this.spotLightCake.target)

        // add shadow to the cake light
        this.spotLightCake.castShadow = true
        this.spotLightCake.shadow.mapSize.width = this.mapSize
        this.spotLightCake.shadow.mapSize.height = this.mapSize
        this.spotLightCake.shadow.camera.near = 0.5
        this.spotLightCake.shadow.camera.far = 100
        this.spotLightCake.shadow.camera.left = -15
        this.spotLightCake.shadow.camera.right = 15
        this.spotLightCake.shadow.camera.bottom = -15
        this.spotLightCake.shadow.camera.top = 15

        // add a point light to the candle
        this.pointLightCandle = new THREE.PointLight(this.pointLightCandleColor, this.pointLightCandleDistance,
             this.pointLightCandleDistance, this.pointLightCandleDecay)
        this.pointLightCandle.castShadow = true;
        this.pointLightCandle.position.set(0.5, 7.16, -0.5)

        // add shadow to the candle light
        this.pointLightCandle.castShadow = true
        this.pointLightCandle.shadow.mapSize.width = this.mapSize
        this.pointLightCandle.shadow.mapSize.height = this.mapSize
        this.pointLightCandle.shadow.camera.near = 0.5
        this.pointLightCandle.shadow.camera.far = 100
          
        // add a window light
        this.windowLight = new THREE.DirectionalLight(this.windowLightColor, this.windowLightIntensity)
        this.windowLight.position.set(this.windowLightDisplacement.x, this.windowLightDisplacement.y, this.windowLightDisplacement.z)
        this.windowLight.target.position.set(-10, 0, 0)

        // add shadow to the window light
        this.windowLight.castShadow = true
        this.windowLight.shadow.mapSize.width = this.mapSize
        this.windowLight.shadow.mapSize.height = this.mapSize
        this.windowLight.shadow.camera.near = 0.5
        this.windowLight.shadow.camera.far = 100
        this.windowLight.shadow.camera.left = -15
        this.windowLight.shadow.camera.right = 15
        this.windowLight.shadow.camera.bottom = -15
        this.windowLight.shadow.camera.top = 15
  
        // add an ambient light
        this.ambientLight = new THREE.AmbientLight(0x555555, 4)

        // add left frame light
        this.spotLightFrameLeft = new THREE.SpotLight(this.leftSpotlightFrameColor, this.leftSpotlightFrameIntensity, this.leftSpotlightFrameDistance, 
            this.degreesToRadians(this.leftSpotlightFrameAngle), this.leftSpotlightFramePenumbra, this.leftSpotlightFrameDecay)
        this.spotLightFrameLeft.position.set(this.frameSpotlightLeftDisplacement.x, this.frameSpotlightLeftDisplacement.y, this.frameSpotlightLeftDisplacement.z)
        this.spotLightFrameLeft.target.position.set(this.leftSpotlightFrameTargetX, this.leftSpotlightFrameTargetY, -7.5)

        // add shadow to the left frame light
        this.spotLightFrameLeft.castShadow = true
        this.spotLightFrameLeft.shadow.mapSize.width = this.mapSize
        this.spotLightFrameLeft.shadow.mapSize.height = this.mapSize
        this.spotLightFrameLeft.shadow.camera.near = 0.5
        this.spotLightFrameLeft.shadow.camera.far = 100
        this.spotLightFrameLeft.shadow.camera.left = -15
        this.spotLightFrameLeft.shadow.camera.right = 15
        this.spotLightFrameLeft.shadow.camera.bottom = -15
        this.spotLightFrameLeft.shadow.camera.top = 15

        // update the light's target
        this.scene.add(this.spotLightFrameLeft.target)
        
        // add right frame light    
        this.spotLightFrameRight = new THREE.SpotLight(this.rightSpotlightFrameColor, this.rightSpotlightFrameIntensity, this.rightSpotlightFrameDistance,
            this.degreesToRadians(this.rightSpotlightFrameAngle), this.rightSpotlightFramePenumbra, this.rightSpotlightFrameDecay)
        this.spotLightFrameRight.position.set(this.frameSpotlightRightDisplacement.x, this.frameSpotlightRightDisplacement.y, this.frameSpotlightRightDisplacement.z)
        this.spotLightFrameRight.target.position.set(this.rightSpotlightFrameTargetX, this.rightSpotlightFrameTargetY, 7.5)

        // add shadow to the right frame light
        this.spotLightFrameRight.castShadow = true
        this.spotLightFrameRight.shadow.mapSize.width = this.mapSize
        this.spotLightFrameRight.shadow.mapSize.height = this.mapSize
        this.spotLightFrameRight.shadow.camera.near = 0.5
        this.spotLightFrameRight.shadow.camera.far = 100
        this.spotLightFrameRight.shadow.camera.left = -15
        this.spotLightFrameRight.shadow.camera.right = 15
        this.spotLightFrameRight.shadow.camera.bottom = -15
        this.spotLightFrameRight.shadow.camera.top = 15

        // update the light's target
        this.scene.add(this.spotLightFrameRight.target)

        // add car frame light
        this.spotLightCarFrame = new THREE.SpotLight(this.carSpotlightFrameColor, this.carSpotlightFrameIntensity, this.carSpotlightFrameDistance,
            this.degreesToRadians(this.carSpotlightFrameAngle), this.carSpotlightFramePenumbra, this.carSpotlightFrameDecay)
        this.spotLightCarFrame.position.set(this.carFrameSpotlightDisplacement.x, this.carFrameSpotlightDisplacement.y, this.carFrameSpotlightDisplacement.z)
        this.spotLightCarFrame.target.position.set(0, 14.5, -19)

        // add shadow to the car frame light
        this.spotLightCarFrame.castShadow = true
        this.spotLightCarFrame.shadow.mapSize.width = this.mapSize
        this.spotLightCarFrame.shadow.mapSize.height = this.mapSize
        this.spotLightCarFrame.shadow.camera.near = 0.5
        this.spotLightCarFrame.shadow.camera.far = 100
        this.spotLightCarFrame.shadow.camera.left = -15
        this.spotLightCarFrame.shadow.camera.right = 15
        this.spotLightCarFrame.shadow.camera.bottom = -15
        this.spotLightCarFrame.shadow.camera.top = 15

        // update the light's target
        this.scene.add(this.spotLightCarFrame.target)
    }

    addToScene(scene) {
        if(this.spotLightCake) scene.add(this.spotLightCake)
        if(this.windowLight) scene.add(this.windowLight)
        if(this.topPointLight) scene.add(this.topPointLight)
        if(this.pointLightCandle) scene.add(this.pointLightCandle)
        if(this.ambientLight) scene.add(this.ambientLight)
        if(this.spotLightFrameLeft) scene.add(this.spotLightFrameLeft)
        if(this.spotLightFrameRight) scene.add(this.spotLightFrameRight)
        if(this.spotLightCarFrame) scene.add(this.spotLightCarFrame)
    }

    removeFromScene(scene) {
        if(this.spotLightCake) scene.remove(this.spotLightCake)
        if(this.windowLight) scene.remove(this.windowLight)
        if(this.topPointLight) scene.remove(this.topPointLight)
        if(this.pointLightCandle) scene.remove(this.pointLightCandle)
        if(this.ambientLight) scene.remove(this.ambientLight)
        if(this.spotLightFrameLeft) scene.remove(this.spotLightFrameLeft)
        if(this.spotLightFrameRight) scene.remove(this.spotLightFrameRight)
        if(this.spotLightCarFrame) scene.remove(this.spotLightCarFrame)
    }

    /**
     * Rebuilds Lights if required
     */
    rebuildLights(scene) {
        this.removeFromScene(scene)
        this.buildLights()
        this.addToScene(scene)
        this.lastAmbientLightEnabled = null
        this.lastWindowLightEnabled = null
        this.lastTopPointLightEnabled = null
        this.lastSpotLightCakeEnabled = null
        this.lastPointLightCandleEnabled = null
        this.lastSpotLightFrameLeftEnabled = null
        this.lastSpotLightFrameRightEnabled = null
        this.lastSpotLightCarFrameEnabled = null
    }

    /**
     * Updates Candle mesh if required
     */
    updateLightsIfRequired(scene) {
        if (this.ambientLightEnabled !== this.lastAmbientLightEnabled) {
            this.lastAmbientLightEnabled = this.ambientLightEnabled
            if (this.ambientLightEnabled) {
                scene.add(this.ambientLight)
            }
            else {
                scene.remove(this.ambientLight)
            }
        }
        if(this.windowLightEnabled !== this.lastWindowLightEnabled){
            this.lastWindowLightEnabled = this.windowLightEnabled
            if(this.windowLightEnabled){
                scene.add(this.windowLight)
            }
            else{
                scene.remove(this.windowLight)
            }
        }
        if(this.topPointLightEnabled !== this.lastTopPointLightEnabled){
            this.lastTopPointLightEnabled = this.topPointLightEnabled
            if(this.topPointLightEnabled){
                scene.add(this.topPointLight)
            }
            else{
                scene.remove(this.topPointLight)
            }
        }
        if(this.pointLightCandleEnabled !== this.lastPointLightCandleEnabled){
            this.lastPointLightCandleEnabled = this.pointLightCandleEnabled
            if(this.pointLightCandleEnabled){
                scene.add(this.pointLightCandle)
            }
            else{
                scene.remove(this.pointLightCandle)
            }
        }
        if(this.spotLightCakeEnabled !== this.lastSpotLightCakeEnabled){
            this.lastSpotLightCakeEnabled = this.spotLightCakeEnabled
            if(this.spotLightCakeEnabled){
                scene.add(this.spotLightCake)
            }
            else{
                scene.remove(this.spotLightCake)
            }
        }
        if(this.spotLightFrameLeftEnabled !== this.lastSpotLightFrameLeftEnabled){
            this.lastSpotLightFrameLeftEnabled = this.spotLightFrameLeftEnabled
            if(this.spotLightFrameLeftEnabled){
                scene.add(this.spotLightFrameLeft)
            }
            else{
                scene.remove(this.spotLightFrameLeft)
            }
        }
        if(this.spotLightFrameRightEnabled !== this.lastSpotLightFrameRightEnabled){
            this.lastSpotLightFrameRightEnabled = this.spotLightFrameRightEnabled
            if(this.spotLightFrameRightEnabled){
                scene.add(this.spotLightFrameRight)
            }
            else{
                scene.remove(this.spotLightFrameRight)
            }
        }
        if(this.spotLightCarFrameEnabled !== this.lastSpotLightCarFrameEnabled){
            this.lastSpotLightCarFrameEnabled = this.spotLightCarFrameEnabled
            if(this.spotLightCarFrameEnabled){
                scene.add(this.spotLightCarFrame)
            }
            else{
                scene.remove(this.spotLightCarFrame)
            }
        }
    }

    /**
     * Converts degrees to radians
     * @param {number} value
     */
    degreesToRadians(value) {
        return value * Math.PI / 180
    }

    /**
    * updates the spotlight color
    * @param {number} value - Hexadecimal color value
    */
    updateSpotlightColor(value) {
        this.spotlightCakeColor = value
        this.spotLightCake.color.set(value)
    }

    /**
     * updates the spotlight intensity
     * @param {number} value
     */
    updateSpotlightIntensity(value) {
        this.spotlightCakeIntensity = value
        this.spotLightCake.intensity = value
    }

    /**
     * updates the spotlight distance
     * @param {number} value
     */
    updateSpotlightDistance(value) {
        this.spotlightCakeDistance = value
        this.spotLightCake.distance = value
    }

    /**
     * updates the spotlight angle
     * @param {number} value
     */
    updateSpotlightAngle(value) {
        this.spotlightCakeAngle = value
        this.spotLightCake.angle = this.degreesToRadians(value)
    }

    /**
     * updates the spotlight penumbra
     * @param {number} value
     */
    updateSpotlightPenumbra(value) {
        this.spotlightCakePenumbra = value
        this.spotLightCake.penumbra = value
    }

    /**
     * updates the spotlight decay
     * @param {number} value
     */
    updateSpotlightDecay(value) {
        this.spotlightCakeDecay = value
        this.spotLightCake.decay = value
    }

    /**
     * updates spotlight target X
     * @param {number} value
     */
    updateSpotlightTargetX(value) {
        this.spotlightCakeTargetX = value
        this.spotLightCake.target.position.x = value
        this.spotLightCake.target.updateMatrixWorld() // Ensure the target's matrix is updated
    }

    /**
     * updates spotlight target Y
     */
    updateSpotlightTargetY(value) {
        this.spotlightCakeTargetY = value
        this.spotLightCake.target.position.y = value
        this.spotLightCake.target.updateMatrixWorld() // Ensure the target's matrix is updated
    }

    /**
     * updates the window light color
     * @param {number} value - Hexadecimal color value
     */
    updateWindowLightColor(value) {
        this.windowLightColor = value
        this.windowLight.color.set(value)
    }

    /**
     * updates the window light intensity
     * @param {number} value
     */
    updateWindowLightIntensity(value) {
        this.windowLightIntensity = value
        this.windowLight.intensity = value
    }

    /**
     * updates the window light displacement X
     * @param {number} value
     */
    updateWindowLightDisplacementX(value) {
        this.windowLightDisplacementX = value
        this.windowLight.position.x = value
    }

    /**
     * updates the window light displacement Y
     * @param {number} value
     */
    updateWindowLightDisplacementY(value) {
        this.windowLightDisplacementY = value
        this.windowLight.position.y = value
    }

    /**
     * updates the window light target X
     * @param {number} value
     */
    updateWindowLightTargetX(value) {
        this.windowLightTargetX = value
        this.windowLight.target.position.x = value
        this.windowLight.target.updateMatrixWorld() // Ensure the target's matrix is updated
    }

    /**
     * updates the window light target Y
     * @param {number} value
     */
    updateWindowLightTargetY(value) {
        this.windowLightTargetY = value
        this.windowLight.target.position.y = value
        this.windowLight.target.updateMatrixWorld() // Ensure the target's matrix is updated
    }

    /**
     * updates the left frame light color
     * @param {number} value
     */
    updateLeftFrameLightColor(value) {
        this.leftSpotlightFrameColor = value
        this.spotLightFrameLeft.color.set(value)
    }

    /**
     * updates the left frame light intensity
     * @param {number} value
     */
    updateLeftFrameLightIntensity(value) {
        this.leftSpotlightFrameIntensity = value
        this.spotLightFrameLeft.intensity = value
    }

    /**
     * updates the left frame light distance
     * @param {number} value
     */
    updateLeftFrameLightDistance(value) {
        this.leftSpotlightFrameDistance = value
        this.spotLightFrameLeft.distance = value
    }

    /**
     * updates the left frame light angle
     * @param {number} value
     */
    updateLeftFrameLightAngle(value) {
        this.leftSpotlightFrameAngle = value
        this.spotLightFrameLeft.angle = this.degreesToRadians(value)
    }

    /**
     * updates the left frame light penumbra
     * @param {number} value
     */
    updateLeftFrameLightPenumbra(value) {
        this.leftSpotlightFramePenumbra = value
        this.spotLightFrameLeft.penumbra = value
    }

    /**
     * updates the left frame light decay
     * @param {number} value
     */
    updateLeftFrameLightDecay(value) {
        this.leftSpotlightFrameDecay = value
        this.spotLightFrameLeft.decay = value
    }

    /**
     * updates the left frame light target X
     * @param {number} value
     */
    updateLeftFrameLightTargetX(value) {
        this.spotLightFrameLeft.target.position.x = value
        this.spotLightFrameLeft.target.updateMatrixWorld() // Ensure the target's matrix is updated
    }

    /**
     * updates the left frame light target Y
     * @param {number} value
     */
    updateLeftFrameLightTargetY(value) {
        this.spotLightFrameLeft.target.position.y = value
        this.spotLightFrameLeft.target.updateMatrixWorld() // Ensure the target's matrix is updated
    }

    /**
     * updates the right frame light color
     * @param {number} value
     */
    updateRightFrameLightColor(value) {
        this.rightSpotlightFrameColor = value
        this.spotLightFrameRight.color.set(value)
    }

    /**
     * updates the right frame light intensity
     * @param {number} value
     */
    updateRightFrameLightIntensity(value) {
        this.rightSpotlightFrameIntensity = value
        this.spotLightFrameRight.intensity = value
    }

    /**
     * updates the right frame light distance
     * @param {number} value
     */
    updateRightFrameLightDistance(value) {
        this.rightSpotlightFrameDistance = value
        this.spotLightFrameRight.distance = value
    }

    /**
     * updates the right frame light angle
     * @param {number} value
     */
    updateRightFrameLightAngle(value) {
        this.rightSpotlightFrameAngle = value
        this.spotLightFrameRight.angle = this.degreesToRadians(value)
    }

    /**
     * updates the right frame light penumbra
     * @param {number} value
     */
    updateRightFrameLightPenumbra(value) {
        this.rightSpotlightFramePenumbra = value
        this.spotLightFrameRight.penumbra = value
    }

    /**
     * updates the right frame light decay
     * @param {number} value
     */
    updateRightFrameLightDecay(value) {
        this.rightSpotlightFrameDecay = value
        this.spotLightFrameRight.decay = value
    }

    /**
     * updates the right frame light target X
     * @param {number} value
     */
    updateRightFrameLightTargetX(value) {
        this.spotLightFrameRight.target.position.x = value
        this.spotLightFrameRight.target.updateMatrixWorld() // Ensure the target's matrix is updated
    }

    /**
     * updates the right frame light target Y
     * @param {number} value
     */
    updateRightFrameLightTargetY(value) {
        this.spotLightFrameRight.target.position.y = value
        this.spotLightFrameRight.target.updateMatrixWorld() // Ensure the target's matrix is updated
    }

    /**
     * updates the car frame light color
     * @param {number} value
     */
    updateCarFrameLightColor(value) {
        this.carSpotlightFrameColor = value
        this.spotLightCarFrame.color.set(value)
    }

    /**
     * updates the car frame light intensity
     * @param {number} value
     */
    updateCarFrameLightIntensity(value) {
        this.carSpotlightFrameIntensity = value
        this.spotLightCarFrame.intensity = value
    }

    /**
     * updates the car frame light distance
     * @param {number} value
     */
    updateCarFrameLightDistance(value) {
        this.carSpotlightFrameDistance = value
        this.spotLightCarFrame.distance = value
    }

    /**
     * updates the car frame light angle
     * @param {number} value
     */
    updateCarFrameLightAngle(value) {
        this.carSpotlightFrameAngle = value
        this.spotLightCarFrame.angle = this.degreesToRadians(value)
    }

    /**
     * updates the car frame light penumbra
     * @param {number} value
     */
    updateCarFrameLightPenumbra(value) {
        this.carSpotlightFramePenumbra = value
        this.spotLightCarFrame.penumbra = value
    }

    /**
     * updates the car frame light decay
     * @param {number} value
     */
    updateCarFrameLightDecay(value) {
        this.carSpotlightFrameDecay = value
        this.spotLightCarFrame.decay = value
    }

    /**
     * updates the car frame light target Y
     * @param {number} value
     */
    updateCarFrameLightTargetY(value) {
        this.spotLightCarFrame.target.position.y = value
        this.spotLightCarFrame.target.updateMatrixWorld() // Ensure the target's matrix is updated
    }

    /**
     * updates the car frame light target Z
     * @param {number} value
     */
    updateCarFrameLightTargetZ(value) {
        this.spotLightCarFrame.target.position.z = value
        this.spotLightCarFrame.target.updateMatrixWorld() // Ensure the target's matrix is updated
    }

    /**
     * updates the top point light color
     * @param {number} value
     */ 
    updateTopPointLightColor(value) {
        this.topPointLightColor = value
        this.topPointLight.color.set(value) 
    }

    /**
     * updates the top point light intensity
     * @param {number} value
     */
    updateTopPointLightIntensity(value) {
        this.topPointLightIntensity = value
        this.topPointLight.intensity = value
    }

    /**
     * updates the top point light distance
     * @param {number} value
     */
    updateTopPointLightDistance(value) {
        this.topPointLightDistance = value
        this.topPointLight.distance = value
    }

}

export { MyLights }
       