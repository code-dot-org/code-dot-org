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
  scope :latest, -> {find_by(id: maximum(:id))}
  scope :latest_per_level, -> {find(group([:student_id, :level_id]).pluck('MAX(teacher_feedbacks.id)'))}

  REVIEW_STATES = [
    "keepWorking",
    "completed"
  ]

  validates_inclusion_of :review_state, in: REVIEW_STATES, allow_nil: true

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

  def self.get_feedback_given(student_id, level_id, script_id, teacher_id)
    where(
      student_id: student_id,
      level_id: level_id,
      script_id: script_id,
      teacher_id: teacher_id
    ).latest
  end

  def self.get_feedback_received(student_id, level_id, script_id)
    where(
      student_id: student_id,
      level_id: level_id,
      script_id: script_id,
    ).for_enrolled_sections.latest
  end

  def self.get_feedbacks_given(student_ids, level_ids, script_id, teacher_id)
    query = where(
      student_id: student_ids,
      script_id: script_id,
      teacher_id: teacher_id
    )

    if level_ids.present?
      query = query.where(level_id: level_ids)
    end

    query.latest_per_level
  end

  def self.student_has_feedback(student_id)
    where(student_id: student_id).count > 0
  end

  def self.get_student_unseen_feedback_count(student_id)
    authorized_unseen_feedbacks = where(
      student_id: current_user.id,
      seen_on_feedback_page_at: nil,
      student_first_visited_at: nil
    ).select do |feedback|
      feedback.teacher.authorized_teacher?
    end

    authorized_unseen_feedbacks.count
  end

  def self.for_enrolled_sections
    #Only select feedback from teachers who lead sections in which the student is still enrolled
    joins(:student_sections).where('sections.user_id = teacher_id')
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
