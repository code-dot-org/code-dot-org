Feature: Print batch certificates

Scenario: Printing a batch of certificates
  Given I am on "http://studio.code.org/certificates/batch"
  And I wait until element ".batch-certificate-form" is visible
  And I press keys "Alice\nBob\nCharlie" for element ".batch-certificate-form textarea"
  And I press "submit-button" to load a new page

  When I wait until I am on "http://studio.code.org/print_certificates/batch"
  And I wait until element ".hide-print" is visible
  Then evaluate JavaScript expression "$('img').length === 3"
