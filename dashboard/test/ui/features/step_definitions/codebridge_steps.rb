Then(/^I open the dropdown for file ([^"]*)$/) do |file_id|
  steps <<~GHERKIN
    And I hover over selector "#0-#{file_id}-draggable"
    And I press "uitest-file-#{file_id}-kebab"
  GHERKIN
end
