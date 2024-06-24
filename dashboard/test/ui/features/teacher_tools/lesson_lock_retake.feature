Feature: Lesson Locking Retake

@eyes
Scenario: Lock settings for retake not submit scenario
  Given I create an authorized teacher-associated student named "babby"

  # initially locked for student in summary view

  When I am on "http://studio.code.org/s/allthethings"
  Then I verify the lesson named "Anonymous student survey 2" is locked

  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/1"
  And I wait until element "#level-body" is visible
  Then element "#locked-lesson:contains(lesson is currently locked)" is visible

  # teacher unlocks

  And I sign in as "Teacher_babby"
  And I am on "http://studio.code.org/s/allthethings"
  # Wait until detail view loads
  And I wait until element "span:contains(Lesson 1: Jigsaw)" is visible
  And I open the lesson lock dialog
  And I unlock the lesson for students
  And I wait until element ".modal-backdrop" is gone

  # now unlocked/not tried for student

  When I sign in as "babby"
  And I am on "http://studio.code.org/s/allthethings"
  Then I verify the lesson named "Anonymous student survey 2" is unlocked
  Then I verify progress for lesson 31 level 1 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 2 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 3 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 4 is "not_tried" without waiting

  # student does not submit assessment before teacher switches to locked 

  And I sign in as "Teacher_babby"
  And I am on "http://studio.code.org/s/allthethings"
  # Wait until detail view loads
  And I wait until element "span:contains(Lesson 1: Jigsaw)" is visible
  And I open the lesson lock dialog
  And I lock the lesson for students
  And I wait until element ".modal-backdrop" is gone

  # now locked/not submitted for student

  When I sign in as "babby"
  And I am on "http://studio.code.org/s/allthethings"
  Then I verify the lesson named "Anonymous student survey 2" is locked

  # now teacher allows for retake

  And I sign in as "Teacher_babby"
  And I am on "http://studio.code.org/s/allthethings"
  # Wait until detail view loads
  And I wait until element "span:contains(Lesson 1: Jigsaw)" is visible
  And I open the lesson lock dialog
  And I unlock the lesson for students
  And I wait until element ".modal-backdrop" is gone

  # now editable, and student can submit

  When I sign in as "babby"
  And I am on "http://studio.code.org/s/allthethings"
  Then I verify the lesson named "Anonymous student survey 2" is unlocked
  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/4"
  And I click selector ".submitButton" once I see it
  And I wait to see a dialog titled "Submit your survey"
  And I press "ok-button"
  And I wait until current URL contains "/s/allthethings/lessons/31/levels/1"

  # now locked for student

  When I am on "http://studio.code.org/s/allthethings"
  Then I verify the lesson named "Anonymous student survey 2" is locked

@no_mobile
Scenario: Lock settings for retake after submit scenario
  Given I create an authorized teacher-associated student named "frank"

  # initially locked for student in summary view

  When I am on "http://studio.code.org/s/allthethings"
  And I wait until element ".uitest-summary-progress-row:contains(1. Jigsaw)" is visible
  Then I verify the lesson named "Anonymous student survey 2" is locked

  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/1"
  And I wait until element "#level-body" is visible
  Then element "#locked-lesson:contains(lesson is currently locked)" is visible

  # teacher unlocks

  And I sign in as "Teacher_frank"
  And I am on "http://studio.code.org/s/allthethings"
  # Wait until detail view loads
  And I wait until element "span:contains(Lesson 1: Jigsaw)" is visible
  And I open the lesson lock dialog
  And I unlock the lesson for students
  And I wait until element ".modal-backdrop" is gone

  # student submits

  When I sign in as "frank"
  And I am on "http://studio.code.org/s/allthethings"
  And I wait until element ".uitest-summary-progress-row:contains(1. Jigsaw)" is visible
  Then I verify the lesson named "Anonymous student survey 2" is unlocked
  Then I verify progress for lesson 31 level 1 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 2 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 3 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 4 is "not_tried" without waiting
  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/4"
  And I click selector ".submitButton" once I see it
  And I wait to see a dialog titled "Submit your survey"
  And I press "ok-button"
  And I wait until current URL contains "/s/allthethings/lessons/31/levels/1"

  # now locked for student

  When I am on "http://studio.code.org/s/allthethings"
  And I wait until element ".uitest-summary-progress-row:contains(1. Jigsaw)" is visible
  Then I verify the lesson named "Anonymous student survey 2" is locked

  # now teacher allows for retake

  And I sign in as "Teacher_frank"
  And I am on "http://studio.code.org/s/allthethings"
  # Wait until detail view loads
  And I wait until element "span:contains(Lesson 1: Jigsaw)" is visible
  And I open the lesson lock dialog
  And I unlock the lesson for students
  And I wait until element ".modal-backdrop" is gone

  # now editable, and student can see unsubmit button

  When I sign in as "frank"
  And I am on "http://studio.code.org/s/allthethings"
  And I wait until element ".uitest-summary-progress-row:contains(1. Jigsaw)" is visible
  Then I verify the lesson named "Anonymous student survey 2" is unlocked
  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/4"
  Then element ".unsubmitButton" is visible
