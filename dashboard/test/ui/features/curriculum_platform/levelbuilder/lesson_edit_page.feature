# We need "press keys" to type into the React form's fields, but that doesn't work on IE.
@no_ie
@no_mobile
Feature: Using the Lesson Edit Page
  Scenario: Save changes using the lesson edit page
    Given I create a levelbuilder named "Levi"
    And I create a temp script and lesson
    And I view the temp lesson edit page

    # Match the text 'Editing Lesson "Temp Lesson"'
    And element "h1" contains text "Editing Lesson"
    And element "h1" contains text "Temp Lesson"

    And element ".uitest-activity-card" is visible

    And I press keys "Temp Activity" for element ".uitest-activity-name-input"
    And I press backspace to clear element ".uitest-activity-duration-input"
    And I press keys "15" for element ".uitest-activity-duration-input"
    And I click "button[type='submit']" to load a new page

    # Make sure the lesson overview page updated correctly
    And I wait until element "#show-container" is visible
    And element "h2" contains text "Temp Activity (15 minutes)"

    # Make sure the lesson edit page updated correctly
    And I view the temp lesson edit page
    And element ".uitest-activity-name-input" has value "Temp Activity"
    And element ".uitest-activity-duration-input" has value "15"

    And I delete the temp script and lesson
