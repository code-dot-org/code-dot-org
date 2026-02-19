Feature: Seeding Vocab

Scenario: Can view lesson vocab

  Given I am a teacher
  And I am on "http://studio.code.org/courses/ui-test-vocab/units/1/lessons/1/"
  And I wait until element ".lesson-overview" is visible
  Then element ".lesson-overview" contains text "my-vocab-word"
