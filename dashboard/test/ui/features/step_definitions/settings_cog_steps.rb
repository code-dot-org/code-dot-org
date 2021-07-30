# Helper steps for the App Lab and Game Lab settings cog menu

When /^I press the settings cog$/ do
  cog_selector = '.settings-cog:visible'
  steps %{
    Then I wait until element "#{cog_selector}" is visible
    And I click selector "#{cog_selector}"
  }
end

When /^I press the settings cog menu item "([^"]*)"$/ do |item_text|
  menu_item_selector = ".settings-cog-menu:visible .pop-up-menu-item:contains(#{item_text})"
  steps %{
    Then I wait until element "#{menu_item_selector}" is visible
    And I click selector "#{menu_item_selector}"
  }
end

Then /^I open the Manage Assets dialog$/ do
  steps <<-STEPS
    Then I click selector ".settings-cog"
    And I click selector ".pop-up-menu-item"
  STEPS
end

Then /^I open the Manage Libraries dialog$/ do
  steps <<-STEPS
    Then I click selector ".settings-cog"
    And I click selector ".pop-up-menu-item:contains(Manage Libraries)"
  STEPS
end
