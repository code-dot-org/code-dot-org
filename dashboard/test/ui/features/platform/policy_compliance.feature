Feature: Policy Compliance and Parental Permission

  Scenario: New under 13 account should be able to send a parental request.
    Given I am on "http://studio.code.org"
    # CPA new user lockout phase starts 1 month before CPA exception
    Given CPA new user lockout phase starts at "2024-04-26T00:00:00MST"

    When I create a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
    Then I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # Type in the email do re-enable the button
    And I press keys "parent@example.com" for element "#parent-email"
    Then element "#lockout-submit" is enabled

    # Ensure that we are now "pending"
    And I take note of the current loaded page
    When I press "lockout-submit"
    Then I wait until I am on a different page than I noted before

    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Pending"

  Scenario: New under 13 account should be able to provide state and see lockout page to send parental request.
    Given I am on "http://studio.code.org"
    # CPA new user lockout phase starts 1 month before CPA exception
    Given CPA new user lockout phase starts at "2024-04-26T00:00:00MST"

    When I create a young student who has never signed in named "Sally Student" after CPA exception
    Then I am on "http://studio.code.org/home?forceStudentInterstitial=true"

    Then I wait to see "#student-information-modal"
    And I select the "Colorado" option in dropdown "user_us_state"

    Then I press "#submit-btn" using jQuery

    Given I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # Type in the email do re-enable the button
    And I press keys "parent@example.com" for element "#parent-email"
    Then element "#lockout-submit" is enabled

    # Ensure that we are now "pending"
    And I take note of the current loaded page
    When I press "lockout-submit"
    Then I wait until I am on a different page than I noted before

    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Pending"

  Scenario: New under 13 account should be able to elect to sign out at the lockout.
    Given I am on "http://studio.code.org"
    # CPA new user lockout phase starts 1 month before CPA exception
    Given CPA new user lockout phase starts at "2024-04-26T00:00:00MST"

    When I create a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
    Then I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # The sign out button should navigate and show the sign in button
    When I press "lockout-signout"
    Then I wait to see "#header_user_signin"

  Scenario: New under 13 account should be able to resend the email
    Given I am on "http://studio.code.org"
    # CPA new user lockout phase starts 1 month before CPA exception
    Given CPA new user lockout phase starts at "2024-04-26T00:00:00MST"

    When I create a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
    Then I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # Type in the email do re-enable the button
    And I press keys "parent@example.com" for element "#parent-email"
    Then element "#lockout-submit" is enabled

    # Ensure that we are now "pending"
    And I take note of the current loaded page
    When I press "lockout-submit"
    Then I wait until I am on a different page than I noted before

    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Pending"

    # Perform a "resend"
    And I take note of the current loaded page
    When I press "lockout-resend"
    Then I wait until I am on a different page than I noted before
    Then I wait to see "#lockout-panel-form"

  Scenario: New under 13 account should be able to send a different email
    Given I am on "http://studio.code.org"
    # CPA new user lockout phase starts 1 month before CPA exception
    Given CPA new user lockout phase starts at "2024-04-26T00:00:00MST"

    When I create a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
    Then I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # Type in the email do re-enable the button
    And I press keys "parent@example.com" for element "#parent-email"
    Then element "#lockout-submit" is enabled

    # Ensure that we are now "pending"
    And I take note of the current loaded page
    When I press "lockout-submit"
    Then I wait until I am on a different page than I noted before

    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Pending"

    # Type in the email do re-enable the button
    When I clear the text from element "#parent-email"
    And I press keys "parent2@example.com" for element "#parent-email"
    Then element "#lockout-submit" is enabled

    # Ensure that the new email was used
    And I take note of the current loaded page
    When I press "lockout-submit"
    Then I wait until I am on a different page than I noted before

    Then I wait to see "#lockout-panel-form"
    And element "#parent-email" has value "parent2@example.com"

  Scenario: Student should not be able to enter their own email as their parent's email
    Given I am on "http://studio.code.org"
    # CPA new user lockout phase starts 1 month before CPA exception
    Given CPA new user lockout phase starts at "2024-04-26T00:00:00MST"

    When I create a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
    Then I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # Type in the student email as the parent email, which should disable the button
    And I press keys for the email for "Sally Student" into element "#parent-email"
    Then element "#lockout-submit" is disabled

  Scenario: Student should be able to enter their parent's email if their parent created their account
    Given I am on "http://studio.code.org"
    # CPA new user lockout phase starts 1 month before CPA exception
    Given CPA new user lockout phase starts at "2024-04-26T00:00:00MST"

    When I create as a parent a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
    Then I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # Type in the student email as the parent email, which should not disable the button
    And I press keys for the email for "Sally Student" into element "#parent-email"
    Then element "#lockout-submit" is enabled

  Scenario: Existing under 13 account in Colorado should not be locked out.
    Given I am on "http://studio.code.org"
    # CPA new user lockout phase starts 1 month before CPA exception
    Given CPA new user lockout phase starts at "2024-04-26T00:00:00MST"

    When I create a young student in Colorado who has never signed in named "Sally Student" before CPA exception and go home
    Then I am on "http://studio.code.org/home"
