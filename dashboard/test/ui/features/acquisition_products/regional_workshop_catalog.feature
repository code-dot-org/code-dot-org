@no_mobile
Feature: Regional Workshop Catalog page

  Scenario: Entering a zip with no matches shows No Workshops Found view
    Given I create a teacher named "New Teacher"
    And I sign in as "New Teacher" and go home
    Then I am on "http://studio.code.org/professional-learning/workshops"

    # Sees default view
    And I wait until element "h1:contains(Find Code.org workshops near you)" is visible
    And I wait until element "h2:contains(Enter zip code to see workshops)" is visible

    # Enter zip with no match and no workshops
    Then I press keys "99999" for element "input[name='zipSearch']"
    Then I click selector "span:contains(Submit)"
    And I wait until element "p:contains(No regional partner found)" is visible
    And I wait until element "h2:contains(No workshops found)" is visible

  Scenario: Entering a zip with a regional partner match allows user to see more info about and contact them
    Given I have a regional partner named "Reggie Partner" in the zip code "12345"
    And I create a workshop under the regional partner named "Reggie Partner"

    And I create a teacher named "New Teacher"
    And I sign in as "New Teacher" and go home
    Then I am on "http://studio.code.org/professional-learning/workshops"

    # Sees default view
    And I wait until element "h1:contains(Find Code.org workshops near you)" is visible
    And I wait until element "h2:contains(Enter zip code to see workshops)" is visible

    # Enter zip with regional partner match
    Then I press keys "12345" for element "input[name='zipSearch']"
    Then I click selector "span:contains(Submit)"
    And I wait until element "p:contains(Reggie Partner)" is visible
    And I wait until element "h2:contains(Upcoming local workshops)" is visible
    
    # View the Partner info modal
    Then I click selector "button:contains('Partner info')"
    And I wait until element "button:contains('Return to workshops')" is visible
    Then I click selector "button:contains('Return to workshops')"

    # Contact button sends user to RP contact form
    And I wait until element "#rpContactLink" is visible
    And the href of selector "#rpContactLink" contains "/professional-learning/contact-regional-partner?zip=12345"

  Scenario: Entering a zip with a regional partner match shows user the available workshops
    Given I have a regional partner named "Reggie Partner" in the zip code "12345"
    And I create a workshop under the regional partner named "Reggie Partner"

    And I create a teacher named "New Teacher"
    And I sign in as "New Teacher" and go home
    Then I am on "http://studio.code.org/professional-learning/workshops"

    # Sees default view
    And I wait until element "h1:contains(Find Code.org workshops near you)" is visible
    And I wait until element "h2:contains(Enter zip code to see workshops)" is visible

    # Enter zip with regional partner match
    Then I press keys "12345" for element "input[name='zipSearch']"
    Then I click selector "span:contains(Submit)"
    And I wait until element "p:contains(Reggie Partner)" is visible
    And I wait until element "h2:contains(Upcoming local workshops)" is visible

  Scenario: If sent to this page with a zip code url param the page obtains the regional partner and relevant workshops
    Given I have a regional partner named "Reggie Partner" in the zip code "12345"
    And I create a workshop under the regional partner named "Reggie Partner"

    And I create a teacher named "New Teacher"
    And I sign in as "New Teacher" and go home
    Then I am on "http://studio.code.org/professional-learning/workshops?zip=12345"

    # Shows regional partner associated with the given zip
    And I wait until element "p:contains(Reggie Partner)" is visible
    And I wait until element "h2:contains(Upcoming local workshops)" is visible
