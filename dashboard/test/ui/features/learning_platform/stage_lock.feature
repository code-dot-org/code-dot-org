Feature: Stage Locking

Background:
  Given I create an authorized teacher-associated student named "bobby"
  Given I create an authorized teacher-associated student named "billy"
  Given I create an authorized teacher-associated student named "babby"
  Given I create an authorized teacher-associated student named "frank"

@eyes
Scenario: Stage Locking Dialog
  When I open my eyes to test "stage locking"
  Then I sign in as "Teacher_bobby"
  Then I am on "http://studio.code.org/s/allthethings"
  And I see no difference for "selected section"
  Then I open the lesson lock dialog
  And I see no difference for "stage lock dialog"
  Then I unlock the lesson for students
  And I wait until element ".modal-backdrop" is gone
  And I scroll our lockable lesson into view
  And I see no difference for "course overview for authorized teacher"
  And I close my eyes

Scenario: Lock settings for students
  # initially locked for student in summary view

  When I am on "http://studio.code.org/s/allthethings"
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  Then element "td:contains(Anonymous student survey 2) .fa-lock" is visible

  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/1"
  And I wait until element "#level-body" is visible
  Then element "#locked-stage:contains(stage is currently locked)" is visible

  # teacher unlocks

  And I sign in as "Teacher_bobby"
  And I am on "http://studio.code.org/s/allthethings"
  # Wait until detail view loads
  And I wait until element "span:contains(Lesson 1: Jigsaw)" is visible
  And I open the lesson lock dialog
  And I unlock the lesson for students
  And I wait until element ".modal-backdrop" is gone

  # now unlocked/not tried for student

  When I sign in as "bobby"
  And I am on "http://studio.code.org/s/allthethings"
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  And I wait until jQuery Ajax requests are finished
  Then element "td:contains(Anonymous student survey 2) .fa-unlock" is visible
  Then I verify progress for lesson 31 level 1 is "not_tried"
  Then I verify progress for lesson 31 level 2 is "not_tried"
  Then I verify progress for lesson 31 level 3 is "not_tried"
  Then I verify progress for lesson 31 level 4 is "not_tried"

  # student submits

  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/4"
  And I click selector ".submitButton" once I see it
  And I wait to see a dialog titled "Submit your survey"
  And I press "ok-button"
  And I wait until current URL contains "/s/allthethings/lessons/31/levels/1"

  # now locked for student

  When I am on "http://studio.code.org/s/allthethings"
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  And I wait until jQuery Ajax requests are finished
  Then element "td:contains(Anonymous student survey 2) .fa-lock" is visible

  # teacher marks readonly

  And I sign in as "Teacher_bobby"
  And I am on "http://studio.code.org/s/allthethings"
  # Wait until detail view loads
  And I wait until element "span:contains(Lesson 1: Jigsaw)" is visible
  And I open the lesson lock dialog
  And I show lesson answers for students
  And I wait until element ".modal-backdrop" is gone

  # now unlocked/submitted for student

  When I sign in as "bobby"
  And I am on "http://studio.code.org/s/allthethings"
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  And I wait until jQuery Ajax requests are finished
  Then element "td:contains(Anonymous student survey 2) .fa-unlock" is visible
  Then I verify progress for lesson 31 level 1 is "not_tried"
  Then I verify progress for lesson 31 level 2 is "not_tried"
  Then I verify progress for lesson 31 level 3 is "not_tried"
  Then I verify progress for lesson 31 level 4 is "not_tried"

  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/4"
  And I wait until element "h2:contains(Pre-survey)" is visible
  Then element "h3:contains(Answer)" is visible
  Then element ".previousPageButton" is visible
  # in the future we will want the unsubmit button to be hidden instead.
  Then element ".unsubmitButton" is visible

Scenario: Lock settings for students who never submit
  # initially locked for student in summary view

  When I am on "http://studio.code.org/s/allthethings"
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  And I wait until jQuery Ajax requests are finished
  Then element "td:contains(Anonymous student survey 2) .fa-lock" is visible

  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/1"
  And I wait until element "#level-body" is visible
  Then element "#locked-stage:contains(stage is currently locked)" is visible

  # teacher unlocks

  And I sign in as "Teacher_billy"
  And I am on "http://studio.code.org/s/allthethings"
  # Wait until detail view loads
  And I wait until element "span:contains(Lesson 1: Jigsaw)" is visible
  And I open the lesson lock dialog
  And I unlock the lesson for students
  And I wait until element ".modal-backdrop" is gone

  # now unlocked/not tried for student

  When I sign in as "billy"
  And I am on "http://studio.code.org/s/allthethings"
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  And I wait until jQuery Ajax requests are finished
  Then element "td:contains(Anonymous student survey 2) .fa-unlock" is visible
  Then I verify progress for lesson 31 level 1 is "not_tried"
  Then I verify progress for lesson 31 level 2 is "not_tried"
  Then I verify progress for lesson 31 level 3 is "not_tried"
  Then I verify progress for lesson 31 level 4 is "not_tried"

  # student does not submit assessment before teacher switches to readonly 

  And I sign in as "Teacher_billy"
  And I am on "http://studio.code.org/s/allthethings"
  # Wait until detail view loads
  And I wait until element "span:contains(Lesson 1: Jigsaw)" is visible
  And I open the lesson lock dialog
  And I show lesson answers for students
  And I wait until element ".modal-backdrop" is gone

  # now unlocked/not submitted for student

  When I sign in as "billy"
  And I am on "http://studio.code.org/s/allthethings"
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  And I wait until jQuery Ajax requests are finished
  Then element "td:contains(Anonymous student survey 2) .fa-unlock" is visible
  Then I verify progress for lesson 31 level 1 is "not_tried"
  Then I verify progress for lesson 31 level 2 is "not_tried"
  Then I verify progress for lesson 31 level 3 is "not_tried"
  Then I verify progress for lesson 31 level 4 is "not_tried"

Scenario: Lock settings for retake not submit scenario
  # initially locked for student in summary view

  When I am on "http://studio.code.org/s/allthethings"
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  And I wait until jQuery Ajax requests are finished
  Then element "td:contains(Anonymous student survey 2) .fa-lock" is visible

  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/1"
  And I wait until element "#level-body" is visible
  Then element "#locked-stage:contains(stage is currently locked)" is visible

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
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  And I wait until jQuery Ajax requests are finished
  Then element "td:contains(Anonymous student survey 2) .fa-unlock" is visible
  Then I verify progress for lesson 31 level 1 is "not_tried"
  Then I verify progress for lesson 31 level 2 is "not_tried"
  Then I verify progress for lesson 31 level 3 is "not_tried"
  Then I verify progress for lesson 31 level 4 is "not_tried"

  # student does not submit assessment before teacher switches to locked 

  And I sign in as "Teacher_babby"
  And I am on "http://studio.code.org/s/allthethings"
  # Wait until detail view loads
  And I wait until element "span:contains(Lesson 1: Jigsaw)" is visible
  And I open the lesson lock dialog
  And
  And I wait until element ".modal-backdrop" is gone

  # now locked/not submitted for student

  When I sign in as "babby"
  And I am on "http://studio.code.org/s/allthethings"
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  And I wait until jQuery Ajax requests are finished
  Then element "td:contains(Anonymous student survey 2) .fa-lock" is visible

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
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  And I wait until jQuery Ajax requests are finished
  Then element "td:contains(Anonymous student survey 2) .fa-unlock" is visible
  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/4"
  And I click selector ".submitButton" once I see it
  And I wait to see a dialog titled "Submit your survey"
  And I press "ok-button"
  And I wait until current URL contains "/s/allthethings/lessons/31/levels/1"

  # now locked for student

  When I am on "http://studio.code.org/s/allthethings"
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  And I wait until jQuery Ajax requests are finished
  Then element "td:contains(Anonymous student survey 2) .fa-lock" is visible

Scenario: Lock settings for retake after submit scenario
  # initially locked for student in summary view

  When I am on "http://studio.code.org/s/allthethings"
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  And I wait until jQuery Ajax requests are finished
  Then element "td:contains(Anonymous student survey 2) .fa-lock" is visible

  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/1"
  And I wait until element "#level-body" is visible
  Then element "#locked-stage:contains(stage is currently locked)" is visible

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
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  And I wait until jQuery Ajax requests are finished
  Then element "td:contains(Anonymous student survey 2) .fa-unlock" is visible
  Then I verify progress for lesson 31 level 1 is "not_tried"
  Then I verify progress for lesson 31 level 2 is "not_tried"
  Then I verify progress for lesson 31 level 3 is "not_tried"
  Then I verify progress for lesson 31 level 4 is "not_tried"
  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/4"
  And I click selector ".submitButton" once I see it
  And I wait to see a dialog titled "Submit your survey"
  And I press "ok-button"
  And I wait until current URL contains "/s/allthethings/lessons/31/levels/1"

  # now locked for student

  When I am on "http://studio.code.org/s/allthethings"
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  And I wait until jQuery Ajax requests are finished
  Then element "td:contains(Anonymous student survey 2) .fa-lock" is visible

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
  And I wait until element "td:contains(Anonymous student survey 2)" is visible
  And I wait until jQuery Ajax requests are finished
  Then element "td:contains(Anonymous student survey 2) .fa-unlock" is visible
  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/4"
  Then element ".unsubmitButton" is visible
