Feature: Professional learning Sections
  Scenario: Create new professional learning section as levelbuilder
    # Create section button
    When I see the section set up box
    Then I press the new section button

    # Participant Type Picker
    Then I should see the new section dialog
    And element ".uitest-student-type" is visible
    And element ".uitest-teacher-type" is visible
    And element ".uitest-facilitator-type" is visible
    When I select facilitator participant type

    # Edit Section Form
    Then I wait to see "#uitest-section-name"
    And I press keys "My Section of Teachers" for element "#uitest-section-name"
    Then I wait to see "#uitest-assignment-family"
    # Need to figure out what course we are going to use. Do we need to seed one special for this?
    When I select the "All the Self Paced PL Things *" option in dropdown "uitest-assignment-family"
    And I press the save button to create a new section
    And I wait for the dialog to close using jQuery

    # Professional Learning Sections Table
    Then I should see the professional learning section table
    Then the professional learning section table should have 1 row
    And I wait until element "a:contains(My Section of Teachers)" is visible
    And the href of selector "a:contains(My Section of Teachers)" contains "/teacher_dashboard/sections/"

  Scenario: Create new professional learning section as universal instructor
    # Create section button
    When I see the section set up box
    Then I press the new section button

    # Participant Type Picker
    Then I should see the new section dialog
    And element ".uitest-student-type" is visible
    And element ".uitest-teacher-type" is visible
    And element ".uitest-facilitator-type" is visible
    When I select facilitator participant type

    # Edit Section Form
    Then I wait to see "#uitest-section-name"
    And I press keys "My Section of Teachers" for element "#uitest-section-name"
    Then I wait to see "#uitest-assignment-family"
    # Need to figure out what course we are going to use. Do we need to seed one special for this?
    When I select the "All the Self Paced PL Things *" option in dropdown "uitest-assignment-family"
    And I press the save button to create a new section
    And I wait for the dialog to close using jQuery

    # Professional Learning Sections Table
    Then I should see the professional learning section table
    Then the professional learning section table should have 1 row
    And I wait until element "a:contains(My Section of Teachers)" is visible
    And the href of selector "a:contains(My Section of Teachers)" contains "/teacher_dashboard/sections/"

  Scenario: Create new professional learning section as plc reviewer
    # Create section button
    When I see the section set up box
    Then I press the new section button

    # Participant Type Picker
    Then I should see the new section dialog
    And element ".uitest-student-type" is visible
    And element ".uitest-teacher-type" is visible
    And element ".uitest-facilitator-type" is visible
    When I select facilitator participant type

    # Edit Section Form
    Then I wait to see "#uitest-section-name"
    And I press keys "My Section of Teachers" for element "#uitest-section-name"
    Then I wait to see "#uitest-assignment-family"
    # Need to figure out what course we are going to use. Do we need to seed one special for this?
    When I select the "All the Self Paced PL Things *" option in dropdown "uitest-assignment-family"
    And I press the save button to create a new section
    And I wait for the dialog to close using jQuery

    # Professional Learning Sections Table
    Then I should see the professional learning section table
    Then the professional learning section table should have 1 row
    And I wait until element "a:contains(My Section of Teachers)" is visible
    And the href of selector "a:contains(My Section of Teachers)" contains "/teacher_dashboard/sections/"

  Scenario: Create new professional learning section as facilitator
    # Create section button
    When I see the section set up box
    Then I press the new section button

    # Participant Type Picker
    Then I should see the new section dialog
    And element ".uitest-student-type" is visible
    And element ".uitest-teacher-type" is visible
    And element ".uitest-facilitator-type" is not visible
    When I select teacher participant type

    # Edit Section Form
    Then I wait to see "#uitest-section-name"
    And I press keys "My Section of Teachers" for element "#uitest-section-name"
    Then I wait to see "#uitest-assignment-family"
    # Need to figure out what course we are going to use. Do we need to seed one special for this?
    When I select the "All the Self Paced PL Things *" option in dropdown "uitest-assignment-family"
    And I press the save button to create a new section
    And I wait for the dialog to close using jQuery

    # Professional Learning Sections Table
    Then I should see the professional learning section table
    Then the professional learning section table should have 1 row
    And I wait until element "a:contains(My Section of Teachers)" is visible
    And the href of selector "a:contains(My Section of Teachers)" contains "/teacher_dashboard/sections/"

  Scenario: Teacher can not create professional learning section
    # Create section button
    When I see the section set up box
    Then I press the new section button

    # Participant Type Picker
    Then I should see the new section dialog
    And element ".uitest-student-type" is not visible
    And element ".uitest-teacher-type" is not visible
    And element ".uitest-facilitator-type" is not visible

  Scenario: Teacher tries to join professional learning section for teachers
    Given I am a teacher and go home
    And I wait until element "div.ui-test-join-section" is visible
    And I create a new teacher section and go home
    # need to get a valid section for teachers
    And I type the section code into "#input.ui-test-join-section"
    And I click selector "div.ui-test-join-section"
    # check that the section is added to the joined sections pl table

  Scenario: Teacher tries to join professional learning section for facilitators
    Given I am a teacher and go home
    And I wait until element "div.ui-test-join-section" is visible
    And I create a new facilitator section and go home
    # need to get a section code for a facilitator section
    And I type the section code into "#input.ui-test-join-section"
    And I click selector "div.ui-test-join-section"
    Then I wait until element ".announcement-notification" is visible
    And element ".announcement-notification" contains text matching "You do not have the permissions to join section"
    # check that section was not added to the table