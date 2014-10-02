file = File.open("./js/blockValidation.js", "rb")
contents = file.read

Given(/^I run block validation with key "(.*?)"$/) do |key|

  contents += ";return validateWithKey('#{key}');"

  @browser.execute_script(contents).should eq ""
end
