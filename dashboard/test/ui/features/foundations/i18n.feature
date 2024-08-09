@single_session
Feature: Hour of Code, Frozen, and Minecraft:Agent tutorials in various languages

Scenario: HoC tutorial in Spanish
  Given I am on "http://studio.code.org/hoc/15/lang/es-MX"
  And I wait for the lab page to fully load
  Then element ".csf-top-instructions p" has "es-MX" text from key "data.level.instructions.maze_2_14"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element ".csf-top-instructions p" has "es-MX" text from key "data.level.instructions.maze_2_14"

Scenario: Frozen tutorial in Spanish
  Given I am on "http://studio.code.org/s/frozen/lessons/1/levels/2/lang/es-MX"
  And I wait for the lab page to fully load
  Then element ".csf-top-instructions p" has "es-MX" text from key "data.short_instructions.frozen perpendicular"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element ".csf-top-instructions p" has "es-MX" text from key "data.short_instructions.frozen perpendicular"

Scenario: Minecraft:Agent tutorial in Spanish
  Given I am on "http://studio.code.org/s/hero/lessons/1/levels/1/lang/es-MX"
  And I wait for the lab page to fully load
  Then element "#toggleButton" is visible
  And I click selector "#toggleButton"
  And I wait until element ".csf-top-instructions p" is visible
  And element ".csf-top-instructions p" has "es-MX" text from key "data.short_instructions.MC_HOC_2017_01_RETRY"

Scenario: Toolbox Categories in Spanish
  Given I am on "http://studio.code.org/s/allthethings/lessons/45/levels/4/lang/es-MX"
  And I wait for the lab page to fully load
  Then element "#blockly-0" has "es-MX" text from key "data.block_categories.Events"
  Then element "#blockly-1" has "es-MX" text from key "data.block_categories.Text"
  Then element "#blockly-2" has "es-MX" text from key "data.block_categories.Variables"
  Then element "#blockly-3" has "es-MX" text from key "data.block_categories.Effects"
  Then element "#blockly-4" has "es-MX" text from key "data.block_categories.Sprites"
  Then element "#blockly-5" has "es-MX" text from key "data.block_categories.Functions"
  Then element "#blockly-6" has "es-MX" text from key "data.block_categories.Variables"

Scenario: Translated function names in Spanish
  Given I am on "http://studio.code.org/s/allthethings/lessons/4/levels/6/lang/es-MX"
  And I wait for the lab page to fully load
  # Toolbox call block is translated
  Then element "[data-id='toolboxCallBlock'] .blocklyText" has "es-MX" text from key "data.function_definitions.2-3 Bee Functions 2.get 5.name"
  # Workspace call block is translated
  And element "[data-id='workspaceCallBlock'] .blocklyText" has "es-MX" text from key "data.function_definitions.2-3 Bee Functions 2.get 5.name"
  # Workspace definition block is translated
  And element "[data-id='definitionBlock'] > .blocklyNonEditableText > .blocklyText" has "es-MX" text from key "data.function_definitions.2-3 Bee Functions 2.get 5.name"

Scenario: HoC tutorial in Portuguese
  Given I am on "http://studio.code.org/hoc/15/lang/pt-br"
  And I wait for the lab page to fully load
  Then element ".csf-top-instructions p" has "pt-BR" text from key "data.level.instructions.maze_2_14"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element ".csf-top-instructions p" has "pt-BR" text from key "data.level.instructions.maze_2_14"

@no_circle
Scenario: Frozen tutorial in Portuguese
  Given I am on "http://studio.code.org/s/frozen/lessons/1/levels/2/lang/pt-br"
  And I wait for the lab page to fully load
  Then element ".csf-top-instructions p" has "pt-BR" text from key "data.short_instructions.frozen perpendicular"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element ".csf-top-instructions p" has "pt-BR" text from key "data.short_instructions.frozen perpendicular"

Scenario: Minecraft:Agent tutorial in Portuguese
  Given I am on "http://studio.code.org/s/hero/lessons/1/levels/1/lang/pt-br"
  And I wait for the lab page to fully load
  Then element "#toggleButton" is visible
  And I click selector "#toggleButton"
  And I wait until element ".csf-top-instructions p" is visible
  And element ".csf-top-instructions p" has "pt-BR" text from key "data.short_instructions.MC_HOC_2017_01_RETRY"

Scenario: Toolbox Categories in Portuguese
  Given I am on "http://studio.code.org/s/allthethings/lessons/45/levels/4/lang/pt-br"
  And I wait for the lab page to fully load
  Then element "#blockly-0" has "pt-BR" text from key "data.block_categories.Events"
  Then element "#blockly-1" has "pt-BR" text from key "data.block_categories.Text"
  Then element "#blockly-2" has "pt-BR" text from key "data.block_categories.Variables"
  Then element "#blockly-3" has "pt-BR" text from key "data.block_categories.Effects"
  Then element "#blockly-4" has "pt-BR" text from key "data.block_categories.Sprites"
  Then element "#blockly-5" has "pt-BR" text from key "data.block_categories.Functions"
  Then element "#blockly-6" has "pt-BR" text from key "data.block_categories.Variables"

Scenario: Translated function names in Portuguese
  Given I am on "http://studio.code.org/s/allthethings/lessons/4/levels/6/lang/pt-BR"
  And I wait for the lab page to fully load
  # Toolbox call block is translated
  Then element "[data-id='toolboxCallBlock'] .blocklyText" has "pt-BR" text from key "data.function_definitions.2-3 Bee Functions 2.get 5.name"
  # Workspace call block is translated
  And element "[data-id='workspaceCallBlock'] .blocklyText" has "pt-BR" text from key "data.function_definitions.2-3 Bee Functions 2.get 5.name"
  # Workspace definition block is translated
  And element "[data-id='definitionBlock'] > .blocklyNonEditableText > .blocklyText" has "pt-BR" text from key "data.function_definitions.2-3 Bee Functions 2.get 5.name"

Scenario: HoC tutorial in Arabic (RTL)
  Given I am on "http://studio.code.org/hoc/15/lang/ar-sa"
  And I wait for the lab page to fully load
  Then element ".csf-top-instructions p" has "ar-SA" text from key "data.level.instructions.maze_2_14"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element ".csf-top-instructions p" has "ar-SA" text from key "data.level.instructions.maze_2_14"

Scenario: Frozen tutorial in Arabic (RTL)
  Given I am on "http://studio.code.org/s/frozen/lessons/1/levels/2/lang/ar-sa"
  And I wait for the lab page to fully load
  Then element ".csf-top-instructions p" has "ar-SA" text from key "data.short_instructions.frozen perpendicular"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element ".csf-top-instructions p" has "ar-SA" text from key "data.short_instructions.frozen perpendicular"

Scenario: Minecraft:Agent tutorial in Arabic (RTL)
  Given I am on "http://studio.code.org/s/hero/lessons/1/levels/1/lang/ar-sa"
  And I wait for the lab page to fully load
  Then element "#toggleButton" is visible
  And I click selector "#toggleButton"
  And I wait until element ".csf-top-instructions p" is visible
  Then element ".csf-top-instructions p" has "ar-SA" text from key "data.short_instructions.MC_HOC_2017_01_RETRY"

Scenario: Translated function names in Arabic
  Given I am on "http://studio.code.org/s/allthethings/lessons/4/levels/6/lang/ar-SA"
  And I wait for the lab page to fully load
  # Toolbox call block is translated
  Then element "[data-id='toolboxCallBlock'] .blocklyText" has "ar-SA" text from key "data.function_definitions.2-3 Bee Functions 2.get 5.name"
  # Workspace call block is translated
  And element "[data-id='workspaceCallBlock'] .blocklyText" has "ar-SA" text from key "data.function_definitions.2-3 Bee Functions 2.get 5.name"
  # Workspace definition block is translated
  And element "[data-id='definitionBlock'] > .blocklyNonEditableText > .blocklyText" has "ar-SA" text from key "data.function_definitions.2-3 Bee Functions 2.get 5.name"

Scenario: Toolbox Categories in Arabic (RTL)
  Given I am on "http://studio.code.org/s/allthethings/lessons/45/levels/4/lang/ar-sa"
  And I wait for the lab page to fully load
  Then element "#blockly-0" has "ar-SA" text from key "data.block_categories.Events"
  Then element "#blockly-1" has "ar-SA" text from key "data.block_categories.Text"
  Then element "#blockly-2" has "ar-SA" text from key "data.block_categories.Variables"
  Then element "#blockly-3" has "ar-SA" text from key "data.block_categories.Effects"
  Then element "#blockly-4" has "ar-SA" text from key "data.block_categories.Sprites"
  Then element "#blockly-5" has "ar-SA" text from key "data.block_categories.Functions"
  Then element "#blockly-6" has "ar-SA" text from key "data.block_categories.Variables"

Scenario: Pixelation Widget long and short instructions in Spanish
  Given I am on "http://studio.code.org/s/allthethings/lessons/17/levels/2/lang/es-MX"
  # We cannot use 'fully load' because that assumes there is a run button
  # and the Pixelation widget has no such button. Instead, we wait until the
  # instructions dialog appears, which appears dynamically at the 'ready' event,
  # but just in case, we click on the short instructions div which also brings
  # it up for us, since a video might pop up first, instead.
  And I click selector "#below_viz_instructions" once I see it
  And I wait to see ".markdown-instructions-container"
  Then element ".markdown-instructions-container .instructions-markdown > div" has "es-MX" markdown from key "data.long_instructions.AllTheThings: Pixelation - Lesson 15 - Complete 3-bit color"
  Then element "#below_viz_instructions" has "es-MX" text from key "data.short_instructions.AllTheThings: Pixelation - Lesson 15 - Complete 3-bit color"
