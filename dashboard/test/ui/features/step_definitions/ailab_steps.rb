When /^I select table column "([^"]*)"$/ do |column|
  @elements = @browser.find_elements(:css, ".table-column")

  @element = @elements[column.to_i]
  @element.click
end
