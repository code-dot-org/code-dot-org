# frozen_string_literal: true

require "chunky_png"

module DancePartyImageGenerator
  class PaletteExtractor
    SECONDARY_MIN_DELTAE      = 18.0
    MIN_PERCENT_FOR_SECONDARY = 0.5  # %
    MIN_PERCENT_FOR_TERTIARY  = 0.2  # %
    OFF_WHITE = "#F2F2F2"
    OFF_BLACK = "#0A0A0A"

    def initialize(alpha_weight: true, normalize_grays: true)
      @alpha_weight    = alpha_weight
      @normalize_grays = normalize_grays
    end

    # Public API used by ImageGenerator:
    # accepts MiniMagick::Image, ChunkyPNG::Image, or raw PNG bytes
    def extract(image)
      bytes =
        case image
        when String then image
        when MiniMagick::Image, ChunkyPNG::Image then image.to_blob
        else
          image.respond_to?(:to_blob) ? image.to_blob :
            raise(ArgumentError, "Unsupported image type: #{image.class}")
        end
      extract_from_bytes(bytes)
    end

    # Convenience (also usable directly)
    def extract_from_bytes(bytes)
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

      # Secondary: sufficiently different & frequent; prefer larger ΔE, then weight
      sec_candidates = others.select {|i| deltas[i] >= SECONDARY_MIN_DELTAE && perc[i] >= MIN_PERCENT_FOR_SECONDARY}
      sec_candidates = others if sec_candidates.empty?
      sec_idx = sec_candidates.max_by {|i| [deltas[i], weights[i]]} || dom_idx
      sec_hex = hex(unpack_rgb(uniq[sec_idx]))

      # Tertiary: furthest ΔE with some presence
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

    # Class conveniences (used by doctor jobs, etc.)
    def self.extract_png_bytes(bytes, normalize_grays: true)
      new(normalize_grays: normalize_grays).extract_from_bytes(bytes)
    end

    def self.too_transparent?(bytes, threshold: 0.90)
      img = ChunkyPNG::Image.from_blob(bytes)
      zeros = img.pixels.count {|p| ((p >> 24) & 0xFF).zero?}
      zeros.to_f / (img.width * img.height) >= threshold
    end

    private def unpack_rgb(key) = [(key >> 16) & 0xFF, (key >> 8) & 0xFF, key & 0xFF]
    private def hex(rgb)        = format("#%02X%02X%02X", *rgb)

    private def normalize_gray(h)
      up = h.upcase
      return OFF_BLACK if %w[#000000 #010101 #0D0D0D #111111].include?(up)
      return OFF_WHITE if %w[#FFFFFF #FEFEFE #FDFDFD].include?(up)
      h
    end

    # --- sRGB -> Lab and ΔE76 ---
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
      xn = 0.95047
      yn = 1.00000
      zn = 1.08883
      fx = f_xyz(x/xn)
      fy = f_xyz(y/yn)
      fz = f_xyz(z/zn)
      [(116.0*fy) - 16.0, 500.0*(fx - fy), 200.0*(fy - fz)]
    end

    private def delta_e76(l1, l2)
      dl = l2[0]-l1[0]; da = l2[1]-l1[1]; db = l2[2]-l1[2]
      Math.sqrt((dl*dl) + (da*da) + (db*db))
    end
  end
end
