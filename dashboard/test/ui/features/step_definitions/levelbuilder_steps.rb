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

Given(/^I enter a temp unit name$/) do
  @temp_script_name = "temp-script-#{Time.now.to_i}-#{rand(1_000_000)}"
  puts "temp unit name: #{@temp_script_name}"
  steps %{
    And element ".familyNameInput" is visible
    And I press keys "#{@temp_script_name}" for element ".familyNameInput"
  }
end

Given(/^the unit slug input contains the temp script name$/) do
  steps %{
    And I wait until element ".newUnitSlug" is visible
    And element ".newUnitSlug" has value "#{@temp_script_name}"
  }
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
    And I wait until element ".edit_unit" is visible
  }
end

Given(/^I wait for the temp unit edit page to load$/) do
  steps %{
    And I wait until I am on "http://studio.code.org/s/#{@temp_script_name}/edit"
    And I wait until element ".edit_unit" is visible
  }
end

Given(/^I wait for the temp unit overview page to load$/) do
  steps %{
    And I wait until I am on "http://studio.code.org/s/#{@temp_script_name}"
    And I wait until element ".unit-overview-top-row" is visible
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

Given(/^I remove the temp unit from the cache$/) do
  browser_request(
    url: '/api/test/invalidate_script',
    method: 'POST',
    body: {script_name: @temp_script_name}
  )
end
Given(/^I delete the temp unit( with lessons)?$/) do |_|
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

Given(/^I enter a temp data doc key and temp data doc name$/) do
  @temp_data_doc_key = "temp-data-doc-#{Time.now.to_i}-#{rand(1_000_000)}"
  @temp_data_doc_name = "A Name: #{@temp_data_doc_key}"
  steps %{
    And I wait until element "input[name='key']" is visible
    And I press keys "#{@temp_data_doc_key}" for element "input[name='key']"
    And I press keys "#{@temp_data_doc_name}" for element "input[name='name']"
  }
end

Given(/^I wait for the temp data doc page to load$/) do
  steps %{
    And I wait until I am on "http://studio.code.org/data_docs/#{@temp_data_doc_key}"
    And I wait until element "#view-data-doc" is visible
  }
end

Given(/^I wait for the temp data doc edit page to load$/) do
  steps %{
    And I wait until I am on "http://studio.code.org/data_docs/#{@temp_data_doc_key}/edit"
    And I wait until element "#edit-data-doc" is visible
  }
end

Given(/^element "([^"]*)" contains the name of the temp data doc$/) do |selector|
  steps %{
     And element "#{selector}" contains text "#{@temp_data_doc_name}"
  }
end

Given(/^the element contains the path to the temp data doc$/) do
  steps %{
    And the href of selector "a:contains(#{@temp_data_doc_name})" contains "/data_docs/#{@temp_data_doc_key}"
  }
end

Given(/^I click the icon to edit the temp data doc$/) do
  steps %{
    And I click selector "#edit_#{@temp_data_doc_key}"
  }
end

Given(/^I click the icon to delete the temp data doc$/) do
  steps %{
    And I click selector "#delete_#{@temp_data_doc_key}"
  }
end

Given(/^the temp data doc is not visible$/) do
  steps %{
    And element "a" does not contain text "#{@temp_data_doc_name}"
  }
end
