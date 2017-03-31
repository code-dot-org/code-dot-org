@dashboard_db_access
@eyes

Feature: Basic appearance for Workshop Certificates

Scenario: Simple Workshop Certificate
  Given I am a teacher who has just followed a workshop certificate link
  And I open my eyes to test "workshop certificate"
  And I see no difference for "viewing workshop certificate"
  And I close my eyes
