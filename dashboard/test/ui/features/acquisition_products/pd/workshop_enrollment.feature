@dashboard_db_access
Feature: Workshop Enrollment

Scenario: Enrolling in a new workshop with school info US nces school
  Given I am a teacher enrolling in "CS Principles"
  And I wait until element "#uitest-country-dropdown" is visible
  And I select the "United States" option in dropdown "uitest-country-dropdown"
  And I wait until element "#uitest-school-zip" is visible
  And I press keys "31513" for element "#uitest-school-zip"
  And I wait until element "#uitest-school-dropdown" is visible
  And I select the "Appling County High School" option in dropdown "uitest-school-dropdown"
  And I click "button#submit"
  And I wait until current URL contains "my-professional-learning"

  # test clean up
  And I delete the workshop

Scenario: Enrolling in a new workshop with school info unknown school
  Given I am a teacher enrolling in "CS Principles"
  And I wait until element "#uitest-country-dropdown" is visible
  And I select the "United States" option in dropdown "uitest-country-dropdown"
  And I wait until element "#uitest-school-zip" is visible
  And I press keys "31513" for element "#uitest-school-zip"
  And I wait until element "#uitest-school-dropdown" is visible
  And I select the "Not listed here - add my school" option in dropdown "uitest-school-dropdown"
  And I wait until element "#uitest-school-name" is visible
  And I press keys "New School" for element "#uitest-school-name"
  And I click "button#submit"
  And I wait until current URL contains "my-professional-learning"

  # test clean up
  And I delete the workshop

Scenario: Enrolling in a new workshop with school info no school setting
  Given I am a teacher enrolling in "CS Principles"
  And I wait until element "#uitest-country-dropdown" is visible
  And I select the "United States" option in dropdown "uitest-country-dropdown"
  And I wait until element "#uitest-school-zip" is visible
  And I press keys "31513" for element "#uitest-school-zip"
  And I wait until element "#uitest-school-dropdown" is visible
  And I select the "I don't teach CS in a school setting" option in dropdown "uitest-school-dropdown"
  And I click "button#submit"
  And I wait until current URL contains "my-professional-learning"

  # test clean up
  And I delete the workshop

Scenario: Enrolling in a new workshop with school info non-US school
  Given I am a teacher enrolling in "CS Principles"
  And I wait until element "#uitest-country-dropdown" is visible
  And I select the "Canada" option in dropdown "uitest-country-dropdown"
  And I wait until element "#uitest-school-name" is visible
  And I press keys "New School" for element "#uitest-school-name"
  And I click "button#submit"
  And I wait until current URL contains "my-professional-learning"

  # test clean up
  And I delete the workshop

Scenario: Enrolling in a new workshop with invalid school info
  Given I am a teacher enrolling in "CS Principles"
  And I wait until element "#uitest-country-dropdown" is visible
  And I click "button#submit"
  And I wait until element "span:contains('School information is required')" is visible

  # test clean up
  And I delete the workshop


