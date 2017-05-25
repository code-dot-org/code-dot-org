@no_mobile
@as_student
Feature: App Lab Data Tab

  Scenario: AppLab Verify Link on Data Tab
    Given I am on "http://studio.code.org/projects/applab/"
    And I wait for the page to fully load
    And I wait up to 5 seconds for element "#dataModeButton" to be visible
    And element "#dataModeButton" is visible
    Then I press "dataModeButton"
    And I press "dataBlocksLink" to load a new page
    And I wait until current URL contains "/code.org/applab/docs/tabledatastorage"