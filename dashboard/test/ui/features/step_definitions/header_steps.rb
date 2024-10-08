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

Then /^I (can|could) navigate the following hamburger menu items(?: within the ([^\s]+) submenu)?:$/ do |visit, sub_menu, items|
  items.hashes.each do |item|
    steps <<-STEPS
      Then I wait to see "#hamburger-icon"
      And I click selector "#hamburger-icon"
      Then I wait to see "#hamburger-contents"
    STEPS

    if sub_menu
      steps <<-STEPS
        Then I wait to see "##{sub_menu}"
        And I click selector "##{sub_menu}"
      STEPS
    end

    if visit == "can"
      wait_until_interactable(5) do
        steps <<-STEPS
          And I click on the link reading "#{item['text']}" within element "#hamburger-contents" to load a new page
        STEPS
      end

      steps <<-STEPS
        Then check that I am on "#{item['url']}"
      STEPS
    else
      steps <<-STEPS
        Then the link reading "#{item['text']}" within element "#hamburger-contents" goes to "#{item['url']}"
      STEPS
    end
  end
end
