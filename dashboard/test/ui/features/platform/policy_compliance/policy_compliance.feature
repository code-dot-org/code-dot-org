@no_mobile
Feature: Policy Compliance
  @pegasus_content
  Scenario: New under 13 account should be able to elect to sign out at the lockout.
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase

    When I create a young student in Colorado who has never signed in named "Sally Student" after CAP start and go home
    Then I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # The sign out button should navigate and show the sign in button
    And I click "#lockout-signout" to load a new page
    Then check that the URL contains "http://code.org"

  Scenario: Existing under 13 account in Colorado should not be locked out.
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase

    When I create a young student in Colorado who has never signed in named "Sally Student" before CAP start and go home
    Then I am on "http://studio.code.org/home"

  Scenario: Teacher should be able to connect a third-party account even without a state specified
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase
    Given I create a teacher who has never signed in named "Amstrad Teacher" after CAP start and go home

    # Find the unlocked buttons to connect an account
    Given I am on "http://studio.code.org/users/edit"
    Then I wait to see "#manage-linked-accounts"
    Then I wait until "form[action=\'/users/auth/google_oauth2?action=connect\'] button" is not disabled

  Scenario: Student should not be able to connect a third-party account until their account is unlocked
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase
    Given I create a young student in Colorado who has never signed in named "Coco Student" before CAP start and go home

    # Find the locked buttons to connect an account
    Given I am on "http://studio.code.org/users/edit"
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
    Given I am on "http://studio.code.org/users/edit"
    Then I wait to see "#manage-linked-accounts"
    Then I wait until "form[action=\'/users/auth/google_oauth2?action=connect\'] button" is not disabled

  Scenario: Sponsored student should not be able to add a personal email on an account until providing a state
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase
    Given I create an authorized teacher-associated under-13 sponsored student named "Tandy" after CAP start

    # Find the disabled region to provide a personal login
    Given I am on "http://studio.code.org/users/edit"
    Then I wait to see "#edit_user_create_personal_account"
    Then element "#edit_user_create_personal_account input[type=\'password\']" is disabled

    # See that it tells the student that they need to enter a state
    Then element "#edit_user_create_personal_account_description" has "en-US" text from key "user.create_personal_login_state_required"

    # Have the student pick a state (outside the policy region)
    Given I select the "Alabama" option in dropdown "user_us_state"
    Then I click "#submit-update"
    Then I wait until element "div#account-update-success" is visible

    # Right now, we have to assert that the experiment is active
    # This should be unnecessary in the future, but will not hurt
    Given I am on "http://studio.code.org/users/edit"

    # And now that they are in a non-policy state, they can see the enabled fields
    Then I wait to see "#edit_user_create_personal_account"
    Then element "#edit_user_create_personal_account input[type=\'password\']" is enabled

  Scenario: Sponsored student should not be able to add a personal email when they supply a policy state
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase
    Given I create an authorized teacher-associated under-13 sponsored student named "Tandy" after CAP start

    # Find the disabled region to provide a personal login
    Given I am on "http://studio.code.org/users/edit"
    Then I wait to see "#edit_user_create_personal_account"
    Then element "#edit_user_create_personal_account input[type=\'password\']" is disabled

    # See that it tells the student that they need to enter a state
    Then element "#edit_user_create_personal_account_description" has "en-US" text from key "user.create_personal_login_state_required"

    # Have the student pick a state within the policy region
    Given I select the "Colorado" option in dropdown "user_us_state"
    Then I click "#submit-update"
    Then I wait until element "div#account-update-success" is visible

    # Right now, we have to assert that the experiment is active
    # This should be unnecessary in the future, but will not hurt
    Given I am on "http://studio.code.org/users/edit"

    # And now that they are in a non-policy state, they can see the enabled fields
    Then I wait to see "#edit_user_create_personal_account"
    Then element "#edit_user_create_personal_account input[type=\'password\']" is disabled

    # See that it tells the student that they need to get parental permission
    Then element "#edit_user_create_personal_account_description" has "en-US" text from key "user.create_personal_login_parental_permission_required"

  Scenario: Sponsored student is able to add a personal email on an unlocked account
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase
    Given I create an authorized teacher-associated under-13 sponsored student in Colorado named "Tandy" after CAP start

    # Find the disabled region to provide a personal login
    Given I am on "http://studio.code.org/users/edit"

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
    Given I am on "http://studio.code.org/users/edit"
    Then I wait to see "#edit_user_create_personal_account"
    And element "#edit_user_create_personal_account input[type=\'password\']" is enabled

    # And it should tell me that the request was granted
    And element "#permission-status" contains text "Granted"
