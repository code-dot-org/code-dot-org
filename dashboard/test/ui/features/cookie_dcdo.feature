Feature: Cookie DCDO
  Scenario: Using a cookie to mock DCDO
    Given I am on "http://code.org/test_dcdo"
    Then element "#fetched_dcdo_value" has text "nil"

    # Tests mocking of DCDO
    When I use a cookie to mock the DCDO key "test_dcdo_on_pegasus" as "mocking_works"
    And I reload the page
    Then element "#fetched_dcdo_value" has text "\"mocking_works\""

    # Tests re-mocking of DCDO
    When I use a cookie to mock the DCDO key "test_dcdo_on_pegasus" as "{"re-mocking":"works"}"
    And I reload the page
    Then element "#fetched_dcdo_value" has text "{\"re-mocking\"=>\"works\"}"

    # Tests cleaning of DCDO
    When I delete the cookie named "DCDO"
    And I reload the page
    Then element "#fetched_dcdo_value" has text "nil"
