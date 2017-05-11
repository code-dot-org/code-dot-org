class Pd::WorkshopSurvey < ActiveRecord::Base
  include Pd::Form

  belongs_to :pd_enrollment
  validates_presence_of :pd_enrollment
end
