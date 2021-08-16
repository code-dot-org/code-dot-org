# Helper steps for interacting with the footer menu

When /^I (?:open|close) the small footer menu$/ do
  menu_selector = 'div.small-footer-base button.more-link'
  steps %{
    Then I wait until element "#{menu_selector}" is visible
    And I click selector "#{menu_selector}"
  }
end

When /^I press menu item "([^"]*)"$/ do |menu_item_text|
  menu_item_selector = "ul#more-menu a:contains(#{menu_item_text})"
  steps %{
    Then I wait until element "#{menu_item_selector}" is visible
    And I click selector "#{menu_item_selector}"
  }
end

When /^I select the "([^"]*)" small footer item( to load a new page)?$/ do |menu_item_text, load|
  page_load(load) do
    steps %{
      Then I open the small footer menu
      And I press menu item "#{menu_item_text}"
    }
  end
end
