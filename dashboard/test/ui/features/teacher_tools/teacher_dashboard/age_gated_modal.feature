Feature: Age Gated Students Modal and Banner
 Scenario: Viewing a student
    Given I create an authorized teacher-associated student named "Sally"
    Given I am assigned to unit "allthethings"
    And I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1"
    And I complete the free response on "http://studio.code.org/s/allthethings/lessons/27/levels/1"
    And I submit the assessment on "http://studio.code.org/s/allthethings/lessons/33/levels/1"
