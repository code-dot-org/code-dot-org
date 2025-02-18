@no_mobile
Feature: Lesson Locking

@eyes
Scenario: Stage Locking Dialog
  Given I create an authorized teacher-associated student named "bobby"
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

Scenario: Readonly view does not show teacher only boxes
  Given I create an authorized teacher-associated student named "bobby"

  # teacher marks readonly
  And I sign in as "Teacher_bobby"
  And I am on "http://studio.code.org/s/allthethings"
  # Wait until detail view loads
  And I wait until element "span:contains(Lesson 1: Jigsaw)" is visible
  And I open the lesson lock dialog for lockable lesson 3
  # need to open lesson lock dialog for right lesson
  And I show lesson answers for students
  And I wait until element ".modal-backdrop" is gone

  # now unlocked/submitted for student

  When I sign in as "bobby"
  And I am on "http://studio.code.org/s/allthethings"
  Then I verify the lesson named "Example CSP Assessment" is unlocked
  Then I verify progress for lesson 47 level 1 is "not_tried" without waiting
  Then I verify progress for lesson 47 level 2 is "not_tried" without waiting
  Then I verify progress for lesson 47 level 3 is "not_tried" without waiting

  When I am on "http://studio.code.org/s/allthethings/lockable/3/levels/1/page/3"
  And I wait until element "h2:contains(CS Principles Unit 1 Assessment)" is visible
  Then element "h3:contains(Answer)" is visible
  Then element "h3:contains(For Teacher Only)" is not visible
  Then element ".previousPageButton" is visible

Scenario: Lock settings for students in survey
  Given I create an authorized teacher-associated student named "bobby"

  # initially locked for student in summary view

  When I am on "http://studio.code.org/s/allthethings"
  Then I verify the lesson named "Anonymous student survey 2" is locked

  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/1"
  And I wait until element "#level-body" is visible
  Then element "#locked-lesson:contains(lesson is currently locked)" is visible

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
  Then I verify the lesson named "Anonymous student survey 2" is unlocked
  Then I verify progress for lesson 31 level 1 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 2 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 3 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 4 is "not_tried" without waiting

  # student submits

  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/4"
  And I click selector ".submitButton" once I see it
  And I wait to see a dialog titled "Submit your survey"
  And I press "ok-button"
  And I wait until current URL contains "/s/allthethings/lessons/31/levels/1"

  # now locked for student

  When I am on "http://studio.code.org/s/allthethings"
  Then I verify the lesson named "Anonymous student survey 2" is locked

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
  Then I verify the lesson named "Anonymous student survey 2" is unlocked
  Then I verify progress for lesson 31 level 1 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 2 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 3 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 4 is "not_tried" without waiting

  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/4"
  And I wait until element "h2:contains(Pre-survey)" is visible
  Then element "h3:contains(Answer)" is visible
  Then element ".previousPageButton" is visible

Scenario: Lock settings for students who never submit
  Given I create an authorized teacher-associated student named "billy"

  # initially locked for student in summary view

  When I am on "http://studio.code.org/s/allthethings"
  Then I verify the lesson named "Anonymous student survey 2" is locked

  When I am on "http://studio.code.org/s/allthethings/lockable/1/levels/1/page/1"
  And I wait until element "#level-body" is visible
  Then element "#locked-lesson:contains(lesson is currently locked)" is visible

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
  Then I verify the lesson named "Anonymous student survey 2" is unlocked
  Then I verify progress for lesson 31 level 1 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 2 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 3 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 4 is "not_tried" without waiting

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
  Then I verify the lesson named "Anonymous student survey 2" is unlocked
  Then I verify progress for lesson 31 level 1 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 2 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 3 is "not_tried" without waiting
  Then I verify progress for lesson 31 level 4 is "not_tried" without waiting
