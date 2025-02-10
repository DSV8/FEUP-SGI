import * as THREE from 'three';

class MySpritesheetText {
    constructor(spritesheetUrl, charWidth, charHeight, charsPerRow) {
        this.spritesheetUrl = spritesheetUrl;
        this.charWidth = charWidth; // Width of each character in the spritesheet
        this.charHeight = charHeight; // Height of each character in the spritesheet
        this.charsPerRow = charsPerRow; // Number of characters in each row of the spritesheet
        this.spritesheetTexture = null; // Will hold the texture after it's loaded
    }

    // Load the spritesheet texture
    loadSpritesheet(callback) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            this.spritesheetUrl,
            (texture) => {
                this.spritesheetTexture = texture;
                console.log('Spritesheet loaded:', this.spritesheetTexture);
                if (callback) callback();
            },
            undefined,
            (error) => {
                console.error('An error occurred while loading the spritesheet:', error);
            }
        );
    }

    // Map the character to its UV position in the spritesheet
    getCharacterUV(charCode) {
        if (!this.spritesheetTexture || !this.spritesheetTexture.image) {
            throw new Error('Spritesheet texture is not loaded');
        }

        const row = Math.floor((charCode - 32) / this.charsPerRow); // ASCII space starts at 32
        const col = (charCode - 32) % this.charsPerRow;
        
        // Calculate the `u`, `v` coordinates for the texture
        const u = col * this.charWidth / this.spritesheetTexture.image.width;
        const v = 1 - (row + 1) * this.charHeight / this.spritesheetTexture.image.height; // Flip vertically

        return { u, v };
    }

    // Create a sprite for a single character
    createCharacterSprite(character) {
        var charCode = character.charCodeAt(0);

        // Skip rendering for space character
        if (charCode === 32) {
            return null;
        }
        else if (charCode === 231){ // 'ç' character
            charCode = 133;
        }

        const { u, v } = this.getCharacterUV(charCode);

        const spriteMaterial = new THREE.SpriteMaterial({
            map: this.spritesheetTexture.clone(),
            transparent: true,
        });

        // Set the texture offset for the character
        spriteMaterial.map.offset.set(u, v);
        spriteMaterial.map.repeat.set(this.charWidth / this.spritesheetTexture.image.width, this.charHeight / this.spritesheetTexture.image.height);

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(this.charWidth, this.charHeight, 1); // Adjust sprite size as needed
        return sprite;
    }

    // Render the text on the screen
    renderText(scene, text, startX, startY, scale = 1) {
        let xOffset = startX;

        // Loop through each character in the text
        for (let i = 0; i < text.length; i++) {
            const sprite = this.createCharacterSprite(text[i]);

            // Skip rendering for space character
            if (sprite === null) {
                xOffset += this.charWidth; // Move to the next position for the next character
                continue;
            }

            // Position and scale the sprite and add it to the scene
            sprite.position.set(xOffset, startY, 0);
            sprite.scale.multiplyScalar(scale); // Adjust sprite scale as needed
            scene.add(sprite);

            // Move to the next position for the next character
            xOffset += this.charWidth * scale; // Adjust the spacing between characters as needed
        }
    }
}

export { MySpritesheetText };