Then(/^there's (\d*) dirt at \((\d+), (\d+)\)$/) do |dirt_amount, x, y|
  dirt_amount_actual = @browser.execute_script("return Maze.controller.map.getValue(#{x},#{y})")
  expect(dirt_amount.to_i).to eq(dirt_amount_actual.to_i)
end
