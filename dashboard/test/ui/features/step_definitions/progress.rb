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

# Verifies that the given selector (which should be a progress bubble) is visible
# and displays the expected test_result. This function accounts for the asynchronous
# nature of progress bubbles and can be slow, especially when verifying that a bubble
# displays 'not_tried'. Passing no_wait=true skips all waits and immediately verifies
# the bubble.
def verify_progress(selector, test_result, no_wait=false)
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

  if no_wait
    steps %{
      And element "#{selector}" is visible
      And element "#{selector}" has css property "background-color" equal to "#{background_color}"
      And element "#{selector}" has css property "border-top-color" equal to "#{border_color}"
    }
  else
    # The data for progress bubbles can be loaded synchronously or asynchronously.
    # For 'not_tried', it is difficult to tell whether the bubble is just in its
    # default state or if progress data was loaded and the bubble was explicitly
    # set to 'not_tried'. In this case, we'll just wait a bit before checking to
    # reduce the likelihood of false positives.
    # For all other test_result values, we know that progress has been loaded if
    # the bubble changes color so we can just poll for the expected color.
    if test_result == 'not_tried'
      steps %{
        And I wait for 2 seconds
        And I wait until jQuery Ajax requests are finished
        And I wait until element "#{selector}" is visible
        And element "#{selector}" has css property "background-color" equal to "#{background_color}"
        And element "#{selector}" has css property "border-top-color" equal to "#{border_color}"
      }
    else
      steps %{ And I wait until element "#{selector}" is visible }
      wait_short_until do
        steps %{
          And element "#{selector}" has css property "background-color" equal to "#{background_color}"
          And element "#{selector}" has css property "border-top-color" equal to "#{border_color}"
        }
      end
    end
  end
end

def verify_bubble_type(selector, type)
  if type == "concept"
    border_radius = "2px"
  elsif type == "activity"
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
  ".header_level .react_stage a:nth(#{level_num - 1}) .progress-bubble"
end

Then /^I verify the bubble for level (\d+) is an? (concept|activity) bubble/ do |level, type|
  wait_short_until do
    verify_bubble_type(header_bubble_selector(level.to_i), type)
  end
end

Then /^I open the progress drop down of the current page$/ do
  steps %{
    Then I click selector ".header_popup_link"
    And I wait to see ".user-stats-block"
  }
end

Then /^I verify progress in the header of the current page is "([^"]*)" for level (\d+)/ do |test_result, level|
  selector = header_bubble_selector(level.to_i)
  verify_progress(selector, test_result)
end

Then /^I verify progress in the drop down of the current page is "([^"]*)" for lesson (\d+) level (\d+)/ do |test_result, lesson, level|
  selector = "tbody tr:nth(#{lesson.to_i - 1}) a:contains(#{level.to_i}) .progress-bubble"
  verify_progress(selector, test_result)
end

Then /^I verify progress for lesson (\d+) level (\d+)( in detail view)? is "([^"]*)"( without waiting)?/ do |lesson, level, detail_view, test_result, without_waiting|
  selector = detail_view.nil? ?
    ".uitest-summary-progress-table .uitest-summary-progress-row:nth(#{lesson.to_i - 1}) .progress-bubble:nth(#{level.to_i - 1})" :
    ".uitest-detail-progress-table .uitest-progress-lesson:nth(#{lesson.to_i - 1}) .progress-bubble:nth(#{level.to_i - 1})"
  verify_progress(selector, test_result, !!without_waiting)
end

Then /^I verify progress for the sublevel with selector "([^"]*)" is "([^"]*)"/ do |selector, test_result|
  verify_progress(selector, test_result)
end

# PLC Progress
Then /^I verify progress for the selector "([^"]*)" is "([^"]*)"/ do |selector, progress|
  element_has_css(selector, 'background-color', MODULE_PROGRESS_COLOR_MAP[progress.to_sym])
end
