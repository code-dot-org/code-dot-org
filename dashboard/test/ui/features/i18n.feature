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
