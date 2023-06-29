@as_teacher
Feature: Print batch certificates

Scenario: Printing a batch of certificates
  Given I am on "http://studio.code.org/certificates/batch"
  And I wait until element ".batch-certificate-form" is visible
  And I press keys "Alice\nBob\nCharlie" for element ".batch-certificate-form textarea"
  And I press "submit-button" to load a new page

  When I wait until I am on "http://studio.code.org/print_certificates/batch"
  And I wait until element ".hide-print" is visible
  Then evaluate JavaScript expression "$('#print-certificate-batch img').length === 3"

@eyes
Scenario: Eyes test for oceans certificate on bulk print page
  When I open my eyes to test "batch print certificates"
  And I am on "http://studio.code.org/certificates/batch?course=b2NlYW5z"
  And I wait until element ".batch-certificate-form" is visible
  And I press keys "Student One" for element ".batch-certificate-form textarea"
  And I see no difference for "bulk certificate page"
  And I press "submit-button" to load a new page

  When I wait until I am on "http://studio.code.org/print_certificates/batch"
  And I wait until element ".hide-print" is visible
  And I see no difference for "bulk print page"
  And I close my eyes
