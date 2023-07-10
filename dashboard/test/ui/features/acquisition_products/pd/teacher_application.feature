@dashboard_db_access
@no_mobile
@no_safari

Feature: Teacher Application

@eyes
Scenario: Teacher starts a new application and submits it
  Given I create a teacher named "Severus"
  And I am on "http://studio.code.org/pd/application/teacher"
  And I wait until element "h1" contains text "Professional Learning Program Teacher Application"
  And I open my eyes to test "Teacher Application"
  Then I wait until element "h3" contains text "Section 1: Choose Your Program"
  And I press "input[name='program']:first" using jQuery
  Then I see no difference for "Section 1: Choose Your Program"
  And I press the first "button#next" element

  # Section 2
  And I complete Section 2 of the teacher PD application
  Then I see no difference for "Section 2: Find Your Region"
  And I press the first "button#next" element

  # Section 3
  And I complete Section 3 of the teacher PD application
  Then I see no difference for "Section 3: About You"
  And I press the first "button#next" element

  # Section 4
  And I complete Section 4 of the teacher PD application
  Then I see no difference for "Section 4: Additional Demographic Information"
  And I press the first "button#next" element

  # Section 5
  And I complete Section 5 of the teacher PD application
  Then I see no difference for "Section 5: Administrator/School Leader Information"
  And I press the first "button#next" element

  # Section 6
  Then I wait until element "h3" contains text "Section 6: Implementation Plan"
  And I press the first "input[name='csdWhichGrades']" element
  And I press the first "input[name='enoughCourseHours']" element
  And I press the first "input[name='replaceExisting']" element
  Then I see no difference for "Section 6: Implementation Plan"
  And I press the first "button#next" element

  # Section 7
  And I complete Section 7 of the teacher PD application
  Then I see no difference for "Section 7: Program Requirements and Submission"
  And I press the first "button[type='submit']" element

  # Confirmation page
  Then I wait until element "h1" contains text "Thank you for submitting your application!"
  Then I see no difference for "Confirmation"

  # Principal approval
  Then I sign out
  Then I navigate to the principal approval page for "Severus"
  Then I wait until element "h1" contains text "Code.org Administrator/School Leader Approval Form"
  Then I press the first "input[name='canEmailYou']" element
  Then I press the first "input[name='doYouApprove'][value='Yes']" element

  And I press keys "nonexistent" for element "#nces_school"
  Then I wait until element ".VirtualizedSelectOption:contains('Other school not listed below')" is visible
  And I press ".VirtualizedSelectOption:contains('Other school not listed below')" using jQuery
  Then I wait until element "input#schoolName" is visible
  And I press keys "Code.org" for element "input#schoolName"
  And I press keys "1501 4th Ave" for element "input#schoolAddress"
  And I press keys "Seattle" for element "input#schoolCity"
  And I select the "Washington" option in dropdown "schoolState"
  # zip code is autofilled from the teacher app data (in order to fetch the regional partner)
  And I press the first "input[name='schoolType'][value='Other']" element

  Then I press keys "1000" for element "#totalStudentEnrollment"
  Then I press keys "10" for element "#freeLunchPercent"
  Then I press keys "10" for element "#white"
  Then I press keys "10" for element "#black"
  Then I press keys "10" for element "#hispanic"
  Then I press keys "10" for element "#asian"
  Then I press keys "10" for element "#pacificIslander"
  Then I press keys "10" for element "#americanIndian"
  Then I press keys "10" for element "#other"

  Then I press the first "input[name='committedToMasterSchedule']" element
  Then I press the first "input[name='replaceCourse']" element

  Then I press the first "#understandFee" element
  Then I press the first "input[name='payFee']" element
  Then I press the first "#confirmPrincipal" element

  Then I see no difference for "Principal approval form"

  And I press the first "button#submit" element
  Then I wait until element "h1" contains text "Thank you. Your teacher's application is now considered complete and will be reviewed."
  Then I see no difference for "Principal approval confirmation form"
  Then I close my eyes

@eyes
Scenario: Teacher saves, re-opens, and submits an application
  Given I create a teacher named "Severus"
  And I am on "http://studio.code.org/pd/application/teacher"
  And I wait until element "h1" contains text "Professional Learning Program Teacher Application"
  And I open my eyes to test "Saving and Reopening Teacher Application"

  # Saving the application
  Then I wait until element "h3" contains text "Section 1: Choose Your Program"
  And I press "input[name='program']:first" using jQuery
  Then I see no difference for "Section 1: Choose Your Program"
  And I press the first "button#next" element
  Then I wait until element "h3" contains text "Section 2: Find Your Region"
  And I press the first "input[name='country']" element
  And I press the first "button#save" element
  Then I wait until element "p" contains text "Your progress has been saved. Return to this page at any time to continue working on your application."
  And I see no difference for "Viewing teacher application after saving"

  # Opening an application that's been started
  And I reload the page
  Then I am on "http://studio.code.org/pd/application/teacher"
  Then I wait until element "p" contains text "We found an application you started! Your saved responses have been loaded."
  And I see no difference for "Viewing previously-saved teacher application"
  Then I close my eyes

  # Finish Section 2 which was started
  And I complete Section 2 of the teacher PD application
  And I press the first "button#next" element

  # Section 3
  And I complete Section 3 of the teacher PD application
  And I press the first "button#next" element

  # Section 4
  And I complete Section 4 of the teacher PD application
  And I press the first "button#next" element

  # Section 5
  And I complete Section 5 of the teacher PD application
  And I press the first "button#next" element

  # Section 6
  Then I wait until element "h3" contains text "Section 6: Implementation Plan"
  And I press the first "input[name='csdWhichGrades']" element
  And I press the first "input[name='enoughCourseHours']" element
  And I press the first "input[name='replaceExisting']" element
  And I press the first "button#next" element

  # Section 7
  And I complete Section 7 of the teacher PD application
  And I press the first "button[type='submit']" element

Scenario: Teacher starts a new csp application and submits it
  Given I create a teacher named "Severus"
  And I am on "http://studio.code.org/pd/application/teacher"
  And I wait until element "h1" contains text "Professional Learning Program Teacher Application"
  Then I wait until element "h3" contains text "Section 1: Choose Your Program"
  And I press the first "input[name='program'][value='Computer Science Principles (appropriate for 9th - 12th grade, and can be implemented as an AP or introductory course)']" element
  And I press the first "button#next" element

  # Section 2
  And I complete Section 2 of the teacher PD application
  And I press the first "button#next" element

  # Section 3
  And I complete Section 3 of the teacher PD application
  And I press the first "button#next" element

  # Section 4
  And I complete Section 4 of the teacher PD application
  And I press the first "button#next" element

  # Section 5
  And I complete Section 5 of the teacher PD application
  And I press the first "button#next" element

  # Section 6
  Then I wait until element "h3" contains text "Section 6: Implementation Plan"
  And I press the first "input[name='cspWhichGrades']" element
  And I press the first "input[name='cspHowOffer']" element
  And I press the first "input[name='enoughCourseHours']" element
  And I press the first "input[name='replaceExisting']" element
  And I press the first "button#next" element

  # Section 7
  And I complete Section 7 of the teacher PD application
  And I press the first "button[type='submit']" element

  # Confirmation page
  Then I wait until element "h1" contains text "Thank you for submitting your application!"

Scenario: Teacher starts a new csa application and submits it
  Given I create a teacher named "Severus"
  And I am on "http://studio.code.org/pd/application/teacher"
  And I wait until element "h1" contains text "Professional Learning Program Teacher Application"
  Then I wait until element "h3" contains text "Section 1: Choose Your Program"
  And I press "input[name='program']:last" using jQuery
  And I press the first "button#next" element

  # Section 2
  And I complete Section 2 of the teacher PD application
  And I press the first "button#next" element

  # Section 3
  And I complete Section 3 of the teacher PD application
  And I press the first "button#next" element

  # Section 4
  And I complete Section 4 of the teacher PD application
  And I press the first "input[name='csaAlreadyKnow']" element
  And I press the first "input[name='csaPhoneScreen']" element
  And I press the first "button#next" element

  # Section 5
  And I complete Section 5 of the teacher PD application
  And I press the first "button#next" element

  # Section 6
  Then I wait until element "h3" contains text "Section 6: Implementation Plan"
  And I press the first "input[name='csaWhichGrades']" element
  And I press the first "input[name='csaHowOffer']" element
  And I press the first "input[name='enoughCourseHours']" element
  And I press the first "input[name='replaceExisting']" element
  And I press the first "button#next" element

  # Section 7
  And I complete Section 7 of the teacher PD application
  And I press the first "button[type='submit']" element

  # Confirmation page
  Then I wait until element "h1" contains text "Thank you for submitting your application!"
