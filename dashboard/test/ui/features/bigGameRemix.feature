@dashboard_db_access
Feature: Big Game Remix

  Background:
    Given I am on "http://learn.code.org/"
    And I am a student
    And I am on "http://learn.code.org/users/sign_in"
    And I am on "http://learn.code.org/s/ui_tests/stage/4/puzzle/1?noautoplay=true"
    And I rotate to landscape
    And I press "x-close"
    And element "#runButton" is visible

  Scenario: Big Game Remix
    Then I press the first ".project_remix" element
    Then I wait until element ".project_updated_at" contains text "Saved"
    And check that the URL contains "http://learn.code.org/p/algebra_game"
    Then I am on "http://learn.code.org/p"
    And I wait until element ".projects td:eq(0)" contains text "Remix: Big Game Template"
