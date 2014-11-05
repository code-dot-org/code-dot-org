# Test only on Chrome, Safari webdriver doesn't support interactions API
@chrome
Feature: Blocks can be copied and pasted using the keyboard

Background:
  Given I am on "http://learn.code.org/s/1/level/40?noautoplay=true"

Scenario: Copy and paste a block
  When I rotate to landscape
  And I press "x-close"
  And I wait for 1 seconds
  And I drag block "1" to offset "300, 150"
  Then the workspace has "1" blocks of type "draw_move_by_constant"
  And I click block "9"
  And I ctrl-c
  And I ctrl-v
  Then the workspace has "2" blocks of type "draw_move_by_constant"

Scenario: Cut and paste a block
  When I rotate to landscape
  And I press "x-close"
  And I wait for 1 seconds
  And I drag block "1" to offset "300, 150"
  Then the workspace has "1" blocks of type "draw_move_by_constant"
  And I click block "9"
  And I ctrl-x
  Then the workspace has "0" blocks of type "draw_move_by_constant"
  And I ctrl-v
  Then the workspace has "1" blocks of type "draw_move_by_constant"
