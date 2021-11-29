# Test only on Chrome, Safari webdriver doesn't support interactions API
@chrome
Feature: Blocks can be copied and pasted using the keyboard

Background:
  Given I am on "http://studio.code.org/s/20-hour/lessons/7/levels/6?noautoplay=true"
  And I rotate to landscape
  And I wait for the page to fully load

Scenario: Copy and paste a block
  When I drag block "1" to offset "300, 150"
  Then the workspace has "1" blocks of type "draw_move_by_constant"
  And I ctrl-c
  And I ctrl-v
  Then the workspace has "2" blocks of type "draw_move_by_constant"

Scenario: Cut and paste a block
  When I drag block "1" to offset "300, 150"
  Then the workspace has "1" blocks of type "draw_move_by_constant"
  And I ctrl-x
  Then the workspace has "0" blocks of type "draw_move_by_constant"
  And I ctrl-v
  Then the workspace has "1" blocks of type "draw_move_by_constant"
