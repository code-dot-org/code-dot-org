class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  connects_to database: {writing: :primary, reading: Rails.env.test? ? :primary : :primary_replica}
end
