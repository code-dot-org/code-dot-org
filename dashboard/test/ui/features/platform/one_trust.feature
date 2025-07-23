@single_session
Feature: OneTrust integration
  @eyes
  @pegasus_content
  Scenario: User sees OneTrust cookie pop-up when self-hosting OneTrust libraries on hourofcode
    Given I am in Europe
    Given I am on "http://hourofcode.com/es?otreset=true&otgeo=es"
    And I wait until current URL contains "otreset=false"
    And I wait for jquery to load
    And I open my eyes to test "Hour of code Onetrust pop up"
    And I wait until element "#onetrust-banner-sdk" is visible
    And I see no difference for "Onetrust pop up: Hour of Code" using stitch mode "none"
    And I close my eyes

  @eyes
  Scenario: User sees OneTrust cookie pop-up when self-hosting OneTrust libraries on code.org
    Given I create a student named "Alice"
    Given I am in Europe
    Given I am on "http://studio.code.org/home?otreset=true&otgeo=es"
    And I wait until current URL contains "otreset=false"
    And I wait for jquery to load
    And I open my eyes to test "Code.org Onetrust pop up"
    And I wait until element "#onetrust-banner-sdk" is visible
    And I see no difference for "Onetrust pop up: code.org" using stitch mode "none"
    And I close my eyes

  @pegasus_content
  Scenario: OneTrust cookie pop-up shows when self-hosting OneTrust libraries on hourofocode
    Given I am in Europe
    Given I am on "http://hourofcode.com/es?otreset=true&otgeo=es"
    And I wait until current URL contains "otreset=false"
    And I wait for jquery to load
    And I wait until element "#onetrust-banner-sdk" is visible

  Scenario: OneTrust cookie pop-up shows when self-hosting OneTrust libraries on code.org
    Given I create a student named "Alice"
    Given I am in Europe
    Given I am on "http://studio.code.org/home?otreset=true&otgeo=es"
    And I wait until current URL contains "otreset=false"
    And I wait for jquery to load
    And I wait until element "#onetrust-banner-sdk" is visible

  Scenario: The dashboard pages load the self hosted OneTrust libraries.
    Given I am on "http://studio.code.org/users/sign_in"
    Then element "script[src$='onetrust/cdo/scripttemplates/otSDKStub.js']" does exist
    Then element "script[src$='977d/OtAutoBlock.js']" does exist
    Then element "script[src$='977d-test/OtAutoBlock.js']" does not exist

  Scenario: The dashboard pages load the Onetrust prod libraries.
    Given I am on "http://studio.code.org/users/sign_in"
    When I use a cookie to mock the DCDO key "onetrust_cookie_scripts" as "prod"
    Given I am on "http://studio.code.org/users/sign_in"
    Then element "script[src$='otSDKStub.js']" does exist
    Then element "script[src$='977d/OtAutoBlock.js']" does exist
    Then element "script[src$='977d-test/OtAutoBlock.js']" does not exist
    Then element "script[src$='onetrust/scripttemplates/otSDKStub.js']" does not exist

  Scenario: The dashboard pages load the test OneTrust libraries.
    Given I am on "http://studio.code.org/users/sign_in?onetrust_cookie_scripts=test"
    Then element "script[src$='otSDKStub.js']" does exist
    Then element "script[src$='977d/OtAutoBlock.js']" does not exist
    Then element "script[src$='977d-test/OtAutoBlock.js']" does exist

  @pegasus_content
  Scenario: The pegasus pages load the test OneTrust libraries.
    Given I am on "http://code.org/index?onetrust_cookie_scripts=test"
    Then element "script[src$='otSDKStub.js']" does exist
    Then element "script[src$='977d/OtAutoBlock.js']" does not exist
    Then element "script[src$='977d-test/OtAutoBlock.js']" does exist

    Given I am on "http://hourofcode.com/us?onetrust_cookie_scripts=test"
    Then element "script[src$='otSDKStub.js']" does exist
    Then element "script[src$='e345/OtAutoBlock.js']" does not exist
    Then element "script[src$='e345-test/OtAutoBlock.js']" does exist

  Scenario: The dashboard pages do not load the OneTrust libraries.
    Given I am on "http://studio.code.org/users/sign_in?onetrust_cookie_scripts=off"
    Then element "script[src$='otSDKStub.js']" does not exist
    Then element "script[src$='977d/OtAutoBlock.js']" does not exist
    Then element "script[src$='977d-test/OtAutoBlock.js']" does not exist

  @pegasus_content
  Scenario: The pegasus pages do not load the OneTrust libraries.
    Given I am on "http://code.org/index?onetrust_cookie_scripts=off"
    Then element "script[src$='otSDKStub.js']" does not exist
    Then element "script[src$='977d/OtAutoBlock.js']" does not exist
    Then element "script[src$='977d-test/OtAutoBlock.js']" does not exist

    Given I am on "http://hourofcode.com/us?onetrust_cookie_scripts=off"
    Then element "script[src$='otSDKStub.js']" does not exist
    Then element "script[src$='e345/OtAutoBlock.js']" does not exist
    Then element "script[src$='e345-test/OtAutoBlock.js']" does not exist

  @pegasus_content
  Scenario Outline: Critical Javascript files are appropriately categorized by OneTrust on pegasus
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

  Scenario Outline: Critical Javascript files are appropriately categorized by OneTrust on dashboard
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
      | http://studio.code.org/users/sign_in                                    |

  @as_student
  Scenario Outline: Embedded projects do not display the OneTrust banner
    Given I am in Europe
    Given I am on "<url>"
    Given I switch to the embedded view of current project with query "otreset=true&otgeo=es"
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
