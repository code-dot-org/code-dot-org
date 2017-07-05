Then /^the (\d*)th sprite image has height "(\d*)"$/ do |n, height|
  @browser.execute_script("return $('#spriteLayer image').eq(#{n}).attr('height') === '#{height}';")
end
