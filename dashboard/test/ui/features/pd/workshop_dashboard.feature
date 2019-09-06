@dashboard_db_access
@eyes


Feature: Workshop Dashboard

# Skip due to flaky test
@skip
Scenario: New workshop: CSF intro
  Given I am a CSF facilitator named "Test CSF Facilitator" for regional partner "Test Partner"
  Then I open the new workshop form
  Then I open my eyes to test "New workshop: CSF intro"

  And I press keys "Code.org Office" for element "input#location_name"
  And I press keys "Seattle, WA" for element "input#location_address"
  And I press keys "25" for element "input#capacity"
  And I select the "CS Fundamentals" option in dropdown "course"
  And I select the "Intro" option in dropdown "subject"

  And I wait until element "label:contains('Workshop Type Options')" is visible
  And I press the first "input[name='on_map'][value='no']" element
  And I select the "Yes, it is funded. Please pay the Regional Partner." option in dropdown "funded"

  And I press keys "Test" for element "#regional-partner-select"
  And I press the first ".Select-option[aria-label='Test Partner']" element

  And I press keys "These are my CSF notes" for element "textarea#notes"
  And I select the "Test CSF Facilitator" facilitator at index 0

  And I see no difference for "new workshop details: CSF"

  And I press "button:contains('Publish')" using jQuery
  And I wait until element ".panel-title:contains('Your workshop sign-up link:')" is visible
  And I see jquery selector button.btn-orange:contains('Start Workshop')

  And I see no difference for "created workshop details: CSF"
  And I close my eyes

Scenario: New workshop: CSD units 2-3 with 2 facilitators
  Given I am a program manager named "Test CSD PM" for regional partner "Test Partner"
  Given there is a facilitator named "Test CSD Facilitator 1" for course "CS Discoveries"
  Given there is a facilitator named "Test CSD Facilitator 2" for course "CS Discoveries"
  Then I open the new workshop form
  Then I open my eyes to test "New workshop: CSD units 2-3 with 2 facilitators"

  And I press keys "Code.org Office" for element "input#location_name"
  And I press keys "Seattle, WA" for element "input#location_address"
  And I press keys "25" for element "input#capacity"
  And I select the "CS Discoveries" option in dropdown "course"
  And I select the "Workshop 1: Unit 3" option in dropdown "subject"

  And I wait until element "label:contains('Workshop Type Options')" is visible
  And I select the "Yes, it is funded." option in dropdown "funded"

  And I see "#regional-partner-name"

  And I press keys "These are my CSD notes" for element "textarea#notes"

  And I select the "Test CSD Facilitator 1" facilitator at index 0
  And I press the first "#add-facilitator-btn" element
  And I select the "Test CSD Facilitator 2" facilitator at index 1

  And I see no difference for "new workshop details: CSD"

  And I press "button:contains('Publish')" using jQuery
  And I wait until element ".panel-title:contains('Your workshop sign-up link:')" is visible
  And I see jquery selector button.btn-orange:contains('Start Workshop')

  And I see no difference for "created workshop details: CSD"
  And I close my eyes

Scenario: New workshop: CSP local summer with 1 facilitator
  Given I am a program manager named "Test CSP PM" for regional partner "Test Partner"
  Given there is a facilitator named "Test CSP Facilitator" for course "CS Principles"
  Then I open the new workshop form
  Then I open my eyes to test "New workshop: CSP local summer with 1 facilitator"

  And I press keys "Code.org Office" for element "input#location_name"
  And I press keys "Seattle, WA" for element "input#location_address"
  And I press keys "25" for element "input#capacity"
  And I select the "CS Principles" option in dropdown "course"
  And I select the "5-day Summer" option in dropdown "subject"

  And I wait until element "label:contains('Workshop Type Options')" is visible
  And I select the "Yes, it is funded." option in dropdown "funded"

  And I see "#regional-partner-name"

  And I press keys "These are my CSP notes" for element "textarea#notes"
  And I select the "Test CSP Facilitator" facilitator at index 0

  And I see no difference for "new workshop details: CSP"

  And I press "button:contains('Publish')" using jQuery
  And I wait until element ".panel-title:contains('Your workshop sign-up link:')" is visible
  And I see jquery selector button.btn-orange:contains('Start Workshop')

  And I see no difference for "created workshop details: CSP"
  And I close my eyes
