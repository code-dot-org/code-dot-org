# == Schema Information
#
# Table name: teacher_dashboard_notes
#
#  id                 :bigint           not null, primary key
#  teacher_id         :integer          not null
#  section_id         :integer
#  shared_with_section :boolean         default(FALSE), not null
#  shareable_globally :boolean          default(FALSE), not null
#  context_type       :string(255)      not null
#  unit_group_id      :integer
#  unit_id            :integer
#  lesson_id          :integer
#  title              :string(255)
#  note_color         :string(255)      default("white"), not null
#  note_layout_column :integer          default(0), not null
#  note_position      :integer          default(0), not null
#  body               :text(65535)      not null
#  lock_version       :integer          default(0), not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#

class TeacherDashboardNote < ApplicationRecord
  CONTEXT_TYPES = [
    COURSE = 'course',
    UNIT = 'unit',
    LESSON = 'lesson',
  ].freeze

  MAX_BODY_LENGTH = 20_000
  NOTE_COLORS = %w[
    white
    yellow
    peach
    mint
    blue
    lavender
    pink
    gray
    aqua
    cream
  ].freeze

  belongs_to :teacher, class_name: 'User'
  belongs_to :section, optional: true
  belongs_to :unit_group, optional: true
  belongs_to :unit, class_name: 'Unit', optional: true
  belongs_to :lesson, optional: true
  has_many :teacher_dashboard_note_shared_sections, dependent: :destroy
  has_many :shared_sections, through: :teacher_dashboard_note_shared_sections, source: :section
  has_many :teacher_dashboard_note_layouts, dependent: :destroy

  validates :context_type, :body, presence: true
  validates :context_type, inclusion: {in: CONTEXT_TYPES}
  validates :note_color, inclusion: {in: NOTE_COLORS}
  validates :note_layout_column, inclusion: {in: [0, 1]}
  validates :note_position, numericality: {only_integer: true, greater_than_or_equal_to: 0}
  validates :title, length: {maximum: 255}
  validates :body, length: {maximum: MAX_BODY_LENGTH}
  validate :body_is_not_blank
  validate :context_matches_foreign_key
  validate :teacher_instructs_section
  validate :teacher_instructs_shared_sections

  scope :owned_by, ->(teacher) {where(teacher_id: teacher.id)}
  scope :in_section_or_all_sections, ->(section_id) {where(section_id: [nil, section_id])}
  scope :shared_with_section, lambda {|section_id|
    joins(:teacher_dashboard_note_shared_sections).
      where(teacher_dashboard_note_shared_sections: {section_id: section_id}).
      distinct
  }

  def self.visible_on_page_for(teacher, section:, unit_id:, unit_group_id: nil, lesson_id: nil)
    owned = owned_by(teacher).
      in_section_or_all_sections(section.id).
      matching_page_contexts(unit_group_id: unit_group_id, unit_id: unit_id, lesson_id: lesson_id)

    shared = none
    if section.active_section_instructors.exists?(instructor_id: teacher.id)
      shared = shared_with_section(section.id).
        where.not(teacher_id: teacher.id).
        matching_page_contexts(unit_group_id: unit_group_id, unit_id: unit_id, lesson_id: lesson_id)
    end

    where(id: owned.select(:id)).
      or(where(id: shared.select(:id))).
      order(:context_type, :note_layout_column, :note_position, :created_at)
  end

  def self.matching_page_contexts(unit_group_id:, unit_id:, lesson_id:)
    relation = where(context_type: UNIT, unit_id: unit_id)
    if unit_group_id.present?
      relation = relation.or(where(context_type: COURSE, unit_group_id: unit_group_id))
    end
    relation = relation.or(where(context_type: LESSON, lesson_id: lesson_id)) if lesson_id.present?
    relation
  end

  def owner?(user)
    user.respond_to?(:id) && teacher_id == user.id
  end

  def visible_to?(user)
    return true if owner?(user)
    return false unless user.respond_to?(:id) && shared_with_section?

    shared_sections.joins(:active_section_instructors).
      exists?(section_instructors: {instructor_id: user.id})
  end

  def active_section_note?
    section_id.present?
  end

  private def body_is_not_blank
    errors.add(:body, 'must not be blank') if body&.strip.blank?
  end

  private def context_matches_foreign_key
    return if context_type.blank?

    expected = {
      COURSE => unit_group_id,
      UNIT => unit_id,
      LESSON => lesson_id,
    }[context_type]

    errors.add(:context_type, 'must have its matching context id') if expected.blank?

    extra_contexts = {
      COURSE => [unit_id, lesson_id],
      UNIT => [unit_group_id, lesson_id],
      LESSON => [unit_group_id, unit_id],
    }[context_type]
    errors.add(:context_type, 'must set exactly one context id') if extra_contexts.any?(&:present?)
  end

  private def teacher_instructs_section
    return if section_id.blank? || teacher_id.blank?

    unless section&.active_section_instructors&.exists?(instructor_id: teacher_id)
      errors.add(:section_id, 'must belong to an active instructor')
    end
  end

  private def teacher_instructs_shared_sections
    return if teacher_id.blank? || shared_section_ids.blank?

    instructed_section_ids = Section.joins(:active_section_instructors).
      where(id: shared_section_ids, section_instructors: {instructor_id: teacher_id}).
      pluck(:id)
    invalid_section_ids = shared_section_ids - instructed_section_ids
    return if invalid_section_ids.empty?

    errors.add(:shared_section_ids, 'must belong to an active instructor')
  end
end
