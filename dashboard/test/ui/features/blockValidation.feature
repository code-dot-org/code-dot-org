Feature: Run a bunch of JS to validate block svgs

@local_only
Scenario: Artist
  Given I am on "http://learn.code.org/s/1/level/108?noautoplay=true"
  And I wait to see "#x-close"
  And I press "x-close"
  And I run block validation with key "turtle_5_6"
