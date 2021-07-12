When /^I select table column "([^"]*)"$/ do |column|
  @elements = @browser.find_elements(:css, ".table-column")

  @element = @elements[column.to_i]
  @element.click
end

Then /^I wait to see the dynamic instructions contain "((?:[^"\\]|\\.)*)" key$/ do |selector|
  steps %{
    And I wait to see ".#{selector}"
    And element ".#{selector}" has one of css properties "opacity" equal to "1"
  }
end
