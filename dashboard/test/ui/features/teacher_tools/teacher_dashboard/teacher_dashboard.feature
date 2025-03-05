@no_mobile
Feature: Using the teacher dashboard

  Scenario: Visiting student name URLs in teacher dashboard
    Given I am on "http://studio.code.org"
    When I use a cookie to mock the DCDO key "progress-table-v2-enabled" as "true"
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to unit "allthethings"
    And I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1"

    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    When I click selector "a:contains(Untitled Section)" once I see it to load a new page
    And I wait until element "#ui-test-toggle-progress-view" is visible
    And I click selector "#ui-test-toggle-progress-view"
    And I wait until element "#uitest-teacher-dashboard-nav" is visible
    And check that the URL contains "/teacher_dashboard/sections/"
    And I wait until element "#uitest-course-dropdown" is visible
    And I select the "All the Things! *" option in dropdown "uitest-course-dropdown"
    And I wait until element "a:contains(Sally)" is visible
    When I click selector "a:contains(Sally)" to load a new page
    And I wait until element "#teacher-panel-container" is visible
    And check that the URL contains "/s/allthethings"
    And check that the URL contains "viewAs=Instructor"

  Scenario: Loading section projects
    Given I create a teacher-associated student named "Sally"
    Given I am assigned to unit "allthethings"
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

    When I sign in as "Teacher_Sally" and go home
    And I wait until element "a:contains('Untitled Section')" is visible
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved
    And I click selector "#uitest-teacher-dashboard-nav a:contains(Projects)" once I see it
    And I wait until element "#uitest-projects-table" is visible
    And I click selector "a:contains('thumb wars')" once I see it to load a new tab
    And I wait until element ".project_name.header_text" is visible
    And element ".project_name.header_text" contains text "thumb wars"

  Scenario: Toggling student progress
    Given I create an authorized teacher-associated student named "Sally"
    And I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1"
    And I complete the free response on "http://studio.code.org/s/allthethings/lessons/27/levels/1"
    And I submit the assessment on "http://studio.code.org/s/allthethings/lessons/33/levels/1"

    # Progress tab
    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I wait until element "a:contains('Untitled Section')" is visible
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved
    And I wait until element "#uitest-course-dropdown" is visible
    And I select the "All the Things! *" option in dropdown "uitest-course-dropdown"
    And I press the first ".uitest-summary-cell" element
    And I see ".uitest-detail-cell"

  @eyes
  Scenario: Eyes tests for section projects with thumbnails
    When I open my eyes to test "section projects with thumbnails"
    And I create a teacher-associated student named "Sally"

    # Create an applab project and generate a thumbnail

    When I am on "http://studio.code.org/projects/applab/new"
    And I wait for the lab page to fully load
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
    And I wait for the lab page to fully load
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

    When I am on "http://studio.code.org/s/allthethings/lessons/3/levels/8"
    And I wait for the lab page to fully load
    And I press "runButton"
    And I wait until element ".project_updated_at" contains text "Saved"
    And I wait until initial thumbnail capture is complete
    And I press the first ".project_remix" element to load a new page
    And I wait for the lab page to fully load

    # Create a dance party project level and generate a thumbnail.

    # We don't want to have to write the code by dragging blocks, so just remix
    # an existing project-backed level, and then run the project.

    When I am on "http://studio.code.org/s/dance/lessons/1/levels/13"
    And I wait for the lab page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I click selector "#x-close" once I see it
    And I close the instructions overlay if it exists
    And I press the first ".project_remix" element to load a new page
    And I wait for the lab page to fully load
    And I press "runButton"
    And I wait until element ".project_updated_at" contains text "Saved"
    And I wait until initial thumbnail capture is complete
    And I press "resetButton"
    And I click selector "#runButton" once I see it
    # Wait for the thumbnail URL to be sent to the server.
    And I wait until element ".project_updated_at" contains text "Saved"

    # Load the section projects page

    When I sign in as "Teacher_Sally" and go home
    And I wait until element "a:contains('Untitled Section')" is visible
    And I save the section id from row 0 of the section table
    Then I navigate to teacher dashboard for the section I saved
    And I click selector "#uitest-teacher-dashboard-nav a:contains(Projects)" once I see it
    And I wait until element "#uitest-projects-table" is visible
    And I wait until the image within element "tr:eq(1)" has loaded
    And I wait until the image within element "tr:eq(2)" has loaded
    And I wait until the image within element "tr:eq(3)" has loaded
    And I wait until the image within element "tr:eq(4)" has loaded

    Then I see no difference for "projects list view"
    And I close my eyes
