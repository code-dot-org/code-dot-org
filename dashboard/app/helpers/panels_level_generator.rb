# Generates the panels array for a Panels lab level from a free-text
# "Generate prompt" supplied by the curriculum author. Called from
# Panels#summarize_for_lab2_properties at the moment a client requests
# the level's properties.
class PanelsLevelGenerator
  SYSTEM_PROMPT = <<~PROMPT.freeze
    You are generating the "panels" array for a Code.org Panels lab level.
    Panels lab shows a sequence of slide-like panels to a student; each panel
    has a markdown text block and a background image.

    Output ONE JSON object of the form:

      {
        "panels": [
          {
            "text": "###Title\\nMarkdown body text for this panel.",
            "imagePrompt": "A vivid, education-appropriate description of the
                            background image for this panel. The frontend will
                            feed this into an image generation model.",
            "layout": "text-bottom-right",   // optional
            "fadeInOverPrevious": true       // optional, omit on first panel
          },
          ...
        ]
      }

    Rules:
      - Respond with ONLY the JSON object. No prose, no markdown fences.
        Output must parse with JSON.parse.
      - 3 to 8 panels is a good default; pick a count that fits the prompt.
      - "text" is markdown. Use "###" for a panel headline on the first line,
        followed by a short body paragraph.
      - "imagePrompt" is REQUIRED on every panel. Write a concrete, visual
        prompt (subject, setting, style) suitable for a text-to-image model.
        Keep it under 60 words and free of named real people. No text overlays.
      - Do NOT invent imageUrl values; the frontend will generate the image
        from imagePrompt at level-load time.
      - Valid layout values: "text-top-center", "text-bottom-right",
        "text-bottom-left", "text-bottom-center". Pick one per panel or omit.
  PROMPT

  def self.generate(prompt, level_name)
    parsed = LevelGeneratorHelper.generate_json(
      system_prompt: SYSTEM_PROMPT,
      user_prompt: prompt
    )
    panels = parsed.is_a?(Hash) ? parsed['panels'] : parsed
    return nil unless panels.is_a?(Array)
    panels.each_with_index do |panel, i|
      panel['key'] ||= "#{level_name}-generated-#{i}"
    end
    panels
  rescue LevelGeneratorHelper::GenerationError => exception
    Rails.logger.warn("PanelsLevelGenerator failed: #{exception.message}")
    nil
  end
end
