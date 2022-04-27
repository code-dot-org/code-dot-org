Feature: Professional learning Sections
  Scenario: Create new professional learning section as levelbuilder
    Given I create an authorized teacher-associated student named "Sally"
    When I sign in as "Teacher_Sally" and go home
    And I get levelbuilder access
    And I reload the page

    # Create section button
    When I see the section set up box
    Then I press the new section button

    # Participant Type Picker
    Then I should see the new section dialog
    Then I wait to see ".uitest-participant-type-picker"
    And element ".uitest-student-type" is visible
    And element ".uitest-teacher-type" is visible
    And element ".uitest-facilitator-type" is visible
    When I select facilitator participant type

    # Edit Section Form
    Then I wait to see "#uitest-section-name"
    And I press keys "My Section of Teachers" for element "#uitest-section-name"
    Then I wait to see "#uitest-assignment-family"
    When I select the "ui-test-teacher-pl-course" option in dropdown "uitest-assignment-family"
    And I press the save button to create a new section
    And I wait for the dialog to close using jQuery

    # Professional Learning Sections Table
    Then I should see the professional learning section table
    Then the professional learning section table should have 1 row
    And I wait until element "a:contains(My Section of Teachers)" is visible
    And the href of selector "a:contains(My Section of Teachers)" contains "/teacher_dashboard/sections/"

  Scenario: Create new professional learning section as universal instructor
    Given I create an authorized teacher-associated student named "Sally"
    When I sign in as "Teacher_Sally" and go home
    And I get universal instructor access
    And I reload the page

    # Create section button
    When I see the section set up box
    Then I press the new section button

    # Participant Type Picker
    Then I should see the new section dialog
    Then I wait to see ".uitest-participant-type-picker"
    And element ".uitest-student-type" is visible
    And element ".uitest-teacher-type" is visible
    And element ".uitest-facilitator-type" is visible
    When I select facilitator participant type

    # Edit Section Form
    Then I wait to see "#uitest-section-name"
    And I press keys "My Section of Teachers" for element "#uitest-section-name"
    Then I wait to see "#uitest-assignment-family"
    When I select the "ui-test-teacher-pl-course" option in dropdown "uitest-assignment-family"
    And I press the save button to create a new section
    And I wait for the dialog to close using jQuery

    # Professional Learning Sections Table
    Then I should see the professional learning section table
    Then the professional learning section table should have 1 row
    And I wait until element "a:contains(My Section of Teachers)" is visible
    And the href of selector "a:contains(My Section of Teachers)" contains "/teacher_dashboard/sections/"

  Scenario: Create new professional learning section as plc reviewer
    Given I create an authorized teacher-associated student named "Sally"
    When I sign in as "Teacher_Sally" and go home
    And I get plc reviewer access
    And I reload the page

    # Create section button
    When I see the section set up box
    Then I press the new section button

    # Participant Type Picker
    Then I should see the new section dialog
    Then I wait to see ".uitest-participant-type-picker"
    And element ".uitest-student-type" is visible
    And element ".uitest-teacher-type" is visible
    And element ".uitest-facilitator-type" is visible
    When I select facilitator participant type

    # Edit Section Form
    Then I wait to see "#uitest-section-name"
    And I press keys "My Section of Teachers" for element "#uitest-section-name"
    Then I wait to see "#uitest-assignment-family"
    When I select the "ui-test-facilitator-pl-course" option in dropdown "uitest-assignment-family"
    And I press the save button to create a new section
    And I wait for the dialog to close using jQuery

    # Professional Learning Sections Table
    Then I should see the professional learning section table
    Then the professional learning section table should have 1 row
    And I wait until element "a:contains(My Section of Teachers)" is visible
    And the href of selector "a:contains(My Section of Teachers)" contains "/teacher_dashboard/sections/"

  Scenario: Create new professional learning section as facilitator
    Given I create an authorized teacher-associated student named "Sally"
    When I sign in as "Teacher_Sally" and go home
    And I get facilitator access
    And I reload the page

    # Create section button
    When I see the section set up box
    Then I press the new section button

    # Participant Type Picker
    Then I should see the new section dialog
    Then I wait to see ".uitest-participant-type-picker"
    And element ".uitest-student-type" is visible
    And element ".uitest-teacher-type" is visible
    And element ".uitest-facilitator-type" is not visible
    When I select teacher participant type

    # Edit Section Form
    Then I wait to see "#uitest-section-name"
    And I press keys "My Section of Teachers" for element "#uitest-section-name"
    Then I wait to see "#uitest-assignment-family"
    When I select the "ui-test-teacher-pl-course" option in dropdown "uitest-assignment-family"
    And I press the save button to create a new section
    And I wait for the dialog to close using jQuery

    # Professional Learning Sections Table
    Then I should see the professional learning section table
    Then the professional learning section table should have 1 row
    And I wait until element "a:contains(My Section of Teachers)" is visible
    And the href of selector "a:contains(My Section of Teachers)" contains "/teacher_dashboard/sections/"

  Scenario: Teacher can not create professional learning section
    Given I create a teacher named "Teacher"
    And I sign in as "Teacher" and go home

    # Create section button
    When I see the section set up box
    Then I press the new section button

    # Participant Type Picker Does Not Show
    Then I should see the new section dialog
    Then I select email login
    Then I wait to see "#uitest-section-name"

  Scenario: Teacher tries to join professional learning section for teachers
    Given I create an authorized teacher-associated student named "Sally"
    When I sign in as "Teacher_Sally" and go home
    And I get universal instructor access
    And I create a new teacher section and go home

    Then I create a teacher named "Teacher"
    And I sign in as "Teacher" and go home

    And I wait until element "div.ui-test-join-section" is visible
    And I scroll the "div.ui-test-join-section" element into view
    And I enter the section code into "input.ui-test-join-section"
    And I click selector "div.ui-test-join-section"
    Then the professional learning joined sections table should have 1 row

  Scenario: Teacher tries to join professional learning section for facilitators
    Given I create an authorized teacher-associated student named "Sally"
    When I sign in as "Teacher_Sally" and go home
    And I get universal instructor access
    And I create a new facilitator section and go home

    Then I create a teacher named "Teacher"
    And I sign in as "Teacher" and go home

    And I wait until element "div.ui-test-join-section" is visible
    And I scroll the "div.ui-test-join-section" element into view
    And I enter the section code into "input.ui-test-join-section"
    And I click selector "div.ui-test-join-section"
    Then I wait until element ".announcement-notification" is visible
    And element ".announcement-notification" contains text matching "You do not have the permissions to join section"

  Scenario: Facilitator tries to join professional learning section for teachers
    Given I create an authorized teacher-associated student named "Sally"
    When I sign in as "Teacher_Sally" and go home
    And I get universal instructor access
    And I create a new teacher section and go home

    Then I create a teacher named "Facilitator"
    And I sign in as "Facilitator" and go home
    And I get facilitator access
    And I reload the page

    And I wait until element "div.ui-test-join-section" is visible
    And I scroll the "div.ui-test-join-section" element into view
    And I enter the section code into "input.ui-test-join-section"
    And I click selector "div.ui-test-join-section"
    Then the professional learning joined sections table should have 1 row

  Scenario: Facilitator tries to join professional learning section for facilitators
    Given I create an authorized teacher-associated student named "Sally"
    When I sign in as "Teacher_Sally" and go home
    And I get universal instructor access
    And I create a new facilitator section and go home

    Then I create a teacher named "Facilitator"
    And I sign in as "Facilitator" and go home
    And I get facilitator access
    And I reload the page

    And I wait until element "div.ui-test-join-section" is visible
    And I scroll the "div.ui-test-join-section" element into view
    And I enter the section code into "input.ui-test-join-section"
    And I click selector "div.ui-test-join-section"
    Then the professional learning joined sections table should have 1 row

  Scenario: Universal Instructor tries to join professional learning section for teachers
    Given I create an authorized teacher-associated student named "Sally"
    When I sign in as "Teacher_Sally" and go home
    And I get universal instructor access
    And I create a new teacher section and go home

    Then I create a teacher named "Universal Instructor 2"
    And I sign in as "Universal Instructor 2" and go home
    And I get universal instructor access
    And I reload the page

    And I wait until element "div.ui-test-join-section" is visible
    And I scroll the "div.ui-test-join-section" element into view
    And I enter the section code into "input.ui-test-join-section"
    And I click selector "div.ui-test-join-section"
    Then the professional learning joined sections table should have 1 row

  Scenario: Universal Instructor tries to join professional learning section for facilitators
    Given I create an authorized teacher-associated student named "Sally"
    When I sign in as "Teacher_Sally" and go home
    And I get universal instructor access
    And I create a new facilitator section and go home

    Then I create a teacher named "Universal Instructor 2"
    And I sign in as "Universal Instructor 2" and go home
    And I get universal instructor access
    And I reload the page

    And I wait until element "div.ui-test-join-section" is visible
    And I scroll the "div.ui-test-join-section" element into view
    And I enter the section code into "input.ui-test-join-section"
    And I click selector "div.ui-test-join-section"
    Then the professional learning joined sections table should have 1 row