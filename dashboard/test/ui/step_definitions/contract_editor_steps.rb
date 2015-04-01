And(/^the contract editor has (\d*) example[s]?$/) do |expected_examples|
  number_of_examples = @browser.execute_script('return Blockly.contractEditor.exampleBlocks.length;')
  number_of_examples.to_i.should eq expected_examples.to_i
end

When(/^"(.+)" refers to the open contract editor function definition$/) do |block_alias|
  example_block_id = @browser.execute_script('return Blockly.contractEditor.functionDefinitionBlock.id;')
  add_block_alias(block_alias, example_block_id.to_s)
end

When(/^"(.+)" refers to the open contract editor example (\d*)$/) do |block_alias, example_number|
  example_block_id = @browser.execute_script("return Blockly.contractEditor.exampleBlocks[#{example_number}].id;")
  add_block_alias(block_alias, example_block_id.to_s)
end
