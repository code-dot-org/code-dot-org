Feature: Professional Learning landing page

  Scenario: New teacher without PL history sees relevant content sections
    Given I create a teacher named "New Teacher"
    And I sign in as "New Teacher" and go home
    Then I am on "http://studio.code.org/my-professional-learning"

    # Sees Getting Started banner
    And I wait until element "a:contains(Learn about professional learning)" is visible
    And the href of selector "a:contains(Learn about professional learning)" contains "/educate/professional-learning"

    # Sees Joined Professional Learning Sections section
    And element "button.ui-test-join-section" is visible

    # Sees Recommended for you section
    And element "a:contains(Learn more about workshops)" is visible
    And the href of selector "a:contains(Learn more about workshops)" contains "/professional-learning/middle-high"
    And element "a:contains(Start professional learning courses)" is visible
    And the href of selector "a:contains(Start professional learning courses)" contains "/educate/professional-development-online"
