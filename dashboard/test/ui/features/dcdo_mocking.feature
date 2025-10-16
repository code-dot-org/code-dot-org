Feature: DCDO mocking
  Scenario: Using a cookie to mock DCDO
    Given I am on "http://studio.code.org/api/test/get_dcdo"
    Then response json key "stored" has value "null"
    And response json key "fetched" has value "null"

    # Tests mocking of DCDO
    When I use a cookie to mock the DCDO key "dcdo_mocking_test" as "mocked"
    And I am on "http://studio.code.org/api/test/get_dcdo"
    Then response json key "stored" has value "null"
    And response json key "fetched" has value ""mocked""

    # Tests re-mocking of DCDO
    When I use a cookie to mock the DCDO key "dcdo_mocking_test" as "{"dcdo":"re-mocked"}"
    And I am on "http://studio.code.org/api/test/get_dcdo"
    Then response json key "stored" has value "null"
    And response json key "fetched" has value "{"dcdo":"re-mocked"}"

    # Tests cleaning of DCDO
    When I delete the cookie named "DCDO"
    And I am on "http://studio.code.org/api/test/get_dcdo"
    Then response json key "stored" has value "null"
    And response json key "fetched" has value "null"
