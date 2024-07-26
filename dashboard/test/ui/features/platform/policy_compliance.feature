@no_mobile
Feature: Policy Compliance and Parental Permission
  Scenario: New under 13 account should be able to send a parental request.
    Given I am on "http://studio.code.org"
    # CPA new user lockout phase starts 1 month before CPA exception
    Given CPA new user lockout phase starts at "2024-04-26T00:00:00MDT"

    When I create a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
    Then I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    Then I wait until element "#permission-status" contains text "Not Submitted"
    And element ".lockout-panel h2" contains text "Just one more thing!"
    And element "#lockout-panel-form > p:nth-child(1)" contains text "We need your parent or guardian to approve your account before you can get started. Please supply us with your parent or guardian's email address so they can grant you permission."
    And element "#lockout-panel-form > p:nth-child(2)" contains text "Note: Your account will be deleted if we do not receive your parent or guardian's permission by "

    # Type in the email do re-enable the button
    And I press keys "parent@example.com" for element "#parent-email"
    Then element "#lockout-submit" is enabled

    # Ensure that we are now "pending"
    When I press "lockout-submit"
    Then I wait until element "#permission-status" contains text "Pending"
    And element ".lockout-panel h2" contains text "Thanks! We've contacted your parent/guardian."
    And element "#lockout-panel-form > p:nth-child(1)" contains text "We sent an email to parent@example.com. Didn't receive anything? Update your parent or guardian's email below or send another request."
    And element "#lockout-panel-form > p:nth-child(2)" contains text "Note: Your account will be deleted if we do not receive your parent or guardian's permission by "

  Scenario: New under 13 account should be able to provide state and see lockout page to send parental request.
    Given I am on "http://studio.code.org"
    # CPA new user lockout phase starts 1 month before CPA exception
    Given CPA new user lockout phase starts at "2024-04-26T00:00:00MDT"

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
    When I press "lockout-submit"
    Then I wait until element "#permission-status" contains text "Pending"

  Scenario: New under 13 account should be able to elect to sign out at the lockout.
    Given I am on "http://studio.code.org"
    # CPA new user lockout phase starts 1 month before CPA exception
    Given CPA new user lockout phase starts at "2024-04-26T00:00:00MDT"

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
    Given CPA new user lockout phase starts at "2024-04-26T00:00:00MDT"

    When I create a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
    Then I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # Type in the email do re-enable the button
    And I press keys "parent@example.com" for element "#parent-email"
    Then element "#lockout-submit" is enabled

    # Ensure that we are now "pending"
    When I press "lockout-submit"
    Then I wait until element "#permission-status" contains text "Pending"

    # Perform a "resend"
    When I press "lockout-resend"
    Then I wait to see "#lockout-panel-form"

  Scenario: New under 13 account should be able to send a different email
    Given I am on "http://studio.code.org"
    # CPA new user lockout phase starts 1 month before CPA exception
    Given CPA new user lockout phase starts at "2024-04-26T00:00:00MDT"

    When I create a young student in Colorado who has never signed in named "Sally Student" after CPA exception and go home
    Then I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # Type in the email do re-enable the button
    And I press keys "parent@example.com" for element "#parent-email"
    Then element "#lockout-submit" is enabled

    # Ensure that we are now "pending"
    When I press "lockout-submit"
    Then I wait until element "#permission-status" contains text "Pending"

    # Type in the email do re-enable the button
    When I clear the text from element "#parent-email"
    And I press keys "parent2@example.com" for element "#parent-email"
    Then element "#lockout-submit" is enabled

    # Ensure that the new email was used
    When I press "lockout-submit"
    And I reload the page
    Then I wait to see "#lockout-panel-form"
    And element "#parent-email" has value "parent2@example.com"

  Scenario: Student should not be able to enter their own email as their parent's email
    Given I am on "http://studio.code.org"
    # CPA new user lockout phase starts 1 month before CPA exception
    Given CPA new user lockout phase starts at "2024-04-26T00:00:00MDT"

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
    Given CPA new user lockout phase starts at "2024-04-26T00:00:00MDT"

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
    Given CPA new user lockout phase starts at "2024-04-26T00:00:00MDT"

    When I create a young student in Colorado who has never signed in named "Sally Student" before CPA exception and go home
    Then I am on "http://studio.code.org/home"

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

  Scenario: Student account Under-13 in Colorado created before CPA exception cannot change age and state
    Given I create a young student in Colorado named "Tandy" before CPA exception

    Given I am on "http://studio.code.org/users/edit"

    Then I wait to see "#user_age"
    Then I wait to see "#user_us_state"
    Then element "#user_us_state" is disabled
    Then element "#user_age" is disabled

  Scenario: Student account Under-13 in Colorado created after CPA exception cannot change age and state
    Given I create a young student in Colorado named "Tandy" after CPA exception

    Given I am on "http://studio.code.org/users/edit"

    Then I wait to see "#user_age"
    Then I wait to see "#user_us_state"
    Then element "#user_us_state" is disabled
    Then element "#user_age" is disabled

  Scenario: Student account Under-13 not in Colorado created after CPA exception can change their age and state
    Given I create a young student named "Tandy" after CPA exception

    Given I am on "http://studio.code.org/users/edit"

    Then I wait to see "#user_age"
    Then I wait to see "#user_us_state"
    Then element "#user_us_state" is enabled
    Then element "#user_age" is enabled

  Scenario: Student account Under-13 not in Colorado created before CPA exception can change their age and state
    Given I create a young student named "Tandy" before CPA exception

    Given I am on "http://studio.code.org/users/edit"

    Then I wait to see "#user_age"
    Then I wait to see "#user_us_state"
    Then element "#user_us_state" is enabled
    Then element "#user_age" is enabled

  Scenario: Student account Over-13 and in Colorado created after CPA exception can change their age and state
    Given I create a student in Colorado named "Tandy" after CPA exception

    Given I am on "http://studio.code.org/users/edit"

    Then I wait to see "#user_age"
    Then I wait to see "#user_us_state"
    Then element "#user_us_state" is enabled
    Then element "#user_age" is enabled

  Scenario: Student account Over-13 and in Colorado created before CPA exception can change their age and state
    Given I create a student in Colorado named "Tandy" before CPA exception

    Given I am on "http://studio.code.org/users/edit"

    Then I wait to see "#user_age"
    Then I wait to see "#user_us_state"
    Then element "#user_us_state" is enabled
    Then element "#user_age" is enabled

  Scenario: Student account under-13 and in Colorado created after CPA exception using only clever cannot change their age and state
    Given I create a young student using clever in Colorado named "Tandy" after CPA exception

    Given I am on "http://studio.code.org/users/edit"

    Then I wait to see "#user_age"
    Then I wait to see "#user_us_state"
    Then element "#user_us_state" is disabled
    Then element "#user_age" is disabled

   Scenario: Student account under-13 and in Colorado created before CPA exception using only clever cannot change their age and state
    Given I create a young student using clever in Colorado named "Tandy" before CPA exception

    Given I am on "http://studio.code.org/users/edit"

    Then I wait to see "#user_age"
    Then I wait to see "#user_us_state"
    Then element "#user_us_state" is disabled
    Then element "#user_age" is disabled

  Scenario: Student account under-13 and in Colorado created before CPA exception using google cannot change their age and state
    Given I create a young student using google in Colorado named "Tandy" before CPA exception

    Given I am on "http://studio.code.org/users/edit"

    Then I wait to see "#user_age"
    Then I wait to see "#user_us_state"
    Then element "#user_us_state" is disabled
    Then element "#user_age" is disabled

  Scenario: Student account under-13 and in Colorado created after CPA exception using google cannot change their age and state
    Given I create a young student using google in Colorado named "Tandy" after CPA exception

    Given I am on "http://studio.code.org/users/edit"

    Then I wait to see "#user_age"
    Then I wait to see "#user_us_state"
    Then element "#user_us_state" is disabled
    Then element "#user_age" is disabled

   Scenario: Student account under-13 not in Colorado created after CPA exception using clever cannot change their age and state
    Given I create a young student using clever named "Tandy" after CPA exception

    Given I am on "http://studio.code.org/users/edit"

    Then I wait to see "#user_age"
    Then I wait to see "#user_us_state"
    Then element "#user_us_state" is enabled
    Then element "#user_age" is enabled

  Scenario: Student account under-13 not in Colorado created before CPA exception using clever cannot change their age and state
    Given I create a young student using clever named "Tandy" before CPA exception

    Given I am on "http://studio.code.org/users/edit"

    Then I wait to see "#user_age"
    Then I wait to see "#user_us_state"
    Then element "#user_us_state" is enabled
    Then element "#user_age" is enabled
  