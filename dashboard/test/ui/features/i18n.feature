Feature: Hour of Code and Frozen tutorial in Spanish and Portuguese

Scenario: HoC tutorial in Spanish
  Given I am on "http://learn.code.org/hoc/15/lang/es"
  And I rotate to landscape
  Then I wait to see a dialog titled "Puzzle 15 de 20"
  Then element ".modal-content p:nth-child(2)" has "es" text from key "data.level.instructions.maze_2_14"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element "#prompt" has "es" text from key "data.level.instructions.maze_2_14"
  Given I am on "http://learn.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Frozen tutorial in Spanish
  Given I am on "http://learn.code.org/s/frozen/stage/1/puzzle/2/lang/es"
  And I rotate to landscape
  Then I wait to see a dialog titled "Puzzle 2 de 20"
  Then element ".modal-content p:nth-child(2)" has "es" text from key "data.instructions.frozen perpendicular_instruction"
  And I close the dialog
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element "#prompt" has "es" text from key "data.instructions.frozen perpendicular_instruction"
  Given I am on "http://learn.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: HoC tutorial in Portuguese
  Given I am on "http://learn.code.org/hoc/15/lang/pt-br"
  And I rotate to landscape
  Then I wait to see a dialog titled "Desafio 15 de 20"
  Then element ".modal-content p:nth-child(2)" has "pt-br" text from key "data.level.instructions.maze_2_14"
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element "#prompt" has "pt-br" text from key "data.level.instructions.maze_2_14"
  Given I am on "http://learn.code.org/reset_session/lang/en"
  And I wait for 2 seconds

Scenario: Frozen tutorial in Portuguese
  Given I am on "http://learn.code.org/s/frozen/stage/1/puzzle/2/lang/pt-br"
  And I rotate to landscape
  Then I wait to see a dialog titled "Desafio 2 de 20"
  Then element ".modal-content p:nth-child(2)" has "pt-br" text from key "data.instructions.frozen perpendicular_instruction"
  And I close the dialog
  Then element "#runButton" is visible
  And element "#resetButton" is hidden
  Then element "#prompt" has "pt-br" text from key "data.instructions.frozen perpendicular_instruction"
  Given I am on "http://learn.code.org/reset_session/lang/en"
  And I wait for 2 seconds
  