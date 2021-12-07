@eyes
Feature: Self Paced PL Instructor in Training

  Scenario: Applab level with teacher only markdown
    When I open my eyes to test "instructor in training - applab"
    Given I create an authorized teacher-associated student named "Manuel"
    Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/11"
    And I rotate to landscape
    And I wait for the page to fully load
    And I see no difference for "student doesnt see teacher markdown"
    Then I sign out
    And I sign in as "Teacher_Manuel"
    Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/11"
    And I rotate to landscape
    And I wait for the page to fully load
    And I see no difference for "authorized teacher does see teacher markdown"
    Then I close my eyes

  Scenario: Dance level with teacher only markdown
    When I open my eyes to test "instructor in training - dance"
    Given I create an authorized teacher-associated student named "Manuel"
    Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/11"
    And I rotate to landscape
    And I wait for the page to fully load
    And I see no difference for "student doesnt see teacher markdown"
    Then I sign out
    And I sign in as "Teacher_Manuel"
    Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/11"
    And I rotate to landscape
    And I wait for the page to fully load
    And I see no difference for "authorized teacher does see teacher markdown"
    Then I close my eyes

  Scenario: External level with teacher only markdown
    When I open my eyes to test "instructor in training - external"
    Given I create an authorized teacher-associated student named "Manuel"
    Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/11"
    And I rotate to landscape
    And I wait for the page to fully load
    And I see no difference for "student doesnt see teacher markdown"
    Then I sign out
    And I sign in as "Teacher_Manuel"
    Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/11"
    And I rotate to landscape
    And I wait for the page to fully load
    And I see no difference for "authorized teacher does see teacher markdown"
    Then I close my eyes

  Scenario: Multi level with teacher only markdown
    When I open my eyes to test "instructor in training - multi"
    Given I create an authorized teacher-associated student named "Manuel"
    Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/11"
    And I rotate to landscape
    And I wait for the page to fully load
    And I see no difference for "student doesnt see teacher markdown"
    Then I sign out
    And I sign in as "Teacher_Manuel"
    Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/11"
    And I rotate to landscape
    And I wait for the page to fully load
    And I see no difference for "authorized teacher does see teacher markdown"
    Then I close my eyes

  Scenario: Match level with teacher only markdown
    When I open my eyes to test "instructor in training - match"
    Given I create an authorized teacher-associated student named "Manuel"
    Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/11"
    And I rotate to landscape
    And I wait for the page to fully load
    And I see no difference for "student doesnt see teacher markdown"
    Then I sign out
    And I sign in as "Teacher_Manuel"
    Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/11"
    And I rotate to landscape
    And I wait for the page to fully load
    And I see no difference for "authorized teacher does see teacher markdown"
    Then I close my eyes

  Scenario: Bubble Choice level with teacher only markdown
    When I open my eyes to test "instructor in training - bubble choice"
    Given I create an authorized teacher-associated student named "Manuel"
    Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/11"
    And I rotate to landscape
    And I wait for the page to fully load
    And I see no difference for "student doesnt see teacher markdown"
    Then I sign out
    And I sign in as "Teacher_Manuel"
    Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/11"
    And I rotate to landscape
    And I wait for the page to fully load
    And I see no difference for "authorized teacher does see teacher markdown"
    Then I close my eyes

  Scenario: LevelGroup level with teacher only markdown
    When I open my eyes to test "instructor in training - levelgroup"
    Given I create an authorized teacher-associated student named "Manuel"
    Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/11"
    And I rotate to landscape
    And I wait for the page to fully load
    And I see no difference for "student doesnt see teacher markdown"
    Then I sign out
    And I sign in as "Teacher_Manuel"
    Then I am on "http://studio.code.org/s/allthethings/lessons/18/levels/11"
    And I rotate to landscape
    And I wait for the page to fully load
    And I see no difference for "authorized teacher does see teacher markdown"
    Then I close my eyes