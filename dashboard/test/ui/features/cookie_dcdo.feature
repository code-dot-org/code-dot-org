Feature: Cookie DCDO
  Scenario: Using a cookie to mock DCDO
    Given I am on "http://studio.code.org/users/sign_in"
    Then element "script[data-dcdo]" attr "data-dcdo" includes ""cookie_dcdo_test":null"

    # Tests assigning of a cookie DCDO flag
    When I use a cookie to mock the DCDO key "cookie_dcdo_test" as "assigning_works"
    And I reload the page
    Then element "script[data-dcdo]" attr "data-dcdo" includes ""cookie_dcdo_test":"assigning_works""

    # Tests re-assigning of a cookie DCDO flag
    When I use a cookie to mock the DCDO key "cookie_dcdo_test" as "{"re-assigning":"works"}"
    And I reload the page
    Then element "script[data-dcdo]" attr "data-dcdo" includes ""cookie_dcdo_test":{"re-assigning":"works"}"

    # Tests cleaning of a cookie DCDO flag
    When I delete the cookie named "DCDO"
    And I reload the page
    Then element "script[data-dcdo]" attr "data-dcdo" includes ""cookie_dcdo_test":null"
