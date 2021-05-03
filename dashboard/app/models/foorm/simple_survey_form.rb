# == Schema Information
#
# Table name: foorm_simple_survey_forms
#
#  id           :bigint           not null, primary key
#  path         :string(255)      not null
#  kind         :string(255)
#  form_name    :string(255)      not null
#  form_version :integer
#  properties   :text(65535)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_foorm_simple_survey_forms_on_path  (path)
#
class Foorm::SimpleSurveyForm < ApplicationRecord
  include SerializedProperties

  serialized_attrs [
    'survey_data',
    'allow_multiple_submissions'
  ]

  def self.find_most_recent_form_for_path(path)
    where(path: path).last
  end

  # To do: create a new DCDO flag with the same contents as this flag (foorm_simple_surveys_disabled),
  # and replace its use here.
  # Longer term, maybe we add a disabled flag on the SimpleSurveyForm model.
  def self.form_path_disabled?(path)
    disabled_forms = DCDO.get('foorm_misc_survey_disabled', [])
    disabled_forms && disabled_forms.include?(path)
  end
end
