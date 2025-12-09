# Get the SCSS color constant for a given status.
def color_string(key)
  {
    perfect: 'rgb(14, 190, 14)',        # $level_perfect
    passed: 'rgb(159, 212, 159)',       # $level_passed
    not_tried: 'rgb(254, 254, 254)',    # $level_not_tried
    lighter_gray: 'rgb(198, 202, 205)',
    assessment: 'rgb(140, 82, 186)'
  }[key.to_sym]
end

# Verifies that the given selector (which should be a progress bubble) is visible
# and displays the expected test_result. This function accounts for the asynchronous
# nature of progress bubbles by repeatedly checking for the specified value for
# up to 30 seconds; this means that successful checks should be reliable and
# prompt, but failures will be slow.
def verify_progress(selector, test_result)
  case test_result
  when 'perfect'
    background_color = color_string('perfect')
    border_color = color_string('perfect')
  when 'attempted'
    background_color = color_string('not_tried')
    border_color = color_string('perfect')
  when 'not_tried'
    background_color = color_string('not_tried')
    border_color = color_string('lighter_gray')
  when 'perfect_assessment'
    background_color = color_string('assessment')
    border_color = color_string('assessment')
  when 'attempted_assessment'
    background_color = color_string('not_tried')
    border_color = color_string('assessment')
  end

  steps %{
    And I wait until element "#{selector}" is visible
    And I wait until jQuery Ajax requests are finished
  }

  # The data for progress bubbles can be loaded  asynchronously, so keep
  # checking until progress is loaded and the bubble is the correct color.
  wait_short_until do
    element_css_value(selector, 'background-color') == background_color &&
      element_css_value(selector, 'border-top-color') == border_color
  end
end

def verify_bubble_type(selector, type)
  case type
  when "concept"
    border_radius = "2px"
  when "activity"
    border_radius = "9px"
  else
    raise "Unexpected bubble type"
  end
  steps %{
    And I wait until element "#{selector}" is in the DOM
    And element "#{selector}" has one of css properties "border-radius,-webkit-border-radius" equal to "#{border_radius}"
  }
end

def header_bubble_selector(level_num)
  ".header_level .react_stage a:eq(#{level_num - 1}) .progress-bubble"
end

Then /^I verify the bubble for level (\d+) is an? (concept|activity) bubble/ do |level, type|
  wait_short_until do
    verify_bubble_type(header_bubble_selector(level.to_i), type)
  end
end

Then /^I open the progress drop down of the current page$/ do
  steps %{
    Then I click selector ".header_popup_link"
    And I wait to see ".uitest-summary-progress-table"
  }
end

Then /^I verify progress in the header of the current page is "([^"]*)" for level (\d+)/ do |test_result, level|
  selector = header_bubble_selector(level.to_i)
  verify_progress(selector, test_result)
end

Then /^I verify progress in the drop down of the current page is "([^"]*)" for lesson (\d+) level (\d+)/ do |test_result, lesson, level|
  selector = "tbody tr:eq(#{lesson.to_i - 1}) a:contains(#{level.to_i}) .progress-bubble"
  verify_progress(selector, test_result)
end

Then /^I verify progress for lesson (\d+) level (\d+)( in detail view)? is "([^"]*)"/ do |lesson, level, detail_view, test_result|
  selector = detail_view.nil? ?
    ".uitest-summary-progress-table .uitest-summary-progress-row:eq(#{lesson.to_i - 1}) .progress-bubble:eq(#{level.to_i - 1})" :
    ".uitest-detail-progress-table .uitest-progress-lesson:eq(#{lesson.to_i - 1}) .progress-bubble:eq(#{level.to_i - 1})"
  verify_progress(selector, test_result)
end

Then /^I verify progress for the sublevel with selector "([^"]*)" is "([^"]*)"/ do |selector, test_result|
  verify_progress(selector, test_result)
end

# PLC Progress
Then /^I verify progress for the selector "([^"]*)" is "([^"]*)"/ do |selector, progress|
  element_has_css(selector, 'background-color', MODULE_PROGRESS_COLOR_MAP[progress.to_sym])
end

# Note: only works for levels other than the current one
Then(/^check that level (\d+) on this lesson is done$/) do |level|
  undone = @browser.execute_script("return $('a[href$=\"level/#{level}\"].other_level').hasClass('level_undone')")
  !undone
end

# Note: only works for levels other than the current one
Then(/^check that level (\d+) on this lesson is not done$/) do |level|
  undone = @browser.execute_script("return $('a[href$=\"level/#{level}\"].other_level').hasClass('level_undone')")
  undone
end

And(/^I complete course "([^"]*)" unit (\d+)/) do |course_name, unit_position|
  browser_request(
    url: '/api/test/complete_unit',
    method: 'POST',
    body: {course_name: course_name, unit_position: unit_position}
  )
end
