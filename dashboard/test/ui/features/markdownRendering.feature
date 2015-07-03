Feature: Markdown rendering across the website

Scenario: Visiting an external markdown level with details tag
  Given I am on "http://learn.code.org/s/allthethings/stage/20/puzzle/1?noautoplay=true"
  And I rotate to landscape
  Then element "#extra-details-tag" is hidden
  And I click selector "#summary-tag"
  Then element "#extra-details-tag" is visible
