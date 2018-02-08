Feature: Using the YourSchool census page

  Scenario: Loading yourschool and fill out form
    Given I am on "http://code.org/yourschool"
    Then I see "#map"
    And I see "#census-form"
    Then I press "#schoolNotFoundCheckbox" using jQuery
    Then I wait until element "#school_name" is visible
    And I select the "Washington" option in dropdown "school_state"
    And I press keys "A school name" for element "#school_name"
    And I press keys "Seattle" for element "#school_city"
    And I press keys "98111" for element "#school_zipcode"
    And I select the "Other" option in dropdown "school_type"
    And I press the first "select[name='how_many_do_hoc'] option[value='SOME']" element
    And I press the first "select[name='how_many_after_school'] option[value='SOME']" element
    And I press the first "select[name='how_many_10_hours'] option[value='SOME']" element
    And I press the first "select[name='how_many_20_hours'] option[value='SOME']" element
    And I press the first "select[name='submitter_role'] option[value='OTHER']" element
    And I press "input[name='topic_blocks']" using jQuery
    And I press the first "select[name='class_frequency'] option[value='THREE PLUS HOURS PER WEEK']" element
    And I press keys "me@me.me" for element "input[name='submitter_email_address']"
    And I press the first "select[name='share_with_regional_partners'] option[value='false']" element
    Then I press "#submit-button" using jQuery
    Then I wait until I am on "http://code.org/yourschool/thankyou"