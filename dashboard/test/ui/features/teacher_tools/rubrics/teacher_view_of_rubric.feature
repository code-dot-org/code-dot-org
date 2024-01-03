@no_mobile
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
  And I press "confirm-button"
  And I wait to see "#song_selector"

  # Teacher can see and submit feedback for a student
  Then I sign in as "Teacher_Lillian" and go home
  And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2?enableExperiments=ai-rubrics"
  And I wait to see "#ui-floatingActionButton"
  And I wait until element "#teacher-panel-container" is visible
  And I wait until element ".student-table" is visible
  And I click selector ".student-table tr:nth(1)" to load a new page
  And I click selector "#ui-floatingActionButton" once I see it
  And I click selector "strong:contains(Code Quality)" once I see it
  And I wait until element "span:contains(Extensive Evidence)" is visible
  Then I click selector "span:contains(Extensive Evidence)"
  And I click selector "#ui-teacherFeedback" once I see it
  And I press keys "Nice work Lillian!" for element "#ui-teacherFeedback"
  And I wait to see "#ui-autosaveConfirm"
  And I click selector "#ui-submitFeedbackButton" once I see it
  And I wait to see "#ui-feedback-submitted-timestamp"
  And I wait until element "p:contains(Feedback submitted at)" is visible

  # Check that the teacher can see submitted feedback
  Then I reload the page
  And I click selector "#ui-floatingActionButton" once I see it
  And I click selector "strong:contains(Code Quality)" once I see it
  And I wait until element "textarea:contains(Nice work Lillian!)" is visible

  # The teacher given feedback is recieved by the student
  Then I sign in as "Lillian" and go home
  And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2?enableExperiments=ai-rubrics"
  And I click selector ".uitest-taRubricTab" once I see it
  And I wait until element "p:contains(Extensive Evidence)" is visible
  And I click selector "strong:contains(Code Quality)" once I see it
  And I wait until element "textarea:contains(Nice work Lillian!)" is visible

  @eyes
  Scenario: Teacher views Rubric and Settings tabs, without accordion experiment
    Given I create a teacher-associated student named "Aiden"
    And I sign in as "Teacher_Aiden" and go home
    And I wait until element "#homepage-container" is visible
    And element "#sign_in_or_user" contains text "Teacher_Aiden"
    And I add the current user to the "ai-rubrics" single user experiment
    And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2"
    And I wait for the page to fully load
    And element ".teacher-panel td:eq(1)" contains text "Aiden"
    And I click selector ".teacher-panel td:eq(1)" to load a new page
    And I wait for the page to fully load

    When I open my eyes to test "teaching assistant rubric"
    Then I see no difference for "floating action button icon - ai bot"

    When I click selector "#ui-floatingActionButton"
    And I wait until element ".uitest-rubric-header-tab:contains('Settings')" is visible
    And I wait until element "summary:contains(Code Quality)" is visible
    And element "details:contains(Code Quality)" is not open
    Then I see no difference for "rubric tab with learning goals collapsed"

    When I click selector "summary:contains(Code Quality)"
    And I wait until element "details:contains(Code Quality)" is open
    Then I see no difference for "rubric tab with learning goal expanded"

    When I click selector ".uitest-rubric-header-tab:contains('Settings')"
    And I wait until element ".uitest-rubric-settings" is visible
    And element ".uitest-run-ai-assessment" is disabled
    And element ".uitest-eval-status-text" is visible
    Then I see no difference for "rubric settings tab"

    Then I close my eyes
