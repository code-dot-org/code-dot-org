Feature: Cookie DCDO
  Scenario: Cookie DCDO flag is set
    Given I am on "http://studio.code.org/users/sign_in"
    Then element "script[data-dcdo]" attr "data-dcdo" includes ""cookie_dcdo_test":null"

    # Tests assigning of a cookie DCDO flag
    When I set the DCDO key "cookie_dcdo_test" to "assigning_works"
    And I reload the page
    Then element "script[data-dcdo]" attr "data-dcdo" includes ""cookie_dcdo_test":"assigning_works""

    # Tests re-assigning of a cookie DCDO flag
    When I set the DCDO key "cookie_dcdo_test" to "{"re-assigning":"works"}"
    And I reload the page
    Then element "script[data-dcdo]" attr "data-dcdo" includes ""cookie_dcdo_test":{"re-assigning":"works"}"

    # Tests cleaning of a cookie DCDO flag
    When I delete the cookie named "DCDO"
    And I reload the page
    Then element "script[data-dcdo]" attr "data-dcdo" includes ""cookie_dcdo_test":null"
