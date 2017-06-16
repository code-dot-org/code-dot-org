@no_mobile
Feature: Header navigation bar

Scenario: Signed out user in English should see 6 header links
  Given I am on "http://code.org/"
  And I dismiss the language selector
  And I wait to see "#headerlinks"
  And I wait to see ".headerlink"
  And I wait until ".headerlink" contains text "Learn"
  And I wait until ".headerlink" contains text "Teach"
  And I wait until ".headerlink" contains text "Stats"
  And I wait until ".headerlink" contains text "Help Us"
  And I wait until ".headerlink" contains text "About"
  And I wait until ".headerlink" contains text "Project Gallery"

Scenario: Student in English should see 2 header links
  Given I create a student named "Sally Student"
  Then check that I am on "http://studio.code.org/courses"
  And I wait to see "#headerlinks"
  And I wait to see ".headerlink"
  And I wait until ".headerlink" contains text "Courses"
  And I wait until ".headerlink" contains text "Project Gallery"

Scenario: Teacher in English should see 2 header links
  Given I create a teacher named "Tessa Teacher"
  Then check that I am on "http://studio.code.org/home"
  And I close the dialog
  Then I wait to see "#headerlinks"
  And I wait to see ".headerlink"
  And I wait until ".headerlink" contains text "Home"
  And I wait until ".headerlink" contains text "Courses"
  And I wait until ".headerlink" contains text "Project Gallery"
  And I wait until ".headerlink" contains text "Sections"
  And I wait until ".headerlink" contains text "Professional Learning"
