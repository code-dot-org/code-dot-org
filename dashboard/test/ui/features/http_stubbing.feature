Feature: HTTP stubbing
  Scenario: Stub external HTTP requests within Studio
    Given I am on "http://studio.code.org/reset_session"

    When I use a cookie to stub matching HTTP requests from the "http_stubbing_test" fixture:
      | get  | https\:\/\/request1\/\?param\=test |           |
      | post | https\:\/\/request2\/\?param\=test | "WebMock" |
    And I am on "http://studio.code.org/api/test/get_http_stubs"
    Then response json key "response1" has value ""VCR""
    And response json key "response2" has value ""WebMock""
    And response json key "response3" has value ""real""

    When I use a cookie to stub matching HTTP requests from the "http_stubbing_test" fixture:
      | post | https\:\/\/request2\/\?param\=test |           |
      | get  | https\:\/\/request3\/\?param\=test | "WebMock" |
    And I am on "http://studio.code.org/api/test/get_http_stubs"
    Then response json key "response1" has value ""real""
    And response json key "response2" has value ""VCR""
    And response json key "response3" has value ""WebMock""

    When I use a cookie to stub matching HTTP requests from the "http_stubbing_test" fixture:
      | get | https\:\/\/request1\/\?param\=test | "WebMock" |
      | get | https\:\/\/request3\/\?param\=test |           |
    And I am on "http://studio.code.org/api/test/get_http_stubs"
    Then response json key "response1" has value ""WebMock""
    And response json key "response2" has value ""real""
    And response json key "response3" has value ""VCR""

    When I delete the cookie named "http_stub"
    And I am on "http://studio.code.org/api/test/get_http_stubs"
    Then response json key "response1" has value ""real""
    And response json key "response2" has value ""real""
    And response json key "response3" has value ""real""
