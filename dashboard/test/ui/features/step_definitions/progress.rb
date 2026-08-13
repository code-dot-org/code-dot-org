# Acceptable RGB values for the DSCO semantic tokens that paint progress
# bubbles, as they resolve under the codeai-next brand (the default-brand
# fallback — see lib/cdo/brand.rb). Tokens resolve differently in the Light vs
# Dark theme — Lab2 wraps its content in `<div data-theme="Dark">` so any bubble
# shown inside a Lab2 page paints with the Dark-theme values — so each status
# lists Light first, then Dark where the two differ.
#
# These are literals, so they only hold for the current default brand: setting
# default-brand back to codeai moves every one of them.
#
# Sources (frontend/packages/component-library-styles):
#   brandCodeAiNext.css        canonical CADS tokens, [data-brand='codeai-next']
#   brandLegacyAliases.css     legacy token names mapped onto CADS values
def color_strings(key)
  {
    # --background-success-primary (sentiment-success-70 in both themes), which
    # paints both the fill and the border of every success status —
    # progressStyles.js draws those borders in the fill color, so there is no
    # separate --borders-success-primary resolution to accept here.
    perfect: ['rgb(37, 136, 48)'],
    # --background-success-extra-light
    passed: ['rgb(216, 255, 220)', 'rgb(0, 63, 37)'],
    # --background-neutral-primary (white Light, neutral-base-black Dark)
    not_tried: ['rgb(255, 255, 255)', 'rgb(18, 18, 18)'],
    # --borders-neutral-primary
    lighter_gray: ['rgb(211, 214, 218)', 'rgb(75, 82, 88)']
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
    background_colors = color_strings('perfect')
    border_colors = color_strings('perfect')
  when 'attempted'
    background_colors = color_strings('not_tried')
    border_colors = color_strings('perfect')
  when 'not_tried'
    background_colors = color_strings('not_tried')
    border_colors = color_strings('lighter_gray')
  # Assessment levels are no longer color-coded (they used to paint purple);
  # they are denoted by a star instead, and take the same status colors as
  # any other level.
  when 'perfect_assessment'
    background_colors = color_strings('perfect')
    border_colors = color_strings('perfect')
  when 'attempted_assessment'
    background_colors = color_strings('not_tried')
    border_colors = color_strings('perfect')
  when 'attempted_assessment_dot'
    # Small (dot) assessment bubbles drop status coloring until completed,
    # so a started-but-not-completed one keeps the not_tried gray outline.
    background_colors = color_strings('not_tried')
    border_colors = color_strings('lighter_gray')
  end

  steps %{
    And I wait until element "#{selector}" is visible
    And I wait until jQuery Ajax requests are finished
  }

  # The data for progress bubbles can be loaded asynchronously, so keep
  # checking until progress is loaded and the bubble is the correct color.
  # Each status accepts either the Light- or Dark-theme RGB resolution
  # of its DSCO token (see `color_strings` above for why).
  wait_short_until do
    background_colors.include?(element_css_value(selector, 'background-color')) &&
      border_colors.include?(element_css_value(selector, 'border-top-color'))
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
