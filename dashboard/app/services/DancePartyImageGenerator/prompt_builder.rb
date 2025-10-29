module DancePartyImageGenerator
  class PromptBuilder
    def initialize(width: 1024, height: 1024)
      (@w = width
       @h = height)
    end

    # {adj:, animal:, attire:}
    def build(item)
      theme =
        if item[:adj] && item[:attire] then "#{item[:animal]} wearing #{item[:attire]}, with #{item[:adj]} mood."
        elsif item[:attire] then "#{item[:animal]} in #{item[:attire]}"
        else
          item[:animal]
        end
      <<~PROMPT
        Create one non-human character head for Code.org’s Dance Party.
        Canvas & Size: exactly #{@w} px wide × #{@h} px tall.
        Focus: Show only the head and face, no body, no neck, no shoulders...
        Background: transparent PNG only. Entire head visible and centered, nothing cropped.
        Theme: #{theme}.
        Art style: Flat vector color fills, no outlines, no shading/gradients...
        Framing: small uniform margin; head fills most of the canvas.
      PROMPT
    end
  end
end
