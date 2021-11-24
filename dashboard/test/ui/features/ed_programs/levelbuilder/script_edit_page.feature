@no_mobile

# We need "press keys" to type into the React form's fields, but that doesn't work on IE.
@no_ie

@no_safari
Feature: Using the Script Edit Page

Scenario: View the unit edit page
  Given I create a levelbuilder named "Levi"
  And I create a temp migrated unit with lessons
  And I view the temp unit overview page
  And I view the temp unit edit page
  And I delete the temp unit with lessons

Scenario: View the unit edit page in locale besides en-US
  Given I am on "http://studio.code.org/home/lang/es"
  And I create a levelbuilder named "Levi"
  And I create a temp migrated unit with lessons
  And I view the temp unit overview page
  And I try to view the temp unit edit page
  And I get redirected to "/" via "dashboard"
  And I wait until element "#homepage-container" is visible
  And I wait until element "#homepage-container" contains text "Editing on levelbuilder is only supported in English (en-US locale)."
  And I delete the temp unit with lessons

Scenario: Save changes to a unit
  Given I create a levelbuilder named "Levi"
  And I create a temp migrated unit with lessons
  And I view the temp unit overview page
  # do not check actual lesson name, because translation is missing
  And element ".uitest-progress-lesson" contains text "Lesson 1:"
  And element ".uitest-progress-lesson" contains text "Lesson 2:"

  When I view the temp unit edit page
  And I scroll the ".uitest-unit-card" element into view
  And element ".uitest-lesson-token-contents:first" contains text "Temp Lesson With Lesson Plan"
  And element ".uitest-lesson-token-contents:last" contains text "Temp Lesson Without Lesson Plan"

  # delete one lesson. this didn't work with jquery click or mousedown for some reason
  And I press the child number 1 of class ".fa-times"
  And I wait until element ".modal-body" is visible
  And element ".modal-body button:last" contains text "Delete"
  And I click selector ".modal-body button:last"
  And I wait until element ".modal-body" is not visible

  And I remove the temp unit from the cache
  And I click selector ".btn-primary" to load a new page
  And I wait until element "#script-title" is visible

  Then element ".uitest-progress-lesson" contains text "Lesson 1:"
  And element ".uitest-progress-lesson" does not contain text "Lesson 2:"

  And I delete the temp unit with lessons

Scenario: Navigate from unit edit page for migrated unit to lesson edit page
  Given I create a levelbuilder named "Levi"
  And I create a temp migrated unit with lessons
  And I view the temp unit overview page
  And I view the temp unit edit page

  # Open the lesson edit page
  And I wait until element ".fa-pencil" is visible
  Then I scroll the ".fa-pencil" element into view
  And I click ".fa-pencil"
  And I switch tabs
  And I wait until element "#edit-container" is visible

  # Match the text 'Editing Lesson "Temp Lesson"'
  And element "h1" contains text "Editing Lesson"
  And element "h1" contains text "Temp Lesson"

  And I delete the temp unit with lessons
