@single_session
Feature: OneTrust integration
  Scenario: The pages load the prod OneTrust libraries.
    Given I am on "http://studio.code.org/users/sign_in"
    Then element "script[src$='otSDKStub.js']" does exist
    Then element "script[src$='977d/OtAutoBlock.js']" does exist
    Then element "script[src$='977d-test/OtAutoBlock.js']" does not exist

    Given I am on "http://code.org/index"
    Then element "script[src$='otSDKStub.js']" does exist
    Then element "script[src$='977d/OtAutoBlock.js']" does exist
    Then element "script[src$='977d-test/OtAutoBlock.js']" does not exist

    Given I am on "http://hourofcode.com/us"
    Then element "script[src$='otSDKStub.js']" does exist
    Then element "script[src$='e345/OtAutoBlock.js']" does exist
    Then element "script[src$='e345-test/OtAutoBlock.js']" does not exist

  Scenario: The pages load the test OneTrust libraries.
    Given I am on "http://studio.code.org/users/sign_in?onetrust_cookie_scripts=test"
    Then element "script[src$='otSDKStub.js']" does exist
    Then element "script[src$='977d/OtAutoBlock.js']" does not exist
    Then element "script[src$='977d-test/OtAutoBlock.js']" does exist

    Given I am on "http://code.org/index?onetrust_cookie_scripts=test"
    Then element "script[src$='otSDKStub.js']" does exist
    Then element "script[src$='977d/OtAutoBlock.js']" does not exist
    Then element "script[src$='977d-test/OtAutoBlock.js']" does exist

    Given I am on "http://hourofcode.com/us?onetrust_cookie_scripts=test"
    Then element "script[src$='otSDKStub.js']" does exist
    Then element "script[src$='e345/OtAutoBlock.js']" does not exist
    Then element "script[src$='e345-test/OtAutoBlock.js']" does exist

  Scenario: The pages do not load the OneTrust libraries.
    Given I am on "http://studio.code.org/users/sign_in?onetrust_cookie_scripts=off"
    Then element "script[src$='otSDKStub.js']" does not exist
    Then element "script[src$='977d/OtAutoBlock.js']" does not exist
    Then element "script[src$='977d-test/OtAutoBlock.js']" does not exist

    Given I am on "http://code.org/index?onetrust_cookie_scripts=off"
    Then element "script[src$='otSDKStub.js']" does not exist
    Then element "script[src$='977d/OtAutoBlock.js']" does not exist
    Then element "script[src$='977d-test/OtAutoBlock.js']" does not exist

    Given I am on "http://hourofcode.com/us?onetrust_cookie_scripts=off"
    Then element "script[src$='otSDKStub.js']" does not exist
    Then element "script[src$='e345/OtAutoBlock.js']" does not exist
    Then element "script[src$='e345-test/OtAutoBlock.js']" does not exist

  Scenario Outline: Critical Javascript files are appropriately categorized by OneTrust
    Given I am on "<url>"
    Then element "script[src*='/assets/application']" is not categorized by OneTrust
    Then element "script[src*='js/webpack-runtime']" is not categorized by OneTrust
    Then element "script[src*='js/essential']" is not categorized by OneTrust
    Then element "script[src*='js/vendors']" is not categorized by OneTrust
    Then element "script[src*='/common_locale']" is not categorized by OneTrust
    Then element "script[src*='js/code-studio-common']" is not categorized by OneTrust
    Then element "script[src*='js/code-studio']" is not categorized by OneTrust
  Examples:
    | url                                                                     |
    | http://code.org/index                                                   |
    | http://hourofcode.com/us                                                |
    | http://studio.code.org/users/sign_in                                    |

  @as_student
  Scenario Outline: Embedded projects do not display the OneTrust banner
    Given I am on "<url>"
    Then I switch to the embedded view of current project
    Then I append "?otreset=true&otgeo=gb" to the URL
    Then element "script[src$='otSDKStub.js']" does not exist
    Then element "script[src$='OtAutoBlock.js']" does not exist
  Examples:
    | url                                                                    |
    | http://studio.code.org/projects/music/new                              |
    | http://studio.code.org/projects/spritelab/new                          |
    | http://studio.code.org/projects/artist/new                             |
    | http://studio.code.org/projects/gamelab/new                            |
    | http://studio.code.org/projects/dance/new                              |
    | http://studio.code.org/projects/applab/new                             |
    | http://studio.code.org/projects/poetry/new                             |
    | http://studio.code.org/projects/flappy/new                             |
    | http://studio.code.org/projects/frozen/new                             |
