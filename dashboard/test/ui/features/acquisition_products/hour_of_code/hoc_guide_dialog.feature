@skip
# This test is useful to reenable during hoc_mode 'soon-hoc' and 'actual-hoc'
# During all other hoc_modes, this dialog is not shown
Feature: HOC Guide Email Conversion Dialog

  @eyes
  Scenario: View and Close Dialog as signed in Instructor
    When I open my eyes to test "dialogForSignedInInstructor"
    Given I create a teacher named "Coach"
    And I sign in as "Coach"
    Then I am on "http://studio.code.org/s/allthethings/lessons/37/levels/2?noautoplay=true"
    And I see no difference for "signedInGuide"
    And I dismiss the hoc guide dialog
    And I wait for the lab page to fully load
    And I close my eyes

  Scenario: Send Email as signed In Instructor
    Given I create a teacher named "Coach"
    And I sign in as "Coach"
    Then I am on "http://studio.code.org/s/allthethings/lessons/37/levels/2?noautoplay=true"
    And I click selector "#uitest-email-guide" once I see it

  @eyes
  Scenario: View Dialog and send Email as signed out User
    When I open my eyes to test "dialogForSignedOutInstructor"
    Given I am on "http://studio.code.org/s/allthethings/lessons/37/levels/2?noautoplay=true"
    And I wait for the lab page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I select age 21 in the age dialog
    And I see no difference for "signedOutGuide"
    And I press keys "Simone" for element "input#uitest-hoc-guide-name"
    And I press keys "Simone@Biles.com" for element "input#uitest-hoc-guide-email"
    And I click selector "#uitest-email-guide" once I see it
    And I close my eyes
