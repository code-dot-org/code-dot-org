Feature: Unnumbered Lessons

  Scenario: Units with Unnumbered Lessons
    Given I am a teacher

    When I am on "http://studio.code.org/s/ui-test-unnumbered-lessons"
    And I wait until element ".uitest-progress-lesson" is visible
    Then element ".uitest-progress-lesson" contains text "Lesson One"
    And element ".uitest-progress-lesson" does not contain text "Lesson 1"
    And element ".uitest-progress-lesson" contains text "Lesson Two"
    And element ".uitest-progress-lesson" does not contain text "Lesson 2"

    When I am on "http://studio.code.org/s/ui-test-unnumbered-lessons/lessons/1"
    And I wait until element ".uitest-lesson-title" is visible
    Then element ".uitest-lesson-title" contains text "Lesson One"
    And element ".uitest-lesson-title" does not contain text "Lesson 1"

    When I am on "http://studio.code.org/s/ui-test-unnumbered-lessons/lessons/1/levels/1"
    And I wait until element "button.header_popup_link" is visible
    And element ".uitest-progress-lesson" is not visible
    And I click selector "button.header_popup_link"
    And I wait until element ".uitest-progress-lesson" is visible
    Then element ".uitest-progress-lesson" contains text "Lesson One"
    And element ".uitest-progress-lesson" does not contain text "Lesson 1"
    And element ".uitest-progress-lesson" contains text "Lesson Two"
    And element ".uitest-progress-lesson" does not contain text "Lesson 2"
