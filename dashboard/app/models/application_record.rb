class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  # Configure all of our models to distribute requests between the primary and
  # replica databases
  connects_to database: {writing: :primary, reading: :primary_replica}
end
