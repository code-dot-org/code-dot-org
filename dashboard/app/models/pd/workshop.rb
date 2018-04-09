# == Schema Information
#
# Table name: pd_workshops
#
#  id                  :integer          not null, primary key
#  organizer_id        :integer          not null
#  location_name       :string(255)
#  location_address    :string(255)
#  processed_location  :text(65535)
#  course              :string(255)      not null
#  subject             :string(255)
#  capacity            :integer          not null
#  notes               :text(65535)
#  section_id          :integer
#  started_at          :datetime
#  ended_at            :datetime
#  created_at          :datetime
#  updated_at          :datetime
#  processed_at        :datetime
#  deleted_at          :datetime
#  regional_partner_id :integer
#  on_map              :boolean
#  funded              :boolean
#  funding_type        :string(255)
#
# Indexes
#
#  index_pd_workshops_on_organizer_id         (organizer_id)
#  index_pd_workshops_on_regional_partner_id  (regional_partner_id)
#

class Pd::Workshop < ActiveRecord::Base
  include Pd::WorkshopConstants

  acts_as_paranoid # Use deleted_at column instead of deleting rows.

  validates_inclusion_of :course, in: COURSES
  validates :capacity, numericality: {only_integer: true, greater_than: 0, less_than: 10000}
  validates_length_of :notes, maximum: 65535
  validates_length_of :location_name, :location_address, maximum: 255
  validate :sessions_must_start_on_separate_days
  validate :subject_must_be_valid_for_course
  validates_inclusion_of :on_map, in: [true, false]
  validates_inclusion_of :funded, in: [true, false]

  validates :funding_type,
    inclusion: {in: FUNDING_TYPES, if: :funded_csf?},
    absence: {unless: :funded_csf?}

  belongs_to :organizer, class_name: 'User'
  has_and_belongs_to_many :facilitators, class_name: 'User', join_table: 'pd_workshops_facilitators', foreign_key: 'pd_workshop_id', association_foreign_key: 'user_id'

  has_many :sessions, -> {order :start}, class_name: 'Pd::Session', dependent: :destroy, foreign_key: 'pd_workshop_id'
  accepts_nested_attributes_for :sessions, allow_destroy: true

  has_many :enrollments, class_name: 'Pd::Enrollment', dependent: :destroy, foreign_key: 'pd_workshop_id'
  belongs_to :regional_partner

  before_save :process_location, if: -> {location_address_changed?}
  auto_strip_attributes :location_name, :location_address

  before_save :assign_regional_partner, if: -> {organizer_id_changed? && !regional_partner_id?}
  def assign_regional_partner
    self.regional_partner = organizer.try {|o| o.regional_partners.first}
  end

  def sessions_must_start_on_separate_days
    if sessions.all(&:valid?)
      unless sessions.map {|session| session.start.to_datetime.to_date}.uniq.length == sessions.length
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
    left_outer_joins(:facilitators).where(users: {id: facilitator.id}).distinct
  end

  def self.enrolled_in_by(teacher)
    joins(:enrollments).where(pd_enrollments: {email: teacher.email}).distinct
  end

  def self.exclude_summer
    where.not(subject: [SUBJECT_SUMMER_WORKSHOP, SUBJECT_TEACHER_CON])
  end

  # scopes to workshops managed by the user, which means the user is any of:
  # - the organizer
  # - a facilitator
  # - a program manager for the assigned regional partner
  def self.managed_by(user)
    left_outer_joins(:facilitators).
      where(
        'pd_workshops_facilitators.user_id = ? OR organizer_id = ? OR regional_partner_id IN (?)',
        user.id,
        user.id,
        user.regional_partner_program_managers.select(:regional_partner_id)
      ).distinct
  end

  def self.attended_by(teacher)
    joins(sessions: :attendances).where(pd_attendances: {teacher_id: teacher.id}).distinct
  end

  def self.in_state(state, error_on_bad_state: true)
    case state
      when STATE_NOT_STARTED
        where(started_at: nil)
      when STATE_IN_PROGRESS
        where.not(started_at: nil).where(ended_at: nil)
      when STATE_ENDED
        where.not(started_at: nil).where.not(ended_at: nil)
      else
        raise "Unrecognized state: #{state}" if error_on_bad_state
        none
    end
  end

  scope :group_by_id, -> {group('pd_workshops.id')}

  # Filters by scheduled start date (date of first session)
  def self.scheduled_start_on_or_before(date)
    joins(:sessions).group_by_id.having('(DATE(MIN(start)) <= ?)', date)
  end

  # Filters by scheduled start date (date of first session)
  def self.scheduled_start_on_or_after(date)
    joins(:sessions).group_by_id.having('(DATE(MIN(start)) >= ?)', date)
  end

  scope :in_year, ->(year = Date.now.year) do
    scheduled_start_on_or_after(Date.new(year)).
    scheduled_start_on_or_before(Date.new(year + 1))
  end

  # Filters to workshops that are scheduled on or after today and have not yet ended
  scope :future, -> {scheduled_start_on_or_after(Time.zone.today).where(ended_at: nil)}

  # Orders by the scheduled start date (date of the first session),
  # @param :desc [Boolean] optional - when true, sort descending
  def self.order_by_scheduled_start(desc: false)
    joins(:sessions).
      group_by_id.
      order('DATE(MIN(pd_sessions.start))' + (desc ? ' DESC' : ''))
  end

  # Orders by the number of active enrollments
  # @param :desc [Boolean] optional - when true, sort descending
  def self.order_by_enrollment_count(desc: false)
    left_outer_joins(:enrollments).
      group_by_id.
      order('COUNT(pd_enrollments.id)' + (desc ? ' DESC' : ''))
  end

  # Orders by the workshop state, in order: Not Started, In Progress, Ended
  # @param :desc [Boolean] optional - when true, sort descending
  def self.order_by_state(desc: false)
    order(%Q(
      CASE
        WHEN started_at IS NULL THEN "#{STATE_NOT_STARTED}"
        WHEN ended_at IS NULL THEN "#{STATE_IN_PROGRESS}"
        ELSE "#{STATE_ENDED}"
      END #{desc ? ' DESC' : ''})
    )
  end

  # Filters by scheduled end date (date of last session)
  def self.scheduled_end_on_or_before(date)
    joins(:sessions).group_by_id.having("(DATE(MAX(end)) <= ?)", date)
  end

  # Filters by scheduled end date (date of last session)
  def self.scheduled_end_on_or_after(date)
    joins(:sessions).group_by_id.having("(DATE(MAX(end)) >= ?)", date)
  end

  def self.scheduled_start_in_days(days)
    Pd::Workshop.joins(:sessions).group_by_id.having("(DATE(MIN(start)) = ?)", Date.today + days.days)
  end

  def self.scheduled_end_in_days(days)
    Pd::Workshop.joins(:sessions).group_by_id.having("(DATE(MAX(end)) = ?)", Date.today + days.days)
  end

  # Filters by date the workshop actually ended, regardless of scheduled session times.
  def self.end_on_or_before(date)
    where('(DATE(ended_at) <= ?)', date)
  end

  # Filters by date the workshop actually ended, regardless of scheduled session times.
  def self.end_on_or_after(date)
    where('(DATE(ended_at) >= ?)', date)
  end

  # Filters those those workshops that have not yet ended, but whose
  # final session was scheduled to end more than two days ago
  def self.should_have_ended
    in_state(STATE_IN_PROGRESS).scheduled_end_on_or_before(Time.zone.now - 2.days)
  end

  def course_name
    COURSE_NAMES_MAP[course]
  end

  def course_target
    COURSE_URLS_MAP[course]
  end

  def friendly_name
    start_time = sessions.empty? ? '' : sessions.first.start.strftime('%m/%d/%y')
    course_subject = subject ? "#{course} #{subject}" : course

    # Limit the friendly name to 255 chars
    "#{course_subject} workshop on #{start_time} at #{location_name}"[0...255]
  end

  # E.g. "March 1-3, 2017" or "March 30 - April 2, 2017"
  # Assume no workshops will span a new year
  def friendly_date_range
    sessions.first.start.month == sessions.last.start.month ?
      "#{sessions.first.start.strftime('%B %-d')}-#{sessions.last.start.strftime('%-d, %Y')}" :
      "#{sessions.first.start.strftime('%B %-d')} - #{sessions.last.start.strftime('%B %-d, %Y')}"
  end

  # Friendly location string is determined by:
  # 1. known variant of TBA? use TBA
  # 2. processed location? use city, state
  # 3. unprocessable location: use user-entered string
  # 4. no location address at all? use TBA
  def friendly_location
    return 'Location TBA' if location_address_tba?
    return "#{location_city} #{location_state}" if processed_location
    location_address.presence || 'Location TBA'
  end

  def date_and_location_name
    date_string = sessions.any? ? friendly_date_range : 'Dates TBA'
    "#{date_string}, #{friendly_location}#{teachercon? ? ' TeacherCon' : ''}"
  end

  # Puts workshop in 'In Progress' state
  def start!
    raise 'Workshop must have at least one session to start.' if sessions.empty?

    sessions.each(&:assign_code)
    update!(started_at: Time.zone.now)

    # return nil in case any callers are still expecting a section
    nil
  end

  # Ends the workshop, or no-op if it's already ended.
  # The return value is undefined.
  def end!
    return unless ended_at.nil?
    self.ended_at = Time.zone.now
    sessions.each(&:remove_code)
    save!
  end

  def state
    return STATE_NOT_STARTED if started_at.nil?
    return STATE_IN_PROGRESS if ended_at.nil?
    STATE_ENDED
  end

  def year
    return nil if sessions.empty?
    sessions.order(:start).first.start.strftime('%Y')
  end

  # Suppress 3 and 10-day reminders for certain workshops
  def suppress_reminders?
    [
      SUBJECT_CSP_TEACHER_CON,
      SUBJECT_CSP_FIT,
      SUBJECT_CSD_TEACHER_CON,
      SUBJECT_CSD_FIT,
      SUBJECT_CSF_FIT
    ].include? subject
  end

  def self.send_reminder_for_upcoming_in_days(days)
    # Collect errors, but do not stop batch. Rethrow all errors below.
    errors = []
    scheduled_start_in_days(days).each do |workshop|
      workshop.enrollments.each do |enrollment|
        begin
          email = Pd::WorkshopMailer.teacher_enrollment_reminder(enrollment, days_before: days)
          email.deliver_now
        rescue => e
          errors << "teacher enrollment #{enrollment.id} - #{e.message}"
        end
      end
      workshop.facilitators.each do |facilitator|
        next if facilitator == workshop.organizer
        begin
          Pd::WorkshopMailer.facilitator_enrollment_reminder(facilitator, workshop).deliver_now
        rescue => e
          errors << "facilitator #{facilitator.id} - #{e.message}"
        end
      end
      begin
        Pd::WorkshopMailer.organizer_enrollment_reminder(workshop).deliver_now
      rescue => e
        errors << "organizer workshop #{workshop.id} - #{e.message}"
      end
    end

    raise "Failed to send #{days} day workshop reminders: #{errors.join(', ')}" unless errors.empty?
  end

  def self.send_reminder_to_close
    # Collect errors, but do not stop batch. Rethrow all errors below.
    errors = []
    should_have_ended.each do |workshop|
      begin
        Pd::WorkshopMailer.organizer_should_close_reminder(workshop).deliver_now
      rescue => e
        errors << "organizer should close workshop #{workshop.id} - #{e.message}"
      end
    end
    raise "Failed to send reminders: #{errors.join(', ')}" unless errors.empty?
  end

  def self.send_automated_emails
    send_reminder_for_upcoming_in_days(3)
    send_reminder_for_upcoming_in_days(10)
    send_reminder_to_close
  end

  def self.process_ended_workshop_async(id)
    workshop = Pd::Workshop.find(id)
    raise "Unexpected workshop state #{workshop.state}." unless workshop.state == STATE_ENDED

    workshop.send_exit_surveys

    workshop.update!(processed_at: Time.zone.now)
  end

  # Updates enrollments with resolved users.
  def resolve_enrolled_users
    enrollments.each do |enrollment|
      enrollment.update!(user: enrollment.resolve_user) unless enrollment.user
    end
  end

  def send_exit_surveys
    resolve_enrolled_users

    # Send the emails
    enrollments.each do |enrollment|
      if account_required_for_attendance?
        next unless enrollment.user

        next unless attending_teachers.include?(enrollment.user)
      end

      enrollment.send_exit_survey
    end
  end

  def location_address_tba?
    %w(tba tbd n/a).include?(location_address.try(:downcase))
  end

  def process_location
    result = nil

    unless location_address.blank? || location_address_tba?
      begin
        Geocoder.with_errors do
          # Geocoder can raise a number of errors including SocketError, with a common base of StandardError
          # See https://github.com/alexreisner/geocoder#error-handling
          Retryable.retryable(on: StandardError) do
            result = Geocoder.search(location_address).try(:first)
          end
        end
      rescue StandardError => e
        # Log geocoding errors to honeybadger but don't fail
        Honeybadger.notify(e,
          error_message: 'Error geocoding workshop location_address',
          context: {
            pd_workshop_id: id,
            location_address: location_address
          }
        )
      end
    end

    unless result
      self.processed_location = nil
      return
    end

    self.processed_location = {
      latitude: result.latitude,
      longitude: result.longitude,
      city: result.city,
      state: result.state,
      formatted_address: result.formatted_address
    }.to_json
  end

  # Retrieve a single location value (like city or state) from the processed
  # location hash. Attribute can be passed as a string or symbol
  def get_processed_location_value(key)
    return unless processed_location
    location_hash = JSON.parse processed_location
    location_hash[key.to_s]
  end

  def location_city
    get_processed_location_value('city')
  end

  def location_state
    get_processed_location_value('state')
  end

  # Min number of days a teacher must attend for it to count.
  # @return [Integer]
  def min_attendance_days
    [1, time_constraint(:min_days)].compact.max
  end

  # Apply max # days for payment, if applicable, to the number of scheduled days (sessions).
  # @return [Integer] number of payment days, after applying constraints
  def effective_num_days
    [sessions.count, time_constraint(:max_days)].compact.min
  end

  # Apply max # of hours for payment, if applicable, to the number of scheduled session-hours.
  # @return [Integer] number of payment hours, after applying constraints
  def effective_num_hours
    actual_hours = sessions.map(&:hours).reduce(&:+)
    [actual_hours, time_constraint(:max_hours)].compact.min
  end

  # @return [Boolean] true if a Code Studio account is required for attendance, otherwise false.
  def account_required_for_attendance?
    ![Pd::Workshop::COURSE_COUNSELOR, Pd::Workshop::COURSE_ADMIN].include?(course)
  end

  def workshop_starting_date
    sessions.first.try(:start)
  end

  def workshop_ending_date
    sessions.last.try(:start)
  end

  def workshop_date_range_string
    if workshop_starting_date == workshop_ending_date
      workshop_starting_date.strftime('%B %e, %Y')
    else
      "#{workshop_starting_date.strftime('%B %e, %Y')} - #{workshop_ending_date.strftime('%B %e, %Y')}"
    end
  end

  # @return [String] url for this workshop in the workshop dashboard
  # Note the latter part of the path is handled by React-Router on the client, and is not known by rails url helpers
  def workshop_dashboard_url
    Rails.application.routes.url_helpers.pd_workshop_dashboard_url + "/workshops/#{id}"
  end

  def associated_online_course
    ::Course.find_by(name: WORKSHOP_COURSE_ONLINE_LEARNING_MAPPING[course]).try(:plc_course) if WORKSHOP_COURSE_ONLINE_LEARNING_MAPPING[course]
  end

  # Get all the teachers that have actually attended this workshop via the attendence.
  def attending_teachers
    sessions.flat_map(&:attendances).flat_map(&:teacher).uniq
  end

  def local_summer?
    subject == SUBJECT_SUMMER_WORKSHOP
  end

  def teachercon?
    [
      SUBJECT_CSP_TEACHER_CON,
      SUBJECT_CSD_TEACHER_CON,
    ].include?(subject)
  end

  def fit_weekend?
    [
      SUBJECT_CSP_FIT,
      SUBJECT_CSD_FIT,
      SUBJECT_CSF_FIT
    ].include?(subject)
  end

  def funded_csf?
    course == COURSE_CSF && funded
  end

  def funding_summary
    (funded ? 'Yes' : 'No') + (funding_type.present? ? ": #{funding_type}" : '')
  end

  # Get all enrollments for this workshop with no associated attendances
  def unattended_enrollments
    enrollments.left_outer_joins(:attendances).where(pd_attendances: {id: nil})
  end

  def organizer_or_facilitator?(user)
    organizer == user || facilitators.include?(user)
  end

  # TODO: Extend this for non teachercon surveys when we get to it
  def survey_responses
    if teachercon?
      Pd::TeacherconSurvey.where(pd_enrollment: enrollments)
    elsif local_summer?
      Pd::LocalSummerWorkshopSurvey.where(pd_enrollment: enrollments)
    else
      raise 'Not supported for this workshop type'
    end
  end

  # Lookup a time constraint by type
  # @param constraint_type [Symbol] e.g. :min_days, :max_days, or :max_hours
  # @returns [Number, nil] constraint for the specified subject and type, or nil if none exists
  def time_constraint(constraint_type)
    TIME_CONSTRAINTS[course].try(:[], subject).try(:[], constraint_type)
  end

  # The workshop is ready to close if the last session has attendance
  def ready_to_close?
    sessions.last.try {|session| session.attendances.any?}
  end

  def pre_survey?
    PRE_SURVEY_BY_COURSE.key? course
  end

  def pre_survey_course_name
    PRE_SURVEY_BY_COURSE[course].try(:[], :course_name)
  end

  # @return an array of tuples, each in the format:
  #   [unit_name, [lesson names]]
  # Units represent the localized titles for scripts in the Course
  # Lessons are the stage names for that script (unit) preceded by "Lesson n: "
  def pre_survey_units_and_lessons
    return nil unless pre_survey?
    pre_survey_course = Course.find_by_name! pre_survey_course_name
    pre_survey_course.default_scripts.map do |script|
      unit_name = script.localized_title
      stage_names = script.stages.where(lockable: false).pluck(:name)
      lesson_names = stage_names.each_with_index.map do |stage_name, i|
        "Lesson #{i + 1}: #{stage_name}"
      end
      [unit_name, lesson_names]
    end
  end
end
