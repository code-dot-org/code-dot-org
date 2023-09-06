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
  belongs_to :student, class_name: 'User', optional: true
  has_many :user_levels, through: :student
  has_many :student_sections, class_name: 'Section', through: :student, source: 'sections_as_student'
  belongs_to :script, class_name: 'Unit', optional: true
  belongs_to :level, optional: true
  belongs_to :teacher, class_name: 'User', optional: true

  REVIEW_STATES = OpenStruct.new(
    {
      keepWorking: 'keepWorking',
      completed: 'completed'
    }
).freeze

  validates_inclusion_of :review_state, in: REVIEW_STATES.to_h.values, allow_nil: true

  # Finds the script level associated with this object, using script id and
  # level id.
  def get_script_level
    script_level = level.script_levels.find {|sl| sl.script_id == script_id}
    return script_level if script_level

    # accomodate feedbacks associated with a Bubble Choice sublevel
    script_level = BubbleChoice.
                   parent_levels(level.name).
                   map(&:script_levels).
                   flatten.
                   find {|sl| sl.script_id == script_id}

    raise "no script level found for teacher feedback #{id}" unless script_level
    script_level
  end

  def self.get_latest_feedback_given(student_id, level_id, teacher_id, script_id)
    get_latest_feedbacks_given(student_id, level_id, script_id, teacher_id).first
  end

  # returns the latest feedback from each teacher for the student on the level
  def self.get_latest_feedbacks_received(student_id, level_id, script_id)
    query = {
      student_id: student_id,
      level_id: level_id,
      script_id: script_id
    }.compact

    where(query).
      latest_per_teacher.
      order(created_at: :desc)
  end

  # Returns the latest feedback for each student on every level in a script given by the teacher
  # Get number of passed levels per user for the given set of user IDs
  # @param [Array<Integer>|Integer] student_ids: (optional) one or a list of student_ids. If nil student_id is excluded from the query
  # @param [Array<Integer>|Integer] level_ids: (optional) one or a list of level_ids. If nil level_id is excluded from the query
  # @param [Integer] script_id: (optional) if nil, script_id will be excluded from the query
  # @param [Integer] teacher_id: (optional) if nil, teacher_id will be excluded from the query
  # @return [Array<TeacherFeedback>] Array of TeacherFeedbacks
  def self.get_latest_feedbacks_given(student_ids, level_ids, script_id, teacher_id)
    query = {
      student_id: student_ids,
      level_id: level_ids,
      script_id: script_id,
      teacher_id: teacher_id
    }.compact

    find(
      where(
        query
      ).group([:student_id, :level_id]).pluck(
        # This SQL string is not at risk for injection vulnerabilites because
        # it's just a hardcoded string, so it's safe to wrap in Arel.sql
        Arel.sql('MAX(teacher_feedbacks.id)')
      )
    )
  end

  def self.latest_per_teacher
    # Only select feedback from teachers who lead sections in which the student is still enrolled
    # and get the latest feedback per teacher for each student on each level
    where(id: joins(:student_sections).
        where('sections.user_id = teacher_id').
        group([:teacher_id, :student_id, :level_id]).
        # This SQL string is not at risk for injection vulnerabilites because
        # it's just a hardcoded string, so it's safe to wrap in Arel.sql
        pluck(Arel.sql('MAX(teacher_feedbacks.id)'))
  )
  end

  def self.has_feedback?(student_id)
    where(
      student_id: student_id
    ).count > 0
  end

  def self.get_unseen_feedback_count(student_id)
    all_unseen_feedbacks = where(
      student_id: student_id,
      seen_on_feedback_page_at: nil,
      student_first_visited_at: nil
    ).select do |feedback|
      User.find(feedback.teacher_id).verified_instructor?
    end

    all_unseen_feedbacks.count
  end

  def self.latest
    find_by(id: maximum(:id))
  end

  def user_level
    @user_level ||= user_levels.where(level_id: level_id, script_id: script_id)&.first
  end

  def student_seen_feedback
    return seen_on_feedback_page_at if seen_on_feedback_page_at && seen_on_feedback_page_at > created_at
    return student_last_visited_at if student_last_visited_at && student_last_visited_at > created_at
  end

  # TODO: update to use camelcase
  def summarize(is_latest = false)
    ActiveRecord::Base.connected_to(role: :reading) do
      {
        id: id,
        student_id: student_id,
        script_id: script_id,
        level_id: level_id,
        comment: comment,
        performance: performance,
        created_at: created_at,
        student_seen_feedback: student_seen_feedback,
        review_state: review_state,
        student_last_updated: user_level&.updated_at,
        seen_on_feedback_page_at: seen_on_feedback_page_at,
        student_first_visited_at: student_first_visited_at,
        is_awaiting_teacher_review: awaiting_teacher_review?(is_latest)
      }
    end
  end

  def summarize_for_csv(level, script_level, student, sublevel_index = nil)
    rubric_performance_json_to_ruby = {
      performanceLevel1: "rubric_performance_level_1",
      performanceLevel2: "rubric_performance_level_2",
      performanceLevel3: "rubric_performance_level_3",
      performanceLevel4: "rubric_performance_level_4"
    }

    rubric_performance_headers = {
      performanceLevel1: "Extensive Evidence",
      performanceLevel2: "Convincing Evidence",
      performanceLevel3: "Limited Evidence",
      performanceLevel4: "No Evidence"
    }

    review_state_labels = {
      keepWorking: "Needs more work",
      completed: "Reviewed, completed",
    }

    review_state_label = awaiting_teacher_review?(true) ? "Waiting for review" : review_state_labels[review_state&.to_sym]
    level_num = script_level.position.to_s

    if sublevel_index
      level_num += BubbleChoice::ALPHABET[sublevel_index]
    end

    {
      studentName: student.name,
      lessonNum: script_level.lesson.relative_position.to_s,
      lessonName: script_level.lesson.localized_title,
      levelNum: level_num,
      keyConcept: (level.rubric_key_concept || ''),
      performanceLevelDetails: (level.properties[rubric_performance_json_to_ruby[performance&.to_sym]] || ''),
      performance: rubric_performance_headers[performance&.to_sym],
      comment: comment,
      timestamp: updated_at.localtime.strftime("%D at %r"),
      reviewStateLabel: review_state_label || "Never reviewed",
      studentSeenFeedback: student_seen_feedback&.localtime&.strftime("%D at %r"),
    }
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

  # When a teacher updates their feedback on a level, a new feedback record is created.
  # Only the latest feedback from the teacher is considered up-to-date and displayed for the
  # student on the level. We store other feedbacks to keep track of historical feedback given,
  # which is displayed on the /feedback page. Only the up-to-date feedback (latest feedback record)
  # can be awaiting review since it's the only relevant feedback to the student.
  def awaiting_teacher_review?(is_latest = false)
    return false unless is_latest

    return review_state == REVIEW_STATES.keepWorking && student_updated_since_feedback?
  end

  private def student_updated_since_feedback?
    user_level.present? && user_level.updated_at > created_at
  end
end
