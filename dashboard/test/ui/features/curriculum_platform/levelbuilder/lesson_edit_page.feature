# We need "press keys" to type into the React form's fields, but that doesn't work on IE.
@no_ie
@no_mobile
Feature: Using the Lesson Edit Page
  Scenario: Navigate from script edit page to lesson edit page
    Given I create a levelbuilder named "Levi"
    And I create a temp script and lesson
    And I view the temp script overview page
    And I view the temp script gui edit page

    # Open the lesson edit page
    And I click ".fa-pencil"
    And I switch tabs
    And I wait until element "#edit-container" is visible

    # Match the text 'Editing Lesson "Temp Lesson"'
    And element "h1" contains text "Editing Lesson"
    And element "h1" contains text "Temp Lesson"

    And I delete the temp script and lesson

  Scenario: Save changes using the lesson edit page
    Given I create a levelbuilder named "Levi"
    And I create a temp script and lesson
    And I view the temp lesson edit page

    # Match the text 'Editing Lesson "Temp Lesson"'
    And element "h1" contains text "Editing Lesson"
    And element "h1" contains text "Temp Lesson"

    And I click ".uitest-add-activity"
    And I wait until element ".uitest-activity-card" is visible

    And I press keys "Temp Activity" for element ".uitest-activity-name-input"
    And I click "button[type='submit']" to load a new page

    And I view the temp lesson edit page
    And element ".uitest-activity-name-input" has value "Temp Activity"

    And I delete the temp script and lesson
