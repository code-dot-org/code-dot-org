PUZZLE_SOLUTIONS = {
  "http://studio.code.org/s/allthethings/lessons/2/levels/1" => %{
    And I drag block "4" to block "5"
    And I drag block "4" to block "6" plus offset 0, 50
  },
  "http://studio.code.org/s/allthethings/lessons/29/levels/1?level_name=2-3 Maze 1" => %{
    And I drag block "1" to block "4"
    And I drag block "1" to block "5"
  },
  "http://studio.code.org/s/allthethings/lessons/29/levels/4?level_name=2-3 Artist 1 new" => %{
    And I drag block "1" to block "25"
    And I drag block "2" to block "26"
    And I drag block "1" to block "27"
  },
}

def append_noautoplay(url_string)
  puzzle_url = URI.parse(url_string)
  params = URI.decode_www_form(puzzle_url.query || '')
  params << ['noautoplay', 'true']
  puzzle_url.query = URI.encode_www_form(params)
  puzzle_url.to_s
end

Then /^I complete the level on "([^"]*)"$/ do |puzzle_url|
  steps %{
    And I am on "#{append_noautoplay(puzzle_url)}"
    And I wait for the page to fully load
  }
  steps PUZZLE_SOLUTIONS[puzzle_url]
  steps %{
    And I press "runButton"
    And I wait until element ".congrats" is visible
  }
end

Then /^I complete the free response on "([^"]*)"$/ do |puzzle_url|
  steps %{
    And I am on "#{append_noautoplay(puzzle_url)}"
    And I wait until element ".response" is visible
    And I type "hello world" into ".response"
    And I click selector ".submitButton" to load a new page
  }
end

Then /^I submit the assessment on "([^"]*)"$/ do |puzzle_url|
  steps %{
    And I am on "#{append_noautoplay(puzzle_url)}"
    And I click selector ".answers:nth(0) .answerbutton[index=1]" once I see it
    And I click selector ".submitButton" once I see it
    And I wait until element ".modal" is visible
    And I click selector ".modal #ok-button" to load a new page
  }
end
