And /^I create a new section$/ do
  individual_steps %Q{
    When I press the new section button
    Then I should see the new section dialog

    When I select email login
    And I press the save button to create a new section
    And I wait for the dialog to close
    Then I should see the section table
  }
end

And /^I create a new section with course "([^"]*)"(?: and unit "([^"]*)")?$/ do |primary, secondary|
  individual_steps %Q{
    When I press the new section button
    Then I should see the new section dialog

    When I select email login
    Then I wait to see "#uitest-primary-assignment"

    When I select the "#{primary}" option in dropdown "uitest-primary-assignment"
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

And(/^I save the section url$/) do
  section_code = @browser.execute_script <<-SCRIPT
    return document
      .querySelector('.uitest-owned-sections tbody tr:last-of-type td:nth-child(6)')
      .textContent
      .trim();
  SCRIPT
  @section_url = "http://studio.code.org/join/#{section_code}"
end

And(/^I navigate to the section url$/) do
  steps %Q{
    Given I am on "#{@section_url}"
  }
  wait_short_until {/^\/join/.match(@browser.execute_script("return location.pathname"))}
end

And(/I type the section code into "([^"]*)"$/) do |selector|
  puts @section_url
  section_code = @section_url.split('/').last
  steps %Q{
    And I type "#{section_code}" into "#{selector}"
  }
end

When /^I see the section set up box$/ do
  steps 'When I wait to see ".uitest-set-up-sections"'
end

When /^I press the new section button$/ do
  steps 'When I press the first ".uitest-newsection" element'
end

Then /^I should see the new section dialog$/ do
  steps 'Then I see ".modal"'
end

When /^I select (picture|word|email) login$/ do |login_type|
  steps %Q{When I press the first ".uitest-#{login_type}Login .uitest-button" element}
end

When /^I press the save button to create a new section$/ do
  steps 'When I press the first ".uitest-saveButton" element'
end

Then /^I should see the section table$/ do
  steps 'Then I see ".uitest-owned-sections"'
end

Then /^the section table should have (\d+) rows?$/ do |expected_row_count|
  row_count = @browser.execute_script(<<-SCRIPT)
    return document.querySelectorAll('.uitest-owned-sections tbody tr').length;
  SCRIPT
  expect(row_count.to_i).to eq(expected_row_count.to_i)
end

Then /^the section table row at index (\d+) has script path "([^"]+)"$/ do |row_index, expected_path|
  href = @browser.execute_script(
    "return $('.uitest-owned-sections tbody tr:eq(#{row_index}) td:eq(3) a:eq(1)').attr('href');"
  )
  # ignore query params
  actual_path = href.split('?')[0]
  expect(actual_path).to eq(expected_path)
end

Then /^I save the section id from row (\d+) of the section table$/ do |row_index|
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

# @return [Number] the section id for the corresponding row in the sections table
def get_section_id_from_table(row_index)
  # e.g. https://code.org/teacher-dashboard#/sections/54
  href = @browser.execute_script(
    "return $('.uitest-owned-sections tbody tr:eq(#{row_index}) td:eq(1) a').attr('href')"
  )
  section_id = href.split('/').last.to_i
  expect(section_id).to be > 0
  section_id
end

And(/^I save the section url$/) do
  section_code = @browser.execute_script <<-SCRIPT
    return document
      .querySelector('.uitest-owned-sections tbody tr:last-of-type td:nth-child(6)')
      .textContent
      .trim();
  SCRIPT
  @section_url = "http://studio.code.org/join/#{section_code}"
end
