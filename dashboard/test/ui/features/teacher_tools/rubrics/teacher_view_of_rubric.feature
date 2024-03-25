@no_mobile
@no_safari
Feature: Teachers can see and give feedback on Rubrics

Scenario: Teachers can give and send feedback on the rubric to students.
  Given I create an authorized teacher-associated student named "Lillian"

  # Student can see the rubric and submit work
  And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2?enableExperiments=ai-rubrics"
  And I click selector ".uitest-taRubricTab" once I see it
  Then I wait to see "#runButton"
  And I press "runButton"
  And I wait to see "#submitButton"
  And I press "submitButton"
  And I wait to see "#confirm-button"
  And I press "confirm-button" to load a new page
  And I wait until element ".header_text" contains text "Dance"

  # Teacher can see and submit feedback for a student
  Then I sign in as "Teacher_Lillian" and go home
  And I add the current user to the "ai-rubrics" single section experiment for the "allthethings" course
  And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2?enableExperiments=ai-rubrics"
  And I wait to see "#ui-floatingActionButton"
  And I wait until element "#teacher-panel-container" is visible
  And I wait until element ".student-table" is visible
  And I click selector ".student-table tr:nth(1)" to load a new page
  And I click selector "#ui-floatingActionButton" once I see it
  And I wait until element "h5:contains(Code Quality)" is visible
  And I wait until element "button:contains(Extensive)" is visible
  Then I click selector "button:contains(Extensive)"
  And I wait until element "#ui-teacherFeedback" is enabled
  And I click selector "#ui-teacherFeedback" once I see it
  And I press keys "Nice work Lillian!" for element "#ui-teacherFeedback"
  And I wait to see "#ui-autosaveConfirm"
  And I click selector "#ui-submitFeedbackButton" once I see it
  And I wait to see "#ui-feedback-submitted-timestamp"
  And I wait until element "p:contains(Feedback submitted at)" is visible

  # Check that the teacher can see submitted feedback
  # FAB should be sticky and be open when page loads
  Then I reload the page
  And I wait until element "h5:contains(Code Quality)" is visible
  And I wait until element "textarea:contains(Nice work Lillian!)" is visible

  # The teacher given feedback is received by the student
  Then I sign in as "Lillian" and go home
  And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2?enableExperiments=ai-rubrics"
  And I click selector ".uitest-taRubricTab" once I see it
  And I wait until element "p:contains(Extensive Evidence)" is visible
  And I click selector "h6:contains(Code Quality)" once I see it
  And I wait until element "textarea:contains(Nice work Lillian!)" is visible

  @eyes
  Scenario: Teacher views Rubric and Settings tabs
    Given I create a teacher-associated student named "Aiden"
    And I sign in as "Teacher_Aiden" and go home
    And I add the current user to the "ai-rubrics" single section experiment for the "allthethings" course
    And I wait until element "#homepage-container" is visible
    And element "#sign_in_or_user" contains text "Teacher_Aiden"
    And I add the current user to the "ai-rubrics" single user experiment
    And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2"
    And I wait for the page to fully load
    And element ".teacher-panel td:eq(1)" contains text "Aiden"
    And I click selector ".teacher-panel td:eq(1)" to load a new page
    And I wait for the page to fully load

    When I open my eyes to test "teaching assistant rubric"
    Then I see no difference for "floating action button icon"

    When I click selector "#ui-floatingActionButton"
    And I wait until element ".uitest-rubric-tab-buttons:contains('Class Management')" is visible
    And I wait until element "h5:contains(Code Quality)" is visible
    Then I see no difference for "rubric tab, Code Quality learning goal"
    And element ".uitest-run-ai-assessment" is disabled
    And element ".uitest-info-alert" is visible

    When I click selector "#uitest-next-goal"
    And I wait until element "h5:contains(Sprites)" is visible
    Then I see no difference for "rubric tab, Sprites learning goal"

    When I click selector "button:contains('Class Management')"
    And I wait until element ".uitest-rubric-settings" is visible
    Then I see no difference for "rubric settings tab"

    Then I close my eyes
