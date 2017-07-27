@no_ie
@no_mobile
@dashboard_db_access
@pegasus_db_access
Feature: Using the teacher homepage sections feature

  Scenario: Loading the teacher homepage with new sections
    Given I am on "http://code.org/"
    And I am a teacher
    And I am on "http://studio.code.org/home?enableExperiments=section-flow-2017"
    And I see ".sectionsContainer"
    And I click selector ".uitest-newsection" once I see it
    And I press the first ".uitest-pictureLogin .uitest-button" element
    And I wait for 2 seconds
    And I press the first ".uitest-editForm .uitest-footer .uitest-saveButton" element
    And I see ".sectionPage"
