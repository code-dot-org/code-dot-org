# Helper steps for levelbuilder permissions and tasks

And(/^I create a levelbuilder named "([^"]*)"$/) do |name|
  steps %{
    Given I create a teacher named "#{name}"
    And I get levelbuilder access
  }
end

And(/^I get levelbuilder access$/) do
  browser_request(url: '/api/test/levelbuilder_access', method: 'POST')
end

Given(/^I create a temp migrated unit with lessons$/) do
  response = browser_request(
    url: '/api/test/create_migrated_script',
    method: 'POST'
  )
  data = JSON.parse(response)
  @temp_script_name = data['script_name']
  @temp_lesson_id = data['lesson_id']
  @temp_lesson_without_lesson_plan_id = data['lesson_without_lesson_plan_id']
end

Given(/^I view the temp unit overview page$/) do
  steps %{
    Given I am on "http://studio.code.org/s/#{@temp_script_name}"
    And I wait until element "#script-title" is visible
  }
end

Given(/^I view the temp unit edit page$/) do
  steps %{
    Given I am on "http://studio.code.org/s/#{@temp_script_name}/edit"
    And I wait until element ".edit_script" is visible
  }
end

Given(/^I try to view the temp unit edit page$/) do
  steps %{
    Given I am on "http://studio.code.org/s/#{@temp_script_name}/edit"
  }
end

Given(/^I view the temp lesson edit page$/) do
  steps %{
    Given I am on "http://studio.code.org/lessons/#{@temp_lesson_id}/edit"
    And I wait until element "#edit-container" is visible
  }
end

Given(/^I view the temp lesson edit page for lesson without lesson plan$/) do
  steps %{
    Given I am on "http://studio.code.org/lessons/#{@temp_lesson_without_lesson_plan_id}/edit"
    And I wait until element "#edit-container" is visible
  }
end

Given (/^I remove the temp unit from the cache$/) do
  browser_request(
    url: '/api/test/invalidate_script',
    method: 'POST',
    body: {script_name: @temp_script_name}
  )
end
Given(/^I delete the temp unit with lessons$/) do
  browser_request(
    url: '/api/test/destroy_script',
    method: 'POST',
    body: {script_name: @temp_script_name}
  )
end

Given(/^I create a temp multi level$/) do
  @temp_level_name = "temp-level-#{Time.now.to_i}-#{rand(1_000_000)}"
  steps "And I am on \"http://studio.code.org/levels/new?type=Multi\""
  steps 'And I enter temp level multi dsl text'
  steps 'And I click "input[type=\'submit\']" to load a new page'
  @temp_level_id = @browser.current_url.split('/')[-2]
  puts "created temp level with id #{@temp_level_id}"
end

Given(/^I enter temp level multi dsl text$/) do
  dsl = <<~DSL
    name '#{@temp_level_name}'
    title 'title'
    description 'description here'
    question 'Question'
    wrong 'incorrect answer'
    right 'correct answer'
  DSL
  steps 'And I clear the text from element "#level_dsl_text"'
  steps "And I press keys #{dsl.dump} for element \"#level_dsl_text\""
end

Given(/^I check I am on the temp level (show|edit) page$/) do |page|
  suffix = (page == 'edit') ? '/edit' : ''
  url = "http://studio.code.org/levels/#{@temp_level_id}#{suffix}"
  url = replace_hostname(url)
  expect(@browser.current_url.split('?').first).to eq(url)
end

Given(/^I delete the temp level$/) do
  browser_request(
    url: '/api/test/destroy_level',
    method: 'POST',
    body: {id: @temp_level_id}
  )
end
