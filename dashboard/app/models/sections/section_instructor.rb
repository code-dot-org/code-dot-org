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
  belongs_to :section

  enum status: {
    active: 0,
    invited: 1,
    declined: 2,
    removed: 3,
  }
end

public def create_section(section, email)
  # Enforce maximum co-instructor count (the limit is 5 plus the main teacher
  # for a total of 6)
  if SectionInstructor.where(section: section).count >= 6
    puts "Section #{section.id} is full #{SectionInstructor.where(section: section).count}"
    raise ArgumentError.new('section full')
  end

  instructor = User.find_by(email: email, user_type: :teacher)

  si = SectionInstructor.with_deleted.find_by(instructor: instructor, section: section)
  if instructor.blank?
    raise
  end

  # Actually delete the instructor if they were soft-deleted so they can be re-invited.
  if si&.deleted_at.present?
    puts "Re-adding previously removed instructor #{instructor.id} to section #{section.id}"
    si.really_destroy!
  # Can't re-add someone who is already an instructor (or invited/declined)
  elsif si.present?
    puts "User #{instructor.id} is already an instructor for section #{section.id}"
    raise ArgumentError.new('already invited')
    return
  end

  return SectionInstructor.create!(
    section: section,
    instructor: instructor,
    status: :invited,
    invited_by: current_user
  )
end
