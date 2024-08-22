# == Schema Information
#
# Table name: section_instructors
#
#  id            :bigint           not null, primary key
#  instructor_id :integer          not null
#  section_id    :integer          not null
#  invited_by_id :integer
#  deleted_at    :datetime
#  status        :integer          not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_section_instructors_on_deleted_at                    (deleted_at)
#  index_section_instructors_on_instructor_id                 (instructor_id)
#  index_section_instructors_on_instructor_id_and_section_id  (instructor_id,section_id) UNIQUE
#  index_section_instructors_on_invited_by_id                 (invited_by_id)
#  index_section_instructors_on_section_id                    (section_id)
#
class SectionInstructor < ApplicationRecord
  acts_as_paranoid

  belongs_to :instructor, class_name: 'User'
  belongs_to :invited_by, class_name: 'User', optional: true
  belongs_to :section, -> {with_deleted}

  enum :status, {
    active: 0,
    invited: 1,
    declined: 2,
    removed: 3,
  }
end
