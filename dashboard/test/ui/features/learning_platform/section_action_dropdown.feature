@single_session
Feature: Using the SectionActionDropdown

  # * Check that we get redirected to the right page
  Scenario: Viewing progress from SectionActionDropdown
    Given I create a teacher-associated student named "Sally"
    And I complete the level on "http://studio.code.org/s/allthethings/lessons/2/levels/1"
    And I complete the free response on "http://studio.code.org/s/allthethings/lessons/27/levels/1"
    And I submit the assessment on "http://studio.code.org/s/allthethings/lessons/33/levels/1"
    And I sign out

    When I sign in as "Teacher_Sally" and go home
    And I open the section action dropdown
    And I press the first ".view-progress-link" element to load a new page
    And I wait until current URL contains "/progress"

  # * Check that we get redirected to the right page
  Scenario: Managing students from SectionActionDropdown
    Given I am a teacher
    And I create a new student section and go home
    And I wait to see ".ui-test-section-dropdown"
    And I open the section action dropdown
    And I press the first ".manage-students-link" element to load a new page
    And I wait until current URL contains "/manage"

  # * Check that we get redirected to the right page
  Scenario: Printing Login Cards from SectionActionDropdown
    Given I am a teacher
    And I create a new student section and go home
    And I open the section action dropdown
    And I press the first ".print-login-link" element to load a new page
    And I wait until current URL contains "/login_info"

  Scenario: Printing Certificates from SectionActionDropdown without experiment
    Given I create a teacher-associated student named "Sally"
    And I sign in as "Teacher_Sally"
    And I am on "http://studio.code.org/home?disableExperiments=studioCertificate"
    And I open the section action dropdown
    And I press the first ".uitest-certs-link" element to load a new page
    And I wait until I am on "http://code.org/certificates"
    Then element "textarea" has value "Sally"

  Scenario: Printing Certificates from SectionActionDropdown with experiment
    Given I create a teacher-associated student named "Sally"
    And I sign in as "Teacher_Sally"
    And I am on "http://studio.code.org/home?enableExperiments=studioCertificate"
    And I open the section action dropdown
    And I press the first ".uitest-certs-link" element to load a new page
    And I wait until current URL contains "/certificates/batch"
    Then element ".batch-certificate-form textarea" has value "Sally"
    And element "#certificate-batch" contains text "personalized Hour of Code certificates"

    When I press "submit-button" to load a new page
    And I wait until I am on "http://studio.code.org/print_certificates/batch"
    And I wait until element ".hide-print" is visible
    Then evaluate JavaScript expression "$('img').length === 1"

  Scenario: Printing Certificates from SectionActionDropdown with experiment shows course name
    Given I create a teacher named "Teacher" and go home
    And I create a new student section named "Oceans Section" assigned to "AI for Oceans"
    And I am on "http://studio.code.org/home?enableExperiments=studioCertificate"
    And I open the section action dropdown
    And I press the first ".uitest-certs-link" element to load a new page
    And I wait until current URL contains "/certificates/batch"
    Then element "#certificate-batch" contains text "personalized AI for Oceans certificates"

  # * Checks that section can be hidden and shown
  #   * The menu of a new section should have a 'Hide Section' option -> select it to hide the section
  #   * Button to show hidden sections appears -> select it to show the now-hidden section
  #   * The menu of the now-hidden section should have a 'Show Section' option -> select it to show the section
  #   * Table of hidden sections and "Hide/Show" button automatically disappears when empty
  #   * Check that the option to hide the section is available again
  Scenario: Hiding/Showing Section from SectionActionDropdown
    Given I am a teacher
    And I create a new student section and go home
    And I open the section action dropdown
    And I press the child number 4 of class ".pop-up-menu-item"
    And I wait until I don't see selector ".ui-test-section-dropdown"
    And I press the first ".ui-test-show-hide" element
    And I open the section action dropdown
    And I press the child number 4 of class ".pop-up-menu-item"
    And I wait until I don't see selector ".ui-test-show-hide"
    And I open the section action dropdown
    And I press the child number 4 of class ".pop-up-menu-item"
