Feature: See Hour of Code and Frozen tutorial in Spanish, Portuguese, and Arabic then reset back to English

Scenario: HoC tutorial in Spanish
  Given I am on "http://learn.code.org/s/20-hour/stage/2/puzzle/16/lang/es"
  And I rotate to landscape
  And I wait to see "#x-close"
  And I press "x-close"
  Then element ".dialog-title" has text "Puzzle 16 de 20"
  Then element ".modal-content p:nth-child(2)" has "es" text from key "data.level.instructions.maze_2_15"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element "#prompt" has "es" text from key "data.level.instructions.maze_2_15"
  Given I am on "http://learn.code.org/reset_session/lang/en"

Scenario: Frozen tutorial in Spanish
  Given I am on "http://learn.code.org/s/frozen/stage/1/puzzle/2/lang/es"
  And I rotate to landscape
  And I wait to see "#x-close"
  Then element ".dialog-title" has text "Puzzle 2 de 20"
  Then element ".modal-content p:nth-child(2)" has "es" text from key "data.instructions.frozen perpendicular_instruction"
  And I press "x-close"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element "#prompt" has "es" text from key "data.instructions.frozen perpendicular_instruction"
  Given I am on "http://learn.code.org/reset_session/lang/en"

Scenario: HoC tutorial in Portuguese
  Given I am on "http://learn.code.org/s/20-hour/stage/2/puzzle/16/lang/pt-br"
  And I rotate to landscape
  And I wait to see "#x-close"
  And I press "x-close"
  Then element ".dialog-title" has text "Desafio 16 de 20"
  Then element ".modal-content p:nth-child(2)" has "pt-br" text from key "data.level.instructions.maze_2_15"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element "#prompt" has "pt-br" text from key "data.level.instructions.maze_2_15"
  Given I am on "http://learn.code.org/reset_session/lang/en"

Scenario: Frozen tutorial in Portuguese
  Given I am on "http://learn.code.org/s/frozen/stage/1/puzzle/2/lang/pt-br"
  And I rotate to landscape
  And I wait to see "#x-close"
  Then element ".dialog-title" has text "Desafio 2 de 20"
  Then element ".modal-content p:nth-child(2)" has "pt-br" text from key "data.instructions.frozen perpendicular_instruction"
  And I press "x-close"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element "#prompt" has "pt-br" text from key "data.instructions.frozen perpendicular_instruction"
  Given I am on "http://learn.code.org/reset_session/lang/en"

Scenario: HoC tutorial in Arabic
  Given I am on "http://learn.code.org/s/20-hour/stage/2/puzzle/16/lang/ar"
  And I rotate to landscape
  And I wait to see "#x-close"
  And I press "x-close"
  Then element ".dialog-title" has text "اللغز 16 من 20"
  Then element ".modal-content p:nth-child(2)" has "ar" text from key "data.level.instructions.maze_2_15"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element "#prompt" has "ar" text from key "data.level.instructions.maze_2_15"
  Given I am on "http://learn.code.org/reset_session/lang/en"

Scenario: Frozen tutorial in Arabic
  Given I am on "http://learn.code.org/s/frozen/stage/1/puzzle/2/lang/ar"
  And I rotate to landscape
  And I wait to see "#x-close"
  Then element ".dialog-title" has text "اللغز 2 من 20"
  Then element ".modal-content p:nth-child(2)" has "ar" text from key "data.instructions.frozen perpendicular_instruction"
  And I press "x-close"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element "#prompt" has "ar" text from key "data.instructions.frozen perpendicular_instruction"
  Given I am on "http://learn.code.org/reset_session/lang/en"
