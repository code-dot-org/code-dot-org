@no_mobile
Feature: Create Dropdown in Header

#TOOD: Erin B., remove the pagemode cookie related steps when launched.

Scenario: Create Dropdown does NOT show without cookie
  Given I am a teacher
  And check that I am on "http://studio.code.org/home"
  And I wait until element ".create_menu" is not visible
  Then I sign out
  Given I am on "http://code.org/"
  And I wait until element ".create_menu" is not visible

Scenario: Create Dropdown shows when Signed Out, Desktop
  Given I am on "http://code.org/"
  Given I set the pagemode cookie to "create_header_2018"
  Then I reload the page
  And I wait to see ".create_menu"
  # Confirm the create dropdown also shows on Dashboard
  Given I am on "http://studio.code.org/projects/public"
  Given I set the pagemode cookie to "create_header_2018"
  Then I reload the page
  And I wait to see ".create_menu"

Scenario: Create Dropdown shows when Signed In
  Given I am a teacher
  And check that I am on "http://studio.code.org/home"
  Given I set the pagemode cookie to "create_header_2018"
  Then I reload the page
  And I wait to see ".create_menu"
  # Confirm the create dropdown also shows on Pegasus
  Given I am on "http://code.org/help"
  Given I set the pagemode cookie to "create_header_2018"
  Then I reload the page
  And I wait to see ".create_menu"

Scenario: Dropdown has correct options, age 13+
  Given I create a student named "16 Year Old"
  Given I set the pagemode cookie to "create_header_2018"
  Then I reload the page
  And I wait to see ".create_menu"
  And I click selector ".create_menu"
  And I wait to see "#create_dropdown_playlab"
  And I wait to see "#create_dropdown_artist"
  And I wait to see "#create_dropdown_applab"
  And I wait to see "#create_dropdown_gamelab"
  And I wait until element "#create_dropdown_minecraft" is not visible
  And I wait until element "#create_dropdown_flappy" is not visible
  And I wait to see "#view_all_projects"

Scenario: Dropdown has correct options, younger than 13
  Given I create a young student named "10 Year Old"
  Given I set the pagemode cookie to "create_header_2018"
  Then I reload the page
  And I wait to see ".create_menu"
  And I click selector ".create_menu"
  And I wait to see "#create_dropdown_playlab"
  And I wait to see "#create_dropdown_artist"
  And I wait to see "#create_dropdown_minecraft"
  And I wait to see "#create_dropdown_flappy"
  And I wait until element "#create_dropdown_applab" is not visible
  And I wait until element "#create_dropdown_gamelab" is not visible
  And I wait to see "#view_all_projects"
