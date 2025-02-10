Then(/^I open the dropdown for file ([^"]*)$/) do |file_id|
  steps <<~GHERKIN
    And I hover over selector "#uitest-file-#{file_id}-row"
    And I press "uitest-file-#{file_id}-kebab"
  GHERKIN
end
