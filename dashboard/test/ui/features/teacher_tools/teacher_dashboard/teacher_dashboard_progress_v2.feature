@no_mobile
Feature: Using the V2 teacher dashboard

Scenario: Teacher can open and close Icon Key and details
  Given I create an authorized teacher-associated student named "Sally"
  Given I am assigned to unit "allthethings"
  And I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1"

  When I sign in as "Teacher_Sally" and go home
  And I get levelbuilder access
  When I click selector "a:contains(Untitled Section)" once I see it to load a new page
  And I wait until element "#uitest-teacher-dashboard-nav" is visible
  And check that the URL contains "/teacher_dashboard/sections/"
  And I wait until element "#uitest-course-dropdown" is visible
  Then I append "/?enableExperiments=section_progress_v2" to the URL

  # toggle to V2 progress view
  Then I click selector "#ui-test-link-to-new-progress-view"
  And I wait until element "h6:contains(Icon Key)" is visible
  And I wait until element "#ui-test-progress-table-v2" is visible
  And element "#ui-test-progress-table-v2" is visible 

  # Teacher can minimize icon key
  And I wait until element "strong:contains(Assignment Completion States)" is visible
  Then I click selector "h6:contains('Icon Key')"
  And element "strong:contains(Assignment Completion States)" is hidden
  Then I click selector "h6:contains('Icon Key')"
  And I wait until element "strong:contains(Assignment Completion States)" is visible

  # Teacher can open the more details of the icon key and close it
  Then I click selector "a:contains('More Details')"
  And I wait until element "h3:contains(Progress Tracking Icon Key)" is visible
  And I click selector "#ui-close-dialog"
  And element "h3:contains(Progress Tracking Icon Key)" is hidden