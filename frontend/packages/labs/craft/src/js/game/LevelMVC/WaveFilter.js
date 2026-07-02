import Phaser from 'phaser';

/**
 * Underwater wave/caustics filter, ported from the CE `Phaser.Filter` the
 * aquatic craft levels applied to `game.world`. In Phaser 4 a full-screen
 * scene shader is a camera Filter: a render-node subclass carrying the GLSL
 * plus a Controller holding the per-frame uniforms.
 *
 * The fragment shader is the CE source adapted to the v4 filter contract:
 * the scene arrives as `uMainSampler` sampled via `boundedSampler` (edge
 * clamp), the varying is `outTexCoord`, and the caustics atlas is bound as a
 * second sampler (`surface`). The math is otherwise unchanged: a sinusoidal
 * vertical wave on the base sample, an overlay-blended scrolling caustics
 * layer, and a mix toward the ocean tint.
 */
const WAVE_FRAG = `
#pragma phaserTemplate(shaderName)

precision mediump float;

uniform sampler2D uMainSampler;
uniform sampler2D surface;
uniform float time;
uniform float x;
uniform float y;
uniform vec4 tint;

varying vec2 outTexCoord;

#pragma phaserTemplate(fragmentHeader)

float overlay(float source, float dest) {
  return dest > 0.5 ? (2.0 * dest * source) : (1.0 - 2.0 * (1.0 - dest) * (1.0 - source));
}

vec4 overlay(vec4 source, vec4 dest) {
  return vec4(overlay(source.r, dest.r), overlay(source.g, dest.g), overlay(source.b, dest.b), 1.0);
}

void main(void) {
  vec2 relativeCoord = outTexCoord + vec2(x * 0.9, -y * 0.9);
  float offsetA = sin(relativeCoord.y * 31.0 + time / 18.0) * 0.0014;
  float offsetB = sin(relativeCoord.y * 57.0 + time / 18.0) * 0.0007;
  // Clamp the wave-displaced sample into the frame. Without this the offset
  // pushes the top/bottom rows past [0,1], where boundedSampler returns
  // transparent (black) — a bar that pulses with the wave. CE's render
  // texture wrapped clamp-to-edge, so match that by clamping the coordinate.
  vec2 baseCoord = vec2(outTexCoord.x, clamp(outTexCoord.y + offsetA + offsetB, 0.0, 1.0));
  vec4 base = boundedSampler(uMainSampler, baseCoord);
  float frame = mod(floor(time / 5.0), 31.0);
  vec4 surfaceColor = texture2D(
    surface,
    vec2(mod(relativeCoord.x * 2.0, 1.0),
    mod((-relativeCoord.y * 2.0 + frame) / 32.0, 1.0))
  );
  gl_FragColor = mix(mix(overlay(base, surfaceColor), base, 0.5), tint, 0.3);
}
`;

const NODE_NAME = 'CraftWaveFilter';

const WaveFilterRenderNode = new Phaser.Class({
  Extends: Phaser.Renderer.WebGL.RenderNodes.BaseFilterShader,

  initialize: function WaveFilterRenderNode(manager) {
    Phaser.Renderer.WebGL.RenderNodes.BaseFilterShader.call(
      this,
      NODE_NAME,
      manager,
      null,
      WAVE_FRAG,
    );
  },

  setupTextures: function (controller, textures) {
    // texture unit 0 is the scene (uMainSampler); 1 is the caustics surface.
    textures[1] = controller.surfaceGlTexture;
  },

  setupUniforms: function (controller) {
    const programManager = this.programManager;
    programManager.setUniform('surface', 1);
    programManager.setUniform('time', controller.time);
    programManager.setUniform('x', controller.x);
    programManager.setUniform('y', controller.y);
    programManager.setUniform('tint', controller.tint);
  },
});

const WaveFilterController = new Phaser.Class({
  Extends: Phaser.Filters.Controller,

  initialize: function WaveFilterController(camera) {
    Phaser.Filters.Controller.call(this, camera, NODE_NAME);
    this.time = 0;
    this.x = 0;
    this.y = 0;
    // Default warm-ocean tint (cold oceans override via setTint).
    this.tint = [67 / 255, 213 / 255, 238 / 255, 1];
    this.surfaceGlTexture = null;
  },

  setSurfaceTexture: function (texture) {
    this.surfaceGlTexture = texture && texture.source && texture.source[0]
      ? texture.source[0].glTexture
      : null;
  },

  setTint: function (rgba) {
    this.tint = rgba;
  },
});

/**
 * Register the render node once per renderer, attach a fresh controller to the
 * given camera's internal filter list, and return the controller so the caller
 * can feed it per-frame uniforms and the caustics texture.
 */
export function attachWaveFilter(camera) {
  const renderer = camera.scene.sys.renderer;
  const nodes = renderer && renderer.renderNodes;
  if (!nodes) {
    // Canvas fallback / headless: no WebGL filter available.
    return null;
  }
  if (!nodes.hasNode(NODE_NAME)) {
    nodes.addNodeConstructor(NODE_NAME, WaveFilterRenderNode);
  }
  const controller = new WaveFilterController(camera);
  camera.filters.internal.add(controller);
  return controller;
}
