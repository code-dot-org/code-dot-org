@no_mobile
Feature: Professional learning Sections

  Scenario: Create new professional learning section as universal instructor
    Given I create an authorized teacher-associated student named "Maggie"
    When I sign in as "Teacher_Maggie" and go home
    And I get universal instructor access
    And I reload the page
    Then I am on "http://studio.code.org/my-professional-learning"

    # Go to the right My PL page tab
    And I wait until element "button:contains(Instructor Center)" is visible
    Then I click selector "button:contains(Instructor Center)"

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

    # New Section details
    Then I wait to see "#sections-set-up-container"
    And I press keys "My Section of Teachers" for element "#uitest-section-name-setup"
    And I wait until element "button:contains(Professional Learning)" is visible
    And I press the first "#uitest-save-section-changes" element to load a new page
    Then I am on "http://studio.code.org/my-professional-learning"

    # Professional Learning Sections Table
    Then I wait until element "button:contains(Instructor Center)" is visible
    Then I click selector "button:contains(Instructor Center)"
    Then I wait until element ".uitest-owned-pl-sections" is visible
    Then I should see the professional learning section table
    Then the professional learning section table should have 1 row
    And I wait until element "a:contains(My Section of Teachers)" is visible
    And the href of selector "a:contains(My Section of Teachers)" contains "/teacher_dashboard/sections/"

  Scenario: Create new professional learning section as plc reviewer
    Given I create an authorized teacher-associated student named "Arity"
    When I sign in as "Teacher_Arity" and go home
    And I get plc reviewer access
    And I reload the page
    Then I am on "http://studio.code.org/my-professional-learning"

    # Go to the right My PL page tab
    And I wait until element "button:contains(Instructor Center)" is visible
    Then I click selector "button:contains(Instructor Center)"

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

    # New Section details
    Then I wait to see "#sections-set-up-container"
    And I press keys "My Section of Teachers" for element "#uitest-section-name-setup"
    And I wait until element "button:contains(Professional Learning)" is visible
    And I press the first "#uitest-save-section-changes" element to load a new page
    Then I am on "http://studio.code.org/my-professional-learning"

    # Professional Learning Sections Table
    Then I wait until element "button:contains(Instructor Center)" is visible
    Then I click selector "button:contains(Instructor Center)"
    Then I wait until element ".uitest-owned-pl-sections" is visible
    Then I should see the professional learning section table
    Then the professional learning section table should have 1 row
    And I wait until element "a:contains(My Section of Teachers)" is visible
    And the href of selector "a:contains(My Section of Teachers)" contains "/teacher_dashboard/sections/"

  Scenario: Create new professional learning section as facilitator
    Given I create an authorized teacher-associated student named "Colin"
    When I sign in as "Teacher_Colin" and go home
    And I get facilitator access
    And I reload the page
    Then I am on "http://studio.code.org/my-professional-learning"

    # Go to the right My PL page tab
    And I wait until element "button:contains(Facilitator Center)" is visible
    Then I click selector "button:contains(Facilitator Center)"

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

    # New Section details
    Then I wait to see "#sections-set-up-container"
    And I press keys "My Section of Teachers" for element "#uitest-section-name-setup"
    And I wait until element "button:contains(Professional Learning)" is visible
    And I press the first "#uitest-save-section-changes" element to load a new page
    Then I am on "http://studio.code.org/my-professional-learning"

    # Professional Learning Sections Table
    Then I wait until element "button:contains(Facilitator Center)" is visible
    Then I click selector "button:contains(Facilitator Center)"
    Then I wait until element ".uitest-owned-pl-sections" is visible
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
    And element ".uitest-teacher-type" is not visible

  Scenario: Teacher tries to join professional learning section for teachers
    Given I create an authorized teacher-associated student named "Bri"
    When I sign in as "Teacher_Bri" and go home
    And I get universal instructor access
    And I create a new teacher section and go home

    Then I create a teacher named "Teacher"
    And I sign in as "Teacher" and go home
    Then I am on "http://studio.code.org/my-professional-learning"

    And I wait until element "button.ui-test-join-section" is visible
    And I scroll the "button.ui-test-join-section" element into view
    And I enter the section code into "input.ui-test-join-section"
    And I click selector "button.ui-test-join-section"
    Then the professional learning joined sections table should have 1 row

  Scenario: Teacher tries to join professional learning section for facilitators
    Given I create an authorized teacher-associated student named "Kelly"
    When I sign in as "Teacher_Kelly" and go home
    And I get universal instructor access
    And I create a new facilitator section and go home

    Then I create a teacher named "Teacher"
    And I sign in as "Teacher" and go home
    Then I am on "http://studio.code.org/my-professional-learning"

    And I wait until element "button.ui-test-join-section" is visible
    And I scroll the "button.ui-test-join-section" element into view
    And I enter the section code into "input.ui-test-join-section"
    And I click selector "button.ui-test-join-section"
    Then I wait until element ".announcement-notification" is visible
    And element ".announcement-notification" contains text matching "You do not have the permissions to join section"

  Scenario: Facilitator tries to join professional learning section for teachers
    Given I create an authorized teacher-associated student named "Gilly"
    When I sign in as "Teacher_Gilly" and go home
    And I get universal instructor access
    And I create a new teacher section and go home

    Then I create a teacher named "Facilitator"
    And I sign in as "Facilitator" and go home
    And I get facilitator access
    And I reload the page
    Then I am on "http://studio.code.org/my-professional-learning"

    And I wait until element "button.ui-test-join-section" is visible
    And I scroll the "button.ui-test-join-section" element into view
    And I enter the section code into "input.ui-test-join-section"
    And I click selector "button.ui-test-join-section"
    Then the professional learning joined sections table should have 1 row

  Scenario: Facilitator tries to join professional learning section for facilitators
    Given I create an authorized teacher-associated student named "Sarah"
    When I sign in as "Teacher_Sarah" and go home
    And I get universal instructor access
    And I create a new facilitator section and go home

    Then I create a teacher named "Facilitator"
    And I sign in as "Facilitator" and go home
    And I get facilitator access
    And I reload the page
    Then I am on "http://studio.code.org/my-professional-learning"

    And I wait until element "button.ui-test-join-section" is visible
    And I scroll the "button.ui-test-join-section" element into view
    And I enter the section code into "input.ui-test-join-section"
    And I click selector "button.ui-test-join-section"
    Then the professional learning joined sections table should have 1 row

  Scenario: Universal Instructor tries to join professional learning section for teachers
    Given I create an authorized teacher-associated student named "Lauren"
    When I sign in as "Teacher_Lauren" and go home
    And I get universal instructor access
    And I create a new teacher section and go home

    Then I create a teacher named "Universal Instructor 2"
    And I sign in as "Universal Instructor 2" and go home
    And I get universal instructor access
    And I reload the page
    Then I am on "http://studio.code.org/my-professional-learning"

    And I wait until element "button.ui-test-join-section" is visible
    And I scroll the "button.ui-test-join-section" element into view
    And I enter the section code into "input.ui-test-join-section"
    And I click selector "button.ui-test-join-section"
    Then the professional learning joined sections table should have 1 row

  Scenario: Universal Instructor tries to join professional learning section for facilitators
    Given I create an authorized teacher-associated student named "Syd"
    When I sign in as "Teacher_Syd" and go home
    And I get universal instructor access
    And I create a new facilitator section and go home

    Then I create a teacher named "Universal Instructor 2"
    And I sign in as "Universal Instructor 2" and go home
    And I get universal instructor access
    And I reload the page
    Then I am on "http://studio.code.org/my-professional-learning"

    And I wait until element "button.ui-test-join-section" is visible
    And I scroll the "button.ui-test-join-section" element into view
    And I enter the section code into "input.ui-test-join-section"
    And I click selector "button.ui-test-join-section"
    Then the professional learning joined sections table should have 1 row
