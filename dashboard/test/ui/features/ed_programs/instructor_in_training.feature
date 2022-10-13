Feature: Self Paced PL Instructor in Training

  Scenario: View Instructor In Training Applab Level as Universal Instructor
    Given I create a teacher named "Universal Instructor"
    And I sign in as "Universal Instructor"
    And I get universal instructor access
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/1"
    And I rotate to landscape
    And I wait for the page to fully load

    Then I press the first ".uitest-teacherOnlyTab" element
    And I wait to see ".editor-column"
    And element ".editor-column" contains text "For Teachers Only"
    And element ".editor-column" contains text "Teacher Only Content Yay!"
    And element ".editor-column" contains text "Example Solution 1"
    And element "#instructor_in_training_tag" is not visible

  Scenario: View Instructor In Training Applab Level as Verified Teacher
    Given I create an authorized teacher-associated student named "Manuel"
    And I sign in as "Teacher_Manuel"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/1"
    And I rotate to landscape
    And I wait for the page to fully load

    Then I press the first ".uitest-teacherOnlyTab" element
    And I wait to see ".editor-column"
    And element ".editor-column" contains text "For Teachers Only"
    And element ".editor-column" contains text "Teacher Only Content Yay!"
    And element ".editor-column" contains text "Example Solution 1"
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"

  Scenario: View Instructor In Training Applab Level as Unverified Teacher
    Given I create a teacher named "Ms_Frizzle"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/1"
    And I rotate to landscape
    And I wait for the page to fully load

    And element ".uitest-instructionsTab" is visible
    And element ".uitest-teacherOnlyTab" is not visible
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"

  Scenario: View Instructor In Training Dance Level as Universal Instructor
    Given I create a teacher named "Universal Instructor"
    And I sign in as "Universal Instructor"
    And I get universal instructor access
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/2"
    And I rotate to landscape
    And I wait for the page to fully load

    Then I press the first ".uitest-teacherOnlyTab" element
    And I wait to see ".editor-column"
    And element ".editor-column" contains text "For Teachers Only"
    And element ".editor-column" contains text "Some teacher only content yay!"
    And element "#instructor_in_training_tag" is not visible

  Scenario: View Instructor In Training Dance Level as Verified Teacher
    Given I create an authorized teacher-associated student named "Manuel"
    And I sign in as "Teacher_Manuel"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/2"
    And I rotate to landscape
    And I wait for the page to fully load

    Then I press the first ".uitest-teacherOnlyTab" element
    And I wait to see ".editor-column"
    And element ".editor-column" contains text "For Teachers Only"
    And element ".editor-column" contains text "Some teacher only content yay!"
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"

  Scenario: View Instructor In Training Dance Level as Unverified Teacher
    Given I create a teacher named "Ms_Frizzle"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/2"
    And I rotate to landscape
    And I wait for the page to fully load

    And element ".uitest-instructionsTab" is visible
    And element ".uitest-teacherOnlyTab" is not visible
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"

  Scenario: View Instructor In Training Free Response Level as Universal Instructor
    Given I create a teacher named "Universal Instructor"
    And I sign in as "Universal Instructor"
    And I get universal instructor access
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/3"
    And I rotate to landscape

    And I wait to see ".free-response"
    And element ".teacher.hide-as-student" is visible
    And element ".teacher.hide-as-student" contains text "For Teachers Only"
    And element ".teacher.hide-as-student" contains text "The variables days, weekends, and months have the primitive data type int."
    And element "#instructor_in_training_tag" is not visible

  Scenario: View Instructor In Training Free Response Level as Verified Teacher
    Given I create an authorized teacher-associated student named "Manuel"
    And I sign in as "Teacher_Manuel"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/3"
    And I rotate to landscape

    And I wait to see ".free-response"
    And element ".teacher.hide-as-student" is visible
    And element ".teacher.hide-as-student" contains text "For Teachers Only"
    And element ".teacher.hide-as-student" contains text "The variables days, weekends, and months have the primitive data type int."
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"

  Scenario: View Instructor In Training Free Response Level as Unverified Teacher
    Given I create a teacher named "Ms_Frizzle"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/3"
    And I rotate to landscape

    And element ".submitButton" is visible
    And element ".teacher.hide-as-student" is not visible
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"

  Scenario: View Instructor In Training External Level as Universal Instructor
    Given I create a teacher named "Universal Instructor"
    And I sign in as "Universal Instructor"
    And I get universal instructor access
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/6"
    And I rotate to landscape

    And I wait to see ".external"
    And element ".teacher.hide-as-student" is visible
    And element ".teacher.hide-as-student" contains text "For Teachers Only"
    And element ".teacher.hide-as-student" contains text "Teacher only markdown content yay!"
    And element "#instructor_in_training_tag" is not visible

  Scenario: View Instructor In Training External Level as Verified Teacher
    Given I create an authorized teacher-associated student named "Manuel"
    And I sign in as "Teacher_Manuel"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/6"
    And I rotate to landscape

    And I wait to see ".external"
    And element ".teacher.hide-as-student" is visible
    And element ".teacher.hide-as-student" contains text "For Teachers Only"
    And element ".teacher.hide-as-student" contains text "Teacher only markdown content yay!"
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"

  Scenario: View Instructor In Training External Level as Unverified Teacher
    Given I create a teacher named "Ms_Frizzle"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/6"
    And I rotate to landscape

    And element ".submitButton" is visible
    And element ".teacher.hide-as-student" is not visible
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"

  Scenario: View Instructor In Training Bubble Choice Level as Universal Instructor
    Given I create a teacher named "Universal Instructor"
    And I sign in as "Universal Instructor"
    And I get universal instructor access
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/7"
    And I rotate to landscape

    And I wait to see ".bubble-choice"
    And element ".teacher.hide-as-student" is visible
    And element ".teacher.hide-as-student" contains text "For Teachers Only"
    And element ".teacher.hide-as-student" contains text "Teacher only markdown for bubble choice yay!"
    And element "#instructor_in_training_tag" is not visible

  Scenario: View Instructor In Training Bubble Choice Level as Verified Teacher
    Given I create an authorized teacher-associated student named "Manuel"
    And I sign in as "Teacher_Manuel"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/7"
    And I rotate to landscape

    And I wait to see ".bubble-choice"
    And element ".teacher.hide-as-student" is visible
    And element ".teacher.hide-as-student" contains text "For Teachers Only"
    And element ".teacher.hide-as-student" contains text "Teacher only markdown for bubble choice yay!"
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"

  Scenario: View Instructor In Training Bubble Choice Level as Unverified Teacher
    Given I create a teacher named "Ms_Frizzle"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/7"
    And I rotate to landscape

    And element ".bubble-choice" is visible
    And element ".teacher.hide-as-student" is not visible
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"

  Scenario: View Instructor In Training LevelGroup Level as Universal Instructor
    Given I create a teacher named "Universal Instructor"
    And I sign in as "Universal Instructor"
    And I get universal instructor access
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/2/levels/1"
    And I rotate to landscape

    And I wait to see ".level-group"
    And element ".teacher.hide-as-student" is visible
    And element ".teacher.hide-as-student" contains text "Answer"
    And element ".teacher.hide-as-student" contains text "For Teachers Only"
    And element ".teacher.hide-as-student" contains text "This assessment is designed to be used in conjunction with the unit project to assess student learning of the objectives in this unit."
    And element "#instructor_in_training_tag" is not visible

  Scenario: View Instructor In Training LevelGroup Level as Verified Teacher
    Given I create an authorized teacher-associated student named "Manuel"
    And I sign in as "Teacher_Manuel"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/2/levels/1"
    And I rotate to landscape

    And I wait to see ".level-group"
    And element ".teacher.hide-as-student" is visible
    And element ".teacher.hide-as-student" contains text "Answer"
    And element ".teacher.hide-as-student" contains text "For Teachers Only"
    And element ".teacher.hide-as-student" contains text "This assessment is designed to be used in conjunction with the unit project to assess student learning of the objectives in this unit."
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"

  Scenario: View Instructor In Training LevelGroup Level as Unverified Teacher
    Given I create a teacher named "Ms_Frizzle"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/2/levels/1"
    And I rotate to landscape

    And element ".level-group" is visible
    And element ".teacher.hide-as-student" is not visible
    And element "#instructor_in_training_tag" contains text "Viewing As Instructor"
