Feature: Oceans ML HoC

  Scenario: Fish vs. Trash
    # Training Screen
    Given I am on "http://studio.code.org/s/oceans/stage/1/puzzle/2?guide=off"
    And I wait until element "button:contains(Fish)" is visible
    Then I click selector "button:contains(Fish)" 3 times
    Then I click selector "button:contains(Not Fish)" 3 times
    Then I click selector "button:contains(Continue)" once I see it

    # Sorting Screen
    Then I click selector "button:contains(Run)" once I see it
    Then I click selector "button:contains(Continue)" once I see it

    # Pond Screen
    And I wait until element "button:contains(Continue)" is visible
    And I wait for 3 seconds

  Scenario: Sea Creatures
    # Initial Screen
    Given I am on "http://studio.code.org/s/oceans/stage/1/puzzle/3?guide=off"
    Then I click selector "button:contains(Run)" once I see it
    And I wait until element "button:contains(Continue)" is visible
    And I wait for 2 seconds

    # Training Screen
    Given I am on "http://studio.code.org/s/oceans/stage/1/puzzle/4?guide=off"
    And I wait until element "button:contains(Yes)" is visible
    Then I click selector "button:contains(Yes)" 3 times
    Then I click selector "button:contains(No)" 3 times
    Then I click selector "button:contains(Continue)" once I see it

    # Sorting Screen
    Then I click selector "button:contains(Run)" once I see it
    Then I click selector "button:contains(Continue)" once I see it

    # Pond Screen
    And I wait until element "button:contains(Continue)" is visible
    And I wait for 3 seconds

  Scenario: Short Word List
    # Training Screen
    Given I am on "http://studio.code.org/s/oceans/stage/1/puzzle/6?guide=off"
    Then I click selector "button:contains(Blue)" once I see it
    And I wait until element "button:contains(Blue)" is visible
    Then I click selector "button:contains(Blue)" 3 times
    Then I click selector "button:contains(Not Blue)" 3 times
    Then I click selector "button:contains(Continue)" once I see it

    # Sorting Screen
    Then I click selector "button:contains(Run)" once I see it
    Then I click selector "button:contains(Continue)" once I see it

    # Pond Screen
    And I wait until element "button:contains(Continue)" is visible
    And I wait for 3 seconds

  Scenario: Long Word List
    # Training Screen
    Given I am on "http://studio.code.org/s/oceans/stage/1/puzzle/8?guide=off"
    Then I click selector "button:contains(Fierce)" once I see it
    And I wait until element "button:contains(Fierce)" is visible
    Then I click selector "button:contains(Fierce)" 3 times
    Then I click selector "button:contains(Not Fierce)" 3 times
    Then I click selector "button:contains(Continue)" once I see it

    # Sorting Screen
    Then I click selector "button:contains(Run)" once I see it
    Then I click selector "button:contains(Continue)" once I see it

    # Pond Screen
    And I wait until element "button:contains(Finish)" is visible
    And I wait for 3 seconds
