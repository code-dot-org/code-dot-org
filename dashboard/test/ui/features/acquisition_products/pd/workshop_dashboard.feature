@dashboard_db_access
@eyes
Feature: Workshop Dashboard

@skip
Scenario: New workshop: BYOW
  Given I am a program manager named "Test BYO PM" for regional partner "Test Partner"
  Given there is a facilitator named "Test BYO Facilitator 1" for course "Build Your Own Workshop"
  Given there is a facilitator named "Test BYO Facilitator 2" for course "Build Your Own Workshop"
  Then I open the new workshop form
  Then I open my eyes to test "New workshop: BYOW"

  And I press keys "Cool new workshop" for element "input[name='name']"
  And I click selector "#grades-dropdown-button"
  And I wait until element "input[name='K']" is visible
  And I click selector "input[name='K']"
  And I select the "Has prerequisites" option in dropdown named "hasPrereq"
  And I wait until element "input[name='prereq']" is visible
  And I press keys "Must be awesome" for element "input[name='prereq']"
  And I press keys "123" for element "input[name='capacity']"
  And I press keys "This is a great workshop" for element "textarea[name='description']"
  And I click selector "#courseOfferings-dropdown-button"
  And I wait until element "label:contains('ui-test-self-paced-pl')" is visible
  And I click selector "label:contains('ui-test-self-paced-pl')"
  And I press keys "01012025" for element "input[name='date']"
  And I select the "9:00am" option in dropdown named "start"
  And I select the "2:00pm" option in dropdown named "end"
  And I press keys "The auditorium" for element "input[name='locationName']"
  And I press keys "123 Main St" for element "input[name='locationAddress']"
  And I click selector "button:contains('Add Date')"
  And I select the "Virtual" option in the last dropdown named "format"
  And I press keys "example.com" for element "input[name='meetingLink']"
  And I wait until the dropdown named "regionalPartnerId" has option "Test Partner"
  And I select the "Test Partner" option in dropdown named "regionalPartnerId"
  And I press keys "Test BYO Facilitator 1\n" for element "#multiselect"
  And I press keys "Test BYO Facilitator 2\n" for element "#multiselect"
  And I click selector "label:contains('3 and 10-days prior to start date')"
  And I press keys "$100" for element "input[name='fee']"
  And I select the "National" option in dropdown named "participantGroupType"
  And I press keys "Get ready to learn!" for element "textarea[name='notes']"
  And I press keys "register.org" for element "input[name='registrationLink']"
  And I click selector "label:contains('Hide this workshop from the public workshop catalog')"

  And I see no difference for "new workshop details: BYO"

  And I click selector "button:contains('Publish')"
  And I wait until element "span:contains('Workshop Information: ')" is visible

  And I see no difference for "created workshop details: BYO"
  And I close my eyes

  And I get the workshop id from the current url
  And I clean up my records
