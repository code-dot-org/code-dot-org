@as_teacher
Feature: Send Lesson

@eyes
Scenario: Send lesson dialog renders properly
  Given I open my eyes to test "send lesson dialog"
  When I am on "http://studio.code.org/courses/csp-2025/units/3"
  Then I see no difference for "unit overview"
  When I open the send lesson dialog for lesson 4
  And I wait until element "span:contains(Google)" is visible
  Then I see no difference for "send lesson dialog"
  Then I close my eyes

@no_mobile
Scenario: Send lesson dialog opens and closes
  Given I am on "http://studio.code.org/courses/csp-2025/units/3"
  When I open the send lesson dialog for lesson 4
  Then I wait until element ".modal" is visible
  And I wait until element "span:contains(Google)" is visible
  When I click selector "button:contains(Done)"
  Then I wait until element ".modal" is not visible

@no_mobile
Scenario: Send lesson dialog copy link button works
  Given I am on "http://studio.code.org/courses/coursec-2019/units/1"
  When I open the send lesson dialog for lesson 2
  Then I wait until element ".modal" is visible
  And I wait until element "#uitest-copy-button" is visible
  When I click selector "#uitest-copy-button"
  Then I wait until element "div:contains(Link copied!)" is visible
  # Ideally, we would also verify that the link is on the clipboard here,
  # but have not found a good way to do that.
