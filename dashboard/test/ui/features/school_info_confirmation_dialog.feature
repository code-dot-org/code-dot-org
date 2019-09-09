Feature: School Info Confirmation Dialog

Scenario: One week later, user receives prompt to complete school info interstitial
  Given I am on "https://studio.code.org/users/sign_up"
  And I create a teacher named "Chuba" and go home
  And I update user "Chuba" account creation date
  Then I reload the page
  And I see ".modal"