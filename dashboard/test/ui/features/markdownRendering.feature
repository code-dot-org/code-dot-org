Feature: Markdown rendering across the website

@no_ie # IE9 issue parsing DOM https://www.pivotaltracker.com/story/show/98498754
Scenario: Visiting an external markdown level with details tag
  Given I am on "http://learn.code.org/s/allthethings/stage/20/puzzle/1?noautoplay=true"
  And I rotate to landscape
  Then element "#extra-details-tag" is hidden
  And I click selector "#summary-tag"
  Then element "#extra-details-tag" is visible
