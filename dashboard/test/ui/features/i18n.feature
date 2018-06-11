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
  Then element ".csf-top-instructions p" has "es" text from key "data.instructions.frozen perpendicular_instruction"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element ".csf-top-instructions p" has "es" text from key "data.instructions.frozen perpendicular_instruction"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Minecraft:Agent tutorial in Spanish
  Given I am on "http://studio.code.org/s/hero/stage/1/puzzle/1/lang/es"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element ".csf-top-instructions p" has "es" text from key "data.instructions.MC_HOC_2017_01_RETRY_instruction"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Toolbox Categories in Spanish
  Given I am on "http://studio.code.org/s/allthethings/stage/3/puzzle/7/lang/es"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element ".blocklyTreeRoot #:1" has "es" text from key "data.block_categories.Actions"
  Then element ".blocklyTreeRoot #:2" has "es" text from key "data.block_categories.Color"
  Then element ".blocklyTreeRoot #:3" has "es" text from key "data.block_categories.Category"
  Then element ".blocklyTreeRoot #:4" has "es" text from key "data.block_categories.Functions"
  Then element ".blocklyTreeRoot #:5" has "es" text from key "data.block_categories.Prebuilt"
  Then element ".blocklyTreeRoot #:6" has "es" text from key "data.block_categories.Loops"
  Then element ".blocklyTreeRoot #:7" has "es" text from key "data.block_categories.Logic"
  Then element ".blocklyTreeRoot #:8" has "es" text from key "data.block_categories.Math"
  Then element ".blocklyTreeRoot #:9" has "es" text from key "data.block_categories.Text"
  Then element ".blocklyTreeRoot #:10" has "es" text from key "data.block_categories.Variables"
  Then element ".blocklyTreeRoot #:11" has "es" text from key "data.block_categories.Picker"
  Then element ".blocklyTreeRoot #:12" has "es" text from key "data.block_categories.Comment"
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
  Then element ".csf-top-instructions p" has "pt-BR" text from key "data.instructions.frozen perpendicular_instruction"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element ".csf-top-instructions p" has "pt-BR" text from key "data.instructions.frozen perpendicular_instruction"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Minecraft:Agent tutorial in Portuguese
  Given I am on "http://studio.code.org/s/hero/stage/1/puzzle/1/lang/pt-br"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element ".csf-top-instructions p" has "pt-BR" text from key "data.instructions.MC_HOC_2017_01_RETRY_instruction"
  Given I am on "http://studio.code.org/reset_session/lang/pt-BR"
  And I wait for 2 seconds

Scenario: Toolbox Categories in Portuguese
  Given I am on "http://studio.code.org/s/allthethings/stage/3/puzzle/7/lang/pt-br"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element ".blocklyTreeRoot #:1" has "pt-BR" text from key "data.block_categories.Actions"
  Then element ".blocklyTreeRoot #:2" has "pt-BR" text from key "data.block_categories.Color"
  Then element ".blocklyTreeRoot #:3" has "pt-BR" text from key "data.block_categories.Category"
  Then element ".blocklyTreeRoot #:4" has "pt-BR" text from key "data.block_categories.Functions"
  Then element ".blocklyTreeRoot #:5" has "pt-BR" text from key "data.block_categories.Prebuilt"
  Then element ".blocklyTreeRoot #:6" has "pt-BR" text from key "data.block_categories.Loops"
  Then element ".blocklyTreeRoot #:7" has "pt-BR" text from key "data.block_categories.Logic"
  Then element ".blocklyTreeRoot #:8" has "pt-BR" text from key "data.block_categories.Math"
  Then element ".blocklyTreeRoot #:9" has "pt-BR" text from key "data.block_categories.Text"
  Then element ".blocklyTreeRoot #:10" has "pt-BR" text from key "data.block_categories.Variables"
  Then element ".blocklyTreeRoot #:11" has "pt-BR" text from key "data.block_categories.Picker"
  Then element ".blocklyTreeRoot #:12" has "pt-BR" text from key "data.block_categories.Comment"
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
  Then element ".csf-top-instructions p" has "ar-SA" text from key "data.instructions.frozen perpendicular_instruction"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element ".csf-top-instructions p" has "ar-SA" text from key "data.instructions.frozen perpendicular_instruction"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Minecraft:Agent tutorial in Arabic (RTL)
  Given I am on "http://studio.code.org/s/hero/stage/1/puzzle/1/lang/ar-sa"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element ".csf-top-instructions p" has "ar-SA" text from key "data.instructions.MC_HOC_2017_01_RETRY_instruction"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Toolbox Categories in Arabic (RTL)
  Given I am on "http://studio.code.org/s/allthethings/stage/3/puzzle/7/lang/ar-sa"
  And I rotate to landscape
  And I wait for the page to fully load
  Then element ".blocklyTreeRoot #:1" has "ar-SA" text from key "data.block_categories.Actions"
  Then element ".blocklyTreeRoot #:2" has "ar-SA" text from key "data.block_categories.Color"
  Then element ".blocklyTreeRoot #:3" has "ar-SA" text from key "data.block_categories.Category"
  Then element ".blocklyTreeRoot #:4" has "ar-SA" text from key "data.block_categories.Functions"
  Then element ".blocklyTreeRoot #:5" has "ar-SA" text from key "data.block_categories.Prebuilt"
  Then element ".blocklyTreeRoot #:6" has "ar-SA" text from key "data.block_categories.Loops"
  Then element ".blocklyTreeRoot #:7" has "ar-SA" text from key "data.block_categories.Logic"
  Then element ".blocklyTreeRoot #:8" has "ar-SA" text from key "data.block_categories.Math"
  Then element ".blocklyTreeRoot #:9" has "ar-SA" text from key "data.block_categories.Text"
  Then element ".blocklyTreeRoot #:10" has "ar-SA" text from key "data.block_categories.Variables"
  Then element ".blocklyTreeRoot #:11" has "ar-SA" text from key "data.block_categories.Picker"
  Then element ".blocklyTreeRoot #:12" has "ar-SA" text from key "data.block_categories.Comment"
  Given I am on "http://studio.code.org/reset_session/lang/en"
  And I wait for 2 seconds
