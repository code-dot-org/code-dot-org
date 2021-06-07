Feature: Course versions

@as_student
@no_mobile
Scenario: Version warning announcement on course and script overview pages
  # course and script pages do not show version warning initially

  When I am on "http://studio.code.org/courses/ui-test-course-2019"
  And I wait to see ".uitest-CourseScript"
  And element "#uitest-version-selector" is not visible
  Then element ".announcement-notification:contains(newer version)" does not exist

  # students must be assigned or have progress to view older script versions

  Given I am assigned to script "ui-test-script-in-course-2017"
  When I am on "http://studio.code.org/courses/ui-test-course-2019"
  And I wait to see ".uitest-CourseScript"
  And element "#uitest-version-selector" is visible
  Then element ".announcement-notification:contains(newer version)" is visible

  When I am on "http://studio.code.org/s/ui-test-script-in-course-2019"
  And I wait until element "#script-title" is visible
  And element "#uitest-version-selector" is not visible
  Then element ".announcement-notification:contains(newer version)" is visible

  # generate some progress in csp-2017

  Given I am on "http://studio.code.org/s/ui-test-script-in-course-2017/next"
  And I wait until current URL contains "/s/ui-test-script-in-course-2017/lessons/1/levels/1"

  # course and unit pages now show version warning

  When I am on "http://studio.code.org/courses/ui-test-course-2019"
  And I wait to see ".uitest-CourseScript"
  And element "#uitest-version-selector" is visible
  Then element ".announcement-notification:contains(newer version)" is visible
  # make sure we are showing the warning specific to course overview pages
  Then element ".announcement-notification:contains(using the dropdown below)" is visible

  When I am on "http://studio.code.org/s/ui-test-script-in-course-2019"
  And I wait until element "#script-title" is visible
  And element "#uitest-version-selector" is not visible
  Then element ".announcement-notification:contains(newer version)" is visible
  # make sure we are showing the warning specific to course units
  Then element ".announcement-notification:contains(going to the course page)" is visible

  # Close the course unit version warning banner
  When I click selector ".announcement-notification:contains(newer version) .fa-times"
  Then I wait until element ".announcement-notification:contains(newer version)" is not visible

  # The course unit version warning banner stays closed on refresh
  When I reload the page
  And I wait until element "#script-title" is visible
  And element "#uitest-version-selector" is not visible
  Then element ".announcement-notification:contains(newer version)" is not visible

  # The course overview warning banner also stays closed
  When I am on "http://studio.code.org/courses/ui-test-course-2019"
  And I wait to see ".uitest-CourseScript"
  And element "#uitest-version-selector" is visible
  Then element ".announcement-notification:contains(newer version)" does not exist

@as_student
@no_mobile
Scenario: Versions warning announcement on script overview page
  When I am on "http://studio.code.org/s/ui-test-versioned-script-2019"
  And I wait until element "#script-title" is visible
  And element "#uitest-version-selector" is not visible
  Then element ".announcement-notification:contains(newer version)" does not exist

  Given I am assigned to script "ui-test-versioned-script-2017"
  When I am on "http://studio.code.org/s/ui-test-versioned-script-2017/next"
  And I wait until current URL contains "/s/ui-test-versioned-script-2017/lessons/1/levels/1"

  When I am on "http://studio.code.org/s/ui-test-versioned-script-2019"
  And I wait until element "#script-title" is visible
  And element "#uitest-version-selector" is visible
  Then element ".announcement-notification:contains(newer version)" is visible
  Then element ".announcement-notification:contains(using the dropdown below)" is visible

  # Close the script version warning banner
  When I click selector ".announcement-notification:contains(newer version) .fa-times"
  Then I wait until element ".announcement-notification:contains(newer version)" is not visible

  # The script version warning banner stays closed on refresh
  When I reload the page
  And I wait until element "#script-title" is visible
  And element "#uitest-version-selector" is visible
  Then element ".announcement-notification:contains(newer version)" is not visible

  # Generate progress in course 2
  When I am on "http://studio.code.org/s/course2/lessons/1/levels/1"
  And I click selector ".next-lesson" once I see it
  And I wait until current URL contains "/s/course2/lessons/1/levels/2"

  When I am on "http://studio.code.org/s/course1"
  And I wait until element "#script-title" is visible
  And element "#uitest-version-selector" is not visible
  Then element ".announcement-notification:contains(newer version)" is not visible

@as_student
@no_mobile
Scenario: Switch versions using dropdown on script overview page
  # Older script versions are not visible to students who are not assigned to them
  When I am on "http://studio.code.org/s/ui-test-versioned-script-2017"
  And I get redirected to "s/ui-test-versioned-script-2019" via "dashboard"
  And I wait until element "#script-title" is visible
  And element "#uitest-version-selector" is not visible

  Given I am assigned to script "ui-test-versioned-script-2017"
  When I am on "http://studio.code.org/s/ui-test-versioned-script-2017"
  And I wait until element "#script-title" is visible
  And element "#uitest-version-selector" is visible
  And I click selector "#assignment-version-year" once I see it
  And element ".assignment-version-title:contains(2018)" is not visible
  And I click selector ".assignment-version-title:contains(2019)" once I see it
  Then I wait until I am on "http://studio.code.org/s/ui-test-versioned-script-2019"

  # On Safari, the 2017 page may still be visible (even though the url has been changed)
  # so we need to wait until we are looking at the 2019 page.
  And I wait until element "#script-title" contains text "2019"
  And element "#uitest-version-selector" is visible
  And I click selector "#assignment-version-year" once I see it
  And element ".assignment-version-title:contains(2018)" is not visible
  And I click selector ".assignment-version-title:contains(2017)" once I see it
  Then I wait until I am on "http://studio.code.org/s/ui-test-versioned-script-2017"

@as_student
@no_mobile
Scenario: Course unit family names redirect to 2019 version
  When I am on "http://studio.code.org/s/csp3"
  And I get redirected to "/s/csp3-2019" via "dashboard"
