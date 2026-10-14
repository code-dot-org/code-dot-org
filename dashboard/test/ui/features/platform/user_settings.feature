@single_session
@skip
@playwright
Feature: Updating account settings

  # NOT PORTED: the #user_ai_rubrics_disabled checkbox and #edit-ai-settings
  # button were removed from /users/edit in 08a9aef1d0b (Sep 2024,
  # "Removes dead code in the settings page related to the AI rubrics
  # experiment"). The ai_rubrics_disabled field still exists on the User
  # model and is toggled via POST /api/v1/users/ai_rubrics_disabled from
  # in-app rubric components, but there is no UI on the settings page to
  # test. This feature should be deleted or replaced with an API-level test.
  #
  # Original comments preserved below:
  # Ensure that the checkbox persists when saved
  # We can, in the future, also peek at the level and see if the AI
  # components are there.
  # We can, in the future, remove the pilot steps guarding the
  # feature.
  Scenario: Teacher wants to disable AI rubrics
    Given I create a teacher named "Haplo"
    And I give user "Haplo" authorized teacher permission
    Given I am on "http://studio.code.org/users/edit"
    Then I wait to see "#user_ai_rubrics_disabled"
    And element "#user_ai_rubrics_disabled" is not checked
    And I press "#user_ai_rubrics_disabled" using jQuery
    And element "#user_ai_rubrics_disabled" is checked
    And I take note of the current loaded page
    And I press "#edit-ai-settings" using jQuery
    Then I wait until I am on a different page than I noted before
    Given I am on "http://studio.code.org/users/edit"
    Then I wait to see "#user_ai_rubrics_disabled"
    And element "#user_ai_rubrics_disabled" is checked
