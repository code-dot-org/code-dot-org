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
  And I wait until element "#react-personal-projects" contains text "You currently have no projects."
  Then I see no difference for "page load"

  When I press "uitest-view-full-list"
  And I wait until element "a[href='/projects/gumball/new']" is visible
  Then I see no difference for "view full list of new project types"
  And I close my eyes

Scenario: Project Ownership
  Given I am on "http://studio.code.org/projects/artist/new"
  And I wait for the page to fully load
  And check that the URL matches "/edit$"
  And I save the URL

  # The storage_id cookie is sent with this account creation request,
  # leading to a storage_id cookie takeover.

  When I create a student named "Takeover"
  And I navigate to the saved URL
  And I wait for the page to fully load
  And check that the URL matches "/edit$"

  # Verify existing buggy behavior. A signed-out user now owns the projects of
  # the user who took over the storage id.

  When I sign out
  And I navigate to the saved URL
  And I wait for the page to fully load
  And check that the URL matches "/edit$"
