# == Schema Information
#
# Table name: lti_sections
#
#  id             :bigint           not null, primary key
#  lti_course_id  :bigint           not null
#  section_id     :integer          not null
#  lms_section_id :string(255)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_lti_sections_on_lti_course_id  (lti_course_id)
#  index_lti_sections_on_section_id     (section_id)
#
class LtiSection < ApplicationRecord
  belongs_to :lti_course
  belongs_to :section
  validates :section_id, uniqueness: true
  validates :lms_section_id, presence: true
  after_destroy :destroy_associated_section

  def destroy_associated_section
    section.destroy
  end
end
