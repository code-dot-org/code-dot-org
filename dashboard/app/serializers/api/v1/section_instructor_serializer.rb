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

class Api::V1::SectionInstructorSerializer < ActiveModel::Serializer
  attributes :id, :status, :invited_by_name, :invited_by_email, :section_name, :section_id, :instructor_name, :instructor_email, :participant_type

  def invited_by_name
    object.invited_by&.name
  end

  def invited_by_email
    object.invited_by&.email
  end

  def section_name
    object.section&.name
  end

  def section_id
    object.section.id
  end

  def instructor_name
    object.instructor&.name if object.active?
  end

  def instructor_email
    object.instructor&.email
  end
end
