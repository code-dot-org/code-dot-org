@no_circle
@no_mobile

Feature: Using the YourSchool census page

  Scenario: Loading yourschool and fill out form
    Given I am on "http://code.org/yourschool?noautoplay=true"
    Then I see "#map"
    And I see "#census-form"
    Then I press "#schoolNotFoundCheckbox" using jQuery
    Then I wait until element "#school_name" is visible
    And I select the "Washington" option in dropdown "school_state"
    And I press keys "A school name" for element "#school_name"
    And I press keys "Seattle" for element "#school_city"
    And I scroll to "#school_zipcode"
    And I press keys "98111" for element "#school_zipcode"
    And I select the "Other" option in dropdown "school_type"
    And I select the "Some" option in dropdown named "how_many_do_hoc"
    And I select the "Some" option in dropdown named "how_many_after_school"
    And I select the "Some" option in dropdown named "how_many_10_hours"
    And I select the "Some" option in dropdown named "how_many_20_hours"
    And I select the "Other" option in dropdown named "submitter_role"
    And I press "input[name='topic_blocks']" using jQuery
    And I select the "3+ hours per week" option in dropdown named "class_frequency"
    And I scroll to "input[name='submitter_email_address']"
    And I press keys "me@me.me" for element "input[name='submitter_email_address']"
    And I select the "No" option in dropdown named "share_with_regional_partners"
    And I select the "No" option in dropdown named "opt_in"
    Then I press "#submit-button" using jQuery
    Then I wait until I am on "http://code.org/yourschool/thankyou"

  @no_circle
  Scenario: Use census map to select school
    Given I am on "http://code.org/yourschool"
    Then I see "#map"
    And I see "#census-form"

    # Close the language popup if it is there so it won't get in the way.
    Then I click selector "button.close" if it exists

    # Choose school from the map school dropdown
    Then I scroll the "#map input" element into view
    Then I press keys "ALBERT EINSTEIN ACADEMY ELEMENTARY" for element "#map input"
    Then I wait until element ".VirtualizedSelectOption:contains('Albert Einstein Academy Elementary - Santa Clarita, CA 91355')" is visible
    Then I press ".VirtualizedSelectOption:contains('Albert Einstein Academy Elementary - Santa Clarita, CA 91355')" using jQuery

    # Verify that the correct school id is set in the census form
    Then element "#form input[name='nces_school_s']" has value "60000113717"
