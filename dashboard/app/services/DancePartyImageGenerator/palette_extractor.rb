# frozen_string_literal: true

require "chunky_png"

module DancePartyImageGenerator
  class PaletteExtractor
    SECONDARY_MIN_DELTAE      = 18.0
    MIN_PERCENT_FOR_SECONDARY = 0.5  # %
    MIN_PERCENT_FOR_TERTIARY  = 0.2  # %
    OFF_WHITE = "#F2F2F2"
    OFF_BLACK = "#0A0A0A"

    PY_MUTEX = Mutex.new

    def initialize(alpha_weight: true, normalize_grays: true, logger: Rails.logger)
      @alpha_weight    = alpha_weight
      @normalize_grays = normalize_grays
      @logger          = logger
      @py_ready        = false
      @py_func         = nil
    end

    # Public API used by ImageGenerator:
    # accepts MiniMagick::Image, ChunkyPNG::Image, or raw PNG bytes
    def extract(image)
      bytes =
        case image
        when String then image # already bytes
        when MiniMagick::Image, ChunkyPNG::Image then image.to_blob
        else
          image.respond_to?(:to_blob) ? image.to_blob :
            raise(ArgumentError, "Unsupported image type: #{image.class}")
        end

      # Try Python fast path first
      begin
        dom, sec, ter = python_extract(bytes)
        return [dom, sec, ter]
      rescue => exception
        @logger.warn("[DPIG][PaletteExtractor] PyCall path failed (#{exception.class}: #{exception.message}) — falling back to Ruby")
      end

      # Fallback to Ruby path
      extract_from_bytes_ruby(bytes)
    end

    # ---------- Python path via PyCall ----------
    def python_extract(bytes)
      ensure_python!
      result = nil
      PY_MUTEX.synchronize do
        # danc_extract_palette_bytes(b, alpha_weight, normalize_grays, sec_deltaE, min_pct_sec, min_pct_ter)
        result = @py_func.call(bytes, @alpha_weight, @normalize_grays, SECONDARY_MIN_DELTAE, MIN_PERCENT_FOR_SECONDARY, MIN_PERCENT_FOR_TERTIARY)
      end
      [*result].map(&:to_s)
    end

    def ensure_python!
      return if @py_ready
      begin
        require 'pycall/import'
        extend PyCall::Import
        pyimport 'builtins'
        pyimport 'io'
        pyimport 'numpy', as: :np
        pyimport 'PIL.Image', as: :PILImage
      rescue LoadError => exception
        raise "PyCall not available: #{exception.message}"
      rescue PyCall::PyError => exception
        raise "Python import failed: #{exception}"
      end

      PyCall.exec(<<~PYCODE)
        import numpy as np
        from PIL import Image
        import io

        def danc_extract_palette_bytes(b,
                                       alpha_weight=True,
                                       normalize_grays=True,
                                       secondary_min_deltae=18.0,
                                       min_pct_secondary=0.5,
                                       min_pct_tertiary=0.2):
            img = Image.open(io.BytesIO(b)).convert("RGBA")
            arr = np.asarray(img)
            rgb = arr[..., :3].reshape(-1, 3).astype(np.uint8)
            alpha = arr[..., 3].reshape(-1)

            vis = alpha > 0
            if not np.any(vis):
                return ("#F2F2F2", "#F2F2F2", "#F2F2F2")

            rgb   = rgb[vis]
            a     = alpha[vis].astype(np.float32) / 255.0
            w     = a if alpha_weight else np.ones(rgb.shape[0], dtype=np.float32)

            packed = (rgb[:,0].astype(np.uint32) << 16) | (rgb[:,1].astype(np.uint32) << 8) | rgb[:,2].astype(np.uint32)
            uniq, inv = np.unique(packed, return_inverse=True)
            counts = np.bincount(inv, weights=w, minlength=uniq.shape[0]).astype(np.float64)
            total  = counts.sum() if counts.sum() > 0 else 1.0
            perc   = (counts / total) * 100.0

            rs = ((uniq >> 16) & 0xFF).astype(np.uint8)
            gs = ((uniq >> 8)  & 0xFF).astype(np.uint8)
            bs = ( uniq        & 0xFF).astype(np.uint8)
            colors = np.stack([rs, gs, bs], axis=1)

            def srgb_to_linear(c):
                c = c.astype(np.float32)
                a = c <= 0.04045
                out = np.empty_like(c, dtype=np.float32)
                out[a]  = c[a] / 12.92
                out[~a] = ((c[~a] + 0.055) / 1.055) ** 2.4
                return out

            def rgb_to_xyz(rgb):
                rgb = rgb.astype(np.float32) / 255.0
                r, g, b = rgb[:,0], rgb[:,1], rgb[:,2]
                r_lin, g_lin, b_lin = srgb_to_linear(r), srgb_to_linear(g), srgb_to_linear(b)
                X = 0.4124564*r_lin + 0.3575761*g_lin + 0.1804375*b_lin
                Y = 0.2126729*r_lin + 0.7151522*g_lin + 0.0721750*b_lin
                Z = 0.0193339*r_lin + 0.1191920*g_lin + 0.9503041*b_lin
                return np.stack([X, Y, Z], axis=1)

            def xyz_to_lab(xyz):
                Xn, Yn, Zn = 0.95047, 1.0, 1.08883
                x = xyz[:,0] / Xn; y = xyz[:,1] / Yn; z = xyz[:,2] / Zn
                eps = (6/29)**3; k = (29/6)**2 / 3
                def f(t):
                    out = np.empty_like(t, dtype=np.float32)
                    mask = t > eps
                    out[mask]  = np.cbrt(t[mask])
                    out[~mask] = k*t[~mask] + 4/29
                    return out
                fx, fy, fz = f(x), f(y), f(z)
                L = 116*fy - 16; a = 500*(fx - fy); b = 200*(fy - fz)
                return np.stack([L, a, b], axis=1)

            labs    = xyz_to_lab(rgb_to_xyz(colors))
            dom_idx = int(np.argmax(counts))
            dom_lab = labs[dom_idx]
            deltas  = np.linalg.norm(labs - dom_lab, axis=1)

            idx = np.arange(colors.shape[0])
            def to_hex(c): return "#%02X%02X%02X" % (int(c[0]), int(c[1]), int(c[2]))

            dom_hex = to_hex(colors[dom_idx])

            # Secondary: sufficiently different & frequent; prefer larger ΔE, then weight
            mask_sec = (idx != dom_idx) & (deltas >= secondary_min_deltae) & (perc >= min_pct_secondary)
            cand = idx[mask_sec]
            if cand.size == 0:
                cand = idx[idx != dom_idx]
            if cand.size:
                order = np.lexsort((-counts[cand], -deltas[cand]))
                sec_idx = cand[order[0]]
            else:
                sec_idx = dom_idx
            sec_hex = to_hex(colors[sec_idx])

            # Tertiary: furthest ΔE with some presence
            mask_ter = (idx != dom_idx) & (perc >= min_pct_tertiary)
            cand2 = idx[mask_ter]
            if cand2.size == 0:
                cand2 = idx[idx != dom_idx]
            if cand2.size:
                ter_idx = cand2[np.argmax(deltas[cand2])]
            else:
                ter_idx = dom_idx
            ter_hex = to_hex(colors[ter_idx])

            def norm_gray(h):
                up = h.upper()
                if up in ("#000000","#010101","#0D0D0D","#111111"):
                    return "#0A0A0A"
                if up in ("#FFFFFF","#FEFEFE","#FDFDFD"):
                    return "#F2F2F2"
                return h

            if normalize_grays:
                dom_hex = norm_gray(dom_hex)
                sec_hex = norm_gray(sec_hex)
                ter_hex = norm_gray(ter_hex)

            return (dom_hex, sec_hex, ter_hex)
      PYCODE

      @py_func  = PyCall.eval('danc_extract_palette_bytes')
      @py_ready = true
    end

    # ---------- Ruby fallback (your original logic) ----------
    def extract_from_bytes_ruby(bytes)
      img = ChunkyPNG::Image.from_blob(bytes)

      counts = Hash.new(0.0)
      total  = 0.0
      img.pixels.each do |p|
        a = (p >> 24) & 0xFF
        next if a == 0
        r = (p >> 16) & 0xFF; g = (p >>  8) & 0xFF; b = p & 0xFF
        key = (r << 16) | (g << 8) | b
        w   = @alpha_weight ? (a / 255.0) : 1.0
        counts[key] += w
        total       += w
      end

      return [OFF_WHITE, OFF_WHITE, OFF_WHITE] if total <= 0.0

      uniq    = counts.keys
      weights = uniq.map {|k| counts[k]}
      perc    = weights.map {|w| (w / total) * 100.0}

      dom_idx = weights.each_with_index.max[1]
      dom_rgb = unpack_rgb(uniq[dom_idx])
      dom_hex = hex(dom_rgb)

      labs    = uniq.map {|k| rgb_to_lab(*unpack_rgb(k))}
      dom_lab = labs[dom_idx]
      deltas  = labs.map {|lab| delta_e76(dom_lab, lab)}

      others = (0...uniq.length).to_a - [dom_idx]

      sec_candidates = others.select {|i| deltas[i] >= SECONDARY_MIN_DELTAE && perc[i] >= MIN_PERCENT_FOR_SECONDARY}
      sec_candidates = others if sec_candidates.empty?
      sec_idx = sec_candidates.max_by {|i| [deltas[i], weights[i]]} || dom_idx
      sec_hex = hex(unpack_rgb(uniq[sec_idx]))

      ter_candidates = others.select {|i| perc[i] >= MIN_PERCENT_FOR_TERTIARY}
      ter_candidates = others if ter_candidates.empty?
      ter_idx = ter_candidates.max_by {|i| deltas[i]} || dom_idx
      ter_hex = hex(unpack_rgb(uniq[ter_idx]))

      if @normalize_grays
        dom_hex = normalize_gray(dom_hex)
        sec_hex = normalize_gray(sec_hex)
        ter_hex = normalize_gray(ter_hex)
      end

      [dom_hex, sec_hex, ter_hex]
    end

    # ---- helpers (Ruby) ----
    private def unpack_rgb(key) = [(key >> 16) & 0xFF, (key >> 8) & 0xFF, key & 0xFF]
    private def hex(rgb)        = format("#%02X%02X%02X", *rgb)

    private def normalize_gray(h)
      up = h.upcase
      return OFF_BLACK if %w[#000000 #010101 #0D0D0D #111111].include?(up)
      return OFF_WHITE if %w[#FFFFFF #FEFEFE #FDFDFD].include?(up)
      h
    end

    # --- sRGB -> Lab and ΔE76 (Ruby fallback) ---
    private def srgb_to_linear(c) = c <= 0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4
    private def rgb_to_xyz(r255, g255, b255)
      r = srgb_to_linear(r255/255.0); g = srgb_to_linear(g255/255.0); b = srgb_to_linear(b255/255.0)
      x = (0.4124564*r) + (0.3575761*g) + (0.1804375*b)
      y = (0.2126729*r) + (0.7151522*g) + (0.0721750*b)
      z = (0.0193339*r) + (0.1191920*g) + (0.9503041*b)
      [x, y, z]
    end
    private def f_xyz(t)
      eps = (6.0/29.0)**3; k = ((29.0/6.0)**2) / 3.0
      t > eps ? t ** (1.0/3.0) : ((k * t) + (4.0/29.0))
    end
    private def rgb_to_lab(r, g, b)
      x, y, z = rgb_to_xyz(r, g, b)
      xn = 0.95047; yn = 1.00000; zn = 1.08883
      fx = f_xyz(x/xn); fy = f_xyz(y/yn); fz = f_xyz(z/zn)
      [(116.0*fy) - 16.0, 500.0*(fx - fy), 200.0*(fy - fz)]
    end
    private def delta_e76(l1, l2)
      dl = l2[0]-l1[0]; da = l2[1]-l1[1]; db = l2[2]-l1[2]
      Math.sqrt((dl*dl) + (da*da) + (db*db))
    end
  end
end
