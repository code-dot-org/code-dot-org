@no_mobile
@dashboard_db_access
@pegasus_db_access
Feature: Using the teacher dashboard

  Scenario: Loading student progress
    Given I create an authorized teacher-associated student named "Sally"
    And I give user "Teacher_Sally" hidden script access
    And I complete the level on "http://studio.code.org/s/allthethings/stage/2/puzzle/1"
    And I complete the free response on "http://studio.code.org/s/allthethings/stage/27/puzzle/1"
    And I submit the assessment on "http://studio.code.org/s/allthethings/stage/33/puzzle/1"
    And I sign out

    # Progress tab
    When I sign in as "Teacher_Sally"
    And I am on "http://studio.code.org/home"
    And I click selector "a:contains('Untitled Section')" once I see it
    And I wait until element "#uitest-course-dropdown" contains text "All the Things! *"

    # Stats tab
    And I click selector "#learn-tabs a:contains('Stats')" once I see it
    And I wait until element "#uitest-stats-table" is visible

    # Manage students tab
    When I click selector "#learn-tabs a:contains('Manage Students')" once I see it
    And I wait until element "#uitest-manage-tab" is visible
    And I wait until element "#uitest-privacy-link" is visible
    And element "#uitest-privacy-link" contains text "privacy document"

    # Text responses tab
    When I click selector "#learn-tabs a:contains('Text Responses')" once I see it
    And I wait until element "#uitest-course-dropdown" is visible
    And element "#text-responses-table tr:contains(Sally)" contains text "hello world"

    # Assessments and surveys tab
    When I click selector "#learn-tabs a:contains('Assessments/Surveys')" once I see it
    And I wait until element "#uitest-course-dropdown" is visible
    And I wait until element "h3:contains(no submissions for this assessment)" is visible
    And I wait until element "h3:contains(this survey is anonymous)" is not visible
    And I select the "Lesson 30: Anonymous student survey" option in dropdown "assessment-selector"
    And I wait until element "h3:contains(this survey is anonymous)" is visible
    And I wait until element "h3:contains(no submissions for this assessment)" is not visible

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
    And I click selector "a:contains('Untitled Section')" once I see it
    And I click selector "#learn-tabs a:contains('Projects')" once I see it
    And I wait until element "#projects-list" is visible
    And I click selector "a:contains('thumb wars')" once I see it
    And I go to the newly opened tab
    And I wait until element ".project_name.header_text:contains('thumb wars')" is visible

  Scenario: Toggling student progress
    Given I create an authorized teacher-associated student named "Sally"
    And I give user "Teacher_Sally" hidden script access
    And I complete the level on "http://studio.code.org/s/allthethings/stage/2/puzzle/1"
    And I complete the free response on "http://studio.code.org/s/allthethings/stage/27/puzzle/1"
    And I submit the assessment on "http://studio.code.org/s/allthethings/stage/33/puzzle/1"
    And I sign out

    # Progress tab
    When I sign in as "Teacher_Sally"
    And I am on "http://studio.code.org/home"
    And I click selector "a:contains('Untitled Section')" once I see it
    And I wait until element "#uitest-course-dropdown" contains text "All the Things! *"
    And I press the first ".uitest-summary-cell" element
    And I see ".uitest-detail-cell"

  @eyes
  Scenario: Eyes tests for section projects with thumbnails
    When I open my eyes to test "section projects with thumbnails"
    And I create a teacher-associated student named "Sally"

    # Create an applab project and generate a thumbnail

    When I am on "http://studio.code.org/projects/applab/new"
    And I wait for the page to fully load
    And I ensure droplet is in text mode
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
    And I ensure droplet is in text mode
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

    # Create a playlab project level and generate a thumbnail.

    # We don't want to have to write the code by dragging blocks, so just remix
    # an existing project-backed level, and then run the project.

    When I am on "http://studio.code.org/s/allthethings/stage/5/puzzle/5"
    And I wait for the page to fully load
    And I press the first ".project_remix" element to load a new page
    And I wait for the page to fully load
    And I press "runButton"
    And I wait until element ".project_updated_at" contains text "Saved"
    And I wait until initial thumbnail capture is complete
    And I press "resetButton"
    And I click selector "#runButton" once I see it
    # Wait for the thumbnail URL to be sent to the server.
    And I wait until element ".project_updated_at" contains text "Saved"

    # Create a dance party project level and generate a thumbnail.

    # We don't want to have to write the code by dragging blocks, so just remix
    # an existing project-backed level, and then run the project.

    When I am on "http://studio.code.org/s/dance/stage/1/puzzle/13"
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I click selector "#x-close" once I see it
    And I close the instructions overlay if it exists
    And I press the first ".project_remix" element to load a new page
    And I wait for the page to fully load
    And I press "runButton"
    And I wait until element ".project_updated_at" contains text "Saved"
    And I wait until initial thumbnail capture is complete
    And I press "resetButton"
    And I click selector "#runButton" once I see it
    # Wait for the thumbnail URL to be sent to the server.
    And I wait until element ".project_updated_at" contains text "Saved"

    And I sign out

    # Load the section projects page

    When I sign in as "Teacher_Sally"
    Then I am on "http://studio.code.org/home"
    And I click selector "a:contains('Untitled Section')" once I see it
    And I click selector "#learn-tabs a:contains('Projects')" once I see it
    And I wait until element "#projects-list" is visible
    And I wait until the image within element "tr:eq(1)" has loaded
    And I wait until the image within element "tr:eq(2)" has loaded
    And I wait until the image within element "tr:eq(3)" has loaded
    And I wait until the image within element "tr:eq(4)" has loaded
    And I wait until the image within element "tr:eq(5)" has loaded

    Then I see no difference for "projects list view"
    And I close my eyes
