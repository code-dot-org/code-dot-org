Feature: Generate Projects for Image Moderation

@dashboard_db_access @as_student
@no_mobile @no_ie

# Projects should be flagged as 'racy' or 'adult'
Scenario: Generate Inappropriate Projects
  Given I generate inappropriate App Lab projects from the data set

# Projects should be flagged as 'everyone'
Scenario: Generate Appropriate Projects
  Given I generate appropriate App Lab projects from the data set
