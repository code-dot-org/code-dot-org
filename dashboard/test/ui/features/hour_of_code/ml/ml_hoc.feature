Feature: Oceans ML HoC

  @no_circle @no_mobile @no_safari
  Scenario: Fish vs. Trash
    # Training Screen
    Given I am on "http://studio.code.org/s/oceans/lessons/1/levels/2?guide=off"
    And I wait until element "button:contains(Fish):eq(1)" is visible
    Then I click selector "button:contains(Fish):eq(1)" 5 times
    Then I click selector "button:contains(Not Fish)" 5 times
    Then I click selector "button:contains(Continue)" once I see it

    # Sorting Screen
    Then I click selector "button:contains(Run)" once I see it
    Then I click selector "button:contains(Continue)" once I see it

    # Pond Screen
    And I wait until element "button:contains(Continue)" is visible
    And I wait for 3 seconds

  @no_circle @no_mobile @no_safari
  Scenario: Sea Creatures
    # Initial Screen
    Given I am on "http://studio.code.org/s/oceans/lessons/1/levels/3?guide=off"
    Then I click selector "button:contains(Run)" once I see it
    And I wait until element "button:contains(Continue)" is visible
    And I wait for 2 seconds

    # Training Screen
    Given I am on "http://studio.code.org/s/oceans/lessons/1/levels/4?guide=off"
    And I wait until element "button:contains(Yes)" is visible
    Then I click selector "button:contains(Yes)" 5 times
    Then I click selector "button:contains(No)" 5 times
    Then I click selector "button:contains(Continue)" once I see it

    # Sorting Screen
    Then I click selector "button:contains(Run)" once I see it
    Then I click selector "button:contains(Continue)" once I see it

    # Pond Screen
    And I wait until element "button:contains(Continue)" is visible
    And I wait for 3 seconds

  @no_circle @no_mobile @no_safari
  Scenario: Short Word List
    # Training Screen
    Given I am on "http://studio.code.org/s/oceans/lessons/1/levels/6?guide=off"
    Then I click selector "button:contains(Blue)" once I see it
    And I wait until element "button:contains(Blue):eq(1)" is visible
    Then I click selector "button:contains(Blue):eq(1)" 5 times
    Then I click selector "button:contains(Not Blue)" 5 times
    Then I click selector "button:contains(Continue)" once I see it

    # Sorting Screen
    Then I click selector "button:contains(Run)" once I see it
    Then I click selector "button:contains(Continue)" once I see it

    # Pond Screen
    And I wait until element "button:contains(Continue)" is visible
    And I wait for 3 seconds

  @no_circle @no_mobile @no_safari
  Scenario: Long Word List
    # Training Screen
    Given I am on "http://studio.code.org/s/oceans/lessons/1/levels/8?guide=off"
    Then I click selector "button:contains(Fierce)" once I see it
    And I wait until element "button:contains(Fierce):eq(1)" is visible
    Then I click selector "button:contains(Fierce):eq(1)" 5 times
    Then I click selector "button:contains(Not Fierce)" 5 times
    Then I click selector "button:contains(Continue)" once I see it

    # Sorting Screen
    Then I click selector "button:contains(Run)" once I see it
    Then I click selector "button:contains(Continue)" once I see it

    # Pond Screen
    And I wait until element "button:contains(Finish)" is visible
    And I wait for 3 seconds
