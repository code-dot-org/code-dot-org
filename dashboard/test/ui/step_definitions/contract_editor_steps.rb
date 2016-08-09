And(/^the contract editor has (\d*) example[s]?$/) do |expected_examples|
  number_of_examples = @browser.execute_script('return Blockly.contractEditor.exampleBlocks.length;')
  expect(number_of_examples.to_i).to eq(expected_examples.to_i)
end

When(/^"(.+)" refers to the open contract editor function definition$/) do |block_alias|
  example_block_id = @browser.execute_script('return Blockly.contractEditor.functionDefinitionBlock.id;')
  add_block_alias(block_alias, example_block_id.to_s)
end

When(/^"(.+)" refers to the open contract editor example (\d*)$/) do |block_alias, example_number|
  example_block_id = @browser.execute_script("return Blockly.contractEditor.exampleBlocks[#{example_number}].id;")
  add_block_alias(block_alias, example_block_id.to_s)
end

When(/^I configure the contract editor to disable examples$/) do
  @browser.execute_script('Blockly.contractEditor.disableExamples_ = true;')
end

And(/^I press the contract editor header "([^"]*)"$/) do |header_name|
  @browser.execute_script("$('.contractEditorHeaderText:contains(#{header_name})').simulate('drag', {})")
end

And(/^the "([^"]*)" contract editor header is visible$/) do |header_name|
  visible = @browser.execute_script("return $('text:contains(#{header_name})').parent().css('display') !== 'none'")
  expect(visible).to eq(true)
end

And(/^the "([^"]*)" contract editor header (?:isn't |is not |is in)visible$/) do |header_name|
  invisible = @browser.execute_script("return $('text:contains(#{header_name})').parent().css('display') === 'none'")
  expect(invisible).to eq(true)
end

And(/^there are no visible examples$/) do
  expect(any_examples_visible?).to be(false)
end

And(/^examples are visible$/) do
  expect(any_examples_visible?).to be(true)
end

And(/^the function editor definition block is visible$/) do
  expect(function_definition_block_visible?).to eq(true)
end

And(/^the function editor definition block is not visible$/) do
  expect(function_definition_block_visible?).to eq(false)
end

And(/^only one functional definition block is visible$/) do
  code = "return Blockly.mainBlockSpace.getAllBlocks().reduce(function (a, b) { return a + ((b.type === 'functional_definition' && b.isVisible()) ? 1 : 0) }, 0)"
  num_visible_blocks = @browser.execute_script(code)
  expect(num_visible_blocks.to_i).to eq(1)
end

def function_definition_block_visible?
  @browser.execute_script('return Blockly.functionEditor.functionDefinitionBlock.isVisible()')
end

def any_examples_visible?
  @browser.execute_script('return Blockly.contractEditor.exampleBlocks.some(function(block) {return block.isVisible()});')
end
