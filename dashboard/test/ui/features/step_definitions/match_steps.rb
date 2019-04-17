And /^match level (\d+) question contains text "([^"]*)"$/ do |index, expected_text|
  selector = ".level-group-content .match:nth(#{index}) .question"
  actual_text = @browser.execute_script("return $(#{selector.dump}).text();")
  expect(actual_text).to include(expected_text)
end

And /^match level (\d+) contains (\d+) unplaced answers$/ do |index, expected_count|
  selector = ".level-group-content .match:nth(#{index}) .match_answers .answer"
  actual_count = @browser.execute_script("return $(#{selector.dump}).length;")
  expect(actual_count).to eq(expected_count.to_i)
end

And /^match level (\d+) contains (\d+) empty slots$/ do |index, expected_count|
  selector = ".level-group-content .match:nth(#{index}) .match_slots .emptyslot"
  actual_count = @browser.execute_script("return $(#{selector.dump}).length;")
  expect(actual_count).to eq(expected_count.to_i)
end

And /^I drag match level (\d+) unplaced answer (\d+) to empty slot (\d+)$/ do |level, answer, slot|
  level_selector = ".level-group-content .match:nth(#{level})"
  answer_selector = "#{level_selector} .match_answers .answer:nth(#{answer})"
  slot_selector = "#{level_selector} .match_slots .emptyslot:nth(#{slot})"
  code = generate_selector_drag_code(answer_selector, slot_selector, 0, 0)
  @browser.execute_script code
end
