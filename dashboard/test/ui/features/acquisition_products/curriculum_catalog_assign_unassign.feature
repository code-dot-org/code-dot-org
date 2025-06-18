Feature: Curriculum Catalog Assign and Unassign

  Scenario: Signed-in teacher with sections assigns and unassigns offerings to sections
    Given I am a teacher with student sections named Section 1 and Section 2

    # Assign a standalone unit
    And I am on "http://studio.code.org/catalog"
    Then I wait until element "h4:contains(AI for Oceans)" is visible
    And I click selector "[aria-label='Assign AI for Oceans to your classroom']"
    And element "span:contains(Section 1)" is visible
    And element "span:contains(Section 2)" is visible
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is not selected
    And I click the "Section 1" checkbox in the dialog
    And the "Section 1" checkbox is selected
    And the "Section 2" checkbox is not selected
    And I click selector "button:contains(Confirm section assignments)"
    And I wait until element "p:contains(You have successfully assigned)" is visible

    # Assign a course
    Then I wait until element "h4:contains(Computer Science Principles)" is visible
    And I click selector "[aria-label='Assign Computer Science Principles to your classroom']"
    And element "span:contains(Section 1)" is visible
    And element "span:contains(Section 2)" is visible
    And element "input[type=checkbox]:eq(2)" is not checked
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is not selected
    And I click the "Section 2" checkbox in the dialog
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is selected
    And I click selector "button:contains(Confirm section assignments)"
    And I wait until element "p:contains(You have successfully assigned)" is visible

    # Confirm assignment
    Then I am on "http://studio.code.org"
    And I see that "Section 1" is assigned to "AI for Oceans" in the section table
    And I see that "Section 2" is assigned to "Computer Science Principles" in the section table

    # Unassign standalone unit
    Then I am on "http://studio.code.org/catalog"
    And I wait until element "h4:contains(AI for Oceans)" is visible
    And I click selector "[aria-label='Assign AI for Oceans to your classroom']"
    And element "span:contains(Section 1)" is visible
    And element "span:contains(Section 2)" is visible
    And the "Section 1" checkbox is selected
    And the "Section 2" checkbox is not selected
    And I click the "Section 1" checkbox in the dialog
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is not selected
    And I click selector "button:contains(Confirm section assignments)"

    # Unassign course unit
    Then I wait until element "h4:contains(Computer Science Principles)" is visible
    And I click selector "[aria-label='Assign Computer Science Principles to your classroom']"
    And element "span:contains(Section 1)" is visible
    And element "span:contains(Section 2)" is visible
    And element "input[type=checkbox]:eq(2)" is not checked
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is selected
    And I click the "Section 2" checkbox in the dialog
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is not selected
    And I click selector "button:contains(Confirm section assignments)"
    And element "p:contains(You have successfully assigned)" is not visible

    # Confirm unassign
    Then I am on "http://studio.code.org"
    And I see that "Section 1" is not assigned to "AI for Oceans" in the section table
    And I see that "Section 2" is not assigned to "Computer Science Principles" in the section table

  @no_mobile
  Scenario: On expanded card, Signed-in teacher with sections assigns and unassigns offerings to sections
    Given I am a teacher with student sections named Section 1 and Section 2

    # Assign a standalone unit
    And I am on "http://studio.code.org/catalog"
    Then I wait until element "h4:contains(AI for Oceans)" is visible
    And I click selector "[aria-label='View details about AI for Oceans']"

    And I click selector "button:contains(Assign to class sections)"
    And element "span:contains(Section 1)" is visible
    And element "span:contains(Section 2)" is visible
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is not selected
    And I click the "Section 1" checkbox in the dialog
    And the "Section 1" checkbox is selected
    And the "Section 2" checkbox is not selected
    And I click selector "button:contains(Confirm section assignments)"

    # Assign a course
    Then I wait until element "h4:contains(Computer Science Principles)" is visible

    And I click selector "[aria-label='View details about Computer Science Principles']"
    And I click selector "button:contains(Assign to class sections)"
    And element "span:contains(Section 1)" is visible
    And element "span:contains(Section 2)" is visible
    And element "input[type=checkbox]:eq(2)" is not checked
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is not selected
    And I click the "Section 2" checkbox in the dialog
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is selected
    And I click selector "button:contains(Confirm section assignments)"
    And I wait until element "p:contains(You have successfully assigned)" is visible

    # Confirm assignment
    Then I am on "http://studio.code.org"
    And I see that "Section 1" is assigned to "AI for Oceans" in the section table
    And I see that "Section 2" is assigned to "Computer Science Principles" in the section table

    # Unassign standalone unit
    Then I am on "http://studio.code.org/catalog"
    And I wait until element "h4:contains(AI for Oceans)" is visible
    And I click selector "[aria-label='View details about AI for Oceans']"

    And I click selector "button:contains(Assign to class sections)"
    And element "span:contains(Section 1)" is visible
    And element "span:contains(Section 2)" is visible
    And the "Section 1" checkbox is selected
    And the "Section 2" checkbox is not selected
    And I click the "Section 1" checkbox in the dialog
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is not selected
    And I click selector "button:contains(Confirm section assignments)"

    # Unassign course unit
    Then I wait until element "h4:contains(Computer Science Principles)" is visible

    And I click selector "[aria-label='View details about Computer Science Principles']"
    And I click selector "button:contains(Assign to class sections)"
    And element "span:contains(Section 1)" is visible
    And element "span:contains(Section 2)" is visible
    And element "input[type=checkbox]:eq(2)" is not checked
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is selected
    And I click the "Section 2" checkbox in the dialog
    And the "Section 1" checkbox is not selected
    And the "Section 2" checkbox is not selected
    And I click selector "button:contains(Confirm section assignments)"
    And element "p:contains(You have successfully assigned)" is not visible

    # Confirm unassign
    Then I am on "http://studio.code.org"
    And I see that "Section 1" is not assigned to "AI for Oceans" in the section table
    And I see that "Section 2" is not assigned to "Computer Science Principles" in the section table
