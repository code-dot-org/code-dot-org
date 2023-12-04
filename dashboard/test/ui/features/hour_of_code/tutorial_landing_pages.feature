@eyes
@single_session
Feature: Looking at tutorial landing pages on Pegasus

Scenario Outline: Simple page view
  When I open my eyes to test "<test_name>"
  And I am on "<url>"
  And I dismiss the language selector
  And I wait for 2 seconds
  Then I see no difference for "initial load"
  And I close my eyes
  And I sign out
Examples:
  | url                                                               | test_name                  |
  | http://code.org/minecraft                                         | minecraft tutorial landing |
  | http://code.org/playlab                                           | playlab tutorial landing   |
  | http://code.org/starwars                                          | starwars tutorial landing  |
  | http://code.org/athletes                                          | athletes tutorial landing  |
  | http://code.org/educate/applab                                    | app lab tutorial landing   |
  | http://code.org/dance                                             | dance tutorial landing     |

# Disabling temporarily to unblock Test
#  | http://code.org/oceans                                            | oceans tutorial landing    |
