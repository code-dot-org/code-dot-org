@eyes
Feature: HOC Guide Email Conversion Dialog

  Scenario: View and Close Dialog as signed in Instructor
    When I open my eyes to test "signedIn"
    Given I create a teacher named "Coach"
    And I sign in as "Coach"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/2"
    And I see no difference for "signedInGuide"
    And I dismiss the hoc guide dialog
    And I wait for the page to fully load
    And I close my eyes

  Scenario: Send Email as signed In Instructor
    Given I create a teacher named "Coach"
    And I sign in as "Coach"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/2"
    And I click selector "#uitest-email-guide" once I see it

  Scenario: View Dialog and send Email as signed out User
    When I open my eyes to test "signedOut"
    Given I am on "http://studio.code.org/s/allthethings/lessons/37/levels/2?noautoplay=true"
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I select age 21+ in the age dialog
    And I see no difference for "signedOutGuide"
    And I press keys "Simone" for element "input#uitest-hoc-guide-name"
    And I press keys "Simone@Biles.com" for element "input#uitest-hoc-guide-email"
    And I click selector "#uitest-email-guide" once I see it
    And I close my eyes
