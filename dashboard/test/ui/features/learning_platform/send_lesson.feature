@as_teacher
Feature: Send Lesson

@eyes
Scenario: Send Lesson Dialog
  When I open my eyes to test "send lesson dialog"
  Given I am on "http://studio.code.org/s/csp3-2018"
  And I see no difference for "unit overview"
  Then I open the send lesson dialog for lesson 4
  And I wait until element "span:contains(Google)" is visible
  And I see no difference for "send lesson dialog"
  And I close my eyes
  