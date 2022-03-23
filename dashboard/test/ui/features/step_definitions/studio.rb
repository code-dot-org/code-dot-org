Then /^the (\d*)th sprite image has height "(\d*)"$/ do |n, height|
  @browser.execute_script("return $('#spriteLayer image').eq(#{n}).attr('height') === '#{height}';")
end

When /^I load student number (.*)'s project from the blue teacher panel$/ do |n|
  steps <<-STEPS
    And I wait to see ".show-handle"
    And I click selector ".show-handle .fa-chevron-left"
    And I wait until element ".student-table" is visible
    And I click selector "#teacher-panel-container tr:nth(#{n})" to load a new page
  STEPS
end
