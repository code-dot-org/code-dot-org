# == Schema Information
#
# Table name: foorm_submissions
#
#  id           :integer          not null, primary key
#  form_name    :string(255)      not null
#  form_version :integer          not null
#  answers      :text(16777215)   not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#

class Foorm::Submission < ActiveRecord::Base
  has_one :metadata, class_name: 'Pd::WorkshopSurveyFoormSubmission', foreign_key: :foorm_submission_id
  belongs_to :form, foreign_key: [:form_name, :form_version], primary_key: [:name, :version]
end
