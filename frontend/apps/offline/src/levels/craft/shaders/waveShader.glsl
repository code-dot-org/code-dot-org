precision mediump float;

uniform float iTime;

uniform sampler2D uSampler;
uniform sampler2D underwaterOverlay;
uniform vec4 tint;

varying vec2 outTexCoord;

float overlay2(float source, float dest) {
    return dest > 0.5 ? (2.0 * dest * source) : (1.0 - 2.0 * (1.0 - dest) * (1.0 - source));
}

vec4 overlay(vec4 source, vec4 dest) {
    return vec4(overlay2(source.r, dest.r), overlay2(source.g, dest.g), overlay2(source.b, dest.b), 1.0);
}

void main(void) {
  // Get the distorted game image
  float offsetA = sin(outTexCoord.y * 31.0 + iTime / 400.0) * 0.0014;
  float offsetB = sin(outTexCoord.y * 57.0 + iTime / 400.0) * 0.0007;
  vec4 base = texture2D(uSampler, outTexCoord + vec2(0.0, offsetA + offsetB));

  // Get the bump map from the overlay texture for the given frame
  // There are 32 frames stacked vertically in the overlay texture
  float frame = mod(floor(iTime / 100.0), 31.0);
  vec2 overlayCoord = vec2(outTexCoord.x, mix(frame / 32.0, (frame + 1.0) / 32.0, outTexCoord.y));
  vec4 surface = texture2D(underwaterOverlay, overlayCoord);

  gl_FragColor = mix(
    // Mix the real level with the water texture overlay
    mix(
      overlay(base, surface),
      base,
      0.5
    ),
    // Add requested color tinting
    tint,
    0.3
  );
}
