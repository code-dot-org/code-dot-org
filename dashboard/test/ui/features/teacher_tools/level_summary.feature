@dashboard_db_access
@eyes
Feature: Level summary

Scenario: Free Response level 1
  # Turn on cfu pin and hide until it is on by default.
  Given I am on "http://code.org/test_dcdo"
  When I use a cookie to mock the DCDO key "cfu-pin-hide-enabled" as "true"

  # Complex level with many different features in use, including a title h1.
  When I open my eyes to test "free response summary 1"
  Given I am a teacher
  And I create a new student section
  And I am on "http://studio.code.org/s/allthethings/lessons/27/levels/1/summary"
  And I wait until element "#summary-container" is visible
  And I wait to see ".uitest-sectionselect"
  Then I see no difference for "free response level summary 1"
  And I close my eyes

Scenario: Free Response level 2
  # Turn on cfu pin and hide until it is on by default.
  Given I am on "http://code.org/test_dcdo"
  When I use a cookie to mock the DCDO key "cfu-pin-hide-enabled" as "true"

  # Simpler level with an h2 in the markdown.
  When I open my eyes to test "free response summary 2"
  Given I am a teacher
  And I create a new student section
  And I am on "http://studio.code.org/s/allthethings/lessons/27/levels/2/summary"
  And I wait until element "#summary-container" is visible
  And I wait to see ".uitest-sectionselect"
  Then I see no difference for "free response level summary 2"
  And I close my eyes

Scenario: Free Response level 3
  # Turn on cfu pin and hide until it is on by default.
  Given I am on "http://code.org/test_dcdo"
  When I use a cookie to mock the DCDO key "cfu-pin-hide-enabled" as "true"

  # Minimal level with no heading, just text and a textarea.
  When I open my eyes to test "free response summary 3"
  Given I am a teacher
  And I create a new student section
  And I am on "http://studio.code.org/s/allthethings/lessons/27/levels/3/summary"
  And I wait until element "#summary-container" is visible
  And I wait to see ".uitest-sectionselect"
  Then I see no difference for "free response level summary 3"
  And I close my eyes

Scenario: Multi level 1
  # Turn on cfu pin and hide until it is on by default.
  Given I am on "http://code.org/test_dcdo"
  When I use a cookie to mock the DCDO key "cfu-pin-hide-enabled" as "true"

  # Multiple content blocks, images in question and answers
  When I open my eyes to test "multi summary 1"
  Given I create a teacher named "Teacher_1"
  And I give user "Teacher_1" authorized teacher permission
  And I create a new student section
  And I am on "http://studio.code.org/s/allthethings/lessons/9/levels/1/summary"
  And I wait until element "#summary-container" is visible
  And I wait to see ".uitest-sectionselect"
  Then I see no difference for "multi level summary 1"
  Then I click selector "span:contains(Show answer)"
  And I see no difference for "multi level summary 1 show answer"
  And I close my eyes

Scenario: Multi level 2
  # Turn on cfu pin and hide until it is on by default.
  Given I am on "http://code.org/test_dcdo"
  When I use a cookie to mock the DCDO key "cfu-pin-hide-enabled" as "true"

  # Markdown in question, images and text in answers, more than 4 answers
  When I open my eyes to test "multi summary 2"
  Given I create a teacher named "Teacher_1"
  And I give user "Teacher_1" authorized teacher permission
  And I create a new student section
  And I am on "http://studio.code.org/s/allthethings/lessons/9/levels/4/summary"
  And I wait until element "#summary-container" is visible
  And I wait to see ".uitest-sectionselect"
  Then I see no difference for "multi level summary 2"
  Then I click selector "span:contains(Show answer)"
  And I see no difference for "multi level summary 2 show answer"
  And I close my eyes
