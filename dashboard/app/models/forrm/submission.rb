# == Schema Information
#
# Table name: forrm_submissions
#
#  id           :integer          not null, primary key
#  form_name    :string(255)      not null
#  form_version :integer          not null
#  answers      :text(65535)      not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#

class Forrm::Submission < ActiveRecord::Base
  belongs_to :forrm_form
end
