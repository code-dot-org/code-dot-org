And(/^the contract editor has (\d*) example[s]?$/) do |expected_examples|
  number_of_examples = @browser.execute_script("return Blockly.contractEditor.exampleBlocks.length;")
  number_of_examples.to_i.should eq expected_examples.to_i
end
