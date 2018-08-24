Feature: Course versions

@as_student
@no_mobile
Scenario: Version warning announcement on course and unit overview pages
  # course and unit pages do not show version warning initially

  When I am on "http://studio.code.org/courses/csp-2018"
  And I wait to see ".uitest-CourseScript"
  And element "#version-selector" is visible
  Then element ".announcement-notification:contains(newer version)" does not exist

  When I am on "http://studio.code.org/s/csp2-2018"
  And I wait until element "#script-title" is visible
  And element "#version-selector" is not visible
  Then element ".announcement-notification:contains(newer version)" does not exist

  # generate some progress in csp-2017

  Given I am on "http://studio.code.org/s/csp3-2017/next"
  And I wait until current URL contains "/s/csp3-2017/stage/1/puzzle/1"

  # course and unit pages now show version warning

  When I am on "http://studio.code.org/courses/csp-2018"
  And I wait to see ".uitest-CourseScript"
  And element "#version-selector" is visible
  Then element ".announcement-notification:contains(newer version)" is visible
  # make sure we are showing the warning specific to course overview pages
  Then element ".announcement-notification:contains(using the dropdown below)" is visible

  When I am on "http://studio.code.org/s/csp2-2018"
  And I wait until element "#script-title" is visible
  And element "#version-selector" is not visible
  Then element ".announcement-notification:contains(newer version)" is visible
  # make sure we are showing the warning specific to course units
  Then element ".announcement-notification:contains(going to the course page)" is visible

  # Close the course unit version warning banner
  When I click selector ".announcement-notification:contains(newer version) .fa-times"
  Then I wait until element ".announcement-notification:contains(newer version)" is not visible

  # The course unit version warning banner stays closed on refresh
  When I reload the page
  And I wait until element "#script-title" is visible
  And element "#version-selector" is not visible
  Then element ".announcement-notification:contains(newer version)" is not visible

  # The course overview warning banner also stays closed
  When I am on "http://studio.code.org/courses/csp-2018"
  And I wait to see ".uitest-CourseScript"
  And element "#version-selector" is visible
  Then element ".announcement-notification:contains(newer version)" does not exist

@as_student
@no_mobile
Scenario: Versions warning announcement on script overview page
  When I am on "http://studio.code.org/s/coursea-2018"
  And I wait until element "#script-title" is visible
  And element "#version-selector" is visible
  Then element ".announcement-notification:contains(newer version)" does not exist

  When I am on "http://studio.code.org/s/coursea-2017/next"
  And I wait until current URL contains "/s/coursea-2017/stage/1/puzzle/1"

  When I am on "http://studio.code.org/s/coursea-2018"
  And I wait until element "#script-title" is visible
  And element "#version-selector" is visible
  Then element ".announcement-notification:contains(newer version)" is visible
  Then element ".announcement-notification:contains(using the dropdown below)" is visible

  # Close the script version warning banner
  When I click selector ".announcement-notification:contains(newer version) .fa-times"
  Then I wait until element ".announcement-notification:contains(newer version)" is not visible

  # The script version warning banner stays closed on refresh
  When I reload the page
  And I wait until element "#script-title" is visible
  And element "#version-selector" is visible
  Then element ".announcement-notification:contains(newer version)" is not visible

  # Generate progress in course 2
  When I am on "http://studio.code.org/s/course2/stage/1/puzzle/1"
  And I click selector ".next-stage" once I see it
  And I wait until current URL contains "/s/course2/stage/1/puzzle/2"

  When I am on "http://studio.code.org/s/course1"
  And I wait until element "#script-title" is visible
  And element "#version-selector" is not visible
  Then element ".announcement-notification:contains(newer version)" is not visible

@as_student
@no_mobile
Scenario: Switch versions using dropdown on script overview page
  When I am on "http://studio.code.org/s/coursea-2017"
  And I wait until element "#script-title" is visible
  And element "#version-selector" is visible
  And I select the "2018" option in dropdown "version-selector" to load a new page
  Then I wait until I am on "http://studio.code.org/s/coursea-2018"

  When I wait until element "#script-title" is visible
  And element "#version-selector" is visible
  And I select the "2017" option in dropdown "version-selector" to load a new page
  Then I wait until I am on "http://studio.code.org/s/coursea-2017"

@as_student
@no_mobile
Scenario: Course unit family names redirect to their latest stable version
  When I am on "http://studio.code.org/s/csp3"
  And I get redirected to "/s/csp3-2018" via "dashboard"

@as_student
@no_mobile
Scenario: Script levels in renamed scripts redirect to their original version
  When I am on "http://studio.code.org/s/csp3/stage/9/puzzle/11"
  # Keep redirecting to the original version of a script level after a later
  # script version becomes stable, because a user with a deep link to a specific
  # level will most likely expect to see their previous progress there.
  And I get redirected to "/s/csp3-2017/stage/9/puzzle/11" via "dashboard"
