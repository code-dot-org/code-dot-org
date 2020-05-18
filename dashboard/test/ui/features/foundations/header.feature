@no_mobile
@single_session
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
  And element "#header-en-projects" contains text "Projects"

Scenario: Student in English should see 2 header links
  Given I create a student named "Sally Student" and go home
  And I wait to see ".headerlinks"
  And I see "#header-student-courses"
  And element "#header-student-courses" contains text "Course Catalog"
  And I see "#header-student-projects"
  And element "#header-student-projects" contains text "Projects"

Scenario: Teacher in English should see 5 header links
  Given I create a teacher named "Tessa Teacher" and go home
  And I wait to see ".headerlinks"
  And I see "#header-teacher-home"
  And element "#header-teacher-home" contains text "My Dashboard"
  And I see "#header-teacher-courses"
  And element "#header-teacher-courses" contains text "Course Catalog"
  And I see "#header-teacher-projects"
  And element "#header-teacher-projects" contains text "Projects"
  And I see "#header-teacher-professional-learning"
  And element "#header-teacher-professional-learning" contains text "Professional Learning"

Scenario: Signed out user in Spanish should see 3 header links
  Given I am on "http://code.org/lang/es"
  Then check that I am on "http://code.org/"
  And I dismiss the language selector
  Given I am on "http://studio.code.org/courses"
  And I wait to see ".headerlinks"
  And I see "#header-non-en-courses"
  And element "#header-non-en-courses" has "es" text from key "nav.header.course_catalog"
  And I see "#header-non-en-projects"
  And element "#header-non-en-projects" has "es" text from key "nav.header.project_gallery"
  And I see "#header-non-en-about"
  And element "#header-non-en-about" has "es" text from key "nav.header.about"

Scenario: Student in Spanish should see 3 header links
  Given I create a student named "Eva Estudiante"
  Given I am on "http://studio.code.org/courses/lang/es"
  Then check that I am on "http://studio.code.org/courses"
  And I wait to see ".headerlinks"
  And I see "#header-student-courses"
  And element "#header-student-courses" has "es" text from key "nav.header.course_catalog"
  And I see "#header-student-projects"
  And element "#header-student-projects" has "es" text from key "nav.header.project_gallery"
  And I see "#header-non-en-about"
  And element "#header-non-en-about" has "es" text from key "nav.header.about"

Scenario: Teacher in Spanish should see 5 header links
  Given I create a teacher named "Pabla Profesora"
  Given I am on "http://studio.code.org/home/lang/es"
  Then check that I am on "http://studio.code.org/home"
  And I wait to see ".headerlinks"
  And I see "#header-teacher-home"
  And element "#header-teacher-home" has "es" text from key "nav.header.my_dashboard"
  And I see "#header-teacher-courses"
  And element "#header-teacher-courses" has "es" text from key "nav.header.course_catalog"
  And I see "#header-teacher-projects"
  And element "#header-teacher-projects" has "es" text from key "nav.header.project_gallery"
  And I see "#header-non-en-about"
  And element "#header-non-en-about" has "es" text from key "nav.header.about"
