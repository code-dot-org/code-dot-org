@dashboard_db_access
Feature: Hour of Code tests for client state for multiple users.

Scenario: Async progress writes followed by stale reads, testing per-user state across multiple users.
  Given I manually sign in as "Alice"
  Then I am on "http://studio.code.org/hoc/20?noautoplay=true"
  And I verify progress in the header of the current page is "not_tried" for level 20
  Then mark the current level as completed on the client
  And I reload the page
  And I verify progress in the header of the current page is "perfect" for level 20
  Then I wait for 10 seconds
  And I navigate to the course page and verify progress for course "hourofcode" stage 1 level 20 is "perfect"

  Then I sign out
  Then I am on "http://studio.code.org/hoc/18?noautoplay=true"
  And I verify progress in the header of the current page is "not_tried" for level 20
  Then mark the current level as completed on the client
  And I reload the page
  And I verify progress in the header of the current page is "perfect" for level 18

  Then I manually sign in as the existing user named "Alice"
  Then I am on "http://studio.code.org/hoc/20?noautoplay=true"
  And I verify progress in the header of the current page is "perfect" for level 20
  Then I sign out

  Then I manually sign in as "Bob"
  Then I am on "http://studio.code.org/hoc/20?noautoplay=true"
  And I verify progress in the header of the current page is "not_tried" for level 20
  Then I am on "http://studio.code.org/hoc/19?noautoplay=true"
  Then mark the current level as completed on the client
  And I reload the page
  And I verify progress in the header of the current page is "perfect" for level 19
  And I verify progress in the header of the current page is "not_tried" for level 20
  And I verify progress in the header of the current page is "not_tried" for level 18
  Then I sign out

  Then I manually sign in as the existing user named "Alice"
  Then I am on "http://studio.code.org/hoc/20?noautoplay=true"
  And I verify progress in the header of the current page is "perfect" for level 20
  And I verify progress in the header of the current page is "not_tried" for level 19
  And I verify progress in the header of the current page is "not_tried" for level 18


  Then I sign out
  Then I am on "http://studio.code.org/hoc/20?noautoplay=true"
  And I verify progress in the header of the current page is "not_tried" for level 18
  And I verify progress in the header of the current page is "not_tried" for level 19
  And I verify progress in the header of the current page is "not_tried" for level 20

