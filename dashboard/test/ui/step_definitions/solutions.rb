PUZZLE_SOLUTIONS = {
  "http://learn.code.org/s/allthethings/stage/2/puzzle/1" => %{
    And I drag block "4" to block "5"
    And I drag block "4" to block "6" plus offset 0, 50
  }
}

Then /^I complete the level on "([^"]*)"$/ do |puzzle_url|
  steps %{
    And I am on "#{puzzle_url}?noautoplay=true"
    And I close the dialog
  }
  steps PUZZLE_SOLUTIONS[puzzle_url]
  steps %{
    And I press "runButton"
    And I wait until element ".congrats" is visible
  }
end
