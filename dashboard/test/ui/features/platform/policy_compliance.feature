# TODO(P20-990): Fix Policy Compliance UI tests
@skip

Feature: Policy Compliance and Parental Permission

  Scenario: New under 13 account should be able to send a parental request.
    Given I create a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
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

  Scenario: New under 13 account should be able to provide state and see lockout page to send parental request.
    Given I create a young student who has never signed in named "Sally Student" after CPA exception
    Given I am on "http://studio.code.org/home?forceStudentInterstitial=true"

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
    Given I create a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
    Given I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # The sign out button should navigate and show the sign in button
    When I press "lockout-signout"
    Then I wait to see "#header_user_signin"

  Scenario: New under 13 account should be able to resend the email
    Given I create a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
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
    Given I create a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
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
    Given I create a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
    Given I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # Type in the student email as the parent email, which should disable the button
    And I press keys for the email for "Sally Student" into element "#parent-email"
    Then element "#lockout-submit" is disabled

  Scenario: Student should be able to enter their parent's email if their parent created their account
    Given I create as a parent a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
    Given I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # Type in the student email as the parent email, which should not disable the button
    And I press keys for the email for "Sally Student" into element "#parent-email"
    Then element "#lockout-submit" is enabled

  Scenario: Existing under 13 account in Colorado should not be locked out.
    Given I create a young student in Colorado who has never signed in named "Sally Student" before CPA exception and go home
    Given I am on "http://studio.code.org/home"

  Scenario: Student should not be able to connect a third-party account until their account is unlocked
    Given I create an old account for a young student in Colorado who has never signed in named "Coco Student" and go home

    # Find the locked buttons to connect an account
    Given I am on "http://studio.code.org/users/edit?cpa-partial-lockout=1&cpa_schedule={%22cpa_new_user_lockout%22:%222023-07-05T23:15:00%2B00:00%22,%22cpa_all_user_lockout_warning%22:%222024-07-01T00:00:00%2B00:00%22,%22cpa_all_user_lockout%22:%222024-07-01T00:00:00%2B00:00%22}"
    Then I wait to see "#manage-linked-accounts"
    Then I wait until "form[action=\'/users/auth/google_oauth2?action=connect\'] button" is disabled

    # Navigate the lockout process
    Given I am on "http://studio.code.org/lockout"
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"
    And I press keys "parent@example.com" for element "#parent-email"
    Then element "#lockout-submit" is enabled

    # Submit request
    And I take note of the current loaded page
    When I press "lockout-submit"
    Then I wait until I am on a different page than I noted before

    # Accept request
    Then My parent permits my parental request

    # Find the now unlocked buttons to connect an account
    Given I am on "http://studio.code.org/users/edit?cpa-partial-lockout=1&cpa_schedule={%22cpa_new_user_lockout%22:%222023-07-05T23:15:00%2B00:00%22,%22cpa_all_user_lockout_warning%22:%222024-07-01T00:00:00%2B00:00%22,%22cpa_all_user_lockout%22:%222024-07-01T00:00:00%2B00:00%22}"
    Then I wait to see "#manage-linked-accounts"
    Then I wait until "form[action=\'/users/auth/google_oauth2?action=connect\'] button" is not disabled

  Scenario: Student should be able to add a personal email on an unlocked account
    Given I create an authorized teacher-associated under-13 old account sponsored student in Colorado named "Tandy"

    # Find the disabled region to provide a personal login
    Given I am on "http://studio.code.org/users/edit?cpa-partial-lockout=1&cpa_schedule={%22cpa_new_user_lockout%22:%222023-07-05T23:15:00%2B00:00%22,%22cpa_all_user_lockout_warning%22:%222024-07-01T00:00:00%2B00:00%22,%22cpa_all_user_lockout%22:%222024-07-01T00:00:00%2B00:00%22}"
    Then I wait to see "#edit_user_create_personal_account"
    Then I wait until "#edit_user_create_personal_account input[type=\'password\']" is disabled
