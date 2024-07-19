@no_mobile
Feature: Professional Learning landing page

  @eyes
  Scenario: New teacher without PL history sees relevant content sections
    Given I create a teacher named "New Teacher"
    And I sign in as "New Teacher" and go home
    Then I am on "http://studio.code.org/my-professional-learning"
    And I open my eyes to test "New teacher Professional Learning page"

    # Sees Getting Started banner
    And I wait until element "a:contains(Learn about professional learning)" is visible
    And the href of selector "a:contains(Learn about professional learning)" contains "/educate/professional-learning"
    And I see no difference for "PL Getting Started banner"

    # Sees Joined Professional Learning Sections section
    And element "button.ui-test-join-section" is visible
    And I see no difference for "Joined PL Sections section"

    # Sees Recommended for you section
    And element "a:contains(Learn more about workshops)" is visible
    And the href of selector "a:contains(Learn more about workshops)" contains "/professional-learning/middle-high"
    And element "a:contains(Start professional learning courses)" is visible
    And the href of selector "a:contains(Start professional learning courses)" contains "/educate/professional-development-online"
    And I see no difference for "PL Recommended for you section"
    And I close my eyes

  @eyes
  Scenario: Facilitator sees relevant content sections
    Given I am a facilitator with started and completed courses
    And I am on "http://studio.code.org/my-professional-learning"
    And I open my eyes to test "Facilitator Professional Learning page"

    # Go to the right My PL page tab
    And I wait until element "button:contains(Facilitator Center)" is visible
    Then I click selector "button:contains(Facilitator Center)"
    And I see no difference for "Facilitator Center tab"

    # Sees Facilitator Resources section
    And I wait until element "a:contains(View workshop dashboard)" is visible
    And the href of selector "a:contains(View workshop dashboard)" contains "/pd/workshop_dashboard"
    And I wait until element "a:contains(View CSF Facilitator Landing page)" is visible
    And the href of selector "a:contains(View CSF Facilitator Landing page)" contains "/educate/facilitator-landing/CSF"
    And I see no difference for "Facilitator Resources section"

    # Sees Workshops table
    And I wait until element "button:contains(Workshop Details)" is visible
    And I see no difference for "Facilitator workshops table"
    And I close my eyes

  Scenario: Universal Instructor sees relevant content sections
    Given I create a teacher named "PL Instructor"
    And I sign in as "PL Instructor" and go home
    And I get universal instructor access
    And I reload the page
    Then I am on "http://studio.code.org/my-professional-learning"

    # Go to the right My PL page tab
    And I wait until element "button:contains(Instructor Center)" is visible
    Then I click selector "button:contains(Instructor Center)"

    # Sees Instructor Professional Learning Sections section
    And I wait until element "button:contains(Create a section)" is visible

  @skip
  Scenario: Regional Partner sees relevant content sections
    Given I am a program manager with started and completed courses
    And I am on "http://studio.code.org/my-professional-learning"

    # Go to the right My PL page tab
    And I wait until element "button:contains(Regional Partner)" is visible
    Then I click selector "button:contains(Regional Partner)"

    # Sees Regional Partner Resources section
    And I wait until element "a:contains(Manage applications)" is visible
    And the href of selector "a:contains(Manage applications)" contains "/pd/application_dashboard"
    And element "a:contains(View workshop dashboard)" is visible
    And the href of selector "a:contains(View workshop dashboard)" contains "/pd/workshop_dashboard"
    And element "a:contains(View playbook)" is visible
    And the href of selector "a:contains(View playbook)" contains "/educate/regional-partner/playbook"

    # Sees Workshops table
    And I wait until element "button:contains(Workshop Details)" is visible

  Scenario: Workshop Organizer sees relevant content sections
    Given I am an organizer with started and completed courses
    And I am on "http://studio.code.org/my-professional-learning"

    # Go to the right My PL page tab
    And I wait until element "button:contains(Workshop Organizer)" is visible
    Then I click selector "button:contains(Workshop Organizer)"

    # Sees Workshop Organizer Resources section
    And I wait until element "a:contains(View workshop dashboard)" is visible
    And the href of selector "a:contains(View workshop dashboard)" contains "/pd/workshop_dashboard"

    # Sees Workshops table
    And I wait until element "button:contains(Workshop Details)" is visible

  Scenario: Teacher with Self-paced PL courses sees relevant content sections
    Given I create a teacher named "Self-paced Teacher"
    And I sign in as "Self-paced Teacher" and go home
    Then I am on "http://studio.code.org/my-professional-learning"

    # Sees Joined Professional Learning Sections section
    And element "button.ui-test-join-section" is visible

    # Sees Recommended for you section
    And element "a:contains(Learn more about workshops)" is visible
    And the href of selector "a:contains(Learn more about workshops)" contains "/professional-learning/middle-high"
    And element "a:contains(Start professional learning courses)" is visible
    And the href of selector "a:contains(Start professional learning courses)" contains "/educate/professional-development-online"

    # Starts a self-paced PL course
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/1"
    And I wait until element "a[aria-label='Level 3 Lesson Instructor In Training Levels']" is visible
    Then I click selector "a[aria-label='Level 3 Lesson Instructor In Training Levels']"
    Then I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/3"
    And I wait until element "a:contains(Submit)" is visible
    Then I click selector "a:contains(Submit)"
    Then I wait until I am on "http://studio.code.org/s/alltheselfpacedplthings/lessons/1/levels/4"
    And I wait until element "a:contains(Submit)" is visible
    Then I am on "http://studio.code.org/my-professional-learning"

    # Sees Self-Paced Professional Learning Courses table
    And I wait until element "a:contains(Continue course)" is visible
