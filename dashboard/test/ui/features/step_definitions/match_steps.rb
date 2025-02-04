And /^match level (\d+) question contains text "([^"]*)"$/ do |index, expected_text|
  selector = ".match:nth(#{index}) .question"
  actual_text = @browser.execute_script("return $(#{selector.dump}).text();")
  expect(actual_text).to include(expected_text)
end

And /^match level (\d+) contains (\d+) unplaced answers$/ do |index, expected_count|
  selector = ".match:nth(#{index}) .match_answers .answer"
  actual_count = @browser.execute_script("return $(#{selector.dump}).length;")
  expect(actual_count).to eq(expected_count.to_i)
end

And /^match level (\d+) contains (\d+) empty slots$/ do |index, expected_count|
  selector = ".match:nth(#{index}) .match_slots .emptyslot"
  actual_count = @browser.execute_script("return $(#{selector.dump}).length;")
  expect(actual_count).to eq(expected_count.to_i)
end

And /^I drag match level (\d+) unplaced answer (\d+) to empty slot (\d+)$/ do |level, answer, slot|
  level_selector = "document.querySelectorAll('.match')[#{level}]"
  answer = "#{level_selector}.querySelector('.match_answers .answer:nth-child(#{answer + 1})')"
  slot = "#{level_selector}.querySelector('.match_slots .emptyslot:nth-child(#{slot + 1})')"

  code = generate_match_drag_code(answer, slot)
  @browser.execute_script code
end

And /^match placed answer (\d+) has original index (\d+)$/ do |answer, original_index|
  selector = ".match_slots .answer:nth(#{answer})"
  actual_index = @browser.execute_script("return $(#{selector.dump}).attr('originalIndex');")
  expect(actual_index.to_i).to eq(original_index)
end
