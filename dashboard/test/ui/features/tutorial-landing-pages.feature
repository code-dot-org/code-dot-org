@eyes
Feature: Looking at tutorial landing pages with Applitools Eyes

Scenario Outline: Viewing tutorial landing page
  Given I am on "http://code.org/"
  When I open my eyes to test "<test_name>"
  And I am on "<url>"
  When I rotate to landscape
  Then I see no difference for "initial load"
  And I close my eyes
Examples:
  | url                                                               | test_name                    |
  | http://code.org/minecraft                                         | minecraft landing            |
  | http://code.org/dance                                             | dance landing                |
  | http://code.org/playlab                                           | playlab landing              |
  | http://code.org/starwars                                          | starwars landing             |
  | http://code.org/athletes                                          | athletes landing             |
  | http://code.org/edcuate/applab                                    | app lab landing              |
