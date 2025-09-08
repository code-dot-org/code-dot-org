// DanceRendererLottie.js
import lottie from 'lottie-web';

const DEFAULT_LAYOUT = {
  mode: 'fit',
  scale: 1,
  align: {x: 'center', y: 'center'},
  offset: {x: 0, y: 0},
  clearBeforeDraw: true,
};

function alignOffset(axisSize, destSize, where) {
  if (where === 'start') return 0;
  if (where === 'end') return axisSize - destSize;
  return (axisSize - destSize) / 2; // center
}

export default class DanceRendererLottie {
  constructor() {
    /** @type {CanvasRenderingContext2D|null} */
    this.targetCtx = null;
    /** @type {import('lottie-web').AnimationItem|null} */
    this.anim = null;

    this.compW = 0;
    this.compH = 0;
    this.durationFrames = null;

    this._readyResolve = null;
    this._readyReject = null;
    this._readyPromise = null;

    this._onDataReady = this._onDataReady.bind(this);
    this._onError = this._onError.bind(this);
  }

  /** @param {CanvasRenderingContext2D} ctx */
  init(ctx) {
    this.targetCtx = ctx;
  }

  /**
   * @param {{url?: string, data?: unknown}} src
   * @returns {Promise<void>}
   */
  async setSource(src) {
    if (!this.targetCtx)
      throw new Error('init(ctx) must be called before setSource()');

    // clean previous
    if (this.anim) {
      try {
        this.anim.removeEventListener('data_ready', this._onDataReady);
        this.anim.removeEventListener('error', this._onError);
      } catch {}
      try {
        this.anim.destroy();
      } catch {}
      this.anim = null;
    }
    this.compW = this.compH = 0;
    this.durationFrames = null;

    this._readyPromise = new Promise((res, rej) => {
      this._readyResolve = res;
      this._readyReject = rej;
    });

    // Bind Lottie directly to the *target* context
    this.anim = lottie.loadAnimation({
      renderer: 'canvas',
      loop: true,
      autoplay: false,
      path: src?.url,
      rendererSettings: {
        context: this.targetCtx,
        clearCanvas: false,
      },
    });

    this.anim.addEventListener('data_ready', this._onDataReady);
    this.anim.addEventListener('error', this._onError);

    return this._readyPromise;
  }

  _onDataReady() {
    if (!this.anim) return;
    const data = this.anim.animationData || {};
    this.compW = data.w || 0;
    this.compH = data.h || 0;

    const total = this.anim.getDuration(true);
    this.durationFrames = Number.isFinite(total) && total > 0 ? total : null;

    // Force a first paint
    try {
      this.anim.goToAndStop(0, true);
    } catch {
      console.warn('Lottie failed to render first frame');
    }

    if (this._readyResolve) this._readyResolve();
    this._readyResolve = this._readyReject = null;
  }

  _onError(e) {
    if (this._readyReject) this._readyReject(e || new Error('Lottie error'));
    this._readyResolve = this._readyReject = null;
  }

  getDurationFrames() {
    return this.durationFrames;
  }

  getCompSize() {
    return this.compW && this.compH ? {w: this.compW, h: this.compH} : null;
  }

  /**
   * Draw exactly one frame into the target context with layout handled here.
   * @param {number} frameIndex
   * @param {{mode?: 'fit'|'cover'|'stretch'|'none', scale?: number, align?: {x:'start'|'center'|'end', y:'start'|'center'|'end'}, offset?: {x:number,y:number}, clearBeforeDraw?: boolean}} layout
   */
  renderFrame(frameIndex, layout = {}) {
    if (
      !this.targetCtx ||
      !this.anim ||
      !this.durationFrames ||
      !this.compW ||
      !this.compH
    )
      return;

    const cfg = {...DEFAULT_LAYOUT, ...layout};
    const ctx = this.targetCtx;
    const cw = ctx.canvas.width | 0;
    const ch = ctx.canvas.height | 0;

    if (cfg.clearBeforeDraw) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
    }

    // Compute destination rect
    let dw, dh;
    if (cfg.mode === 'fit' || cfg.mode === 'cover') {
      const s =
        cfg.mode === 'cover'
          ? Math.max(cw / this.compW, ch / this.compH)
          : Math.min(cw / this.compW, ch / this.compH);
      dw = Math.max(1, Math.round(this.compW * s * (cfg.scale || 1)));
      dh = Math.max(1, Math.round(this.compH * s * (cfg.scale || 1)));
    } else if (cfg.mode === 'stretch') {
      dw = Math.max(1, Math.round(cw * (cfg.scale || 1)));
      dh = Math.max(1, Math.round(ch * (cfg.scale || 1)));
    } else {
      const s = cfg.scale || 1;
      dw = Math.max(1, Math.round(this.compW * s));
      dh = Math.max(1, Math.round(this.compH * s));
    }

    const ax = cfg.align?.x || 'center';
    const ay = cfg.align?.y || 'center';
    const dx = Math.round(alignOffset(cw, dw, ax) + (cfg.offset?.x || 0));
    const dy = Math.round(alignOffset(ch, dh, ay) + (cfg.offset?.y || 0));

    // Apply transform that maps Lottie comp space → dest rect
    ctx.save();
    ctx.setTransform(dw / this.compW, 0, 0, dh / this.compH, dx, dy);

    // Paint the requested frame directly into target
    const idx =
      ((frameIndex % this.durationFrames) + this.durationFrames) %
      this.durationFrames;
    this.anim.goToAndStop(idx, true);

    ctx.restore();
  }

  dispose() {
    if (this.anim) {
      try {
        this.anim.removeEventListener('data_ready', this._onDataReady);
        this.anim.removeEventListener('error', this._onError);
      } catch {}
      try {
        this.anim.destroy();
      } catch {}
      this.anim = null;
    }
    this.targetCtx = null;
    this.compW = this.compH = 0;
    this.durationFrames = null;
  }
}
