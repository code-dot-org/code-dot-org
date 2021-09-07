When /^I select dataset "([^"]*)"$/ do |column|
  @elements = @browser.find_elements(:css, ".uitest-ailab-dataset-image")

  @element = @elements[column.to_i]
  @element.click
end

When /^I select data table column "([^"]*)"$/ do |column|
  @elements = @browser.find_elements(:css, ".uitest-data-table-column")

  @element = @elements[column.to_i]
  @element.click
end

Then /^I see the dynamic instructions are showing "((?:[^"\\]|\\.)*)" key$/ do |selector|
  steps %{
    And element ".uitest-dynamic-instruction-#{selector}" has one of css properties "opacity" equal to "1"
  }
end
