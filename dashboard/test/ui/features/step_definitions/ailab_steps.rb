When /^I select data table column "([^"]*)"$/ do |column|
  @elements = @browser.find_elements(:css, ".uitest-data-table-column")

  @element = @elements[column.to_i]
  @element.click
end

Then /^I see the dynamic instructions are showing "((?:[^"\\]|\\.)*)" key$/ do |selector|
  steps %{
    And element ".uitest-dynamic-instruction-#{selector}" has one of css properties "opacity" equal to "1"
  }
end

# Place files in dashboard/test/fixtures
# Note: Safari webdriver does not support file uploads (https://code.google.com/p/selenium/issues/detail?id=4220)
Then /^I upload the file named "(.*?)" into AI Lab$/ do |filename|
  unless ENV['TEST_LOCAL'] == 'true'
    # Needed for remote (Sauce Labs) uploads
    @browser.file_detector = lambda do |args|
      str = args.first.to_s
      str if File.exist? str
    end
  end

  filename = File.expand_path(filename, '../fixtures')
  @browser.execute_script('$("input[type=file]").show()')
  element = @browser.find_element :css, '.csv-input'
  element.send_keys filename
  @browser.execute_script('$("input[type=file]").hide()')

  unless ENV['TEST_LOCAL'] == 'true'
    @browser.file_detector = nil
  end
end
