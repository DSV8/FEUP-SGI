varying vec2 vUv;

varying vec3 vNormal;

uniform float normScale;
uniform float normalizationFactor;
uniform float displacement;

uniform float timeFactor;
uniform float pulseScale;

void main() {
    vNormal = normal;
	vUv = uv;

    vec3 scaledPosition = position * (1.0 + sin(timeFactor * 2.0) * pulseScale);

	vec4 modelViewPosition = modelViewMatrix * vec4(scaledPosition + normal * normalizationFactor * (displacement + normScale) , 1.0);
    
    gl_Position = projectionMatrix * modelViewPosition;
}