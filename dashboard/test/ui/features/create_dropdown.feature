@no_mobile
# Dropdown hidden in 1024x768 Safari with fixed scrollbar due to media query.
@no_safari
@single_session
Feature: Create Dropdown in Header

Scenario: Create Dropdown does NOT show on level pages
  Given I create a student named "16 Year Old"
  Given I am on "http://studio.code.org/s/allthethings/stage/18/puzzle/7?noautoplay=true"
  And I wait until element ".create_menu" is not visible
  Then I sign out

Scenario: Signed Out - Correct Create Links
  Given I am on "http://code.org"
  And I wait until element ".create_menu" is visible
  And I click selector ".create_menu"
  And I wait until element "#create_dropdown_spritelab" is visible
  And I wait until element "#create_dropdown_artist" is visible
  And I wait until element "#create_dropdown_applab" is visible
  And I wait until element "#create_dropdown_gamelab" is visible
  And I wait until element "#create_dropdown_minecraft" is not visible
  And I wait until element "#create_dropdown_dance" is visible
  And I wait until element "#view_all_projects" is visible

Scenario: Teacher - Correct Create Links
  Given I am a teacher and go home
  And I wait until element ".create_menu" is visible
  And I click selector ".create_menu"
  And I wait until element "#create_dropdown_spritelab" is visible
  And I wait until element "#create_dropdown_artist" is visible
  And I wait until element "#create_dropdown_applab" is visible
  And I wait until element "#create_dropdown_gamelab" is visible
  And I wait until element "#create_dropdown_minecraft" is not visible
  And I wait until element "#create_dropdown_dance" is visible
  And I wait until element "#view_all_projects" is visible

Scenario: Student, Age 13+ - Correct Create Links
  Given I create a student named "16 Year Old" and go home
  And I wait until element ".create_menu" is visible
  And I click selector ".create_menu"
  And I wait until element "#create_dropdown_spritelab" is visible
  And I wait until element "#create_dropdown_artist" is visible
  And I wait until element "#create_dropdown_applab" is visible
  And I wait until element "#create_dropdown_gamelab" is visible
  And I wait until element "#create_dropdown_minecraft" is not visible
  And I wait until element "#create_dropdown_dance" is visible
  And I wait until element "#view_all_projects" is visible

Scenario: Young Student, Not in Section - Correct Create Links
  Given I create a young student named "10 Year Old" and go home
  And I wait until element ".create_menu" is visible
  And I click selector ".create_menu"
  And I wait until element "#create_dropdown_spritelab" is visible
  And I wait until element "#create_dropdown_artist" is visible
  And I wait until element "#create_dropdown_minecraft" is visible
  And I wait until element "#create_dropdown_applab" is not visible
  And I wait until element "#create_dropdown_gamelab" is not visible
  And I wait until element "#create_dropdown_dance" is visible
  And I wait until element "#view_all_projects" is visible

Scenario: Young Student, In Section - Correct Create Links
  Given I create a teacher named "Ms_Frizzle"
  And I create a new section
  Given I create a young student named "Young Student - In Section"
  And I navigate to the section url
  And I wait until element ".create_menu" is visible
  And I click selector ".create_menu"
  And I wait until element "#create_dropdown_spritelab" is visible
  And I wait until element "#create_dropdown_artist" is visible
  And I wait until element "#create_dropdown_applab" is visible
  And I wait until element "#create_dropdown_gamelab" is visible
  And I wait until element "#create_dropdown_minecraft" is not visible
  And I wait until element "#create_dropdown_dance" is visible
  And I wait until element "#view_all_projects" is visible
