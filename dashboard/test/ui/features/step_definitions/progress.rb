# Get the SCSS color constant for a given status.
def color_string(key)
  {
    perfect: 'rgb(14, 190, 14)',        # $level_perfect
    passed: 'rgb(159, 212, 159)',       # $level_passed
    not_tried: 'rgb(254, 254, 254)',    # $level_not_tried
    lighter_gray: 'rgb(198, 202, 205)',
    assessment: 'rgb(118, 101, 160)'
  }[key.to_sym]
end

def verify_progress(selector, test_result)
  if test_result == 'perfect'
    background_color = color_string('perfect')
    border_color = color_string('perfect')
  elsif test_result == 'attempted'
    background_color = color_string('not_tried')
    border_color = color_string('perfect')
  elsif test_result == 'not_tried'
    background_color = color_string('not_tried')
    border_color = color_string('lighter_gray')
  elsif test_result == 'perfect_assessment'
    background_color = color_string('assessment')
    border_color = color_string('assessment')
  elsif test_result == 'attempted_assessment'
    background_color = color_string('not_tried')
    border_color = color_string('assessment')
  end
  steps %{
    And I wait until element "#{selector}" is in the DOM
    And element "#{selector}" has css property "background-color" equal to "#{background_color}"
    And element "#{selector}" has css property "border-top-color" equal to "#{border_color}"
  }
end

Then /^I verify progress in the header of the current page is "([^"]*)" for level (\d+)/ do |test_result, level|
  # Sometimes there's a momentary delay loading progress (which updates the color)
  # so allow a brief wait for the appropriate styling to show up.
  selector = ".header_level_container .react_stage a:nth(#{level.to_i - 1}) :first-child :first-child"
  # Wait 5 seconds because progress is async
  steps %{
    And I wait for 5 seconds
  }
  verify_progress(selector, test_result)
end

Then /^I open the progress drop down of the current page$/ do
  steps %{
    Then I click selector ".header_popup_link"
    And I wait to see ".user-stats-block"
  }
end

Then /^I verify progress in the drop down of the current page is "([^"]*)" for stage (\d+) level (\d+)/ do |test_result, stage, level|
  selector = "tbody tr:nth(#{stage.to_i - 1}) a:contains(#{level.to_i}) :first-child :first-child"
  verify_progress(selector, test_result)
end

Then /^I verify progress for stage (\d+) level (\d+) is "([^"]*)"/ do |stage, level, test_result|
  selector = "tbody tr:nth(#{stage.to_i - 1}) a:contains(#{level.to_i}) :first-child :first-child"
  verify_progress(selector, test_result)
end

# PLC Progress
Then /^I verify progress for the selector "([^"]*)" is "([^"]*)"/ do |selector, progress|
  element_has_css(selector, 'background-color', MODULE_PROGRESS_COLOR_MAP[progress.to_sym])
end
