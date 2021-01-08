# We need "press keys" to type into the React form's fields, but that doesn't work on IE.
@no_ie

Feature: Regional partner mini-contact


Scenario: Teacher submits inline mini-contact form after adding zip
  Given I create a teacher named "Severus"

  # By using a teacher account, the email field will be prepopulated.
  And I am on "http://code.org/educate/professional-learning/middle-high"
  And I wait until element "#regional-partner-mini-contact-form-middle-high" is visible
  And I press "#submit" using jQuery

  # Wait until we see an error for no ZIP.
  And I wait until element "#regional-partner-mini-contact-error-zip" is visible

  # Submit again with the ZIP.
  Given I scroll the "#zip" element into view
  And I press keys "90210" for element "#zip"
  And I press "#submit" using jQuery
  And I wait until element "#regional-partner-mini-contact-thanks-middle-high" is visible
  And I sign out


Scenario: Teacher submits inline mini-contact form after adding zip and email
  Given I create a teacher named "Severus"
  And I am on "http://code.org/educate/professional-learning/middle-high"
  And I wait until element "#regional-partner-mini-contact-form-middle-high" is visible
  And I dismiss the language selector

  # Let's clear out the email to make sure that it's required.
  Given I scroll the "#email" element into view
  And I press backspace to clear element "#email"
  And I press "#submit" using jQuery

  # Wait until we see errors for no ZIP and no email.
  And I wait until element "#regional-partner-mini-contact-error-zip" is visible
  And element "#regional-partner-mini-contact-error-email" is visible

  # Submit again with a ZIP and an email.
  Given I scroll the "#zip" element into view
  And I press keys "90210" for element "#zip"
  And I press keys "test-email@code.org" for element "#email"
  And I press "#submit" using jQuery
  And I wait until element "#regional-partner-mini-contact-thanks-middle-high" is visible
  And I sign out


Scenario: Signed-out user submits pop-up mini-contact form after adding zip and email
  # First pop up the mini-contact form for signed-out user, and submit it.
  And I am on "http://studio.code.org/pd/application/teacher"
  And I wait until element "#regional-partner-mini-contact-popup-link-container span span" is visible
  And I press "#regional-partner-mini-contact-popup-link-container span" using jQuery
  And I wait until element "#regional-partner-mini-contact-form-teacher-application-logged-out" is visible
  And I press "#submit" using jQuery

  # Wait until we see errors for no ZIP and no email.
  And I wait until element "#regional-partner-mini-contact-error-zip" is visible
  And element "#regional-partner-mini-contact-error-email" is visible

  # Submit again with a ZIP and an email.
  Given I scroll the "#zip" element into view
  And I press keys "90210" for element "#zip"
  And I press keys "test-email@code.org" for element "#email"
  And I press "#submit" using jQuery
  And I wait until element "#regional-partner-mini-contact-thanks-teacher-application-logged-out" is visible
