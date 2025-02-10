import * as THREE from 'three';
import { MyNurbsBuilder } from './MyNurbsBuilder.js';

class MyPrimitiveBuilder {
    constructor(app) {
        this.app = app;
        this.convertColor = null;
        this.nurbsBuilder = new MyNurbsBuilder(this.app);
    }

    /**
     * Convert color using the passed convertColor function
     * @param {Object} color The color object to convert
     * @returns {THREE.Color} The converted THREE.Color object
     */
    convertColor(color) {
        if (this.convertColor) { // if convertColor function was passed from MySceneData
            return this.convertColor(color); // execute the function
        } else {
            console.error('convertColor function is not defined'); // function was not passed from MySceneData
            return new THREE.Color(0, 0, 0); // Return black color as default
        }
    }

    /**
     * Function to map an altered texture to a cloned material
     * @param {*} clonedMaterial clonedMaterial to be returned
     * @param {*} material original material
     * @param {*} texlength_s 
     * @param {*} texlength_t 
     * @returns cloned material with altered texture values
     */
    setTextureValues(clonedMaterial, material, texlength_s, texlength_t) {
        // set for normal texture
        if (material.map) {
            var clonedTex = material.map.clone(); // Clone the map
            clonedTex.wrapS = THREE.RepeatWrapping;
            clonedTex.wrapT = THREE.RepeatWrapping;
            clonedTex.repeat.set(texlength_s, texlength_t); // Set the repeat values
            clonedTex.needsUpdate = true; // Ensure the texture updates
        }

        //set for bump map
        if (material.bumpMap) {
            var clonedBumpMap = material.bumpMap.clone(); // Clone the bump map
            clonedBumpMap.wrapS = THREE.RepeatWrapping;
            clonedBumpMap.wrapT = THREE.RepeatWrapping;
            clonedBumpMap.repeat.set(texlength_s, texlength_t); // Set the repeat values
        }

        // set the specular map
        if (material.specularMap) {
            var clonedSpecularMap = material.specularMap.clone(); // Clone the specular map
            clonedSpecularMap.wrapS = THREE.RepeatWrapping;
            clonedSpecularMap.wrapT = THREE.RepeatWrapping;
            clonedSpecularMap.repeat.set(texlength_s, texlength_t); // Set the repeat values
        }

        // Set the cloned texture to the cloned material
        clonedMaterial.map = clonedTex;

        // set the cloned bump map to the cloned material
        clonedMaterial.bumpMap = clonedBumpMap;

        // set the cloned specular map to the cloned material
        clonedMaterial.specularMap = clonedSpecularMap;

        return clonedMaterial;
    }

    /**
     * Receive a primitive node and return a box objective
     * @param {*} primitive node
     * @param {*} material material object
     * @returns build a box object
     */
    buildBox(primitive, material) {
        // clone material to avoid sharing the same material between objects
        var clonedMaterial = material.clone();

        // retrieve representations array 
        var representations = primitive.representations[0];

        // Two 3D points
        var xyz1 = representations.xyz1;
        var xyz2 = representations.xyz2;

        // Calculate dimensions
        var width = Math.abs(xyz2[0] - xyz1[0]);
        var height = Math.abs(xyz2[1] - xyz1[1]);
        var depth = Math.abs(xyz2[2] - xyz1[2]);

        // Calculate center position
        var centerX = (xyz1[0] + xyz2[0]) / 2;
        var centerY = (xyz1[1] + xyz2[1]) / 2;
        var centerZ = (xyz1[2] + xyz2[2]) / 2;

        // Create box geometry
        const geometry = new THREE.BoxGeometry(width, height, depth);

        // Modify UVs to apply texlength
        const uvs = geometry.attributes.uv.array;

        // texlength values
        const texlength_s = material.texlength_s;  // Horizontal scale
        const texlength_t = material.texlength_t;  // Vertical scale

        const repeatWidthHeight = [width / texlength_s, height / texlength_t];
        const repeatHeightDepth = [depth / texlength_s, height / texlength_t];
        const repeatWidthDepth = [width / texlength_s, depth / texlength_t];

        // Adjust UVs by texlength values
        for (var i = 0; i < uvs.length; i += 8) {
            const faceIndex = Math.floor(i / 8);

            var repeat = [1,1];
            if (faceIndex == 0 || faceIndex == 1) { // Front and back faces
                repeat = repeatWidthHeight;
            } else if (faceIndex == 2 || faceIndex == 3) { // Top and bottom faces
                repeat = repeatWidthDepth;
            } else if (faceIndex == 4 || faceIndex == 5) { // Left and right faces
                repeat = repeatHeightDepth;
            }

            for(var j = 0; j < 8; j += 2) {
                uvs[i + j] *= repeat[0]; // Scale the S (horizontal) coordinate
                uvs[i + j + 1] *= repeat[1]; // Scale the T (vertical) coordinate
            }
        }

        // Set texture repeat values
        clonedMaterial = this.setTextureValues(clonedMaterial, material, 1 / texlength_s, 1 / texlength_t);

        // Create mesh
        var primitiveObj = new THREE.Mesh(geometry, clonedMaterial);

        // Position the mesh at the center
        primitiveObj.position.set(centerX, centerY, centerZ);

        return primitiveObj;
    }

    buildSphere(primitive, material) {
        // clone material to avoid sharing the same material between objects
        var clonedMaterial = material.clone();

        // retrieve representations array
        var representations = primitive.representations[0];
        
        // Convert floats to angles
        const phistart = THREE.MathUtils.degToRad(representations.phistart);
        const philength = THREE.MathUtils.degToRad(representations.philength);
        const thetastart = THREE.MathUtils.degToRad(representations.thetastart);
        const thetalength = THREE.MathUtils.degToRad(representations.thetalength);

        var geometry = new THREE.SphereGeometry(
            representations.radius,
            representations.slices,
            representations.stacks,
            phistart,
            philength,
            thetastart,
            thetalength);

        // Set texture repeat values (1 / x to adjust to uvs)
        clonedMaterial = this.setTextureValues(clonedMaterial, material, material.texlength_s, material.texlength_t);

        // Create mesh
        return new THREE.Mesh(geometry, clonedMaterial);
    }

    buildCylinder(primitive, material) {
        // Clone the material to avoid sharing it
        var clonedMaterial = material.clone();

        // Retrieve representations array
        var representations = primitive.representations[0];

        // Convert floats to angles
        const thetastart = THREE.MathUtils.degToRad(representations.thetastart);
        const thetalength = THREE.MathUtils.degToRad(representations.thetalength);

        // caps close means we want the cylinder to be closed, but the cylinder geometry has a parameter called openEnded, which is the inverse of caps close
        var geometry = new THREE.CylinderGeometry(
            representations.top,
            representations.base,
            representations.height,
            representations.slices,
            representations.stacks,
            !representations.capsclose,
            thetastart,
            thetalength
        );

        // Apply texlength scaling to the UV coordinates
        const uvAttribute = geometry.attributes.uv;
        const positionAttribute = geometry.attributes.position;

        const radialSegments = geometry.parameters.radialSegments;
        const heightSegments = geometry.parameters.heightSegments;
        const openEnded = geometry.parameters.openEnded;

        // texlength values
        const texlength_s = material.texlength_s;  // Horizontal scale
        const texlength_t = material.texlength_t;  // Vertical scale

        // Number of vertices for the side faces
        const sideVertices = (radialSegments + 1) * (heightSegments + 1);

        for (let i = 0; i < sideVertices; i++) {
            const x = positionAttribute.getX(i);
            const y = positionAttribute.getY(i);
            const z = positionAttribute.getZ(i);

            // Calculate the angle theta for u coordinate
            let theta = Math.atan2(z, x);
            if (theta < 0) theta += Math.PI * 2;

            const u = (theta - (thetastart || 0)) / (thetalength || (Math.PI * 2));
            const radius = Math.sqrt(x * x + z * z);
            const circumference = 2 * Math.PI * radius * ((thetalength || (Math.PI * 2)) / (Math.PI * 2));
            const uScale = circumference / texlength_s;

            const v = (y + representations.height / 2) / representations.height;
            const vScale = representations.height / texlength_t;

            // Set the new UVs
            uvAttribute.setX(i, u * uScale);
            uvAttribute.setY(i, v * vScale);
        }

        // Adjust UV mapping for caps if the cylinder is not open-ended
        if (!openEnded) {
            // Number of vertices per cap
            const capVertices = (radialSegments + 1);

            // Start index for the top cap vertices
            let index = sideVertices;

            // Adjust UVs for the top cap
            for (let i = 0; i < capVertices; i++, index++) {
                const x = positionAttribute.getX(index);
                const z = positionAttribute.getZ(index);

                const u = (x / (representations.top * 2)) + 0.5;
                const v = (z / (representations.top * 2)) + 0.5;

                const uScale = (representations.top * 2) / texlength_s;
                const vScale = (representations.top * 2) / texlength_t;

                uvAttribute.setX(index, u * uScale);
                uvAttribute.setY(index, v * vScale);
            }

            // Adjust UVs for the bottom cap
            for (let i = 0; i < capVertices; i++, index++) {
                const x = positionAttribute.getX(index);
                const z = positionAttribute.getZ(index);

                const u = (x / (representations.base * 2)) + 0.5;
                const v = (z / (representations.base * 2)) + 0.5;

                const uScale = (representations.base * 2) / texlength_s;
                const vScale = (representations.base * 2) / texlength_t;

                uvAttribute.setX(index, u * uScale);
                uvAttribute.setY(index, v * vScale);
            }
        }

        // Set texture repeat values (1 / x to adjust to uvs)
        clonedMaterial = this.setTextureValues(clonedMaterial, material, 1 / texlength_s, 1 / texlength_t);

        var cylinder = new THREE.Mesh(geometry, clonedMaterial);

        return cylinder;
    }

    buildTriangle(primitive, material) {
        // Clone the material to avoid sharing it between objects
        var clonedMaterial = material.clone();

        // Retrieve representations array
        var representations = primitive.representations[0];

        // triangle vertices
        var xyz1 = representations.xyz1;
        var xyz2 = representations.xyz2;
        var xyz3 = representations.xyz3;

        // Buffer Geometry will allow us to define the vertices of the triangle
        var geometry = new THREE.BufferGeometry();

        // Define the vertices of the triangle
        var vertices = new Float32Array([
            xyz1[0], xyz1[1], xyz1[2],
            xyz2[0], xyz2[1], xyz2[2],
            xyz3[0], xyz3[1], xyz3[2]
        ]);

        // Set the vertices of the triangle
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // Define the indices of the triangle
        geometry.setIndex([0, 1, 2]);

        // Compute the normals of the triangle
        geometry.computeVertexNormals();

        // Triangle vertices (xyz1, xyz2, xyz3) are already defined
        const v1 = new THREE.Vector3(xyz1[0], xyz1[1], xyz1[2]);
        const v2 = new THREE.Vector3(xyz2[0], xyz2[1], xyz2[2]);
        const v3 = new THREE.Vector3(xyz3[0], xyz3[1], xyz3[2]);

        // Calculate the base length 'b' (distance between v1 and v2)
        const b = v2.distanceTo(v1);

        // Calculate the angle α between the two sides using dot product and magnitude
        const edge1 = new THREE.Vector3().subVectors(v2, v1);  // Vector from v1 to v2
        const edge2 = new THREE.Vector3().subVectors(v3, v1);  // Vector from v1 to v3

        const cosAlpha = edge1.dot(edge2) / (edge1.length() * edge2.length());
        const alpha = Math.acos(cosAlpha);

        var texlength_s = material.texlength_s;  // Scaling factor for S (horizontal)
        var texlength_t = material.texlength_t;  // Scaling factor for T (vertical)

        // UV coordinates for each vertex
        const uvs = new Float32Array(6);  // 3 vertices, 2 UV coordinates per vertex

        // Vertex 1 (0, 0)
        uvs[0] = 0;  // s1
        uvs[1] = 0;  // t1

        // Vertex 2 (v2 - v1) / texlength_s, 0
        uvs[2] = (v2.distanceTo(v1)) / texlength_s;  // s2
        uvs[3] = 0;  // t2

        // Vertex 3 (b * cos(α)) / texlength_s, (b * sin(α)) / texlength_t
        uvs[4] = (b * Math.cos(alpha)) / texlength_s;  // s3
        uvs[5] = (b * Math.sin(alpha)) / texlength_t;  // t3

        // Set the UVs for the geometry
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        // Set texture repeat values (1 / x to adjust to uvs)
        clonedMaterial = this.setTextureValues(clonedMaterial, material, 1 / texlength_s, 1 / texlength_t);

        return new THREE.Mesh(geometry, clonedMaterial);
    }

    buildRectangle(primitive, material) {
        // Clone the material to avoid sharing it between objects
        var clonedMaterial = material.clone();

        // Retrieve representations array
        var representations = primitive.representations[0];

        // Calculate width and height
        var width = representations.xy2[0] - representations.xy1[0];
        var height = representations.xy2[1] - representations.xy1[1];

        // Create plane geometry
        var geometry = new THREE.PlaneGeometry(width, height, primitive.parts_x, primitive.parts_y);

        // Calculate texlength
        var texlength_s = width / material.texlength_s;
        var texlength_t = height / material.texlength_t;

        // Set texture repeat values (1 / X is not used because UVs are already correctly set)
        clonedMaterial = this.setTextureValues(clonedMaterial, material, texlength_s, texlength_t);

        var rectangle = new THREE.Mesh(geometry, clonedMaterial);

        // Calculate the center position
        const centerX = (representations.xy1[0] + representations.xy2[0]) / 2;
        const centerY = (representations.xy1[1] + representations.xy2[1]) / 2;

        // Position the rectangle to the calculated center
        rectangle.position.set(centerX, centerY, 0); // Assuming Z remains 0

        return rectangle;
    }

    buildCircle(primitive, material) {
        // Clone the material to avoid sharing it between objects
        var clonedMaterial = material.clone();

        // Retrieve representations array
        var representations = primitive.representations[0];

        // Convert floats to angles
        const thetastart = THREE.MathUtils.degToRad(representations.thetastart);
        const thetalength = THREE.MathUtils.degToRad(representations.thetalength);

        var geometry = new THREE.CircleGeometry(
            representations.radius,
            representations.segments,
            thetastart,
            thetalength
        );

        // Apply texlength scaling to the UV coordinates
        const uvAttribute = geometry.attributes.uv;

        // texlength values
        const texlength_s = material.texlength_s; // Horizontal scale
        const texlength_t = material.texlength_t; // Vertical scale

        for (let i = 0; i < uvAttribute.count; i++) {
            const u = uvAttribute.getX(i);
            const v = uvAttribute.getY(i);

            // Scale the UVs
            uvAttribute.setX(i, u / texlength_s);
            uvAttribute.setY(i, v / texlength_t);
        }

        // Set texture repeat values
        clonedMaterial = this.setTextureValues(clonedMaterial, material, 1 / texlength_s, 1 / texlength_t);

        var circle = new THREE.Mesh(geometry, clonedMaterial);

        return circle;
    }

    buildLathe(primitive, material) {
        // Clone the material to avoid sharing it between objects
        var clonedMaterial = material.clone();

        // Retrieve representations array
        var representations = primitive.representations[0];

        // Convert floats to angles
        const phistart = THREE.MathUtils.degToRad(representations.phistart);
        const philength = THREE.MathUtils.degToRad(representations.philength);

        const points = [];
        for ( let i = 0; i < 10; ++ i ) {
            points.push(new THREE.Vector2(Math.sin(i * 0.2) * 3 + 3, (i - 5) * 0.8));
        }

        var geometry = new THREE.LatheGeometry(
            points,
            representations.segments,
            phistart,
            philength
        );

        // Apply texlength scaling to the UV coordinates
        const uvAttribute = geometry.attributes.uv;
        const positionAttribute = geometry.attributes.position;

        const segments = geometry.parameters.segments;
        const heightSegments = geometry.parameters.heightSegments;

        // texlength values
        const texlength_s = material.texlength_s;  // Horizontal scale
        const texlength_t = material.texlength_t;  // Vertical scale

        // Adjust UVs based on texture scaling
        for (let i = 0; i < uvAttribute.count; i++) {
            const u = uvAttribute.getX(i);
            const v = uvAttribute.getY(i);

            const newU = u / texlength_s;
            const newV = v / texlength_t;

            uvAttribute.setX(i, newU);
            uvAttribute.setY(i, newV);
        }

        // Set texture repeat values (1 / x to adjust to uvs)
        clonedMaterial = this.setTextureValues(clonedMaterial, material, 1 / texlength_s, 1 / texlength_t);

        return new THREE.Mesh(geometry, clonedMaterial);
    }

    buildTorus(primitive, material) {
        // Clone the material to avoid sharing it
        var clonedMaterial = material.clone();
    
        // Retrieve representations array
        var representations = primitive.representations[0];
    
        // Create the torus geometry
        var geometry = new THREE.TorusGeometry(
            representations.radius,
            representations.tube,
            representations.radialsegments,
            representations.tubularsegments
        );
    
        // Apply texlength scaling to the UV coordinates
        const uvAttribute = geometry.attributes.uv;
    
        // texlength values
        const texlength_s = material.texlength_s; // Horizontal scale
        const texlength_t = material.texlength_t; // Vertical scale
    
        // Adjust UVs based on texture scaling
        for (let i = 0; i < uvAttribute.count; i++) {
            const u = uvAttribute.getX(i);
            const v = uvAttribute.getY(i);
    
            const newU = u / texlength_s;
            const newV = v / texlength_t;
    
            uvAttribute.setX(i, newU);
            uvAttribute.setY(i, newV);
        }
    
        // Set texture repeat values (1 / x to adjust to UVs)
        clonedMaterial = this.setTextureValues(clonedMaterial, material, 1 / texlength_s, 1 / texlength_t);
    
        return new THREE.Mesh(geometry, clonedMaterial);
    }

    buildCoil(primitive, material) {
        // Clone the material to avoid sharing it
        var clonedMaterial = material.clone();
    
        // Retrieve representations array
        var representations = primitive.representations[0];

        // Define the control points for the spiral
        const points = [];
        const numPoints = 100;

        // Create the points for the spiral using an helical shape
        for (let i = 0; i < numPoints; i++) {
            const angle = i * (representations.turns * 2 * Math.PI) / numPoints;
            const x = representations.radius * Math.cos(angle);
            const y = (i / numPoints) * representations.height;
            const z = representations.radius * Math.sin(angle);
            points.push(new THREE.Vector3(x, y, z));
        }

        // Create a CatmullRom curve from the points
        const path = new THREE.CatmullRomCurve3(points);

        // Create a tube from the curve
        const geometry = new THREE.TubeGeometry(
            path,
            representations.tubularsegments,
            representations.tuberadius,
            representations.radialregments,
            representations.closed
        );
        geometry.scale(0.5, 0.5, 0.5);

        // Apply texlength scaling to the UV coordinates
        const uvAttribute = geometry.attributes.uv;

        // texlength values
        const texlength_s = material.texlength_s; // Horizontal scale
        const texlength_t = material.texlength_t; // Vertical scale

        // Adjust UVs based on texture scaling
        for (let i = 0; i < uvAttribute.count; i++) {
            const u = uvAttribute.getX(i);
            const v = uvAttribute.getY(i);
    
            const newU = u / texlength_s;
            const newV = v / texlength_t;
    
            uvAttribute.setX(i, newU);
            uvAttribute.setY(i, newV);
        }
    
        // Set texture repeat values (1 / x to adjust to UVs)
        clonedMaterial = this.setTextureValues(clonedMaterial, material, 1 / texlength_s, 1 / texlength_t);
    
        return new THREE.Mesh(geometry, clonedMaterial);
    }

    buildNurbs(primitive, material) {
        // Clone the material to avoid sharing it between objects
        var clonedMaterial = material.clone();

        // Retrieve representations array
        var representations = primitive.representations[0];

        console.log(representations);

        // load the representation variables
        var controlpoints = representations.controlpoints;
        var degree_u = representations.degree_u;
        var degree_v = representations.degree_v;
        var parts_u = representations.parts_u;
        var parts_v = representations.parts_v;

        // degree_u and degree_v are the degrees, but the array of points is an array of dimensions array[degree_u + 1][degree_u + 1]
        var order_u = degree_u + 1
        var order_v = degree_v + 1

        var newControlPoints = [];

        // the control points array will have order_u elements, each one with order_v points
        for (var i = 0; i < order_u; i++) {
            // create the i array of points
            newControlPoints[i] = [];
            for (var j = 0; j < order_v; j++) {
                // push the point to the array
                newControlPoints[i][j] = controlpoints[j].position;
            }

            // remove the first order_v elements from beggining of control points to add the next order_v elements in next iteration
            controlpoints = controlpoints.slice(order_v);
        }

        // create the nurbs geometry
        var nurbSurface = this.nurbsBuilder.build(newControlPoints,
            degree_u,
            degree_v,
            parts_u,
            parts_v, clonedMaterial);

        // Now, apply texture mapping (UVs)
        var uvs = nurbSurface.attributes.uv.array;

        // texlength values (scale for horizontal and vertical)
        var texlength_s = material.texlength_s;  // Horizontal scaling factor
        var texlength_t = material.texlength_t;  // Vertical scaling factor

        // Adjust UVs based on texlength
        for (var i = 0; i < uvs.length; i += 2) {
            uvs[i] /= texlength_s;   // Scale the S (horizontal) coordinate
            uvs[i + 1] /= texlength_t;  // Scale the T (vertical) coordinate
        }

        // Set texture repeat values (1 / x to adjust to uvs)
        clonedMaterial = this.setTextureValues(clonedMaterial, material, 1 / texlength_s, 1 / texlength_t);

        // create the mesh
        return new THREE.Mesh(nurbSurface, clonedMaterial);
    }

    buildPolygon(primitive, material) {
        // Clone the material to avoid sharing it between objects
        var clonedMaterial = material.clone();

        // Retrieve representations array
        var representations = primitive.representations[0];

        var color_c = this.convertColor(representations.color_c)  // Center color
        var color_p = this.convertColor(representations.color_p)  // Perimeter color

        var radius = representations.radius;  // Radius of the polygon
        var slices = representations.slices;  // Number of slices (angular divisions)
        var stacks = representations.stacks;  // Number of stacks (layers)
        
        // Create an array of vertices, faces, and colors
        var vertices = [];
        var indices = [];
        var colors = [];

        // Add the center vertex
        vertices.push(0, 0, 0);

        // Add the center color
        colors.push(color_c.r, color_c.g, color_c.b);

        // Loop through stacks
        for (var stack = 1; stack <= stacks; stack++) {
            // Calculate the current radius and angle increment for the current stack
            var currentRadius = radius * (stack / stacks);
            var angleIncrement = (2 * Math.PI) / slices;

            // Loop through slices
            for (var slice = 0; slice < slices; slice++) {
                // Calculate the angle for the current slice
                var angle = slice * angleIncrement;
                // Calculate the x, y, and z coordinates for the current vertex
                var x = currentRadius * Math.cos(angle);
                var y = currentRadius * Math.sin(angle);
                var z = 0;

                // Add the vertex to the array
                vertices.push(x, y, z);

                // Calculate the interpolated color for the current stack
                var interpolationFactor = stack / stacks;
                var color = color_c.clone().lerp(color_p, interpolationFactor);
                colors.push(color.r, color.g, color.b);
            }
        }

        // Create faces (with correct wrapping of slices)
        for (var stack = 1; stack < stacks; stack++) {
            for (var slice = 0; slice < slices; slice++) {
                // Calculate the indices for the current and next vertices
                var currentIndex = stack * slices + slice + 1;
                var nextIndex = stack * slices + (slice + 1) % slices + 1;
                var currentIndexBelow = (stack - 1) * slices + slice + 1;
                var nextIndexBelow = (stack - 1) * slices + (slice + 1) % slices + 1;

                // Add the indices for the current and next faces
                indices.push(currentIndexBelow, currentIndex, nextIndex);
                indices.push(currentIndexBelow, nextIndex, nextIndexBelow);
            }
        }

        // Faces for the base (stack 1)
        for (var slice = 0; slice < slices; slice++) {
            // Calculate the indices for the current and next vertices
            var currentIndex = slice + 1;
            var nextIndex = (slice + 1) % slices + 1;

            // Add the indices for the current and next faces
            indices.push(0, currentIndex, nextIndex);
        }

        // Create BufferGeometry
        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3)); // Set vertices
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3)); // Set colors for each vertex
        geometry.setIndex(indices); // Set indices for the faces

        // Compute normals
        geometry.computeVertexNormals();

        // Set texture repeat values
        clonedMaterial = this.setTextureValues(clonedMaterial, material, material.texlength_s, material.texlength_t);
        clonedMaterial.vertexColors = true; // Enable vertex colors

        // Return the mesh with the polygon geometry and material
        return new THREE.Mesh(geometry, clonedMaterial);
    }
}

export { MyPrimitiveBuilder };