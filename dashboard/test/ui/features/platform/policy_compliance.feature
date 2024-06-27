# TODO(P20-990): Fix Policy Compliance UI tests
Feature: Policy Compliance and Parental Permission

  @skip
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

  @skip
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

  @skip
  Scenario: New under 13 account should be able to elect to sign out at the lockout.
    Given I create a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
    Given I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # The sign out button should navigate and show the sign in button
    When I press "lockout-signout"
    Then I wait to see "#header_user_signin"

  @skip
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
    Then I wait until element "#permission-status" contains text "Pending"

    # Perform a "resend"
    And I take note of the current loaded page
    When I press "lockout-resend"
    Then I wait until I am on a different page than I noted before
    Then I wait to see "#lockout-panel-form"

  @skip
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

  @skip
  Scenario: Student should not be able to enter their own email as their parent's email
    Given I create a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
    Given I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # Type in the student email as the parent email, which should disable the button
    And I press keys for the email for "Sally Student" into element "#parent-email"
    Then element "#lockout-submit" is disabled

  @skip
  Scenario: Student should be able to enter their parent's email if their parent created their account
    Given I create as a parent a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
    Given I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # Type in the student email as the parent email, which should not disable the button
    And I press keys for the email for "Sally Student" into element "#parent-email"
    Then element "#lockout-submit" is enabled

  @skip
  Scenario: Existing under 13 account in Colorado should not be locked out.
    Given I create a young student in Colorado who has never signed in named "Sally Student" before CPA exception and go home
    Given I am on "http://studio.code.org/home"

  Scenario: Teacher should be able to connect a third-party account even without a state specified
    Given I create a teacher who has never signed in named "Amstrad Teacher" after CPA exception and go home

    # Find the unlocked buttons to connect an account
    Given I am on "http://studio.code.org/users/edit?cpa-partial-lockout=1"
    Then I wait to see "#manage-linked-accounts"
    Then I wait until "form[action=\'/users/auth/google_oauth2?action=connect\'] button" is not disabled

  Scenario: Student should not be able to connect a third-party account until their account is unlocked
    Given I create a young student in Colorado who has never signed in named "Coco Student" after CPA exception and go home

    # Find the locked buttons to connect an account
    Given I am on "http://studio.code.org/users/edit?cpa-partial-lockout=1"
    Then I wait to see "#manage-linked-accounts"
    Then I wait until "form[action=\'/users/auth/google_oauth2?action=connect\'] button" is disabled

    # Navigate the lockout process via the Account Settings page
    Then I wait to see "#lockout-linked-accounts-form"
    And element "#permission-status" contains text "Not Submitted"
    And I press keys "parent@example.com" for element "#parent-email"
    Then element "#lockout-submit" is enabled

    # Submit request
    Then I press "lockout-submit"
    Then I wait until element "#permission-status" contains text "Pending"

    # Accept request
    Then My parent permits my parental request

    # Find the now unlocked buttons to connect an account
    Given I am on "http://studio.code.org/users/edit?cpa-partial-lockout=1"
    Then I wait to see "#manage-linked-accounts"
    Then I wait until "form[action=\'/users/auth/google_oauth2?action=connect\'] button" is not disabled

  Scenario: Sponsored student should not be able to add a personal email on an account until providing a state
    Given I create an authorized teacher-associated under-13 sponsored student named "Tandy" after CPA exception

    # Find the disabled region to provide a personal login
    Given I am on "http://studio.code.org/users/edit?cpa-partial-lockout=1"
    Then I wait to see "#edit_user_create_personal_account"
    Then element "#edit_user_create_personal_account input[type=\'password\']" is disabled

    # See that it tells the student that they need to enter a state
    Then element "#edit_user_create_personal_account_description" has "en-US" text from key "user.create_personal_login_state_required"

    # Have the student pick a state (outside the policy region)
    Given I select the "Alabama" option in dropdown "user_us_state"
    Then I press "#submit-update input" using jQuery to load a new page

    # Right now, we have to assert that the experiment is active
    # This should be unnecessary in the future, but will not hurt
    Given I am on "http://studio.code.org/users/edit?cpa-partial-lockout=1"

    # And now that they are in a non-policy state, they can see the enabled fields
    Then I wait to see "#edit_user_create_personal_account"
    Then element "#edit_user_create_personal_account input[type=\'password\']" is enabled

  Scenario: Sponsored student should not be able to add a personal email when they supply a policy state
    Given I create an authorized teacher-associated under-13 sponsored student named "Tandy" after CPA exception

    # Find the disabled region to provide a personal login
    Given I am on "http://studio.code.org/users/edit?cpa-partial-lockout=1"
    Then I wait to see "#edit_user_create_personal_account"
    Then element "#edit_user_create_personal_account input[type=\'password\']" is disabled

    # See that it tells the student that they need to enter a state
    Then element "#edit_user_create_personal_account_description" has "en-US" text from key "user.create_personal_login_state_required"

    # Have the student pick a state within the policy region
    Given I select the "Colorado" option in dropdown "user_us_state"
    Then I press "#submit-update input" using jQuery to load a new page

    # Right now, we have to assert that the experiment is active
    # This should be unnecessary in the future, but will not hurt
    Given I am on "http://studio.code.org/users/edit?cpa-partial-lockout=1"

    # And now that they are in a non-policy state, they can see the enabled fields
    Then I wait to see "#edit_user_create_personal_account"
    Then element "#edit_user_create_personal_account input[type=\'password\']" is disabled

    # See that it tells the student that they need to get parental permission
    Then element "#edit_user_create_personal_account_description" has "en-US" text from key "user.create_personal_login_parental_permission_required"

  Scenario: Sponsored student is able to add a personal email on an unlocked account
    Given I create an authorized teacher-associated under-13 sponsored student in Colorado named "Tandy" after CPA exception

    # Find the disabled region to provide a personal login
    Given I am on "http://studio.code.org/users/edit?cpa-partial-lockout=1"

    # Navigate the lockout process via the Account Settings page
    Then I wait to see "#lockout-linked-accounts-form"
    And element "#permission-status" contains text "Not Submitted"
    And I press keys "parent@example.com" for element "#parent-email"
    Then element "#lockout-submit" is enabled

    # Submit request
    Then I press "lockout-submit"
    Then I wait until element "#permission-status" contains text "Pending"

    # Accept request
    Then My parent permits my parental request

    # Find the now unlocked region to create a personal login
    Given I am on "http://studio.code.org/users/edit?cpa-partial-lockout=1"
    Then I wait to see "#edit_user_create_personal_account"
    And element "#edit_user_create_personal_account input[type=\'password\']" is enabled

    # And it should tell me that the request was granted
    And element "#permission-status" contains text "Granted"
  
  Scenario: Users in the CPA flow cannot change their age or state
    Given I create an authorized teacher-associated under-13 student in Colorado named "Tandy" after CPA exception

    # Find the disabled region to provide a personal login
    Given I am on "http://studio.code.org/users/edit?cpa-partial-lockout=1"

    # Navigate the lockout process via the Account Settings page
    Then I wait to see "#us_state_dropdown"
    Then element "#us_state_dropdown" is disabled
    Then element "#user_age" is disabled
