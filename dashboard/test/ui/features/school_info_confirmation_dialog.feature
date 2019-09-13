@dashboard_db_access
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
  # The date of the teacher's account is updated to 7 days ago to simulate time travel
  # This enables the condition (see school_info_interstitial helper.rb) that checks
  # the age of the account to determine when to show the school info interstitial.
  And I update user "Teacher_Chuba" created_at timestamp
  # One week later, the teacher sees the prompt to complete the school info interstitial
  Then I reload the page
  And I wait to see ".modal"

  # Teacher completes school info interstitial
  And element "#react-select-2--value" contains text "United States"
  And element "#school-type" is visible
  And I select the "Public" option in dropdown "school-type"
  And I wait until element "#nces_school" is visible
  Then I press keys "A Seattle Public School - Seattle, " for element "#nces_school"
  Then I wait until element ".VirtualizedSelectOption:contains('A Seattle Public School - Seattle, WA 98122')" is visible
  Then I press ".VirtualizedSelectOption:contains('A Seattle Public School - Seattle, WA 98122')" using jQuery
  Then I press "#save-button" using jQuery

  # One week later, the teacher does not see the prompt
  And I update user "Teacher_Chuba" last_seen_school_info_interstitial
  Then I reload the page
  And element ".modal" is not visible

  # One year later, the teacher sees the school info confirmation dialog
  And I update user "Teacher_Chuba" last_confirmation_date and last_seen_school_info_interstitial
  Then I reload the page
  And element ".modal-body" is visible
