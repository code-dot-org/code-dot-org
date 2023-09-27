# == Schema Information
#
# Table name: section_teachers
#
#  id            :bigint           not null, primary key
#  teacher_id    :integer          not null
#  section_id    :integer          not null
#  invited_by_id :integer
#  deleted_at    :datetime
#  status        :integer          not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_section_teachers_on_deleted_at                 (deleted_at)
#  index_section_teachers_on_invited_by_id              (invited_by_id)
#  index_section_teachers_on_section_id                 (section_id)
#  index_section_teachers_on_teacher_id                 (teacher_id)
#  index_section_teachers_on_teacher_id_and_section_id  (teacher_id,section_id) UNIQUE
#
class SectionTeacher < ApplicationRecord
  acts_as_paranoid

  belongs_to :teacher, class_name: 'User'
  belongs_to :invited_by, class_name: 'User', optional: true
  belongs_to :section

  enum status: {
    active: 0,
    invited: 1,
    declined: 2,
    removed: 3,
  }
end
