Feature: DCDO mocking
  Scenario: Using a cookie to mock DCDO
    Given I am on "http://code.org/test_dcdo"
    Then element "#fetched_dcdo_value" has text "nil"

    # Tests mocking of DCDO
    When I use a cookie to mock the DCDO key "test_dcdo_on_pegasus" as "mocked"
    And I reload the page
    Then element "#fetched_dcdo_value" has text "\"mocked\""

    # Tests re-mocking of DCDO
    When I use a cookie to mock the DCDO key "test_dcdo_on_pegasus" as "{"dcdo":"re-mocked"}"
    And I reload the page
    Then element "#fetched_dcdo_value" has text "{\"dcdo\"=>\"re-mocked\"}"

    # Tests cleaning of DCDO
    When I delete the cookie named "DCDO"
    And I reload the page
    Then element "#fetched_dcdo_value" has text "nil"

  Scenario: DCDO mocked on the "studio.code.org" domain is also available on the "code.org" domain
    Given I am on "http://studio.code.org"
    And I use a cookie to mock the DCDO key "test_dcdo_on_pegasus" as "mocked"

    When I am on "http://code.org/test_dcdo"
    Then element "#fetched_dcdo_value" has text "\"mocked\""

  Scenario: DCDO mocked on the "hourofcode.com" domain is not available on the "code.org" domain
    Given I am on "http://hourofcode.com/us"

    When I use a cookie to mock the DCDO key "test_dcdo_on_pegasus" as "mocked"
    And I am on "http://code.org/test_dcdo"
    Then element "#fetched_dcdo_value" has text "nil"
