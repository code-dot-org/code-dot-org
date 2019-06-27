# as student:
# complete a level
# go to BubbleChoice page
# make sure green checkmark is there
# go to script overview
# make sure bubble is green

# as teacher:
# create section with student
# student completes level
# go to script overview page, check bubble
# go to BubbleChoice page, check bubble and teacher panel

Feature: BubbleChoice
  Scenario: Viewing BubbleChoice progress
    Given I create a teacher-associated student named "Alice"

    # Go to BubbleChoice activity page
    Given I am on "http://studio.code.org/s/allthethings/stage/40/puzzle/1"

    # Go to the first BubbleChoice sublevel
    And I wait until element ".uitest-bubble-choice:eq(0) a" is visible
    And I click selector ".uitest-bubble-choice:eq(0) a"

    # Complete the level
    And I wait until element ".submitButton" is visible
    And I click selector ".submitButton"

    # Make sure you are taken back to the BubbleChoice activity page with progress
    And I wait until element "h1:contains(Bubble Choice: All the Choices)" is visible
    And check that the url contains "/s/allthethings/stage/40/puzzle/1"
    And I wait until element ".uitest-bubble-choice:eq(0)" is visible
    And element ".uitest-bubble-choice:eq(0) i.fa-check" is visible

    And I sign out
