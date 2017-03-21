@dashboard_db_access
@eyes

Feature: Workshop Survey Eyes test

Scenario: Basic Workshop Survey Form
  Given I am a teacher who has just followed a survey link
  And I open my eyes to test "workshop survey"
  And I wait to see element with ID "pd-workshop-survey-form"
  And I see no difference for "viewing workshop survey"
  And I press "btn-submit"
  And I wait to see element with ID "error-message"
  And I see no difference for "viewing workshop survey without consent"
  And I select value "1" for input name "consent_b"
  And I press "btn-submit"
  And I wait to see element with ID "error-message"
  And I see no difference for "viewing workshop survey with consent"
  And I close my eyes
