@dashboard_db_access
@eyes

Feature: Workshop Survey Eyes test

Scenario: Basic Workshop Survey Form
  Given I am a teacher who has just followed a survey link
  And I open my eyes to test "workshop survey"
  And I wait to see element with ID "pd-workshop-survey-form"
  Then I see no difference for "viewing workshop survey"

  When I press "btn-submit"
  And I wait to see element with ID "error-message"
  Then I see no difference for "viewing workshop survey without consent"

  When I select value "1" for input name "consent_b"
  And I press "btn-submit"
  And I wait to see element with ID "error-message"
  Then I see no difference for "viewing workshop survey with consent"
  And I close my eyes

Scenario: Workshop Survey Facilitator-specific questions
  Given I am a teacher who has just followed a survey link
  And I wait to see element with ID "pd-workshop-survey-form"
  And I open my eyes to test "workshop survey with facilitator questions"

  When I select the 0th value for input name "who_facilitated_ss[]"
  Then I see no difference for "viewing workshop survey single facilitator"

  When I press "btn-submit"
  And I wait to see element with ID "error-message"
  Then I see no difference for "viewing workshop survey single facilitator with errors"

  When I select the 1st value for input name "who_facilitated_ss[]"
  Then I see no difference for "viewing workshop survey multiple facilitators"

  When I press "btn-submit"
  And I wait to see element with ID "error-message"
  Then I see no difference for "viewing workshop survey multiple facilitators with errors"
