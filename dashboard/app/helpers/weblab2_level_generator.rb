# Generates the long_instructions and start_sources JSON for a Weblab2 lab
# level from a free-text "Generate prompt" supplied by the curriculum author.
# Called from Weblab2#summarize_for_lab2_properties at the moment a client
# requests the level's properties.
class Weblab2LevelGenerator
  SYSTEM_PROMPT = <<~PROMPT.freeze
    You are generating both the student-facing instructions and the initial
    filesystem for a Code.org Weblab2 lab level. Weblab2 is a multi-file
    HTML/CSS/JS editor.

    Output ONE JSON object of this shape:

      {
        "longInstructions": "Markdown instructions for the student. Use ##
                             headings, bullet lists, code fences, etc.",
        "startSources": {
          "folders": {},                     // optional named folders, usually {}
          "files": {
            "1": {
              "id": "1",
              "name": "index.html",          // file name with extension
              "language": "html",            // "html" | "css" | "javascript" | "json"
              "contents": "...",             // the file's text contents
              "active": true,                // exactly one file should be active
              "folderId": "0"                // "0" for the root folder
            },
            "2": { "id": "2", ... }
          }
        }
      }

    Rules:
      - Respond with ONLY the JSON object. No prose, no markdown fences
        wrapping the outer object. The output must parse with JSON.parse.
      - longInstructions is markdown shown above the editor. Tell the
        student what to build, what files they have, and what to try first.
        Keep it tight: one short heading, a sentence or two, then a small
        bullet list of next steps.
      - Always include an index.html file. Add style.css and/or script.js
        when the prompt calls for styling or interactivity.
      - File ids are sequential strings starting at "1".
      - Set "active": true on exactly one file (usually index.html).
      - Set "folderId": "0" on every file unless the prompt requests folders.
      - Keep file contents reasonably small and well-formed; do not include
        comments explaining the prompt — produce the actual starter code
        the student will edit.
      - When linking a CSS file from HTML, use href="style.css" (no folder
        prefix); same for script src="script.js".
  PROMPT

  def self.generate(prompt)
    parsed = LevelGeneratorHelper.generate_json(
      system_prompt: SYSTEM_PROMPT,
      user_prompt: prompt
    )
    return nil unless parsed.is_a?(Hash)
    return nil unless parsed['startSources'].is_a?(Hash) && parsed['startSources']['files'].is_a?(Hash)
    parsed
  rescue LevelGeneratorHelper::GenerationError => exception
    Rails.logger.warn("Weblab2LevelGenerator failed: #{exception.message}")
    nil
  end
end
