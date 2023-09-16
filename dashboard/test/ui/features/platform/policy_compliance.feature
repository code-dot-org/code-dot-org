Feature: Policy Compliance and Parental Permission

  Scenario: New under 13 account should be able to send a parental request.
    Given I create a young student in Colorado who has never signed in named "Sally Student" and go home

    # TODO: Can possibly get rid of this when the lockout is redirected on sign in
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
    Given I create a young student in Colorado who has never signed in named "Sally Student" and go home

    # TODO: Can possibly get rid of this when the lockout is redirected on sign in
    Given I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # The sign out button should navigate and show the sign in button
    When I press "lockout-signout"
    Then I wait to see "#header_user_signin"

  Scenario: New under 13 account should be able to resend the email
    Given I create a young student in Colorado who has never signed in named "Sally Student" and go home

    # TODO: Can possibly get rid of this when the lockout is redirected on sign in
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

    # Perform a "resend"
    And I take note of the current loaded page
    When I press "lockout-resend"
    Then I wait until I am on a different page than I noted before
    Then I wait to see "#lockout-panel-form"

  Scenario: New under 13 account should be able to send a different email
    Given I create a young student in Colorado who has never signed in named "Sally Student" and go home

    # TODO: Can possibly get rid of this when the lockout is redirected on sign in
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
    Given I create a young student in Colorado who has never signed in named "Sally Student" and go home

    # TODO: Can possibly get rid of this when the lockout is redirected on sign in
    Given I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # Type in the student email as the parent email, which should disable the button
    And I type the email for "Sally Student" into element "#parent-email"
    Then element "#lockout-submit" is disabled