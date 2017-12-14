@dashboard_db_access
@as_student
Feature: App Lab Scenarios

  # This scenario covers a regression where share links generated from a script
  # level simply linked back to the script level, not to the underlying project
  # as they should.
  # Originally reported on our forums, see
  #   http://forum.code.org/t/students-sharing-code/11495
  # Correctly formatted share links will take the form:
  #   <origin>/projects/applab/<project-id>
  Scenario: Sharing from an App Lab script level
    Given I am on the 1st App Lab test level
    When I press the first ".project_share" element
    Then the share link includes "/projects/applab/"

