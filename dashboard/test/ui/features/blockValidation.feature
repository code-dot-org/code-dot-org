Feature: Run a bunch of JS to validate block svgs

@local_only
Scenario: Artist
  Given I am on "http://learn.code.org/s/20-hour/stage/19/puzzle/6?noautoplay=true"
  And I close the dialog
  # see pivotal #85968180
  #  And I run block validation with key "turtle_5_6"
