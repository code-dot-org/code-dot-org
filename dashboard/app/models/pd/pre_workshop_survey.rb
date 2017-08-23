# == Schema Information
#
# Table name: pd_pre_workshop_surveys
#
#  id               :integer          not null, primary key
#  pd_enrollment_id :integer          not null
#  form_data        :text(65535)      not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_pd_pre_workshop_surveys_on_pd_enrollment_id  (pd_enrollment_id) UNIQUE
#

class Pd::PreWorkshopSurvey < ActiveRecord::Base
  include Pd::Form

  belongs_to :pd_enrollment, class_name: 'Pd::Enrollment'
  validates_presence_of :pd_enrollment
end
