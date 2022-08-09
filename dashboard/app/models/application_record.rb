class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  connects_to database: {
    writing: Policies::ActiveRecordRoles.get_writing_role_name,
    reading: Policies::ActiveRecordRoles.get_reading_role_name
  }
end
