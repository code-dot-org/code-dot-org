@no_mobile
@no_safari

Feature: Mix & Move with AI
Scenario: Dancer, music, dance

  ###
  ### Create a dancer
  ###

  Given I am on "http://studio.code.org/courses/mix-move-ai-2025/units/1/lessons/1/levels/3"
  And I rotate to landscape

  # Generate.
  And I wait until element "#creature" is visible
  And I select the "koala" option in dropdown "creature"
  And I press "generate-dancer-button"

  # Generate again.
  Then I wait until element "#back-to-prompt-button" is visible
  And I press "back-to-prompt-button"
  And I wait until element "#creature" is visible
  And I select the "axolotl" option in dropdown "creature"
  And I press "generate-dancer-button"

  # Regenerate.
  Then I wait until element "#regenerate-button" is visible
  And I press "regenerate-button"

  # Continue.
  Then I wait until element "#instructions-continue-button" is visible
  And I press "instructions-continue-button"

  ###
  ### Create music
  ###

  And I click selector "[title='Level 13 Lesson Mix & Move with AI']"

  # Select pack.
  And I wait until element ".pack-dialog-entry:first" is visible
  And I click selector ".pack-dialog-entry:first"
  And I press "pack-dialog-select-button"

  # Generate.
  And I wait until element "#mood" is visible
  And I select the "simple" option in dropdown "mood"
  And I select the "short" option in dropdown "length"
  And I select the "original" option in dropdown "drums"
  And I press "generate-code-button"

  # Generate again.
  Then I wait until element "#back-to-prompt-button" is visible
  And I press "back-to-prompt-button"
  And I wait until element "#mood" is visible
  And I select the "creative" option in dropdown "mood"
  And I select the "medium" option in dropdown "length"
  And I select the "electro" option in dropdown "drums"
  And I press "generate-code-button"

  # Regenerate.
  Then I wait until element "#regenerate-button" is visible
  And I press "regenerate-button"

  # Use code.
  Then I wait until element "#use-code-button" is visible
  And I press "use-code-button"

  # Modify code...

  # Click the field inside the first "play sound" block.
  And I click block field ".when_run_simple2 .play_sound_at_current_location_simple2:first > .blocklyEditableField"

  # Click on the second pack inside the sounds panel.
  And I click selector "#sounds-panel .sounds-panel-folder-row:nth-of-type(2)"

  # Click on the second sound inside the sounds panel.
  And I click selector "#sounds-panel .sounds-panel-sound-row:nth-of-type(2)"

  # Dismiss the sounds panel.
  And I press keys ":escape"

  # The sounds panel should be dismissed.
  And I wait until element "#sounds-panel" is not visible

  # Continue.
  And I press "instructions-continue-button"

  ###
  ### Create a dance
  ###

  And I click selector "[title='Level 14 Lesson Mix & Move with AI']"

  # Generate.
  And I wait until element "#complexity" is visible
  And I select the "basic" option in dropdown "complexity"
  And I select the "chill" option in dropdown "energy"
  And I select the "robots" option in dropdown "dancers"
  And I press "generate-dance-button"

  # Generate again.
  Then I wait until element "#back-to-prompt-button" is visible
  And I press "back-to-prompt-button"
  And I wait until element "#complexity" is visible
  And I select the "complex" option in dropdown "complexity"
  And I select the "high energy" option in dropdown "energy"
  And I select the "moose" option in dropdown "dancers"
  And I press "generate-dance-button"

  # Regenerate.
  Then I wait until element "#regenerate-button" is visible
  And I press "regenerate-button"

  # Use code.
  Then I wait until element "#use-code-button" is visible
  And I press "use-code-button"

  # Modify code...

  # Click the field inside the first "set background" block.
  And I click block ".Dancelab_whenRun .blocklyBlock:last"

  # Dismiss the sounds panel.
  And I press keys ":delete"

  # First tab.
  And I press "tab-button-Dancer"
  And I wait until element "#creature" is visible

  # Second tab.
  And I press "tab-button-Music"
  And I wait until element "#back-to-prompt-button" is visible

  # Third tab.
  And I press "tab-button-Dance"

  # Continue.
  And I wait until element "#instructions-continue-button" is visible
  And I press "instructions-continue-button"
  And I wait until element "#project-share-dialog" is visible
