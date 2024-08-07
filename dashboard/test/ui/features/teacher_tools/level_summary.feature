@dashboard_db_access
Feature: Level summary

@eyes
Scenario: Free Response level 1
  # Turn on cfu pin and hide until it is on by default.
  Given I am on "http://studio.code.org"
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

@eyes
Scenario: Free Response level 2
  # Turn on cfu pin and hide until it is on by default.
  Given I am on "http://studio.code.org"
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

@eyes
Scenario: Free Response level 3
  # Turn on cfu pin and hide until it is on by default.
  Given I am on "http://studio.code.org"
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

@eyes
Scenario: Multi level 1
  # Turn on cfu pin and hide until it is on by default.
  Given I am on "http://studio.code.org"
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

@eyes
Scenario: Multi level 2
  # Turn on cfu pin and hide until it is on by default.
  Given I am on "http://studio.code.org"
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

Scenario: Check for Understanding summaries
  # Turn on cfu pin and hide until it is on by default.
  Given I am on "http://studio.code.org"
  When I use a cookie to mock the DCDO key "cfu-pin-hide-enabled" as "true"

  Given I create an authorized teacher-associated student named "Sally"
  And I am on "http://studio.code.org/s/allthethings/lessons/27/levels/1/"
  And I type "sample response" into ".free-response > textarea"
  And I press ".submitButton" using jQuery to load a new page

  When I sign in as "Teacher_Sally" and go home
  And I am on "http://studio.code.org/s/allthethings/lessons/27/levels/1/summary"

  And I wait until element "#summary-container" is visible
  And I dismiss the teacher panel
  And element "p:contains('sample response')" is visible
  And element "p:contains('Sally')" does not exist

  And I click selector "label:contains('Show student names')" once I see it
  And element "p:contains('Sally')" is visible

  Then I press the first "button[aria-label='Additional options']" element
  And I wait until element ".uitest-hide-response" is visible

  Then I press the first ".uitest-hide-response" element
  And element "p:contains('sample response')" does not exist
  And element "p:contains('Sally')" does not exist
  And I wait until element "a:contains('Show hidden responses')" is visible

@eyes
Scenario: Check for Understanding summaries eyes
# Turn on cfu pin and hide until it is on by default.
  Given I am on "http://studio.code.org"
  When I use a cookie to mock the DCDO key "cfu-pin-hide-enabled" as "true"

  When I open my eyes to test "Check for Understanding summaries"

  Given I create an authorized teacher-associated student named "Sally"
  And I am on "http://studio.code.org/s/allthethings/lessons/27/levels/1/"
  And I type "sample response" into ".free-response > textarea"
  And I press ".submitButton" using jQuery to load a new page

  And I create a student named "Student2"
  And I join the section
  And I am on "http://studio.code.org/s/allthethings/lessons/27/levels/1/"
  And I type "sample response 2" into ".free-response > textarea"
  And I press ".submitButton" using jQuery to load a new page

  When I sign in as "Teacher_Sally" and go home
  And I am on "http://studio.code.org/s/allthethings/lessons/27/levels/1/summary"

  And I wait until element "#summary-container" is visible

  And I see no difference for "student names hidden"

  And I click selector "label:contains('Show student names')" once I see it
  And I wait until element "p:contains('Sally')" is visible

  And I see no difference for "student names shown"

  Then I press the first "button[aria-label='Additional options']" element
  And I wait until element ".uitest-hide-response" is visible

  Then I press the first ".uitest-pin-response" element

  And I see no difference for "pinned response"
  And I close my eyes
