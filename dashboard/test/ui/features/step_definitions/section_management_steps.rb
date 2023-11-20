# Helper steps for creating and managing sections

And(/^I create a new (student|teacher|facilitator) section( and go home)?$/) do |participant_type, home|
  grade = participant_type == 'student' ? 'Other' : 'pl'
  section = JSON.parse(browser_request(url: '/dashboardapi/sections', method: 'POST', body: {login_type: 'email', participant_type: participant_type, grade: grade}))
  section_code = section['code']
  @section_url = "http://studio.code.org/join/#{section_code}"
  navigate_to replace_hostname('http://studio.code.org') if home
end

And /^I create a new "([^"]*)" student section named "([^"]*)" assigned to "([^"]*)"(?: version "([^"]*)")?(?: and unit "([^"]*)")?$/ do |marketing_audience, section_name, assignment_family, version_year, secondary|
  individual_steps <<~GHERKIN
    When I see the section set up box
    When I press the new section button
    Then I should see the new section dialog
    When I select email login
    Then I wait to see "#sections-set-up-container"
    And I press keys "#{section_name}" for element "#uitest-section-name-setup"
    And I press the first "input[name='grades[]']" element
    And I wait until element "button:contains(#{marketing_audience})" is visible
    And I click selector "button:contains(#{marketing_audience})"
    And I press the first "input[name='#{assignment_family}']" element
  GHERKIN

  if version_year
    individual_steps <<~GHERKIN
      And I click selector "#assignment-version-year" once I see it
      And I click selector ".assignment-version-title:contains(#{version_year})" once I see it
    GHERKIN
  end

  if secondary
    individual_steps <<~GHERKIN
      And I wait to see "#uitest-secondary-assignment"
      And I select the "#{secondary}" option in dropdown "uitest-secondary-assignment"
    GHERKIN
  end

  individual_steps <<~GHERKIN
    And I press the first "#uitest-save-section-changes" element
    And I wait until element "#classroom-sections" is visible
  GHERKIN
end

Given(/^I am a teacher with student sections named Section 1 and Section 2/) do
  steps "Given I am a teacher"
  browser_request(
    url: '/api/test/create_student_section_with_name',
    method: 'POST',
    body: {section_name: 'Section 1'}
  )
  browser_request(
    url: '/api/test/create_student_section_with_name',
    method: 'POST',
    body: {section_name: 'Section 2'}
  )
end

Given(/^I create a new student section assigned to "([^"]*)"$/) do |script_name|
  browser_request(
    url: '/api/test/create_student_section_assigned_to_script',
    method: 'POST',
    body: {script_name: script_name}
  )
end

And /^I create a new "([^"]*)" student section with course "([^"]*)", version "([^"]*)"(?: and unit "([^"]*)")?$/ do |marketing_audience, assignment_family, version_year, secondary|
  individual_steps <<~GHERKIN
    When I see the section set up box
    When I press the new section button
    Then I should see the new section dialog

    When I select email login

    And I wait until element "button:contains(#{marketing_audience})" is visible
    And I press keys "Untitled Section" for element "#uitest-section-name-setup"
    And I press the first "input[name='grades[]']" element
    And I click selector "button:contains(#{marketing_audience})"
    And I press the first "input[name='#{assignment_family}']" element
    And I click selector "#assignment-version-year" once I see it
    And I click selector ".assignment-version-title:contains(#{version_year})" once I see it
  GHERKIN

  if secondary
    individual_steps <<~GHERKIN
      And I wait to see "#uitest-secondary-assignment"
      And I select the "#{secondary}" option in dropdown "uitest-secondary-assignment"
    GHERKIN
  end

  individual_steps <<~GHERKIN
    And I press the first "#uitest-save-section-changes" element
    And I click selector "button:contains('Go to dashboard')" if I see it
    And I wait until element "#classroom-sections" is visible
  GHERKIN
end

And(/^I create a(n authorized)? teacher-associated( under-13)? student named "([^"]*)"$/) do |authorized, under_13, name|
  steps "Given I create a teacher named \"Teacher_#{name}\""
  # enroll in a plc course as a way of becoming an authorized teacher
  steps 'And I am enrolled in a plc course' if authorized

  section = JSON.parse(browser_request(url: '/dashboardapi/sections', method: 'POST', body: {login_type: 'email', participant_type: 'student'}))
  section_code = section['code']
  @section_url = "http://studio.code.org/join/#{section_code}"
  create_user(name, url: "/join/#{section_code}", code: 200, age: under_13 ? '10' : '16')
end

And(/^I save the student section url$/) do
  wait_short_until {steps 'Then I should see the student section table'}
  section_code = @browser.execute_script <<-SCRIPT
    return document
      .querySelector('.uitest-owned-sections tbody tr:last-of-type td:nth-child(6)')
      .textContent
      .trim();
  SCRIPT
  @section_url = "http://studio.code.org/join/#{section_code}"
end

And(/^I join the section$/) do
  page_load(true) do
    steps <<~GHERKIN
      Given I am on "#{@section_url}"
      And I click selector ".btn.btn-primary" once I see it
    GHERKIN
  end
end

And(/^I attempt to join the section$/) do
  steps "Given I am on \"#{@section_url}\""
end

And /^I click the "([^"]*)" checkbox in the dialog$/ do |section_name|
  @browser.execute_script("return $(\"span:contains(#{section_name})\").siblings()[0].click();")
end

And /^I see that "([^"]*)" is assigned to "([^"]*)" in the section table$/ do |section_name, course_name|
  individual_steps <<~GHERKIN
    And I wait until element "tr:contains(#{section_name}):contains(#{course_name})" is visible
  GHERKIN
end

And /^I see that "([^"]*)" is not assigned to "([^"]*)" in the section table$/ do |section_name, course_name|
  individual_steps <<~GHERKIN
    And I wait until element "tr:contains(#{section_name}):contains(#{course_name})" is not visible
  GHERKIN
end

And /^the "([^"]*)" checkbox is (not )?selected$/ do |section_name, negation|
  wait_until {@browser.execute_script("return $(\"span:contains(#{section_name})\").siblings().is(':checked');") == negation.nil?}
end

And(/I type the section code into "([^"]*)"$/) do |selector|
  puts @section_url
  section_code = @section_url.split('/').last
  steps "And I type \"#{section_code}\" into \"#{selector}\""
end

# press keys allows React to pick up on the changes
And(/I enter the section code into "([^"]*)"$/) do |selector|
  element = @browser.find_element(:css, selector)
  section_code = @section_url.split('/').last
  press_keys(element, section_code)
end

When /^I see the section set up box$/ do
  steps 'When I wait to see ".uitest-set-up-sections"'
end

When /^I press the new section button$/ do
  steps <<-GHERKIN
    Given I scroll the ".uitest-newsection" element into view
    When I press the first ".uitest-newsection" element
  GHERKIN
end

Then /^I should see the new section dialog$/ do
  steps 'Then I see ".modal"'
end

When /^I select (picture|word|email) login$/ do |login_type|
  steps "When I press the first \".uitest-#{login_type}Login\" element"
end

When /^I select (student|teacher|facilitator) participant type$/ do |participant_type|
  steps "When I press the first \".uitest-#{participant_type}-type\" element"
end

When /^I press the save button to create a new section$/ do
  steps 'When I press the first ".uitest-saveButton" element'
end

Then /^I should see the student section table$/ do
  steps 'Then I see ".uitest-owned-sections"'
end

Then /^I should see the professional learning section table$/ do
  steps 'Then I see ".uitest-owned-pl-sections"'
end

Then /^I should see the professional learning joined sections table$/ do
  steps 'Then I see ".ui-test-joined-pl-sections-table"'
end

Then /^the student section table should have (\d+) rows?$/ do |expected_row_count|
  wait_short_until {steps 'Then I should see the student section table'}
  row_count = @browser.execute_script(<<-SCRIPT)
    return document.querySelectorAll('.uitest-owned-sections tbody tr').length;
  SCRIPT
  expect(row_count.to_i).to eq(expected_row_count.to_i)
end

Then /^the professional learning section table should have (\d+) rows?$/ do |expected_row_count|
  wait_short_until {steps 'Then I should see the professional learning section table'}
  row_count = @browser.execute_script(<<-SCRIPT)
    return document.querySelectorAll('.uitest-owned-pl-sections tbody tr').length;
  SCRIPT
  expect(row_count.to_i).to eq(expected_row_count.to_i)
end

Then /^the professional learning joined sections table should have (\d+) rows?$/ do |expected_row_count|
  wait_short_until {steps 'Then I should see the professional learning joined sections table'}
  row_count = @browser.execute_script(<<-SCRIPT)
    return document.querySelectorAll('table.ui-test-joined-pl-sections-table tbody tr.test-row').length;
  SCRIPT
  expect(row_count.to_i).to eq(expected_row_count.to_i)
end

Then /^the section table row at index (\d+) has (primary|secondary) assignment path "([^"]+)"$/ do |row_index, assignment_type, expected_path|
  link_index = (assignment_type == 'primary') ? 0 : 1
  href = @browser.execute_script(
    "return $('.uitest-owned-sections tbody tr:eq(#{row_index}) td:eq(3) a:eq(#{link_index})').attr('href');"
  )
  # ignore query params
  actual_path = href.split('?')[0]
  expect(actual_path).to eq(expected_path)
end

Then /^I save the section id from row (\d+) of the section table$/ do |row_index|
  wait_short_until {steps 'Then I should see the student section table'}
  @section_id = get_section_id_from_table(row_index)
end

Then /^the url contains the section id$/ do
  expect(@section_id).to be > 0
  expect(@browser.current_url).to include("?section_id=#{@section_id}")
end

Then /^the href of selector "([^"]*)" contains the section id$/ do |selector|
  href = @browser.execute_script("return $(\"#{selector}\").attr('href');")
  expect(@section_id).to be > 0

  # make sure the query params do not come after the # symbol
  expect(href.split('#')[0]).to include("?section_id=#{@section_id}")
end

Then /^I navigate to teacher dashboard for the section I saved$/ do
  expect(@section_id).to be > 0
  steps %{
    Then I am on "http://studio.code.org/teacher_dashboard/sections/#{@section_id}"
  }
end

Then /^I navigate to teacher dashboard for the section I saved with experiment "([^"]*)"$/ do |experiment_name|
  expect(@section_id).to be > 0
  steps %{
    Then I am on "http://studio.code.org/teacher_dashboard/sections/#{@section_id}?enableExperiments=#{experiment_name}"
  }
end

Then /^I navigate to manage students for the section I saved$/ do
  expect(@section_id).to be > 0
  steps %{
    Then I am on "http://studio.code.org/teacher_dashboard/sections/#{@section_id}/manage_students"
  }
end

Then /^I navigate to the script "([^"]*)" lesson (\d+) lesson extras page for the section I saved$/ do |script_name, lesson_num|
  expect(@section_id).to be > 0
  steps %{
    Then I am on "http://studio.code.org/s/#{script_name}/lessons/#{lesson_num}/extras?section_id=#{@section_id}"
  }
end

Then /^I navigate to the script "([^"]*)" lesson (\d+) level (\d+) for the section I saved$/ do |script_name, lesson_num, level_num|
  expect(@section_id).to be > 0
  steps %{
    Then I am on "http://studio.code.org/s/#{script_name}/lessons/#{lesson_num}/levels/#{level_num}?section_id=#{@section_id}&noautoplay=true"
  }
end

Then /^I hide unit "([^"]+)"$/ do |unit_name|
  selector = ".uitest-CourseScript:contains(#{unit_name}) .fa-eye-slash"
  @browser.execute_script("$(#{selector.inspect}).click();")
  wait_short_until do
    @browser.execute_script("return window.__TestInterface && window.__TestInterface.toggleHiddenUnitComplete;")
  end
end

Then /^unit "([^"]+)" is marked as (not )?visible$/ do |unit_name, negation|
  selector = ".uitest-CourseScript:contains(#{unit_name})"
  visibility = @browser.execute_script("return $(#{selector.inspect}).attr('data-visibility');")
  expect(visibility).to eq(negation ? 'hidden' : 'visible')
end

# @return [Number] the section id for the corresponding row in the sections table
def get_section_id_from_table(row_index)
  # e.g. https://studio-code.org/teacher_dashboard/sections/54
  href = @browser.execute_script(
    "return $('.uitest-owned-sections tbody tr:eq(#{row_index}) td:eq(1) a').attr('href')"
  )
  section_id = href.split('/').last.to_i
  expect(section_id).to be > 0
  section_id
end

Then /^I open the section action dropdown$/ do
  steps 'Then I click selector ".ui-test-section-dropdown" once I see it'
end

Then /^I add the first student to the first code review group$/ do
  steps <<-GHERKIN
    And I focus selector "#uitest-unassign-all-button"
    And I press keys ":tab"
    And I press keys ":space"
    And I press keys ":arrow_right"
    And I press keys ":space"
  GHERKIN
end

Then /^I open the code review groups management dialog$/ do
  steps <<-GHERKIN
    And I navigate to teacher dashboard for the section I saved
    And I click selector "#uitest-teacher-dashboard-nav a:contains(Manage Students)" once I see it
    And I click selector "#uitest-code-review-groups-button" once I see it
  GHERKIN
end

Then /^I create a new code review group for the section I saved$/ do
  steps <<-GHERKIN
    And I open the code review groups management dialog
    And I wait for 2 seconds
    And I click selector "#uitest-create-code-review-group" once I see it
  GHERKIN
end
