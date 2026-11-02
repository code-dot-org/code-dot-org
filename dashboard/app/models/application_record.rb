class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
  include AnalyticsExportable
  include DataClassification

  connects_to database: {
    writing: :primary,
    reading: :primary_replica,
    reporting: :primary_reporting,
  }
end
