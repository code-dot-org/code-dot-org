import {
  UNIFORM_EFFECT_TIME,
  UNIFORM_MAIN_SAMPLER,
  UNIFORM_RESOLUTION,
  UNIFORM_TIME,
  VARYING_TEX_COORD,
} from '../glsl/symbols';
import {translate} from '../localization';
import type {EffectLiteral, EffectValueType} from '../model/types';

/**
 * A minimal WebGL renderer for compiled effects.
 *
 * The editor previews shaders without booting Phaser: the input row, the
 * output row, and every "eye" thumbnail are separate canvases, and standing up
 * a game instance per thumbnail would be absurd. What this must guarantee is
 * that a shader looking right here looks right in the game, which it does by
 * declaring the same uniforms and varyings Phaser's filter pipeline does.
 */

/** Draws a full-screen quad and hands the fragment shader its UV. */
const VERTEX_SHADER = [
  '#version 100',
  'attribute vec2 aPosition;',
  `varying vec2 ${VARYING_TEX_COORD};`,
  'void main ()',
  '{',
  `    ${VARYING_TEX_COORD} = aPosition * 0.5 + 0.5;`,
  '    gl_Position = vec4(aPosition, 0.0, 1.0);',
  '}',
  '',
].join('\n');

/** Two triangles covering clip space. */
const QUAD = new Float32Array([-1, -1, 3, -1, -1, 3]);

export interface ShaderPreviewParameterValue {
  /** GLSL type of the uniform — `bool` and `int` knobs arrive as floats. */
  type: EffectValueType;
  value: EffectLiteral;
}

/** Raised when the driver rejects a shader, carrying the driver's own log. */
export class ShaderCompileError extends Error {
  log: string;
  source: string;

  constructor(message: string, log: string, source: string) {
    super(message);
    this.name = 'ShaderCompileError';
    this.log = log;
    this.source = source;
  }
}

export class ShaderPreview {
  private readonly gl: WebGLRenderingContext;
  private readonly quadBuffer: WebGLBuffer;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;
  private uniformCache = new Map<string, WebGLUniformLocation | null>();
  private disposed = false;

  constructor(canvas: HTMLCanvasElement) {
    // Graph shaders write *straight* (non-premultiplied) alpha — a learner's
    // `vec4(color, 0.5)` means 50%-transparent color. The context has to say
    // so: with the default `premultipliedAlpha: true` the compositor treats
    // RGB as already scaled by alpha, so any translucent pixel with RGB > 0
    // composites additively over the page and an animated effect appears to
    // pile frame on frame until the preview saturates to white.
    const gl = canvas.getContext('webgl', {
      premultipliedAlpha: false,
      antialias: false,
    });
    if (!gl) {
      throw new Error(
        translate('This browser cannot show effect previews (no WebGL).'),
      );
    }
    this.gl = gl;

    const buffer = gl.createBuffer();
    if (!buffer) {
      throw new Error(translate('Could not allocate the preview geometry.'));
    }
    this.quadBuffer = buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);
  }

  /**
   * Swap in a new fragment shader. Throws `ShaderCompileError` on a bad shader
   * and leaves the previous program in place, so a preview keeps showing the
   * last good frame while the learner is mid-edit.
   */
  setFragmentShader(source: string): void {
    const {gl} = this;
    const program = this.linkProgram(source);

    if (this.program) {
      gl.deleteProgram(this.program);
    }
    this.program = program;
    this.uniformCache.clear();
  }

  /** Set the texture the effect reads through `uMainSampler`. */
  setTexture(source: TexImageSource): void {
    const {gl} = this;

    if (!this.texture) {
      this.texture = gl.createTexture();
    }
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    // Non-power-of-two textures require clamped, non-mipmapped sampling in
    // WebGL 1, and test textures are arbitrary sizes.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  /**
   * Draw one frame.
   *
   * @param time Engine clock in seconds.
   * @param effectTime Seconds since the effect started.
   * @param parameters Values by uniform name, as reported by `compileEffect`.
   */
  render(
    time: number,
    effectTime: number,
    parameters: ReadonlyMap<string, ShaderPreviewParameterValue> = new Map(),
  ): void {
    const {gl} = this;
    if (this.disposed || !this.program) {
      return;
    }

    const canvas = gl.canvas as HTMLCanvasElement;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);

    const position = gl.getAttribLocation(this.program, 'aPosition');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    this.setInt(UNIFORM_MAIN_SAMPLER, 0);

    this.setFloat(UNIFORM_TIME, time);
    this.setFloat(UNIFORM_EFFECT_TIME, effectTime);
    this.setVec2(UNIFORM_RESOLUTION, canvas.width, canvas.height);

    for (const [name, parameter] of parameters) {
      this.setParameter(name, parameter);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /**
   * The frame currently in the drawing buffer, as a PNG data URL.
   *
   * Read with `readPixels` rather than `canvas.toDataURL`, and that is not a
   * preference: the context is created without `preserveDrawingBuffer`, so by
   * the time the canvas could be asked the buffer has been presented and
   * cleared, and `toDataURL` hands back a blank square. `readPixels` must
   * therefore run in the same task as the `render` it captures.
   *
   * GL reports rows bottom-up, so they are flipped on the way into the 2D
   * canvas that encodes them.
   */
  snapshot(): string | null {
    const flat = document.createElement('canvas');
    return this.snapshotInto(flat) ? flat.toDataURL() : null;
  }

  /**
   * The same frame, drawn straight into a 2D canvas.
   *
   * For a caller that will SHOW it rather than store it. A data URL has to be
   * encoded and then decoded again, and the decode is asynchronous — so
   * swapping one in as a canvas is taken away is a race the caller can narrow
   * but not win. Putting the pixels into a canvas already on screen is
   * synchronous, and there is no frame in between to get wrong.
   *
   * `target` is resized to match. Returns false when there is nothing to read.
   */
  snapshotInto(target: HTMLCanvasElement): boolean {
    const {gl} = this;
    if (this.disposed || !this.program) {
      return false;
    }
    const canvas = gl.canvas as HTMLCanvasElement;
    const {width, height} = canvas;
    const pixels = new Uint8ClampedArray(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    target.width = width;
    target.height = height;
    const context = target.getContext('2d');
    if (!context) {
      return false;
    }
    // GL reports rows bottom-up; flip them on the way in.
    const image = context.createImageData(width, height);
    const stride = width * 4;
    for (let row = 0; row < height; row += 1) {
      const from = (height - row - 1) * stride;
      image.data.set(pixels.subarray(from, from + stride), row * stride);
    }
    context.putImageData(image, 0, 0);
    return true;
  }

  dispose(): void {
    const {gl} = this;
    if (this.disposed) {
      return;
    }
    this.disposed = true;

    if (this.program) {
      gl.deleteProgram(this.program);
      this.program = null;
    }
    if (this.texture) {
      gl.deleteTexture(this.texture);
      this.texture = null;
    }
    gl.deleteBuffer(this.quadBuffer);
    this.uniformCache.clear();

    // Hand the CONTEXT back, not just the objects in it. A browser keeps a
    // small pool — around 8 to 16 — and drops the oldest to serve a new one, so
    // a caller that makes and disposes previews in a loop (a picker following
    // the pointer down a list) would blank the ones it made earlier. Deleting
    // the buffers does not release the context; only this does.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }

  // --- internals ---

  private setParameter(
    name: string,
    {type, value}: ShaderPreviewParameterValue,
  ): void {
    const components = typeof value === 'number' ? [value] : value;
    const location = this.locate(name);
    if (!location) {
      // Unused uniforms are stripped by the driver; nothing to set.
      return;
    }

    const {gl} = this;
    switch (type) {
      case 'float':
        gl.uniform1f(location, components[0] ?? 0);
        break;
      case 'vec2':
        gl.uniform2f(location, components[0] ?? 0, components[1] ?? 0);
        break;
      case 'vec3':
        gl.uniform3f(
          location,
          components[0] ?? 0,
          components[1] ?? 0,
          components[2] ?? 0,
        );
        break;
      case 'vec4':
        gl.uniform4f(
          location,
          components[0] ?? 0,
          components[1] ?? 0,
          components[2] ?? 0,
          components[3] ?? 0,
        );
        break;
    }
  }

  private locate(name: string): WebGLUniformLocation | null {
    if (!this.uniformCache.has(name)) {
      this.uniformCache.set(
        name,
        this.program ? this.gl.getUniformLocation(this.program, name) : null,
      );
    }
    return this.uniformCache.get(name) ?? null;
  }

  private setFloat(name: string, value: number): void {
    const location = this.locate(name);
    if (location) {
      this.gl.uniform1f(location, value);
    }
  }

  private setVec2(name: string, x: number, y: number): void {
    const location = this.locate(name);
    if (location) {
      this.gl.uniform2f(location, x, y);
    }
  }

  private setInt(name: string, value: number): void {
    const location = this.locate(name);
    if (location) {
      this.gl.uniform1i(location, value);
    }
  }

  private linkProgram(fragmentSource: string): WebGLProgram {
    const {gl} = this;
    const vertex = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      throw new Error(
        translate('Could not create the preview shader program.'),
      );
    }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    // Shaders are reference-counted by the program once attached.
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program) ?? '';
      gl.deleteProgram(program);
      throw new ShaderCompileError(
        translate('The effect could not be linked.'),
        log,
        fragmentSource,
      );
    }

    return program;
  }

  private compileShader(kind: number, source: string): WebGLShader {
    const {gl} = this;
    const shader = gl.createShader(kind);
    if (!shader) {
      throw new Error(translate('Could not create a preview shader.'));
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader) ?? '';
      gl.deleteShader(shader);
      throw new ShaderCompileError(
        translate('The effect could not be compiled.'),
        log,
        source,
      );
    }

    return shader;
  }
}
