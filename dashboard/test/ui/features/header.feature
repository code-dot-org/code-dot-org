@no_mobile
Feature: Header navigation bar

Scenario: Signed out user in English should see 6 header links
  Given I am on "http://code.org/"
  And I dismiss the language selector
  And I wait to see "#headerlinks"
  And I see "#header-en-learn"
  And element "#header-en-learn" contains text "Learn"
  And I see "#header-en-teach"
  And element "#header-en-teach" contains text "Teach"
  And I see "#header-en-stats"
  And element "#header-en-stats" contains text "Stats"
  And I see "#header-en-help"
  And element "#header-en-help" contains text "Help Us"
  And I see "#header-en-about"
  And element "#header-en-about" contains text "About"
  And I see "#header-en-projects"
  And element "#header-en-projects" contains text "Project Gallery"

Scenario: Student in English should see 2 header links
  Given I create a student named "Sally Student"
  Then check that I am on "http://studio.code.org/courses"
  And I wait to see ".headerlinks"
  And I see "#header-student-courses"
  And element "#header-student-courses" contains text "Courses"
  And I see "#header-student-projects"
  And element "#header-student-projects" contains text "Project Gallery"

Scenario: Teacher in English should see 5 header links
  Given I create a teacher named "Tessa Teacher"
  Then check that I am on "http://studio.code.org/home"
  And I wait to see ".headerlinks"
  And I see "#header-teacher-home"
  And element "#header-teacher-home" contains text "Home"
  And I see "#header-teacher-courses"
  And element "#header-teacher-courses" contains text "Courses"
  And I see "#header-teacher-projects"
  And element "#header-teacher-projects" contains text "Project Gallery"
  And I see "#header-teacher-sections"
  And element "#header-teacher-sections" contains text "Sections"
  And I see "#header-teacher-professional-learning"
  And element "#header-teacher-professional-learning" contains text "Professional Learning"

Scenario: Signed out user in Spanish should see 2 header links
  Given I am on "http://code.org/lang/es"
  Then check that I am on "http://code.org/"
  And I dismiss the language selector
  Given I am on "http://studio.code.org/courses"
  And I wait to see ".headerlinks"
  And I see "#header-non-en-courses"
  And element "#header-non-en-courses" has "es" text from key "nav.header.courses"
  And I see "#header-non-en-projects"
  And element "#header-non-en-projects" has "es" text from key "nav.header.project_gallery"
  
Scenario: Student in Spanish should see 2 header links
  Given I create a student named "Estrella Estudiante"
  Then check that I am on "http://studio.code.org/courses"
  Given I am on "http://studio.code.org/courses/lang/es"
  Then check that I am on "http://studio.code.org/courses"
  And I wait to see ".headerlinks"
  And I see "#header-student-courses"
  And element "#header-student-courses" has "es" text from key "nav.header.courses"
  And I see "#header-student-projects"
  And element "#header-student-projects" has "es" text from key "nav.header.project_gallery"

Scenario: Teacher in Spanish should see 5 header links
  Given I create a teacher named "Pabla Profesora"
  Then check that I am on "http://studio.code.org/home"
  Given I am on "http://studio.code.org/home/lang/es"
  Then check that I am on "http://studio.code.org/home"
  And I wait to see ".headerlinks"
  And I see "#header-teacher-home"
  And element "#header-teacher-home" has "es" text from key "nav.header.home"
  And I see "#header-teacher-courses"
  And element "#header-teacher-courses" has "es" text from key "nav.header.courses"
  And I see "#header-teacher-projects"
  And element "#header-teacher-projects" has "es" text from key "nav.header.project_gallery"
  And I see "#header-teacher-sections"
  And element "#header-teacher-sections" has "es" text from key "nav.header.sections"
  And I see "#header-teacher-professional-learning"
  And element "#header-teacher-professional-learning" has "es" text from key "nav.header.professional_learning"
