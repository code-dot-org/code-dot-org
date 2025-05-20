# We skip because the test server and drone won't localize for some reason right now
@skip
@no_mobile
Feature: Global Edition - Farsi Headers
  Background:
    Given I am on "http://code.org"
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"
    And I set the language cookie

  Scenario: A teacher should see the correct header links on Pegasus
    Given I create a teacher named "Tessa Teacher" and go home
    Then I am on "http://code.org/global/fa/about"
    And I dismiss the language selector
    And I select the "فارسی" option in dropdown with class "language-dropdown select" to load a new page
    Then I wait to see "#headerlinks"
    And I see "#header-teach"
    And element "#header-teach" has "fa-IR" text from key "nav.header.teach"
    And I see "#header-about"
    And element "#header-about" has "fa-IR" text from key "nav.header.about"
    And I see "#header-csf"
    And element "#header-csf" has "fa-IR" text from key "nav.header.csf"
    And I see "#header-videos"
    And element "#header-videos" has "fa-IR" text from key "nav.header.videos"
    And I see "#header-hoc"
    And element "#header-hoc" has "fa-IR" text from key "nav.header.hour_of_code"

  Scenario: A student should see the correct header links on Pegasus
    Given I create a student named "Sally Student" and go home
    Then I am on "http://code.org/global/fa/about"
    And I dismiss the language selector
    And I select the "فارسی" option in dropdown with class "language-dropdown select" to load a new page
    Then I wait to see "#headerlinks"
    And I see "#header-teach"
    And element "#header-teach" has "fa-IR" text from key "nav.header.teach"
    And I see "#header-about"
    And element "#header-about" has "fa-IR" text from key "nav.header.about"
    And I see "#header-csf"
    And element "#header-csf" has "fa-IR" text from key "nav.header.csf"
    And I see "#header-videos"
    And element "#header-videos" has "fa-IR" text from key "nav.header.videos"
    And I see "#header-hoc"
    And element "#header-hoc" has "fa-IR" text from key "nav.header.hour_of_code"

  Scenario: A teacher should see the correct header links on Dashboard
    Given I create a teacher named "Tessa Teacher" and go home
    And I dismiss the language selector
    And I select the "فارسی" option in dropdown "locale" to load a new page
    Then I wait to see ".headerlinks"
    And I see "#header-student-home"
    And element "#header-student-home" has "fa-IR" text from key "nav.header.my_dashboard"
    And I see "#header-teacher-courses"
    And element "#header-teacher-courses" has "fa-IR" text from key "nav.header.course_catalog"
    And I see "#header-teacher-professional-learning"
    And element "#header-teacher-professional-learning" has "fa-IR" text from key "nav.header.professional_learning"

  Scenario: A student should see the correct header links on Dashboard
    Given I create a student named "Sally Student" and go home
    And I dismiss the language selector
    And I select the "فارسی" option in dropdown "locale" to load a new page
    Then I wait to see ".headerlinks"
    And I see "#header-student-home"
    And element "#header-student-home" has "fa-IR" text from key "nav.header.my_dashboard"
    And I see "#header-student-courses"
    And element "#header-student-courses" has "fa-IR" text from key "nav.header.course_catalog"
