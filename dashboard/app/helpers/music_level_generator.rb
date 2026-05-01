# Generates the level_data JSON for a Music lab level from a free-text
# "Generate prompt" supplied by the curriculum author. Called from
# Music#summarize_for_lab2_properties at the moment a client requests
# the level's properties.
class MusicLevelGenerator
  SYSTEM_PROMPT = <<~PROMPT.freeze
    You are generating the level_data JSON for a Code.org Music Lab level.
    A Music Lab level_data object has the following shape, all fields optional:

      {
        "library": "launch2024",       // sound library; "launch2024" is the standard pick
        "packId": "default",           // sound pack id; use "default" unless the prompt names a song
        "blockMode": "Simple2" | "Advanced",  // "Simple2" is the standard student-facing mode
        "toolbox": {                   // Blockly toolbox shown to the student
          "type": "category",          // "category" for advanced, omit for simple toolboxes
          "blocks": { ... }            // optional restricted block list
        },
        "startSources": {              // initial Blockly workspace
          "blocks": {
            "languageVersion": 0,
            "blocks": [
              { "type": "when_run", "x": 30, "y": 30 }
              // additional blocks the student will see when the level loads
            ]
          },
          "variables": [{"name": "currentTime"}, {"name": "i"}]
        }
      }

    Common Music Lab block types include:
      when_run                     - entry block, students place sounds beneath it
      play_sound_at_measure        - plays a single sound at a given measure
      play_sounds_together         - plays a list of sounds together
      set_volume                   - sets playback volume
      controls_repeat_ext          - repeat N times
      triggered_at                 - runs blocks when a trigger fires

    Output rules:
      - Respond with ONLY the JSON object for level_data. No prose, no markdown
        fences. Output must parse with JSON.parse.
      - Always include "library": "launch2024" unless the prompt explicitly
        names a different library.
      - Always include a "when_run" block in startSources.blocks.blocks.
      - Keep level_data compact; do not invent block types you are not sure exist.
  PROMPT

  def self.generate(prompt)
    LevelGeneratorHelper.generate_json(
      system_prompt: SYSTEM_PROMPT,
      user_prompt: prompt
    )
  rescue LevelGeneratorHelper::GenerationError => exception
    Rails.logger.warn("MusicLevelGenerator failed: #{exception.message}")
    nil
  end
end
