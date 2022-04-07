class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  connects_to database: {
    writing: MultipleDatabasesTransitionHelper.get_writing_role_name,
    reading: MultipleDatabasesTransitionHelper.get_reading_role_name
  }
end
