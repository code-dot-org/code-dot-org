# == Schema Information
#
# Table name: foorm_simple_survey_forms
#
#  id           :bigint           not null, primary key
#  kind         :string(255)      not null
#  path         :string(255)
#  form_name    :string(255)      not null
#  form_version :integer
#  properties   :text(65535)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_foorm_simple_survey_forms_on_kind  (kind) UNIQUE
#
class Foorm::SimpleSurveyForm < ApplicationRecord
end
