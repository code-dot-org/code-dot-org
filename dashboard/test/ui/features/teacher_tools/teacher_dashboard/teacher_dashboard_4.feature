@no_mobile
Feature: Using the teacher dashboard 3

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

When I am on "http://studio.code.org/s/allthethings/lessons/3/levels/8"
And I wait for the page to fully load
And I press "runButton"
And I wait until element ".project_updated_at" contains text "Saved"
And I wait until initial thumbnail capture is complete
And I press the first ".project_remix" element to load a new page
And I wait for the page to fully load

    # Create a playlab project level and generate a thumbnail.

    # We don't want to have to write the code by dragging blocks, so just remix
    # an existing project-backed level, and then run the project.

When I am on "http://studio.code.org/s/allthethings/lessons/5/levels/5"
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

When I am on "http://studio.code.org/s/dance/lessons/1/levels/13"
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
And I wait until the image within element "tr:eq(5)" has loaded

Then I see no difference for "projects list view"
And I close my eyes

Scenario: Attempt to join a section you own redirects to dashboard with error message
Given I am a teacher
And I create a new student section and go home
And I attempt to join the section
Then I wait until element "#flashes" is visible
And element "div.alert" contains text matching "Sorry, you can't join your own section"

Scenario: Attempt to join an invalid section through the homepage
Given I am a teacher and go home
And I wait until element "button.ui-test-join-section" is visible
And I press keys "INVALID" for element "input.ui-test-join-section"
And I click selector "button.ui-test-join-section"
Then I wait until element ".announcement-notification" is visible
And element ".announcement-notification" contains text matching "Section INVALID doesn't exist"

Scenario: Attempt to join a section you own from teacher dashboard provides notification
Given I am a teacher
And I create a new student section and go home
And I wait until element "button.ui-test-join-section" is visible
And I enter the section code into "input.ui-test-join-section"
And I click selector "button.ui-test-join-section"
Then I wait until element ".announcement-notification" is visible
And element ".announcement-notification" contains text matching "You are already the owner of section"
