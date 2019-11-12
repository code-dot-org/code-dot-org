@no_mobile
@as_student
Feature: App Lab Data Blocks

  Scenario: Evaluate Data Blocks
    # This level evaluates the create/read/update/deleteRecord and set/getKeyValue blocks
    # when run, and prints success if the data storage APIs are working properly.
    Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/8?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And element "#runButton" is visible
    And I open the debug console
    Then I press "runButton"
    And I wait until element "#keyValueLabel" is visible within element "#divApplab"
    And I wait until element "#recordLabel" is visible within element "#divApplab"

  Scenario: Evaluate onRecordEvent block
    # The level verifies that onRecordEvent captures the correct events when
    # the create/update/deleteRecord blocks are evaluated, then prints success.
    Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/13?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And element "#runButton" is visible
    And I open the debug console
    Then I press "runButton"
    And I wait until element "#successLabel" is visible within element "#divApplab"

  Scenario: Start over clears Data
    Given I am on "http://studio.code.org/projects/applab/new"
    And I get redirected to "/projects/applab/([^\/]*?)/edit" via "dashboard"
    And I rotate to landscape
    And I wait for the page to fully load
    And I ensure droplet is in block mode
    And I switch to text mode
    And I add code "setKeyValue('key', 'value', function() {getKeyValue('key', function(value) {if (value === 'value') {textLabel('keyValueLabel', 'success')}})});" to ace editor
    Then element "#runButton" is visible
    Then I press "runButton"
    And I wait until element "#keyValueLabel" is visible within element "#divApplab"
    And element "#keyValueLabel" eventually contains text "success"
    Then I press "versions-header"
    And I wait until element "button:contains(Start over):eq(0)" is visible
    And I click selector ".btn-danger"
    And I click selector "#confirm-button" to load a new page
    And I wait for the page to fully load
    Then I add code "getKeyValue('key', function(value) {if (value === undefined) {textLabel('keyValueLabel', 'success')}});" to ace editor
    And I press "runButton"
    And I wait until element "#keyValueLabel" is visible within element "#divApplab"
    And element "#keyValueLabel" eventually contains text "success"