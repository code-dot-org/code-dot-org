@no_mobile
@single_session
Feature: Header navigation bar

Scenario: Signed out user in English should see 7 header links
  Given I am on "http://code.org/"
  And I dismiss the language selector
  And I wait to see "#headerlinks"
  And I see "#header-learn"
  And element "#header-learn" contains text "Learn"
  And I see "#header-teach"
  And element "#header-teach" contains text "Teach"
  And I see "#header-districts"
  And element "#header-districts" contains text "Districts"
  And I see "#header-stats"
  And element "#header-stats" contains text "Stats"
  And I see "#header-help"
  And element "#header-help" contains text "Help Us"
  And I see "#header-about"
  And element "#header-about" contains text "About"
  And I see "#header-incubator"
  And element "#header-incubator" contains text "Incubator"

Scenario: Signed out user in English should see 3 header links on small desktop
  Given I am on "http://code.org/"
  And I dismiss the language selector
  And I change the browser window size to 1268 by 768
  And I wait to see "#headerlinks"
  And I see "#header-learn"
  And element "#header-learn" contains text "Learn"
  And I see "#header-teach"
  And element "#header-teach" contains text "Teach"
  And I see "#header-districts"
  And element "#header-districts" contains text "Districts"
  And element "#header-stats" is not visible
  And element "#header-help" is not visible
  And element "#header-about" is not visible
  And element "#header-incubator" is not visible

Scenario: Student in English should see 4 header links
  Given I create a student named "Sally Student" and go home
  And I wait to see ".headerlinks"
  And I see "#header-student-home"
  And element "#header-student-home" contains text "My Dashboard"
  And I see "#header-student-courses"
  And element "#header-student-courses" contains text "Course Catalog"
  And I see "#header-student-projects"
  And element "#header-student-projects" contains text "Projects"
  And I see "#header-incubator"
  And element "#header-incubator" contains text "Incubator"

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
  And I see "#header-teacher-incubator"
  And element "#header-teacher-incubator" contains text "Incubator"

Scenario: Signed out user in Spanish should see 7 header links
  Given I am on "http://code.org/lang/es"
  Then check that I am on "http://code.org/"
  And I dismiss the language selector
  Given I am on "http://studio.code.org/home"
  And I wait to see ".headerlinks"
  And I see "#header-learn"
  And element "#header-learn" has "es" text from key "nav.header.learn"
  And I see "#header-teach"
  And element "#header-teach" has "es" text from key "nav.header.teach"
  And I see "#header-districts"
  And element "#header-districts" has "es" text from key "nav.header.districts"
  And I see "#header-stats"
  And element "#header-stats" has "es" text from key "nav.header.stats"
  And I see "#header-help"
  And element "#header-help" has "es" text from key "nav.header.help_us"
  And I see "#header-incubator"
  And element "#header-incubator" has "es" text from key "nav.header.incubator"
  And I see "#header-about"
  And element "#header-about" has "es" text from key "nav.header.about"

Scenario: Student in Spanish should see 4 header links
  Given I create a student named "Eva Estudiante"
  Given I am on "http://studio.code.org/home/lang/es"
  Then check that I am on "http://studio.code.org/home?lang=es"
  And I wait to see ".headerlinks"
  And I see "#header-student-home"
  And element "#header-student-home" has "es" text from key "nav.header.my_dashboard"
  And I see "#header-student-courses"
  And element "#header-student-courses" has "es" text from key "nav.header.course_catalog"
  And I see "#header-student-projects"
  And element "#header-student-projects" has "es" text from key "nav.header.project_gallery"
  And I see "#header-incubator"
  And element "#header-incubator" has "es" text from key "nav.header.incubator"

Scenario: Teacher in Spanish should see 5 header links
  Given I create a teacher named "Pabla Profesora"
  Given I am on "http://studio.code.org/home/lang/es"
  Then check that I am on "http://studio.code.org/home?lang=es"
  And I wait to see ".headerlinks"
  And I see "#header-teacher-home"
  And element "#header-teacher-home" has "es" text from key "nav.header.my_dashboard"
  And I see "#header-teacher-courses"
  And element "#header-teacher-courses" has "es" text from key "nav.header.course_catalog"
  And I see "#header-teacher-projects"
  And element "#header-teacher-projects" has "es" text from key "nav.header.project_gallery"
  And I see "#header-teacher-professional-learning"
  And element "#header-teacher-professional-learning" has "es" text from key "nav.header.professional_learning"
  And I see "#header-teacher-incubator"
  And element "#header-teacher-incubator" has "es" text from key "nav.header.incubator"
