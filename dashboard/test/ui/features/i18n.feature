@no_circle
Feature: Hour of Code, Frozen, and Minecraft:Agent tutorials in various languages

Scenario: HoC tutorial in Spanish
  Given I am on "http://studio.code.org/hoc/15/lang/es"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element ".csf-top-instructions p" has "es" text from key "data.level.instructions.maze_2_14"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element ".csf-top-instructions p" has "es" text from key "data.level.instructions.maze_2_14"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Frozen tutorial in Spanish
  Given I am on "http://studio.code.org/s/frozen/stage/1/puzzle/2/lang/es"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element ".csf-top-instructions p" has "es" text from key "data.short_instructions.frozen perpendicular"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element ".csf-top-instructions p" has "es" text from key "data.short_instructions.frozen perpendicular"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Minecraft:Agent tutorial in Spanish
  Given I am on "http://studio.code.org/s/hero/stage/1/puzzle/1/lang/es"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element "#toggleButton" is visible
  And I click selector "#toggleButton"
  And I wait until element ".csf-top-instructions p" is visible
  And element ".csf-top-instructions p" has "es" text from key "data.short_instructions.MC_HOC_2017_01_RETRY"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Toolbox Categories in Spanish
  Given I am on "http://studio.code.org/s/allthethings/stage/3/puzzle/7/lang/es"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element ".blocklyTreeRoot #\\\:1" has "es" text from key "data.block_categories.Actions"
  Then element ".blocklyTreeRoot #\\\:2" has "es" text from key "data.block_categories.Color"
  Then element ".blocklyTreeRoot #\\\:3" has "es" text from key "data.block_categories.Category"
  Then element ".blocklyTreeRoot #\\\:4" has "es" text from key "data.block_categories.Functions"
  Then element ".blocklyTreeRoot #\\\:5" has "es" text from key "data.block_categories.Prebuilt"
  Then element ".blocklyTreeRoot #\\\:6" has "es" text from key "data.block_categories.Loops"
  Then element ".blocklyTreeRoot #\\\:7" has "es" text from key "data.block_categories.Logic"
  Then element ".blocklyTreeRoot #\\\:8" has "es" text from key "data.block_categories.Math"
  Then element ".blocklyTreeRoot #\\\:9" has "es" text from key "data.block_categories.Text"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Translated function names in Spanish
  Given I am on "http://studio.code.org/s/allthethings/stage/3/puzzle/3/lang/es"
  And I rotate to landscape
  And I wait for the page to fully load
  # Toolbox call block is translated
  Then element "[block-id=6] .blocklyText" has "es" text from key "data.function_names.draw a square"
  # Workspace call block is translated
  And element "[block-id=28] .blocklyText" has "es" text from key "data.function_names.draw a square"
  # Workspace definition block is translated
  And element "[block-id=29] > .blocklyNonEditableText > .blocklyText" has "es" text from key "data.function_names.draw a square"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: HoC tutorial in Portuguese
  Given I am on "http://studio.code.org/hoc/15/lang/pt-br"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element ".csf-top-instructions p" has "pt-BR" text from key "data.level.instructions.maze_2_14"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element ".csf-top-instructions p" has "pt-BR" text from key "data.level.instructions.maze_2_14"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

@no_circle
Scenario: Frozen tutorial in Portuguese
  Given I am on "http://studio.code.org/s/frozen/stage/1/puzzle/2/lang/pt-br"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element ".csf-top-instructions p" has "pt-BR" text from key "data.short_instructions.frozen perpendicular"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element ".csf-top-instructions p" has "pt-BR" text from key "data.short_instructions.frozen perpendicular"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Minecraft:Agent tutorial in Portuguese
  Given I am on "http://studio.code.org/s/hero/stage/1/puzzle/1/lang/pt-br"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element "#toggleButton" is visible
  And I click selector "#toggleButton"
  And I wait until element ".csf-top-instructions p" is visible
  And element ".csf-top-instructions p" has "pt-BR" text from key "data.short_instructions.MC_HOC_2017_01_RETRY"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Toolbox Categories in Portuguese
  Given I am on "http://studio.code.org/s/allthethings/stage/3/puzzle/7/lang/pt-br"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element ".blocklyTreeRoot #\\:1" has "pt-BR" text from key "data.block_categories.Actions"
  Then element ".blocklyTreeRoot #\\:2" has "pt-BR" text from key "data.block_categories.Color"
  Then element ".blocklyTreeRoot #\\:3" has "pt-BR" text from key "data.block_categories.Category"
  Then element ".blocklyTreeRoot #\\:4" has "pt-BR" text from key "data.block_categories.Functions"
  Then element ".blocklyTreeRoot #\\:5" has "pt-BR" text from key "data.block_categories.Prebuilt"
  Then element ".blocklyTreeRoot #\\:6" has "pt-BR" text from key "data.block_categories.Loops"
  Then element ".blocklyTreeRoot #\\:7" has "pt-BR" text from key "data.block_categories.Logic"
  Then element ".blocklyTreeRoot #\\:8" has "pt-BR" text from key "data.block_categories.Math"
  Then element ".blocklyTreeRoot #\\:9" has "pt-BR" text from key "data.block_categories.Text"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Translated function names in Portuguese
  Given I am on "http://studio.code.org/s/allthethings/stage/3/puzzle/3/lang/pt-BR"
  And I rotate to landscape
  And I wait for the page to fully load
  # Toolbox call block is translated
  Then element "[block-id=6] .blocklyText" has "pt-BR" text from key "data.function_names.draw a square"
  # Workspace call block is translated
  And element "[block-id=28] .blocklyText" has "pt-BR" text from key "data.function_names.draw a square"
  # Workspace definition block is translated
  And element "[block-id=29] > .blocklyNonEditableText > .blocklyText" has "pt-BR" text from key "data.function_names.draw a square"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: HoC tutorial in Arabic (RTL)
  Given I am on "http://studio.code.org/hoc/15/lang/ar-sa"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element ".csf-top-instructions p" has "ar-SA" text from key "data.level.instructions.maze_2_14"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element ".csf-top-instructions p" has "ar-SA" text from key "data.level.instructions.maze_2_14"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Frozen tutorial in Arabic (RTL)
  Given I am on "http://studio.code.org/s/frozen/stage/1/puzzle/2/lang/ar-sa"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element ".csf-top-instructions p" has "ar-SA" text from key "data.short_instructions.frozen perpendicular"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element ".csf-top-instructions p" has "ar-SA" text from key "data.short_instructions.frozen perpendicular"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Minecraft:Agent tutorial in Arabic (RTL)
  Given I am on "http://studio.code.org/s/hero/stage/1/puzzle/1/lang/ar-sa"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element "#toggleButton" is visible
  And I click selector "#toggleButton"
  And I wait until element ".csf-top-instructions p" is visible
  Then element ".csf-top-instructions p" has "ar-SA" text from key "data.short_instructions.MC_HOC_2017_01_RETRY"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Translated function names in Arabic
  Given I am on "http://studio.code.org/s/allthethings/stage/3/puzzle/3/lang/ar-SA"
  And I rotate to landscape
  And I wait for the page to fully load
  # Toolbox call block is translated
  Then element "[block-id=6] .blocklyText" has "ar-SA" text from key "data.function_names.draw a square"
  # Workspace call block is translated
  And element "[block-id=28] .blocklyText" has "ar-SA" text from key "data.function_names.draw a square"
  # Workspace definition block is translated
  And element "[block-id=29] > .blocklyNonEditableText > .blocklyText" has "ar-SA" text from key "data.function_names.draw a square"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Toolbox Categories in Arabic (RTL)
  Given I am on "http://studio.code.org/s/allthethings/stage/3/puzzle/7/lang/ar-sa"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element ".blocklyTreeRoot #\\:1" has "ar-SA" text from key "data.block_categories.Actions"
  Then element ".blocklyTreeRoot #\\:2" has "ar-SA" text from key "data.block_categories.Color"
  Then element ".blocklyTreeRoot #\\:3" has "ar-SA" text from key "data.block_categories.Category"
  Then element ".blocklyTreeRoot #\\:4" has "ar-SA" text from key "data.block_categories.Functions"
  Then element ".blocklyTreeRoot #\\:5" has "ar-SA" text from key "data.block_categories.Prebuilt"
  Then element ".blocklyTreeRoot #\\:6" has "ar-SA" text from key "data.block_categories.Loops"
  Then element ".blocklyTreeRoot #\\:7" has "ar-SA" text from key "data.block_categories.Logic"
  Then element ".blocklyTreeRoot #\\:8" has "ar-SA" text from key "data.block_categories.Math"
  Then element ".blocklyTreeRoot #\\:9" has "ar-SA" text from key "data.block_categories.Text"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: English fallback for missing dashboard or pegasus strings in Azerbaijani
  Given I am on "http://studio.code.org/lang/az-az"
  And I wait to see ".headerlink"
  Then element "#header-non-en-projects" contains text "Layihə qalereyası"
  But element "#header-non-en-courses" contains text "Course Catalog"
  Given I am on "http://code.org"
  And I wait to see ".headerlink"
  Then element "#header-non-en-projects" contains text "Layihə qalereyası"
  But element "#header-non-en-courses" contains text "Course Catalog"

Scenario: English fallback for missing apps string in Azerbaijani
  Given I am on "http://studio.code.org/s/sports/stage/1/puzzle/8/lang/az-az"
  And I wait for the page to fully load
  Then block "7" contains text "yeni top at"
  But block "8" contains text "set basketball scene"
