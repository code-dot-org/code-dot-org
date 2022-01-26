# Helper steps for interacting with the header
When /^I (?:open|close) the help menu$/ do
  help_menu_button_selector = '#help-icon'
  steps %{
    Then I wait until element "#{help_menu_button_selector}" is visible
    And I click selector "#{help_menu_button_selector}"
    Then I wait to see "#help-contents"
  }
end

When /^I press help menu item "([^"]*)"$/ do |help_menu_item_id|
  menu_item_selector = "#help-contents #{help_menu_item_id}"
  steps %{
    Then I wait until element "#{menu_item_selector}" is visible
    And I click selector "#{menu_item_selector}"
  }
end

Then /^I initiate pairing$/ do
  steps <<-STEPS
    And I wait until element ".display_name" is visible
    And I click selector ".display_name"
    And I wait until element "#pairing_link" is visible
    # Wait for user menu to finish animating
    And I wait for 0.5 seconds
    And I press "pairing_link"
    And I wait until element ".student" is visible
    And I click selector ".student"
    And I wait until element ".addPartners" is visible
    And I click selector ".addPartners"
    And I wait for 5 seconds
    And I wait until element ".user_menu" is visible
    And I wait until element ".pairing_name" is visible
    And element ".pairing_name" contains text "Team"
    And I wait until element ".fa-users" is visible
    And I click selector ".pairing_name"
    And I wait until element ".pairing_summary" is visible
  STEPS
end

Then /^I verify the user menu shows "([^"]*)" and "([^"]*)" are in a pairing group$/ do |name1, name2|
  steps <<-STEPS
    And I wait until element ".user_menu" is visible
    And I wait until element ".pairing_name" is visible
    And element ".pairing_name" contains text "Team"
    And I wait until element ".fa-users" is visible
    And I click selector ".pairing_name"
    And I wait until element ".pairing_summary" is visible
    And element ".pairing_summary" contains text "#{name1}"
    And element ".pairing_summary" contains text "#{name2}"
  STEPS
end
