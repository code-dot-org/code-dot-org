Feature: Report Abuse Form
  Scenario: Reporting abuse while signed-out
    Given I am on "http://studio.code.org/report_abuse"
    And I type "harry@hogwarts.edu" into "#uitest-email"
    And I select the "13" option in dropdown "uitest-age-selector"
    And I select the "Other" option in dropdown "uitest-abuse-type"
    And I type "Mudblood is an offensive term" into "#uitest-abuse-detail"
    Then I click selector "#uitest-submit-report-abuse" once I see it
    Then I wait until current URL contains "support.code.org"

  Scenario: Reporting abuse as a signed-in student
    Given I create a student named "Harry"
    Given I am on "http://studio.code.org/report_abuse"
    And I type "harry@hogwarts.edu" into "#uitest-email"
    # Age is are already known and passed to the form
    And I wait until element "#uitest-age-selector" is not visible
    And I select the "Other" option in dropdown "uitest-abuse-type"
    And I type "Mudblood is an offensive term" into "#uitest-abuse-detail"
    Then I click selector "#uitest-submit-report-abuse" once I see it
    Then I wait until current URL contains "support.code.org"

  Scenario: Reporting abuse as a signed-in teacher
    Given I create a teacher named "Dumbledore"
    Given I am on "http://studio.code.org/report_abuse"
    # Email and age are already known and passed to the form
    And I wait until element "#uitest-email" is not visible
    And I wait until element "#uitest-age-selector" is not visible
    And I select the "Other" option in dropdown "uitest-abuse-type"
    And I type "Mudblood is an offensive term" into "#uitest-abuse-detail"
    Then I click selector "#uitest-submit-report-abuse" once I see it
    Then I wait until current URL contains "support.code.org"
