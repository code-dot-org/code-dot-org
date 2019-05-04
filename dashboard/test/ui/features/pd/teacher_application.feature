@dashboard_db_access
@eyes

Feature: Teacher Application

Scenario: Basic teacher application submission
  Given I create a teacher named "Severus"
    And I am on "http://studio.code.org/pd/application/teacher"
    And I wait until element "h1" contains text "2019-20 Professional Learning Program Teacher Application"
    And I open my eyes to test "Teacher Application"

  # Section 1
  When I wait until element "h3" contains text "Section 1: About You"
    And I press the first "input[name='country']" element
    And I press keys "Severus" for element "input#firstName"
    And I press keys "Snape" for element "input#lastName"
    And I press keys "5558675309" for element "input#phone"
    And I press keys "98101" for element "input#zipCode"
    And I press the first "input[name='completingOnBehalfOfSomeoneElse'][value='No']" element
    Then I see no difference for "Section 1: About You"
    And I press the first "button#next" element


  # Section 2
  Then I wait until element "h3" contains text "Section 2: Teaching Background"
  And I press "input[name='subjectsTeaching']:first" using jQuery
  And I press the first "input[name='taughtInPast']" element
  And I press the first "input[name='previousYearlongCdoPd']" element

  And I press keys "nonexistent" for element "#school input"

  # School: select other and enter manual data
  Then I wait until element ".VirtualizedSelectOption:contains('Other school not listed below')" is visible
    And I press ".VirtualizedSelectOption:contains('Other school not listed below')" using jQuery
    Then I wait until element "input#schoolName" is visible
    And I press keys "Code.org" for element "input#schoolName"
    And I press keys "Code.org District" for element "input#schoolDistrictName"
    And I press keys "1501 4th Ave" for element "input#schoolAddress"
    And I press keys "Seattle" for element "input#schoolCity"
    And I select the "Washington" option in dropdown "schoolState"
    And I press keys "98101" for element "input#schoolZipCode"
    And I press the first "input[name='schoolType'][value='Other']" element
  Then I press keys "Albus" for element "input#principalFirstName"
  And I press keys "Dumbledore" for element "input#principalLastName"
  And I press keys "socks@hogwarts.edu" for element "input#principalEmail"
  And I press keys "socks@hogwarts.edu" for element "input#principalConfirmEmail"
  And I press keys "5555882300" for element "input#principalPhoneNumber"
  And I press the first "input[name='currentRole']" element

  Then I see no difference for "Section 2: Teaching Background"
  And I press the first "button#next" element


  # Section 3
  Then I wait until element "h3" contains text "Section 3: Choose Your Program"
  And I press "input[name='program']:first" using jQuery
  And I press the first "input[name='csdWhichGrades']" element
  And I press keys "50" for element "input#csHowManyMinutes"
  And I press keys "5" for element "input#csHowManyDaysPerWeek"
  And I press keys "40" for element "input#csHowManyWeeksPerYear"
  And I press the first "input[name='csTerms']" element
  And I press the first "input[name='planToTeach']" element
  And I press the first "input[name='replaceExisting']" element
  Then I wait until element "textarea#replaceWhichCourse" is visible
    And I press keys "Replacing existing CS Course" for element "textarea#replaceWhichCourse"

  Then I see no difference for "Section 3: Choose Your Program"
  And I press the first "button#next" element


  # Section 4
  Then I wait until element "h3" contains text "Section 4: Professional Learning Program Requirements"
  And I press "input[name='committed']:first" using jQuery
  And I click selector "input[name='payFee']" if I see it
  And I press the first "input[name='willingToTravel']" element
  And I press the first "input[name='interestedInOnlineProgram']" element
  Then I see no difference for "Section 4: Summer Workshop"
  And I press the first "button#next" element

  # Section 5
  Then I wait until element "h3" contains text "Section 5: Additional Demographic Information and submission"
  And I press "input[name='genderIdentity']:first" using jQuery
  And I press the first "input[name='race']" element
  And I press the first "input[name='howHeard']" element
  And I press the first "input#agree" element
  Then I see no difference for "Section 5: Submission"
  And I press the first "button[type='submit']" element

  # Confirmation page
  Then I wait until element "h1" contains text "Thank you for submitting your application!"
  Then I see no difference for "Confirmation"

  # Principal approval
  Then I sign out
  Then I navigate to the principal approval page for "Severus"
  Then I wait until element "h1" contains text "2019-2020 Code.org Principal Approval Form"
  Then I press the first "input[name='doYouApprove'][value='Yes']" element
  Then I press the first "input[name='planToTeach']" element

  And I press keys "nonexistent" for element "#nces_school"
  Then I wait until element ".VirtualizedSelectOption:contains('Other school not listed below')" is visible
  And I press ".VirtualizedSelectOption:contains('Other school not listed below')" using jQuery
  Then I wait until element "input#schoolName" is visible
  And I press keys "Code.org" for element "input#schoolName"
  And I press keys "1501 4th Ave" for element "input#schoolAddress"
  And I press keys "Seattle" for element "input#schoolCity"
  And I select the "Washington" option in dropdown "schoolState"
  And I press keys "98101" for element "input#schoolZipCode"
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
  Then I press the first "input[name='csdImplementation']" element
  Then I press the first "input[name='replaceCourse']" element
  Then I press the first "input[name='replaceWhichCourseCsd']" element

  Then I press the first "input[name='committedToDiversity']" element
  Then I press the first "#understandFee" element
  Then I press the first "input[name='payFee']" element
  Then I press the first "#confirmPrincipal" element

  Then I see no difference for "Principal approval form"

  And I press the first "button#submit" element
  Then I wait until element "h1" contains text "Thank you. Your teacher's application is now considered complete and will be reviewed."
  Then I see no difference for "Principal approval confirmation form"
  Then I close my eyes

