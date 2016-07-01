# == Schema Information
#
# Table name: pd_workshops
#
#  id                 :integer          not null, primary key
#  workshop_type      :string(255)      not null
#  organizer_id       :integer          not null
#  location_name      :string(255)
#  location_address   :string(255)
#  processed_location :text(65535)
#  course             :string(255)      not null
#  subject            :string(255)
#  capacity           :integer          not null
#  notes              :text(65535)
#  section_id         :integer
#  started_at         :datetime
#  ended_at           :datetime
#  created_at         :datetime
#  updated_at         :datetime
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
    COURSE_CSF = 'CS Fundamentals',
    COURSE_CSP = 'CS Principles',
    COURSE_ECS = 'Exploring Computer Science',
    COURSE_CS_IN_A = 'CS in Algebra',
    COURSE_CS_IN_S = 'CS in Science',
    COURSE_CSD = 'CS Discoveries',
    COURSE_COUNSELOR = 'Counselor',
    COURSE_ADMIN = 'Admin'
  ]

  STATES = [
    STATE_NOT_STARTED = 'Not Started',
    STATE_IN_PROGRESS = 'In Progress',
    STATE_ENDED = 'Ended'
  ]

  SUBJECTS = {
    COURSE_ECS => [
      SUBJECT_ECS_PHASE_2 = 'Phase 2 in-person',
      SUBJECT_ECS_UNIT_3 = 'Unit 3 - HTML',
      SUBJECT_ECS_UNIT_4 = 'Unit 4 - Scratch',
      SUBJECT_ECS_UNIT_5 = 'Unit 5 - Data',
      SUBJECT_ECS_UNIT_6 = 'Unit 6 - Robotics',
      SUBJECT_ECS_PHASE_4 = 'Phase 4: Summer wrap-up'
    ],
    COURSE_CS_IN_A => [
      SUBJECT_CS_IN_A_PHASE_2 = 'Phase 2 in-person',
      SUBJECT_CS_IN_A_PHASE_3 = 'Phase 3: Academic Year Development'
    ],
    COURSE_CS_IN_S => [
      SUBJECT_CS_IN_S_PHASE_2 = 'Phase 2: Blended Summer Study',
      SUBJECT_CS_IN_S_PHASE_3_SEMESTER_1 = 'Phase 3 - Semester 1',
      SUBJECT_CS_IN_S_PHASE_3_SEMESTER_2 = 'Phase 3 - Semester 2'
    ]
  }

  validates_inclusion_of :workshop_type, in: TYPES
  validates_inclusion_of :course, in: COURSES
  validates :capacity, numericality: {only_integer: true, greater_than: 0, less_than: 10000}
  validates_length_of :notes, maximum: 65535
  validates_length_of :location_name, :location_address, maximum: 255
  validate :sessions_must_start_on_separate_days
  validate :subject_must_be_valid_for_course

  belongs_to :organizer, class_name: 'User'
  has_and_belongs_to_many :facilitators, class_name: 'User', join_table: 'pd_workshops_facilitators', foreign_key: 'pd_workshop_id', association_foreign_key: 'user_id'

  has_many :sessions, -> {order :start}, class_name: 'Pd::Session', dependent: :destroy, foreign_key: 'pd_workshop_id'
  accepts_nested_attributes_for :sessions, allow_destroy: true

  has_many :enrollments, class_name: 'Pd::Enrollment', dependent: :destroy, foreign_key: 'pd_workshop_id'
  belongs_to :section

  def sessions_must_start_on_separate_days
    if sessions.all(&:valid?)
      unless sessions.map{|session| session.start.to_datetime.to_date}.uniq.length == sessions.length
        errors.add(:sessions, 'must start on separate days.')
      end
    else
      errors.add(:sessions, "must each have a valid start and end.")
    end
  end

  def subject_must_be_valid_for_course
    unless (SUBJECTS[course] && SUBJECTS[course].include?(subject)) || (!SUBJECTS[course] && !subject)
      errors.add(:subject, 'must be a valid option for the course.')
    end
  end

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

  def self.in_state(state)
    case state
      when STATE_NOT_STARTED
        where(started_at: nil)
      when STATE_IN_PROGRESS
        where.not(started_at: nil).where(ended_at: nil)
      when STATE_ENDED
        where.not(started_at: nil).where.not(ended_at: nil)
      else
        raise "Unrecognized state: #{state}"
    end
  end

  def friendly_name
    start_time = sessions.empty? ? '' : sessions.first.start.strftime('%m/%d/%y')
    "Workshop #{start_time} at #{location_name}"
  end

  # Puts workshop in 'In Progress' state, creates a section and returns the section.
  def start!
    return unless self.started_at.nil?
    raise 'Workshop must have at least one session to start.' if self.sessions.empty?

    self.started_at = Time.zone.now
    self.section = Section.create!(
      name: friendly_name,
      user_id: self.organizer_id
    )
    self.save!
    self.section
  end

  def end!
    return unless self.ended_at.nil?
    self.ended_at = Time.zone.now
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

  def self.start_in_days(days)
    Pd::Workshop.joins(:sessions).group(:pd_workshop_id).having("(DATE(MIN(start)) = ?)", Date.today + days.days)
  end

  def self.end_in_days(days)
    Pd::Workshop.joins(:sessions).group(:pd_workshop_id).having("(DATE(MAX(end)) = ?)", Date.today + days.days)
  end

  def self.send_reminder_for_upcoming_in_days(days)
    start_in_days(days).each do |workshop|
      workshop.enrollments.each do |enrollment|
        Pd::WorkshopMailer.teacher_enrollment_reminder(enrollment).deliver_now
      end
    end
  end

  def self.send_automated_emails
    send_reminder_for_upcoming_in_days(3)
    send_reminder_for_upcoming_in_days(10)
  end

  def self.process_ended_workshop_async(id)
    workshop = Pd::Workshop.find(id)
    raise "Unexpected workshop state #{workshop.state}." unless workshop.state == STATE_ENDED

    workshop.send_exit_surveys
  end

  def send_exit_surveys
    # Update enrollments with resolved users.
    self.enrollments.each do |enrollment|
      enrollment.update!(user: enrollment.resolve_user) unless enrollment.user
    end

    Pd::Enrollment.create_for_unenrolled_attendees(self)

    # Send the emails
    self.enrollments.reload.each do |enrollment|
      next unless enrollment.user

      # Make sure every enrolled user is a teacher and has an exposed email
      # because some teachers accidentally create student accounts
      enrollment.user.update!(user_type: User::TYPE_TEACHER, email: enrollment.email) unless enrollment.user.teacher?

      # Make sure user joined the section
      next unless section.students.exists?(enrollment.user.id)

      Pd::WorkshopMailer.exit_survey(self, enrollment.user, enrollment).deliver_now
    end
  end

  def self.process_location(address)
    result = Geocoder.search(address).try(:first)
    return nil unless result

    {
      latitude: result.latitude,
      longitude: result.longitude,
      formatted_address: result.formatted_address
    }.to_json
  end
end
