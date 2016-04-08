# == Schema Information
#
# Table name: pd_workshops
#
#  id               :integer          not null, primary key
#  workshop_type    :string(255)      not null
#  organizer_id     :integer          not null
#  location_name    :string(255)
#  location_address :string(255)
#  course           :string(255)      not null
#  subject          :string(255)
#  capacity         :integer          not null
#  notes            :string(255)
#  section_id       :integer
#  started_at       :datetime
#  ended_at         :datetime
#  created_at       :datetime
#  updated_at       :datetime
#
# Indexes
#
#  index_pd_workshops_on_organizer_id  (organizer_id)
#

class Pd::Workshop < ActiveRecord::Base
  TYPES = [
    TYPE_PUBLIC = 'Public',
    TYPE_PRIVATE = 'Private',
    TYPE_DISTRICT = 'District'
  ]

  COURSES = [
    COURSE_CSF = 'CSF',
    COURSE_CSP = 'CSP',
    COURSE_ECS = 'ECS',
    COURSE_CS_IN_A = 'CSinA',
    COURSE_CS_IN_S = 'CSinS',
    COURSE_CSD = 'CSD'
  ]

  STATE_NOT_STARTED = 'Not Started'
  STATE_IN_PROGRESS = 'In Progress'
  STATE_ENDED = 'Ended'

  validates_inclusion_of :workshop_type, in: TYPES
  validates_inclusion_of :course, in: COURSES
  validates :capacity, numericality: {only_integer: true, greater_than: 0}

  belongs_to :organizer, class_name: 'User'
  has_and_belongs_to_many :facilitators, class_name: 'User', join_table: 'pd_workshops_facilitators', foreign_key: 'pd_workshop_id', association_foreign_key: 'user_id'

  has_many :sessions, -> {order :start}, class_name: 'Pd::Session', dependent: :destroy, foreign_key: 'pd_workshop_id'
  accepts_nested_attributes_for :sessions, allow_destroy: true

  has_many :enrollments, class_name: 'Pd::Enrollment', dependent: :destroy, foreign_key: 'pd_workshop_id'
  belongs_to :section

  def self.organized_by(organizer)
    where(organizer_id: organizer.id)
  end

  def self.facilitated_by(facilitator)
    joins(:facilitators).where(users: {id: facilitator.id}).distinct
  end

  def self.enrolled_in_by(teacher)
    joins(:enrollments).where(pd_enrollments: {email: teacher.email}).distinct
  end

  def self.attended_by(teacher)
    joins(sessions: :attendances).where(pd_attendances: {teacher_id: teacher.id}).distinct
  end

  def friendly_name
    "Workshop #{sessions.first.start.strftime('%m/%d/%y')} at #{location_name}"
  end

  def start!
    return unless self.started_at.nil?
    raise 'Workshop must have at least one session to start.' if self.sessions.empty?

    self.started_at = DateTime.now
    self.section = Section.create!(
      name: friendly_name,
      user_id: self.organizer_id
    )
    self.save!
  end

  def end!
    return unless self.ended_at.nil?
    self.ended_at = DateTime.now
    self.save!
  end

  def state
    case
      when self.started_at.nil?
        STATE_NOT_STARTED
      when self.ended_at.nil?
        STATE_IN_PROGRESS
      else
        STATE_ENDED
    end
  end

  def year
    return nil if sessions.empty?
    sessions.order(:start).first.start.strftime('%Y')
  end
end
