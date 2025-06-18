@dashboard_db_access
@eyes

Feature: Basic appearance for Workshop Certificates

Scenario: Simple Workshop Certificate
  Given I am a teacher who has just followed a workshop certificate link
  And I open my eyes to test "workshop certificate"
  # This page doesn't render any icons, so we don't need to wait for Font Awesome to load.
  And I see no difference for "viewing workshop certificate" without waiting for Font Awesome to load
  And I close my eyes
