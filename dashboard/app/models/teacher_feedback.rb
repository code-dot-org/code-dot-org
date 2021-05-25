# == Schema Information
#
# Table name: teacher_feedbacks
#
#  id                       :integer          not null, primary key
#  comment                  :text(65535)
#  student_id               :integer
#  level_id                 :integer          not null
#  teacher_id               :integer          not null
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  deleted_at               :datetime
#  performance              :string(255)
#  student_visit_count      :integer
#  student_first_visited_at :datetime
#  student_last_visited_at  :datetime
#  seen_on_feedback_page_at :datetime
#  script_id                :integer          not null
#  analytics_section_id     :integer
#  review_state             :string(255)
#
# Indexes
#
#  index_feedback_on_student_and_level_and_teacher_id  (student_id,level_id,teacher_id)
#  index_teacher_feedbacks_on_teacher_id               (teacher_id)
#

class TeacherFeedback < ApplicationRecord
  acts_as_paranoid # use deleted_at column instead of deleting rows
  validates_presence_of :student_id, :script_id, :level_id, :teacher_id, unless: :deleted?
  belongs_to :student, class_name: 'User'
  has_many :student_sections, class_name: 'Section', through: :student, source: 'sections_as_student'
  belongs_to :script
  belongs_to :level
  belongs_to :teacher, class_name: 'User'

  # Finds the script level associated with this object, using script id and
  # level id.
  def get_script_level
    script_level = level.script_levels.find {|sl| sl.script_id == script_id}
    return script_level if script_level

    # This will be somewhat expensive, but will only be executed for feedbacks
    # which were are associated with a Bubble Choice sublevel.
    bubble_choice_levels = script.levels.where(type: 'BubbleChoice').all
    parent_level = bubble_choice_levels.find {|bc| bc.sublevels.include?(level)}

    script_level = parent_level.script_levels.find {|sl| sl.script_id == script_id}
    raise "no script level found for teacher feedback #{id}" unless script_level
    script_level
  end

  def self.get_student_level_feedback(student_id, level_id, teacher_id, script_id)
    where(
      student_id: student_id,
      level_id: level_id,
      teacher_id: teacher_id,
      script_id: script_id
    ).latest
  end

  def self.get_all_feedback_for_section(student_ids, level_ids, teacher_id)
    find(
      where(
        student_id: student_ids,
        level_id: level_ids,
        teacher_id: teacher_id
      ).group([:student_id, :level_id]).pluck('MAX(teacher_feedbacks.id)')
    )
  end

  def self.latest_per_teacher
    #Only select feedback from teachers who lead sections in which the student is still enrolled
    find(
      joins(:student_sections).
        where('sections.user_id = teacher_id').
        group([:teacher_id, :student_id]).
        pluck('MAX(teacher_feedbacks.id)')
    )
  end

  def self.latest
    find_by(id: maximum(:id))
  end

  # Increments student_visit_count and related metrics timestamps for a TeacherFeedback.
  def increment_visit_count
    now = DateTime.now

    if student_visit_count
      self.student_visit_count += 1
    else
      self.student_visit_count = 1
    end

    unless student_first_visited_at
      self.student_first_visited_at = now
    end

    self.student_last_visited_at = now
    save
  end
end
