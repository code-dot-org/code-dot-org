@no_mobile
Feature: Policy Compliance and Parental Permission
  Scenario: New under 13 account should be able to send a parental request.
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase

    When I create a young student in Colorado who has never signed in named "Sally Student" after CAP start and go home
    Then I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    Then I wait until element "#permission-status" contains text "Not Submitted"
    And element ".lockout-panel h2" contains text "Just one more thing!"
    And element "#lockout-panel-form > p:nth-child(1)" contains text "We need your parent or guardian to approve your account before you can get started. Please supply us with your parent or guardian's email address so they can grant you permission."
    And element "#lockout-panel-form > p:nth-child(2)" contains text "Note: Your account will be deleted if we do not receive your parent or guardian's permission by:"

    # Type in the email do re-enable the button
    And I press keys "parent@example.com" for element "#parent-email"
    Then element "#lockout-submit" is enabled

    # Ensure that we are now "pending"
    When I press "lockout-submit"
    Then I wait until element "#permission-status" contains text "Pending"
    And element ".lockout-panel h2" contains text "Thanks! We've contacted your parent/guardian."
    And element "#lockout-panel-form > p:nth-child(1)" contains text "We sent an email to parent@example.com. Didn't receive anything? Update your parent or guardian's email below or send another request."
    And element "#lockout-panel-form > p:nth-child(2)" contains text "Note: Your account will be deleted if we do not receive your parent or guardian's permission by:"

  Scenario: New under 13 account should be able to provide state and see lockout page to send parental request.
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase

    When I create a young student who has never signed in named "Sally Student" after CAP start
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

  Scenario: New under 13 account should be able to resend the email
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase

    When I create a young student in Colorado who has never signed in named "Sally Student" after CAP start and go home
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
    Given CPA all user lockout phase

    When I create a young student in Colorado who has never signed in named "Sally Student" after CAP start and go home
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
    And I wait until element "#lockout-submit" is visible
    And I reload the page
    Then I wait to see "#lockout-panel-form"
    And element "#parent-email" has value "parent2@example.com"

  Scenario: Student should not be able to enter their own email as their parent's email
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase

    When I create a young student in Colorado who has never signed in named "Sally Student" after CAP start and go home
    Then I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # Type in the student email as the parent email, which should disable the button
    And I press keys for the email for "Sally Student" into element "#parent-email"
    Then element "#lockout-submit" is disabled

  Scenario: Student should be able to enter their parent's email if their parent created their account
    Given I am on "http://studio.code.org"
    Given CPA all user lockout phase

    When I create as a parent a young student in Colorado who has never signed in named "Sally Student" after CAP start and go home
    Then I am on "http://studio.code.org/lockout"

    # It should not be a pending request
    Then I wait to see "#lockout-panel-form"
    And element "#permission-status" contains text "Not Submitted"

    # Type in the student email as the parent email, which should not disable the button
    And I press keys for the email for "Sally Student" into element "#parent-email"
    Then element "#lockout-submit" is enabled


