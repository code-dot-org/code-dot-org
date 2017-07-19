PUZZLE_SOLUTIONS = {
  "http://studio.code.org/s/allthethings/stage/2/puzzle/1" => %{
    And I drag block "4" to block "5"
    And I drag block "4" to block "6" plus offset 0, 50
  }
}

Then /^I complete the level on "([^"]*)"$/ do |puzzle_url|
  steps %{
    And I am on "#{puzzle_url}?noautoplay=true"
    And I wait for the page to fully load
    And I close the instructions overlay if it exists
  }
  steps PUZZLE_SOLUTIONS[puzzle_url]
  steps %{
    And I press "runButton"
    And I wait until element ".congrats" is visible
  }
end

Then /^I complete the free response on "([^"]*)"$/ do |puzzle_url|
  steps %{
    And I am on "#{puzzle_url}?noautoplay=true"
    And I wait until element ".response" is visible
    And I type "hello world" into ".response"
    And I click selector ".submitButton" to load a new page
  }
end

Then /^I submit the assessment on "([^"]*)"$/ do |puzzle_url|
  steps %{
    And I am on "#{puzzle_url}?noautoplay=true"
    And I click selector ".answers:nth(0) .answerbutton[index=1]" once I see it
    And I click selector ".submitButton" once I see it
    And I wait until element ".modal" is visible
    And I click selector ".modal #ok-button" to load a new page
  }
end
