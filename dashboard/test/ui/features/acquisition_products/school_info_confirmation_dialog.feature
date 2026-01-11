@dashboard_db_access
# We need "press keys" to type into the React form's fields, but that doesn't work on mobile Safari.
@no_mobile

Feature: School Info Confirmation Dialog

# This test checks three relevant states of the user in the school info confirmation
# dialog flow:
# 1. The initial flow is when a user creates a new account and does not fill out
# all the fields in the school info interstitial.
# 2. The user receives prompt to complete school info interstitial 7 days after
# account creation and completes school info.
# 3. A week later, the user should not receive a prompt to complete school info
# 4. A year later after the user has completed school info, the user sees prompt to
# confirm or update current school info.

Scenario: School Info Confirmation Dialog
  # Teacher account is created with partial school info
  Given I create a teacher named "Teacher_Chuba" and go home
  # Wait for homepage to load before reloading the page.
  Then I wait until element "#teacher-home-header" is visible
  # The date of the teacher's account is updated to 7 days ago to simulate time travel
  # This enables the condition (see school_info_interstitial helper.rb) that checks
  # the age of the account to determine when to show the school info interstitial.
  And eight days pass for user "Teacher_Chuba"
  # One week after account creation, the teacher sees the prompt to complete the school info interstitial
  Then I reload the page
  And I wait to see "#ui-test-drawer-toolbar"

  # Teacher completes school info interstitial
  And I select the "United States" option in dropdown "uitest-country-dropdown"
  And I press keys "31513" for element "#uitest-school-zip"
  Then I wait until element "#uitest-school-dropdown" contains text "Appling County High School"
  And I select the "Appling County High School" option in dropdown "uitest-school-dropdown"
  Then I click selector "button:contains(Save)"
  Then I click selector "button:contains(Close)" once I see it
  And I wait until element "#ui-test-drawer-toolbar" is gone

  # One week later, the teacher does not see the prompt
  And eight days pass for user "Teacher_Chuba"
  Then I reload the page
  And element "#ui-test-drawer-toolbar" is not visible

  # One year later, the teacher sees the school info confirmation dialog and confirms at the same school
  And one year passes for user "Teacher_Chuba"
  And I clear session storage
  Then I reload the page
  And I wait to see "#ui-test-drawer-toolbar"
  Then I click selector "button:contains(I'm still teaching here)"
  And I wait until element "#ui-test-drawer-toolbar" is gone

  # One week later, the teacher does not see the prompt
  And eight days pass for user "Teacher_Chuba"
  Then I reload the page
  And element "#ui-test-drawer-toolbar" is not visible
