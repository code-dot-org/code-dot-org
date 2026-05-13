@dashboard_db_access
@eyes
Feature: Workshop View

Scenario: Workshop Overview, Enrollment, Attendance and Surveys
  Given I am an organizer with a completed course
  Then I submit post byo workshop surveys
  And I am viewing a workshop in the workshop dashboard

  # Workshop Overview
  And I open my eyes to test "Workshop View"
  And I see no difference for "Workshop Overview"

  # Workshop Enrollment
  And I click selector "button:contains('Enrollment')"
  Then I wait until element "table[aria-label='Workshop enrollments']" is visible
  Then I wait until element "button[aria-label='Refresh enrollment table data']" is visible
  Then I wait until element "button[aria-label='Export all enrollment data as csv']" is visible

  # Workshop Attendance
  And I click selector "button:contains('Attendance')"
  Then I wait until element "h2" contains text "Take Attendance"
  And I see no difference for "Workshop Attendance"

  # Workshop Post Survey
  And I click selector "button:contains('Surveys')"
  Then I wait until element "select[name='survey type selection']" is visible
  And I select the "Post-workshop survey" option in dropdown named "'survey type selection'"

  Then I wait until element "button" contains text "Implementation"
  And I click selector "button:contains('Implementation')"
  And I see no difference for "Workshop Post Survey Category: Implementation"

  Then I wait until element "button" contains text "Engagement"
  And I click selector "button:contains('Engagement')"
  And I see no difference for "Workshop Post Survey Category: Engagement"

  Then I wait until element "button" contains text "Logistics"
  And I click selector "button:contains('Logistics')"
  And I see no difference for "Workshop Post Survey Category: Logistics"

  Then I wait until element "button" contains text "Facilitator Feedback"
  And I click selector "button:contains('Facilitator Feedback')"
  And I see no difference for "Workshop Post Survey Category: Facilitator Feedback"

  Then I wait until element "button" contains text "Other"
  And I click selector "button:contains('Other')"
  And I see no difference for "Workshop Post Survey Category: Other"

  And I close my eyes
  And I clean up my records
  
