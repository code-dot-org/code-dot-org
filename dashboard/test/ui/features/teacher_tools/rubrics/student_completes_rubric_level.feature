Feature: Student can complete rubric-enabled level
  Scenario: Student of verified teacher can complete rubric-enabled level
    # Create student with verified teacher
    Given I create an authorized teacher-associated student named "Reuben"
    And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2"
    And I wait for the lab page to fully load
    And I verify progress in the header of the current page is "not_tried" for level 2

    # Student submits code
    When I ensure droplet is in text mode
    And I append text to droplet "// the quick brown fox jumped over the lazy dog.\n"
    And I submit this gamelab level
    

    # Student can see new progress in header
    And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2"
    And I wait for the lab page to fully load
    Then I verify progress in the header of the current page is "perfect_assessment" for level 2

  Scenario: Student of unverified teacher can complete rubric-enabled level
    # Create student in non-AI experiment
    Given I create a teacher-associated student named "Reuben"
    And I add the current user to the "non-ai-rubrics" single user experiment
    And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2"
    And I wait for the lab page to fully load
    And I verify progress in the header of the current page is "not_tried" for level 2
    # Student submits code
    When I ensure droplet is in text mode
    And I append text to droplet "// the quick brown fox jumped over the lazy dog.\n"
    And I submit this gamelab level
    # Student can see new progress in header
    And I am on "http://studio.code.org/s/allthethings/lessons/48/levels/2"
    And I wait for the lab page to fully load
    Then I verify progress in the header of the current page is "perfect_assessment" for level 2
