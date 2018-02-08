@dashboard_db_access
@eyes

Feature: Teachercon Registration Form

Scenario: Teachercon Registration form submission
  Given I am a teacher named "Minerva" going to TeacherCon and am on the TeacherCon registration page
  And I wait until element "h1" contains text "2018-19 TeacherCon Registration Form"
  And I open my eyes to test "Teachercon Registration form"

  # Section 1
  And I wait until element "h4" contains text "Section 1: Are you joining us?"
  And I press the first "input[name='teacherAcceptSeat']" element
  Then I see no difference for "Section 1: Are you joining us?"
  And I press the first "button#next" element

  # Section 2
  And I wait until element "h4" contains text "Section 2: Travel Plans"
  And I press keys "Filius" for element "#contactFirstName"
  And I press keys "Flitwick" for element "#contactLastName"
  And I press keys "Colleague" for element "#contactRelationship"
  And I press keys "8005882300" for element "#contactPhone"
  And I press the first "input[name='dietaryNeeds']" element
  And I press the first "input[name='liveFarAway']" element
  And I press keys "1501 4th Avenue" for element "#addressStreet"
  And I press keys "Seattle" for element "#addressCity"
  And I press keys "WA" for element "#addressState"
  And I press keys "98101" for element "#addressZip"
  And I press the first "input[name='howTraveling']" element
  And I press the first "input[name='needHotel']" element
  And I press the first "input[name='needAda']" element
  And I press keys "ADA needs" for element "#explainAda"
  Then I see no difference for "Section 2: Travel Plans"
  And I press the first "button#next" element

  # Section 3
  And I wait until element "h4" contains text "Section 3: Course Plans"
  And I wait for 2 seconds
  And I press the first "input[name='howOfferCsp']" element
  And I press the first "input[name='haveTaughtAp']" element
  And I press the first "input[name='haveTaughtWrittenProjectCourse']" element
  And I press the first "input[name='howManyHours']" element
  And I press the first "input[name='howManyTerms']" element
  And I press the first "input[name='gradingSystem']" element
  Then I see no difference for "Section 3: Course Plans"
  And I press the first "button#next" element

  # Section 4
  And I wait until element "h4" contains text "Section 4: Releases"
  And I press the first "#photoRelease" element
  And I press the first "#liabilityWaiver" element
  And I press the first "#agreeShareContact" element
  Then I see no difference for "Section 4: Releases"
  And I submit

  # Confirmation
  Then I wait until element "h1" contains text "Thank you for registering for TeacherCon!"
  Then I see no difference for "TeacherCon confirmation form"
  Then I close my eyes
