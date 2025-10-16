@no_mobile

Feature: Regional partner mini-contact


Scenario: Teacher submits inline mini-contact form after adding zip
  Given I have a regional partner named "Reggie Partner" in the zip code "90210"
  And I create a teacher named "Severus"

  # By using a teacher account, the email field will be prepopulated.
  And I am on "http://studio.code.org/professional-learning/contact-regional-partner"
  And I wait until element "#regional-partner-mini-contact-form-contact-regional-partner" is visible

  Given I scroll the "#notes" element into view
  And I press keys "Sample message for regional partner." for element "#notes"
  And I press "#submit" using jQuery

  # Wait until we see an error for no ZIP.
  And I wait until element "#regional-partner-mini-contact-error-zip" is visible

  # Submit again with the ZIP.
  Given I scroll the "#zip" element into view
  And I press keys "90210" for element "#zip"
  And I press "#submit" using jQuery
  And I wait until element "#regional-partner-mini-contact-thanks-contact-regional-partner" is visible
  And I sign out

Scenario: Teacher tries to submit inline mini-contact form after adding zip with no regional partner match
  Given I create a teacher named "Severus"
  And I am on "http://studio.code.org/professional-learning/contact-regional-partner"
  And I wait until element "#regional-partner-mini-contact-form-contact-regional-partner" is visible
  And I dismiss the language selector

  Given I scroll the "#notes" element into view
  And I press keys "Sample message for regional partner." for element "#notes"

  # Enter invalid zip.
  Given I scroll the "#zip" element into view
  And I press keys "11" for element "#zip"
  And I press "#submit" using jQuery
  And I wait until element "#regional-partner-mini-contact-no-rp-in-zip-contact-regional-partner" is visible
  And I sign out

Scenario: Teacher submits inline mini-contact form after adding zip with a regional partner match, email, and notes
  Given I have a regional partner named "Reggie Partner" in the zip code "90210"
  And I create a teacher named "Severus"
  And I am on "http://studio.code.org/professional-learning/contact-regional-partner"
  And I wait until element "#regional-partner-mini-contact-form-contact-regional-partner" is visible
  And I dismiss the language selector

  # Let's clear out the email to make sure that it's required.
  Given I scroll the "#email" element into view
  And I press backspace to clear element "#email"
  And I press "#submit" using jQuery

  # Wait until we see errors for no ZIP and no email and no notes.
  And I wait until element "#regional-partner-mini-contact-error-zip" is visible
  And element "#regional-partner-mini-contact-error-email" is visible
  And element "#regional-partner-mini-contact-error-notes" is visible

  # Submit again with a ZIP, an email, and notes.
  Given I scroll the "#zip" element into view
  And I press keys "90210" for element "#zip"
  And I press keys "test-email@code.org" for element "#email"

  Given I scroll the "#notes" element into view
  And I press keys "Sample message for regional partner." for element "#notes"
  And I press "#submit" using jQuery
  And I wait until element "#regional-partner-mini-contact-thanks-contact-regional-partner" is visible
  And I sign out
