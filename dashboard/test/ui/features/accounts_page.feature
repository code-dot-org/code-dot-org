Feature: Accounts Page
  Scenario: Switching from student to teacher does not show email popup
    Given I am on "http://studio.code.org/"
    And I create a student named "Zaphod"
    And I am on "http://studio.code.org/users/edit"
    When I fill in account email and current password for "Zaphod"
    And I select the "Teacher" option in dropdown "user_user_type"
    And I click selector ".btn-default"
    Then element ".modal" does not contain text "Please confirm your email"
