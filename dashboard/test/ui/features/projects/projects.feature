Feature: Projects

@eyes
@as_student
Scenario: My Projects
  When I open my eyes to test "My Projects page"
  And I am on "http://studio.code.org/projects/"
  And I wait to see ".header_user"
  And I wait until element "#uitest-view-full-list" is visible
  And element "a[href='/projects/artist/new']" is visible
  And element "a[href='/projects/gumball/new']" is not visible
  Then I see no difference for "page load"

  When I click selector "#uitest-view-full-list"
  And I wait until element "a[href='/projects/gumball/new']" is visible
  Then I see no difference for "view full list of new project types"
  And I close my eyes
