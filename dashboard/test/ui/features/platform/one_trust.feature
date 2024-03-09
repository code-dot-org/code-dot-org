@single_session
Feature: OneTrust integration

  # hourofcode.com
  # code.org
  # studio.code.org

  # prod vs test vs off
  Scenario: The pages load the prod OneTrust libraries.
    Given I am on "http://studio.code.org/courses"
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
    Given I am on "http://studio.code.org/courses?onetrust_cookie_scripts=test"
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
    Given I am on "http://studio.code.org/courses?onetrust_cookie_scripts=off"
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
