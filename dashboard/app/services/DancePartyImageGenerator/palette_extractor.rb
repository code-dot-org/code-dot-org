# frozen_string_literal: true

require "chunky_png"

module DancePartyImageGenerator
  class PaletteExtractor
    # Tunables (mirror your Python config)
    SECONDARY_MIN_DELTAE      = 18.0
    MIN_PERCENT_FOR_SECONDARY = 0.5   # %
    MIN_PERCENT_FOR_TERTIARY  = 0.2   # %

    # Fallbacks when no visible pixels
    OFF_WHITE = "#F2F2F2"
    OFF_BLACK = "#0A0A0A"

    # Public: quick helpers --------------------------------------------------

    def self.extract_png_bytes(png_bytes, normalize_grays: true)
      new(normalize_grays: normalize_grays).extract_png_bytes(png_bytes)
    end

    def self.too_transparent?(png_bytes, threshold: 0.90)
      img = ChunkyPNG::Image.from_blob(png_bytes)
      total = img.width * img.height
      zeros = 0
      img.pixels.each {|p| zeros += 1 if ((p >> 24) & 0xFF) == 0}
      (zeros.to_f / total) >= threshold
    end

    # Instance API ----------------------------------------------------------

    def initialize(alpha_weight: true, normalize_grays: true)
      @alpha_weight   = alpha_weight
      @normalize_grays = normalize_grays
    end

    def extract_png_bytes(png_bytes)
      img = ChunkyPNG::Image.from_blob(png_bytes)
      counts, total = count_visible_colors(img, @alpha_weight)

      return [OFF_WHITE, OFF_WHITE, OFF_WHITE] if total <= 0.0

      uniq_colors = counts.keys
      weights     = uniq_colors.map {|k| counts[k]}
      percents    = weights.map {|w| (w / total) * 100.0}

      # Dominant
      dom_idx = weights.each_with_index.max[1]
      dom_rgb = unpack_rgb(uniq_colors[dom_idx])
      dom_hex = hex(dom_rgb)

      # CIELab + ΔE against dominant
      labs = uniq_colors.map {|k| rgb_to_lab(unpack_rgb(k))}
      dom_lab = labs[dom_idx]
      deltas  = labs.map {|lab| delta_e76(dom_lab, lab)}

      # Secondary: sufficiently different & frequent
      sec_idx = best_secondary_index(weights, percents, deltas, dom_idx)
      sec_hex = hex(unpack_rgb(uniq_colors[sec_idx]))

      # Tertiary: furthest ΔE with some presence
      ter_idx = best_tertiary_index(weights, percents, deltas, dom_idx)
      ter_hex = hex(unpack_rgb(uniq_colors[ter_idx]))

      # Optional normalization of exact black/white to off-tones
      if @normalize_grays
        dom_hex = normalize_gray(dom_hex)
        sec_hex = normalize_gray(sec_hex)
        ter_hex = normalize_gray(ter_hex)
      end

      [dom_hex, sec_hex, ter_hex]
    end

    # Count visible colors with optional alpha weighting
    private def count_visible_colors(img, alpha_weight)
      counts = Hash.new(0.0)
      total  = 0.0

      img.pixels.each do |p|
        a = (p >> 24) & 0xFF
        next if a == 0

        r = (p >> 16) & 0xFF
        g = (p >>  8) & 0xFF
        b = (p) & 0xFF

        key = (r << 16) | (g << 8) | b
        w   = alpha_weight ? (a / 255.0) : 1.0
        counts[key] += w
        total       += w
      end

      [counts, total]
    end

    private def unpack_rgb(key)
      r = (key >> 16) & 0xFF
      g = (key >>  8) & 0xFF
      b = (key) & 0xFF
      [r, g, b]
    end

    private def hex(rgb)
      format("#%02X%02X%02X", *rgb)
    end

    private def normalize_gray(h)
      case h.upcase
      when "#000000", "#010101", "#0D0D0D", "#111111"
        OFF_BLACK
      when "#FFFFFF", "#FEFEFE", "#FDFDFD"
        OFF_WHITE
      else
        h
      end
    end

    # ---- Color science (sRGB -> XYZ -> Lab, ΔE76) ------------------------

    private def srgb_to_linear(c) # c in 0..1
      if c <= 0.04045
        c / 12.92
      else
        ((c + 0.055) / 1.055) ** 2.4
      end
    end

    private def rgb_to_xyz(r255, g255, b255)
      r = srgb_to_linear(r255 / 255.0)
      g = srgb_to_linear(g255 / 255.0)
      b = srgb_to_linear(b255 / 255.0)
      x = (0.4124564*r) + (0.3575761*g) + (0.1804375*b)
      y = (0.2126729*r) + (0.7151522*g) + (0.0721750*b)
      z = (0.0193339*r) + (0.1191920*g) + (0.9503041*b)
      [x, y, z]
    end

    private def f_xyz(t)
      eps = (6.0/29.0)**3
      k   = ((29.0/6.0)**2) / 3.0
      t > eps ? t ** (1.0/3.0) : ((k * t) + (4.0/29.0))
    end

    private def rgb_to_lab(rgb)
      x, y, z = rgb_to_xyz(*rgb)
      xn = 0.95047
      yn = 1.00000
      zn = 1.08883 # D65
      fx = f_xyz(x/xn)
      fy = f_xyz(y/yn)
      fz = f_xyz(z/zn)
      l = (116.0 * fy) - 16.0
      a = 500.0 * (fx - fy)
      b = 200.0 * (fy - fz)
      [l, a, b]
    end

    private def delta_e76(lab1, lab2)
      dl = lab2[0] - lab1[0]
      da = lab2[1] - lab1[1]
      db = lab2[2] - lab1[2]
      Math.sqrt((dl*dl) + (da*da) + (db*db))
    end

    # ---- Candidate picking ------------------------------------------------

    private def best_secondary_index(weights, perc, deltas, dom_idx)
      idxs = (0...weights.length).to_a - [dom_idx]
      # Apply thresholds
      cands = idxs.select {|i| deltas[i] >= SECONDARY_MIN_DELTAE && perc[i] >= MIN_PERCENT_FOR_SECONDARY}
      cands = idxs if cands.empty?
      # Prefer larger ΔE, then higher weight
      cands.max_by {|i| [deltas[i], weights[i]]} || dom_idx
    end

    private def best_tertiary_index(weights, perc, deltas, dom_idx)
      idxs = (0...weights.length).to_a - [dom_idx]
      cands = idxs.select {|i| perc[i] >= MIN_PERCENT_FOR_TERTIARY}
      cands = idxs if cands.empty?
      cands.max_by {|i| deltas[i]} || dom_idx
    end
  end
end
