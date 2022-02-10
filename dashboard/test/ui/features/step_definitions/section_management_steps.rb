# Helper steps for creating and managing sections

And /^I create a new section( and go home)?$/ do |home|
  section = JSON.parse(browser_request(url: '/dashboardapi/sections', method: 'POST', body: {login_type: 'email'}))
  section_code = section['code']
  @section_url = "http://studio.code.org/join/#{section_code}"
  navigate_to replace_hostname('http://studio.code.org') if home
end

And /^I create a new section named "([^"]*)" assigned to "([^"]*)" version "([^"]*)"(?: and unit "([^"]*)")?$/ do |section_name, assignment_family, version_year, secondary|
  individual_steps %Q{
    When I see the section set up box
    When I press the new section button
    Then I should see the new section dialog
    When I select email login
    Then I wait to see "#uitest-section-name"
    And I press keys "#{section_name}" for element "#uitest-section-name"
    Then I wait to see "#uitest-assignment-family"
    When I select the "#{assignment_family}" option in dropdown "uitest-assignment-family"

    And I click selector "#assignment-version-year" once I see it
    And I click selector ".assignment-version-title:contains(#{version_year})" once I see it
  }

  if secondary
    individual_steps %Q{
      And I wait to see "#uitest-secondary-assignment"
      And I select the "#{secondary}" option in dropdown "uitest-secondary-assignment"
    }
  end

  individual_steps %Q{
    And I press the save button to create a new section
    And I wait for the dialog to close
    Then I should see the section table
  }
end

And /^I create a new section named "([^"]*)" assigned to "([^"]*)"$/ do |section_name, assignment_family|
  individual_steps %Q{
    When I see the section set up box
    When I press the new section button
    Then I should see the new section dialog
    When I select email login
    Then I wait to see "#uitest-section-name"
    And I press keys "#{section_name}" for element "#uitest-section-name"
    Then I wait to see "#uitest-assignment-family"
    When I select the "#{assignment_family}" option in dropdown "uitest-assignment-family"
  }

  individual_steps %Q{
    And I press the save button to create a new section
    And I wait for the dialog to close
    Then I should see the section table
  }
end

And /^I create a new section with course "([^"]*)", version "([^"]*)"(?: and unit "([^"]*)")?$/ do |assignment_family, version_year, secondary|
  individual_steps %Q{
    When I see the section set up box
    When I press the new section button
    Then I should see the new section dialog

    When I select email login
    Then I wait to see "#uitest-assignment-family"

    When I select the "#{assignment_family}" option in dropdown "uitest-assignment-family"

    And I click selector "#assignment-version-year" once I see it
    And I click selector ".assignment-version-title:contains(#{version_year})" once I see it
  }

  if secondary
    individual_steps %Q{
      And I wait to see "#uitest-secondary-assignment"
      And I select the "#{secondary}" option in dropdown "uitest-secondary-assignment"
    }
  end

  individual_steps %Q{
    And I press the save button to create a new section
    And I wait for the dialog to close using jQuery
    Then I should see the section table
  }
end

And(/^I create a(n authorized)? teacher-associated( under-13)? student named "([^"]*)"$/) do |authorized, under_13, name|
  steps "Given I create a teacher named \"Teacher_#{name}\""
  # enroll in a plc course as a way of becoming an authorized teacher
  steps 'And I am enrolled in a plc course' if authorized

  section = JSON.parse(browser_request(url: '/dashboardapi/sections', method: 'POST', body: {login_type: 'email'}))
  section_code = section['code']
  @section_url = "http://studio.code.org/join/#{section_code}"
  create_user(name, url: "/join/#{section_code}", code: 200, age: under_13 ? '10' : '16')
end

And(/^I save the section url$/) do
  wait_short_until {steps 'Then I should see the section table'}
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
    steps %Q{
      Given I am on "#{@section_url}"
      And I click selector ".btn.btn-primary" once I see it
    }
  end
end

And(/^I attempt to join the section$/) do
  steps %Q{
    Given I am on "#{@section_url}"
  }
end

And(/I type the section code into "([^"]*)"$/) do |selector|
  puts @section_url
  section_code = @section_url.split('/').last
  steps %Q{
    And I type "#{section_code}" into "#{selector}"
  }
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
  steps <<-STEPS
    Given I scroll the ".uitest-newsection" element into view
    When I press the first ".uitest-newsection" element
  STEPS
end

Then /^I should see the new section dialog$/ do
  steps 'Then I see ".modal"'
end

When /^I select (picture|word|email) login$/ do |login_type|
  steps %Q{When I press the first ".uitest-#{login_type}Login" element}
end

When /^I press the save button to create a new section$/ do
  steps 'When I press the first ".uitest-saveButton" element'
end

Then /^I should see the section table$/ do
  steps 'Then I see ".uitest-owned-sections"'
end

Then /^the section table should have (\d+) rows?$/ do |expected_row_count|
  wait_short_until {steps 'Then I should see the section table'}
  row_count = @browser.execute_script(<<-SCRIPT)
    return document.querySelectorAll('.uitest-owned-sections tbody tr').length;
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
  wait_short_until {steps 'Then I should see the section table'}
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

Then /^I navigate to the script "([^"]*)" lesson (\d+) lesson extras page for the section I saved$/ do |script_name, lesson_num|
  expect(@section_id).to be > 0
  steps %{
    Then I am on "http://studio.code.org/s/#{script_name}/lessons/#{lesson_num}/extras?section_id=#{@section_id}"
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
  steps <<-STEPS
    And I focus selector "#uitest-unassign-all-button"
    And I press keys ":tab"
    And I press keys ":space"
    And I press keys ":arrow_right"
    And I press keys ":space"
  STEPS
end

Then /^I open the code review groups management dialog$/ do
  steps <<-STEPS
    And I navigate to teacher dashboard for the section I saved
    And I click selector "#uitest-teacher-dashboard-nav a:contains(Manage Students)" once I see it
    And I click selector "#uitest-code-review-groups-button" once I see it
  STEPS
end

Then /^I create a new code review group for the section I saved$/ do
  steps <<-STEPS
    And I open the code review groups management dialog
    And I wait for 2 seconds
    And I click selector "#uitest-create-code-review-group" once I see it
  STEPS
end
