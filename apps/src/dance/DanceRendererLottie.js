import lottie from 'lottie-web';

import appConfig from '../music/appConfig';

const BASE_HOST = 'https://curriculum.code.org/media/musiclab/generate';
const ASSETS_FOLDER = 'curated';
const TEST_BASE_DANCER = 'duck';
const TEST_GENERATED_DANCER = 'bat';
const MAP = {
  secondary: new Set([
    'bracelet',
    'shirt high',
    'shirt low',
    'shirt low 2',
    'line',
  ]),
  tertiary: new Set([
    'cuff',
    'hip',
    'pelvis',
    'torso accent',
    'belly',
    'leg cuff',
    'arc',
  ]),
};

export default class DanceRendererLottie {
  constructor() {
    this.ctx = null;
    this.anim = null;
    this.animationData = null;
    this.palette = null;
    this.totalFrames = null;

    this.assetsPath = appConfig.getValue('folder') || ASSETS_FOLDER;
    this.headScale = appConfig.getValue('headScale') || 0.5;
    this.randomDancer = appConfig.getValue('randomDancer') === 'true';
    this.randomSkeleton = appConfig.getValue('randomSkeleton') === 'true';
    this.dancerBaseName = appConfig.getValue('dancer')?.toLowerCase();
    this.dancerName = this.dancerBaseName || TEST_GENERATED_DANCER;
  }

  // ExternalDancerLayer hands us an offscreen p5.Graphics 2D context
  init(ctx) {
    this.ctx = ctx;
  }

  async setSource(danceMove) {
    if (!danceMove) {
      this._destroyAnim();
      this.animationData = null;
      this.palette = null;
      this.totalFrames = null;
      return;
    }

    const move = String(danceMove).toLowerCase();
    const jsonUrl = this._resolveAnimationUrl(move);

    if (this.randomDancer) {
      let randomName = null;

      if (this.assetsPath === 'basic2') {
        const variants = ['00', '01', '02'];
        if (this.dancerBaseName) {
          randomName = () => `${this.dancerBaseName}-${pick(variants)}`;
        } else {
          randomName = () => {
            const styles = ['basic', 'goth'];
            const animals = ['frog', 'moose', 'wolf'];
            const accessories = [
              'baseball-cap',
              'beanie',
              'crown',
              'headband',
              'headscarf',
              'sunglasses',
            ];

            return `${pick(styles)}-${pick(animals)}-${pick(
              accessories
            )}-${pick(variants)}`;
          };
        }
      } else if (this.assetsPath === 'curated') {
        randomName = () => {
          const animals = [
            'bear',
            'bull',
            'bunny',
            'cat',
            'dog',
            'frog',
            'zombie',
          ];
          return pick(animals);
        };
      }

      console.log(this.assetsPath, randomName);
      if (typeof randomName === 'function') {
        console.log('Picking random dancer');
        this.dancerName = randomName();
      }
    }
    console.log('Using dancer', this.dancerName);
    const colorsUrl = this._resolveColorsUrl();

    const [animDataRaw, colorsJson] = await Promise.all([
      this._fetchJson(jsonUrl),
      this._fetchJson(colorsUrl),
    ]);

    this.palette = this._normalizePalette(colorsJson);
    console.log({colorsJson, palette: this.palette});

    // Deep clone; we'll mutate
    const animData = JSON.parse(JSON.stringify(animDataRaw));

    // Apply built-in mapping rules (kept inside the renderer)
    this._applyColorMapping(animData, this.palette);
    const headInfo = await this._fetchHeadImageInfo();
    if (headInfo) {
      const headPre = this._findHeadPrecompLayerDeep(animData);
      if (headPre && headPre.refId) {
        const headComp = this._getAssetById(animData, headPre.refId); // comp_1 in DoubleJam
        if (headComp && Array.isArray(headComp.layers)) {
          const {insertIndex} = this._hideVectorHeadInComp(headComp);
          const assetId = this._ensureHeadImageAsset(
            animData,
            headInfo.dataUrl,
            headInfo.w,
            headInfo.h
          );
          this._insertHeadImageLayer(
            headComp,
            insertIndex,
            assetId,
            headInfo.w,
            headInfo.h
          );
        }
      }
    }
    // Prepare lottie instance bound to our canvas 2D context
    await this._prepareLottie(animData);

    this.animationData = animData;
    this.totalFrames = Math.max(
      0,
      Math.round((animData.op || 0) - (animData.ip || 0))
    );
  }

  getDurationFrames() {
    return this.totalFrames;
  }
  getCompSize() {
    return this.compW && this.compH ? {w: this.compW, h: this.compH} : null;
  }
  renderFrame(frameIndex, layout) {
    if (!this.anim || !this.ctx || this.totalFrames === null) return;
    const tf = Math.max(1, this.totalFrames || 1);
    const frame = Math.floor(((frameIndex % tf) + tf) % tf);
    this.anim.goToAndStop(frame, true);
  }

  resize() {
    if (!this.anim) return;
    // ExternalDancerLayer may recreate the graphics; update renderer references
    this.anim.renderer.ctx = this.ctx;
    this.anim.renderer.context = this.ctx; // compatibility with older lottie-web
    if (typeof this.anim.resize === 'function') this.anim.resize();
  }

  dispose() {
    this._destroyAnim();
  }

  // ---------- internals ----------

  _resolveAnimationUrl(danceMove) {
    let skeletonName =
      appConfig.getValue('skeleton')?.toLowerCase() || TEST_BASE_DANCER;
    if (this.randomDancer || this.randomSkeleton) {
      const skeletons = ['bear', 'cat', 'duck', 'frog', 'robot', 'unicorn'];
      skeletonName = skeletons[Math.floor(Math.random() * skeletons.length)];
    }
    return `${BASE_HOST}/dancers/input/${skeletonName.toUpperCase()}/${skeletonName}_${danceMove}.json`;
  }

  _resolveColorsUrl() {
    return `${BASE_HOST}/dancer/${this.assetsPath}/${this.dancerName}-metadata.json`;
  }

  _resolveHeadUrl() {
    return `${BASE_HOST}/dancer/${this.assetsPath}/${this.dancerName}.png`;
  }

  async _prepareLottie(animationData) {
    this._destroyAnim();

    const anim = lottie.loadAnimation({
      renderer: 'canvas',
      loop: false,
      autoplay: false,
      animationData,
      rendererSettings: {
        context: this.ctx,
        clearCanvas: true,
        preserveAspectRatio: 'xMidYMid meet',
      },
    });

    await new Promise(resolve => {
      const onReady = () => {
        anim.removeEventListener('DOMLoaded', onReady);
        anim.removeEventListener('data_ready', onReady);
        resolve();
      };
      anim.addEventListener('DOMLoaded', onReady);
      anim.addEventListener('data_ready', onReady);
    });

    this.anim = anim;
  }

  _destroyAnim() {
    if (this.anim) {
      try {
        this.anim.destroy && this.anim.destroy();
      } catch (e) {}
    }
    this.anim = null;
  }

  async _fetchJson(url) {
    const res = await fetch(url, {cache: 'no-cache'});
    if (!res.ok)
      throw new Error(
        `Failed to fetch ${url}: ${res.status} ${res.statusText}`
      );
    return res.json();
  }
  _normalizePalette(obj = {}) {
    const isHex6 = s => typeof s === 'string' && /^#?[0-9a-f]{6}$/i.test(s);
    const toHex = s => (s[0] === '#' ? s : `#${s}`);
    const toRGBA = hex => {
      if (!hex) return null;
      const h = hex.replace('#', '');
      const r = parseInt(h.slice(0, 2), 16) / 255;
      const g = parseInt(h.slice(2, 4), 16) / 255;
      const b = parseInt(h.slice(4, 6), 16) / 255;
      return [r, g, b, 1];
    };

    // Fall back on body_color for primary if needed
    const primaryColor =
      obj.primary || (obj.body_color !== '#000000' && obj.body_color);
    console.log('primaryColor', primaryColor);
    const primaryHex = isHex6(primaryColor) ? toHex(primaryColor) : null;
    // If secondary/tertiary are invalid/missing, we fall back to primary
    const secondaryHex = isHex6(obj.secondary)
      ? toHex(obj.secondary)
      : primaryHex;
    const tertiaryHex = isHex6(obj.tertiary)
      ? toHex(obj.tertiary)
      : secondaryHex;

    return {
      primary: toRGBA(primaryHex),
      secondary: toRGBA(secondaryHex),
      tertiary: toRGBA(tertiaryHex),
    };
  }

  _hexToRGBA(hex) {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    return [r, g, b, 1];
  }
  _applyColorMapping(animationData, palette) {
    const norm = s => (s || '').toLowerCase().replace(/[_-]+/g, ' ').trim();
    const splitSegments = s =>
      norm(s)
        .split(/\s*\/\s*|\s*::\s*|\s*>\s*|\s{2,}/g)
        .filter(Boolean);

    // --- Build word-boundary regexes from MAP tokens ---
    const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const tokenToRx = token =>
      new RegExp(
        '\\b' + escape(norm(token)).replace(/\s+/g, '[-_\\s]+') + 's?\\b',
        'i'
      );
    const SECONDARY_RX = Array.from(MAP.secondary, tokenToRx);
    const TERTIARY_RX = Array.from(MAP.tertiary, tokenToRx);
    const anyMatch = (str, rxs) => !!str && rxs.some(rx => rx.test(str));

    const isArmLegSeg = seg =>
      /\b(left|right)?\s*(arm|leg|wrist|shoulder|ankle|hip)\b/i.test(seg);

    const isHoseySeg = seg =>
      /\b(arc|lineforcurve|rubber\s*hose|style)\b/i.test(seg);

    const setColorNode = (cNode, rgba) => {
      if (!rgba || !cNode) return; // skip if palette slot missing
      if ('x' in cNode) delete cNode.x; // remove expressions if present
      if (Array.isArray(cNode.k)) {
        if (typeof cNode.k[0] === 'number') {
          cNode.k = [
            rgba[0],
            rgba[1],
            rgba[2],
            cNode.k[3] !== null ? cNode.k[3] : 1,
          ];
        } else {
          cNode.k.forEach(kf => {
            if (kf && Array.isArray(kf.s))
              kf.s = [rgba[0], rgba[1], rgba[2], 1];
          });
        }
      } else {
        cNode.k = [rgba[0], rgba[1], rgba[2], 1];
      }
    };

    const paint = (shape, rgba) => {
      if (!rgba) return;
      if ((shape.ty === 'fl' || shape.ty === 'st') && shape.c)
        setColorNode(shape.c, rgba);
      // (Add gf/gs later if needed)
    };

    const walk = (items, layerName, pathNames = []) => {
      if (!Array.isArray(items)) return;
      const layerSegs = splitSegments(layerName);

      for (const it of items) {
        if (!it) continue;

        if (it.ty === 'gr') {
          const nm = it.nm || '';
          const nextPath = nm ? pathNames.concat(nm) : pathNames;
          walk(it.it, layerName, nextPath);
          continue;
        }

        // Build context strings
        const segs = pathNames.flatMap(splitSegments);
        const shapeName = norm(it.nm || '');
        const pathStr = [...pathNames, it.nm || ''].filter(Boolean).join(' / ');

        // ---- 1) Accessories FIRST (so they win over hose) ----
        const matchesSecondary =
          segs.some(seg => anyMatch(seg, SECONDARY_RX)) ||
          anyMatch(shapeName, SECONDARY_RX) ||
          anyMatch(layerName, SECONDARY_RX) ||
          anyMatch(pathStr, SECONDARY_RX);

        const matchesTertiary =
          segs.some(seg => anyMatch(seg, TERTIARY_RX)) ||
          anyMatch(shapeName, TERTIARY_RX) ||
          anyMatch(layerName, TERTIARY_RX) ||
          anyMatch(pathStr, TERTIARY_RX);

        if (matchesSecondary) {
          paint(it, palette.secondary);
          continue;
        }
        if (matchesTertiary) {
          paint(it, palette.tertiary);
          continue;
        }

        // ---- 2) Hose → PRIMARY (only if not matched as accessory) ----
        const inArmLegContext =
          layerSegs.some(isArmLegSeg) || segs.some(isArmLegSeg);
        const inHoseGroup = segs.some(isHoseySeg);
        if (
          (it.ty === 'st' || it.ty === 'fl') &&
          inArmLegContext &&
          inHoseGroup
        ) {
          paint(it, palette.primary);
          continue;
        }
      }
    };

    const visitLayer = layer => {
      if (Array.isArray(layer?.shapes)) walk(layer.shapes, layer.nm || '', []);
    };

    animationData.layers?.forEach(visitLayer);
    animationData.assets?.forEach(a => a.layers?.forEach(visitLayer));
  }
  // 1) Load head.png (data URL + natural size, with 1000x1000 fallback)
  async _fetchHeadImageInfo() {
    const headUrl = this._resolveHeadUrl();
    try {
      const res = await fetch(headUrl, {cache: 'no-cache'});
      if (!res.ok) return null;
      const blob = await res.blob();

      const dataUrl = await new Promise(resolve => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.readAsDataURL(blob);
      });

      const {width, height} = await new Promise(resolve => {
        const img = new Image();
        img.onload = () =>
          resolve({
            width: img.naturalWidth || 1000,
            height: img.naturalHeight || 1000,
          });
        img.onerror = () => resolve({width: 1000, height: 1000});
        img.src = dataUrl;
      });

      return {dataUrl, w: width, h: height};
    } catch {
      return null;
    }
  }

  // 2) Find the HEAD precomp layer (ty:0, name contains "head") ANYWHERE in assets
  _findHeadPrecompLayerDeep(animationData) {
    const assets = animationData.assets || [];
    for (const asset of assets) {
      if (!asset || !Array.isArray(asset.layers)) continue;
      const layers = asset.layers;
      for (let i = 0; i < layers.length; i++) {
        const L = layers[i];
        if (L && L.ty === 0 && /\bhead\b/i.test(L.nm || '')) {
          return {
            containerAsset: asset, // this is comp_0 in DoubleJam
            layers, // the array we found it in
            index: i,
            layer: L, // the precomp layer "BEAR - Head"
            refId: L.refId, // e.g. "comp_1"
          };
        }
      }
    }
    return null;
  }

  // 3) Get an asset (comp) by id (e.g., "comp_1")
  _getAssetById(animationData, id) {
    return (animationData.assets || []).find(a => a && a.id === id) || null;
  }

  // 4) Hide vector head layers inside the head comp; return {insertIndex, headKs}
  _hideVectorHeadInComp(headCompAsset) {
    let firstHiddenIndex = -1;
    let headKs = null;
    const layers = headCompAsset.layers || [];
    for (let i = 0; i < layers.length; i++) {
      const L = layers[i];
      if (!L) continue;
      // In DoubleJam this is "BEAR - Head/Bear Outlines" (ty:4)
      const nm = L.nm || '';
      if (L.ty === 4 && (/bear outlines/i.test(nm) || /\bhead\b/i.test(nm))) {
        L.hd = true;
        if (!headKs && L.ks) headKs = JSON.parse(JSON.stringify(L.ks));
        if (firstHiddenIndex === -1) firstHiddenIndex = i;
      }
    }
    const insertIndex =
      firstHiddenIndex >= 0 ? firstHiddenIndex + 1 : layers.length;
    return {insertIndex, headKs};
  }

  // 5) Ensure a single embedded image asset exists
  _ensureHeadImageAsset(animationData, dataUrl, w, h) {
    const assets = (animationData.assets = animationData.assets || []);
    const id = 'img_head_custom';
    if (!assets.some(a => a && a.id === id)) {
      assets.push({
        id,
        w,
        h,
        u: '',
        p: dataUrl, // data URL
        e: 1, // embedded
      });
    }
    return id;
  }

  // 6) Insert an image layer into the head comp using either the copied ks or a centered fallback
  _insertHeadImageLayer(
    headCompAsset,
    insertIndex,
    imgAssetId,
    imgW,
    imgH,
    copiedKs
  ) {
    const compW = headCompAsset.w || 500;
    const compH = headCompAsset.h || 500;
    // Compute scale that maps image pixels to comp pixels.
    const sx = (compW / imgW) * 100 * this.headScale;
    const sy = (compH / imgH) * 100 * this.headScale;

    const ks = copiedKs
      ? JSON.parse(JSON.stringify(copiedKs))
      : {
          o: {a: 0, k: 100},
          r: {a: 0, k: 0},
          p: {a: 0, k: [compW / 2, compH / 2, 0]},
          a: {a: 0, k: [imgW / 2, imgH / 2, 0]},
          s: {a: 0, k: [(compW / imgW) * 100, (compH / imgH) * 100, 100]},
        };

    // Make sure anchor matches image center if we copied ks
    if (copiedKs && ks.a && Array.isArray(ks.a.k)) {
      ks.a.k = [imgW / 2, imgH / 2, 0];
    }

    // Unique layer index within this comp
    const maxInd = (headCompAsset.layers || []).reduce(
      (m, L) => Math.max(m, L?.ind || 0),
      0
    );
    // const imgLayer = {
    //   ddd: 0,
    //   ind: maxInd + 1,
    //   ty: 2,
    //   nm: 'Head Image',
    //   refId: imgAssetId,
    //   sr: 1,
    //   ks,
    //   ao: 0,
    //   ip: 0,
    //   op: 9999,
    //   st: 0,
    //   bm: 0,
    //   hd: false,
    // };
    const imgLayer = {
      ddd: 0,
      ind: maxInd + 1,
      ty: 2,
      nm: 'Head Image',
      refId: imgAssetId,
      sr: 1,
      ks: {
        o: {a: 0, k: 100},
        r: {a: 0, k: 0},
        // Put image at comp center so it inherits precomp motion cleanly
        p: {a: 0, k: [compW / 2, compH / 2, 0]},
        // Anchor at image center so scaling is intuitive
        a: {a: 0, k: [imgW / 2, imgH / 2, 0]},
        // Scale from pixels → comp, optionally multiplied
        s: {a: 0, k: [sx, sy, 100]},
      },
      ao: 0,
      ip: 0,
      op: 9999,
      st: 0,
      bm: 0,
      hd: false,
    };
    headCompAsset.layers.splice(insertIndex, 0, imgLayer);
  }
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
