@no_ie
@no_mobile
@dashboard_db_access
@pegasus_db_access
Feature: Using the teacher dashboard

  Scenario: Loading the teacher dashboard
    Given I am on "http://code.org/"
    And I am a teacher
    And I am on "http://code.org/teacher-dashboard"
    Then I wait to see ".outerblock"
    Then I click selector "div.title:contains('Student Accounts and Progress')"
    Then check that I am on "http://code.org/teacher-dashboard#/sections"

  Scenario: Loading student progress
    Given I create a teacher-associated student named "Sally"
    And I give user "Teacher_Sally" hidden script access
    And I complete the level on "http://studio.code.org/s/allthethings/stage/2/puzzle/1"
    And I sign out
    When I sign in as "Teacher_Sally"
    And I am on "http://code.org/teacher-dashboard"
    And I click selector "div.title:contains('Student Accounts and Progress')" once I see it
    And I click selector "a:contains('SectionName')" once I see it
    And I click selector "a:contains('Sally')" once I see it
    And I wait until element "#course-dropdown" is visible
    And I select the "allthethings *" option in dropdown "course-dropdown"
    And I wait until I see selector "a[href*='/s/allthethings/stage/2/puzzle/1']"
    Then selector "a[href*='/s/allthethings/stage/2/puzzle/1']" has class "perfect"
    But selector "a[href*='/s/allthethings/stage/2/puzzle/2']" doesn't have class "perfect"

  Scenario: Loading section projects
    Given I create a teacher-associated student named "Sally"
    And I am on "http://studio.code.org/projects/applab"

    # Make sure the initial save doesn't interfere with renaming the project
    And I wait for initial project save to complete

    # rename the project
    And I click selector ".project_edit" once I see it
    And I wait until element ".project_name.header_input" is visible
    And I type "thumb wars" into ".project_name.header_input"
    And I click selector ".project_save"

    And I wait until element ".project_edit" is visible
    Then element ".project_name.header_text" contains text "thumb wars"
    And I sign out

    When I sign in as "Teacher_Sally"
    And I am on "http://code.org/teacher-dashboard#/sections"
    And I click selector "a:contains('SectionName')" once I see it
    And I click selector "a:contains('Projects')" once I see it
    And I wait until element "#projects-list" is visible
    And I click selector "a:contains('thumb wars')" once I see it
    And I go to the newly opened tab
    And I wait until element ".project_name.header_text:contains('thumb wars')" is visible

  @eyes
  Scenario: Eyes tests for section projects with thumbnails
    When I open my eyes to test "section projects with thumbnails"
    And I create a teacher-associated student named "Sally"

    # Create an applab project and generate a thumbnail

    When I am on "http://studio.code.org/projects/applab/new"
    And I wait for the page to fully load
    And I switch to text mode
    And I append text to droplet "createCanvas('id', 320, 450);\nsetFillColor('red');\ncircle(160, 225, 160);"
    And I press "runButton"
    And I wait until element ".project_updated_at" contains text "Saved"
    And I wait until initial thumbnail capture is complete
    And I press "resetButton"
    And I click selector "#runButton" once I see it
    # Wait for the thumbnail URL to be sent to the server.
    And I wait until element ".project_updated_at" contains text "Saved"

    # Create a gamelab project and generate a thumbnail

    When I am on "http://studio.code.org/projects/gamelab/new"
    And I wait for the page to fully load
    And I switch to text mode
    And I append text to droplet "\nfill('orange');\nellipse(200,200,400,400);"
    And I press "runButton"
    And I wait until element ".project_updated_at" contains text "Saved"
    And I wait until initial thumbnail capture is complete
    And I press "resetButton"
    And I click selector "#runButton" once I see it
    # Wait for the thumbnail URL to be sent to the server.
    And I wait until element ".project_updated_at" contains text "Saved"

    # Create an artist project and generate a thumbnail.
    #
    # Ensure the predraw layer is included in the thumbnail, and that a project
    # with that thumbnail appears in the projects list, by running and then
    # remixing a project-backed script level which has a predraw layer.
    #
    # We can't simply share the script level, because that doesn't make it
    # show up in the projects list. We can't just run the remixed project to
    # generate the thumbnail, because it will have lost the predraw layer.
    # Whether losing the predraw layer on remix is ok is a different issue, and
    # until it is resolved we want to make sure thumbnails include predraw.

    When I am on "http://studio.code.org/s/allthethings/stage/3/puzzle/8"
    And I wait for the page to fully load
    And I press "runButton"
    And I wait until element ".project_updated_at" contains text "Saved"
    And I wait until initial thumbnail capture is complete
    And I press the first ".project_remix" element to load a new page
    And I wait for the page to fully load

    And I sign out

    # Load the section projects page

    When I sign in as "Teacher_Sally"
    And I am on "http://code.org/teacher-dashboard?enableExperiments=showProjectThumbnails#/sections"
    And I click selector "a:contains('SectionName')" once I see it
    And I click selector "a:contains('Projects')" once I see it
    And I wait until element "#projects-list" is visible
    And I wait until the image within element "tr:eq(1)" has loaded
    And I wait until the image within element "tr:eq(2)" has loaded
    And I wait until the image within element "tr:eq(3)" has loaded

    Then I see no difference for "projects list view"
    And I close my eyes
