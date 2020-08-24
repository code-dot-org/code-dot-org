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
#  properties          :text(65535)
#
# Indexes
#
#  index_pd_workshops_on_organizer_id         (organizer_id)
#  index_pd_workshops_on_regional_partner_id  (regional_partner_id)
#

class Pd::Workshop < ActiveRecord::Base
  include Pd::WorkshopConstants
  include SerializedProperties
  include Pd::WorkshopSurveyConstants

  acts_as_paranoid # Use deleted_at column instead of deleting rows.

  belongs_to :organizer, class_name: 'User'
  has_and_belongs_to_many :facilitators, class_name: 'User', join_table: 'pd_workshops_facilitators', foreign_key: 'pd_workshop_id', association_foreign_key: 'user_id'

  has_many :sessions, -> {order :start}, class_name: 'Pd::Session', dependent: :destroy, foreign_key: 'pd_workshop_id'
  accepts_nested_attributes_for :sessions, allow_destroy: true

  has_many :enrollments, class_name: 'Pd::Enrollment', dependent: :destroy, foreign_key: 'pd_workshop_id'
  belongs_to :regional_partner

  has_many :regional_partner_program_managers, source: :program_managers, through: :regional_partner

  serialized_attrs [
    'fee',

    # Indicates that this workshop will be conducted virtually, which has the
    # following effects in our system:
    #   - Ensures `suppress_email` is set (see below)
    #     when it is left blank.
    #   - Uses a different, virtual-specific post-workshop survey.
    'virtual',

    # Allows a workshop to be associated with a third party
    # organization.
    # Only current allowed values are "friday_institute" and nil.
    # "friday_institute" represents The Friday Institute,
    # a regional partner whose model of virtual workshop was used
    # by several partners during summer 2020.
    'third_party_provider',

    # If true, our system will not send enrollees reminders related to this workshop.
    # Note that this is one of (at least) three mechanisms we use to suppress
    # email in various cases -- see Workshop.suppress_reminders? for
    # subject-specific suppression of reminder emails. This is functionally
    # extremely similar (identical?) to the logic currently implemented
    # by this serialized attribute.
    # See also WorkshopMailer.check_should_send, which suppresses ALL email
    # for workshops with a virtual subject (note, this is different than the
    # virtual serialized attribute)
    'suppress_email'
  ]

  validates_inclusion_of :course, in: COURSES
  validates :capacity, numericality: {only_integer: true, greater_than: 0, less_than: 10000}
  validates_length_of :notes, maximum: 65535
  validates_length_of :location_name, :location_address, maximum: 255
  validate :sessions_must_start_on_separate_days
  validate :subject_must_be_valid_for_course
  validates_inclusion_of :on_map, in: [true, false]
  validates_inclusion_of :funded, in: [true, false]
  validate :all_virtual_workshops_suppress_email
  validate :all_academic_year_workshops_suppress_email
  validates_inclusion_of :third_party_provider, in: %w(friday_institute), allow_nil: true
  validate :virtual_only_subjects_must_be_virtual

  validates :funding_type,
    inclusion: {in: FUNDING_TYPES, if: :funded_csf?},
    absence: {unless: :funded_csf?}

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

  def all_virtual_workshops_suppress_email
    if virtual? && !suppress_email?
      errors.add :properties, 'All virtual workshops must suppress email.'
    end
  end

  def all_academic_year_workshops_suppress_email
    if MUST_SUPPRESS_EMAIL_SUBJECTS.include?(subject) && !suppress_email?
      errors.add :properties, 'All academic year workshops must suppress email.'
    end
  end

  def virtual_only_subjects_must_be_virtual
    if VIRTUAL_ONLY_SUBJECTS.include?(subject) && !virtual?
      errors.add :properties, "Workshops with the subject #{subject} must be virtual"
    end
  end

  def self.organized_by(organizer)
    where(organizer_id: organizer.id)
  end

  def self.facilitated_by(facilitator)
    left_outer_joins(:facilitators).where(users: {id: facilitator.id}).distinct
  end

  def self.enrolled_in_by(teacher)
    base_query = joins(:enrollments)
    user_id_where_clause = base_query.where(pd_enrollments: {user_id: teacher.id})
    email_where_clause = base_query.where(pd_enrollments: {email: teacher.email})

    user_id_where_clause.or(email_where_clause).distinct
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

  scope :in_year, ->(year) do
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

  # Find the workshop that is closest in time to today
  # @return [Pd::Workshop, nil]
  def self.nearest
    joins(:sessions).
      select("pd_workshops.*, ABS(DATEDIFF(pd_sessions.start, '#{Date.today}')) AS day_diff").
      order("day_diff ASC").
      first
  end

  # Find the workshop with the closest session to today attended by the given teacher
  # @param [User] teacher
  # @return [Pd::Workshop, nil]
  def self.with_nearest_attendance_by(teacher)
    joins(sessions: :attendances).where(pd_attendances: {teacher_id: teacher.id}).
      select("pd_workshops.*, ABS(DATEDIFF(pd_sessions.start, '#{Date.today}')) AS day_diff").
      order("day_diff").
      first
  end

  # Find the workshop with the closest session to today attended by the given teacher,
  # or enrolled in (but not attended by) that same teacher
  # @param [User] teacher
  # @return [Pd::Workshop, nil]
  def self.nearest_attended_or_enrolled_in_by(teacher)
    current_scope.with_nearest_attendance_by(teacher) || current_scope.enrolled_in_by(teacher).nearest
  end

  # Find the workshop with the closest session to today
  # enrolled in by the given teacher.
  # @param [User] teacher
  # @return [Pd::Workshop, nil]
  def self.nearest_enrolled_in_by(teacher)
    current_scope.enrolled_in_by(teacher).nearest
  end

  def course_name
    COURSE_NAME_OVERRIDES[course] || course
  end

  def course_url
    COURSE_URLS_MAP[course]
  end

  def course_key
    COURSE_KEY_MAP[course]
  end

  def friendly_name
    start_time = sessions.empty? ? '' : sessions.first.start.strftime('%m/%d/%y')
    course_subject = subject ? "#{course} #{subject}" : course

    # Limit the friendly name to 255 chars
    name = "#{course_subject} workshop on #{start_time} at #{location_name}"
    name += " in #{friendly_location}" if friendly_location.present?
    name[0...255]
  end

  def friendly_subject
    if subject && (subject.downcase.include?("workshop") || subject == SUBJECT_TEACHER_CON)
      subject
    elsif subject
      "#{subject} Workshop"
    else
      nil
    end
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
  # 4. no location address at all? use blank
  def friendly_location
    return 'Location TBA' if location_address_tba?
    return 'Virtual Workshop' if location_address_virtual?
    return "#{location_city} #{location_state}" if processed_location
    location_address.presence || ''
  end

  # Returns date and location (only date if no location specified)
  def date_and_location_name
    date_and_location_string = sessions.any? ? friendly_date_range : 'Dates TBA'
    date_and_location_string += ", #{friendly_location}" if friendly_location.present?
    date_and_location_string += ' TeacherCon' if teachercon?
    date_and_location_string
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
    save!

    # We want to send exit surveys now, but that needs to be done on the
    # production-daemon machine, so we'll let the process_pd_workshop_emails
    # cron job call the process_ends function below on that machine.
  end

  # This is called by the process_pd_workshop_emails cron job which is run
  # on the production-daemon machine, and will send exit surveys to workshops
  # that have been ended in the last two days when they haven't already had
  # that done.
  # The emails must be sent from production-daemon because they contain attachments.
  # See https://github.com/code-dot-org/code-dot-org/blob/96b890d6e6f77de23bc5d4469df69b900e3fbeb7/lib/cdo/poste.rb#L217
  # for details.
  def self.process_ends
    end_on_or_after(Time.now - 2.days).each do |workshop|
      # only process if the workshop has not already been processed or if workshop was
      # processed before the workshop ended.
      next unless !workshop.processed_at || workshop.processed_at < workshop.ended_at
      workshop.send_exit_surveys
      workshop.send_facilitator_post_surveys
      workshop.update!(processed_at: Time.zone.now)
    end
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

  # Returns the school year the summer workshop is preparing for, in
  # the form "2019-2020", like application_year on Pd Applications.
  # The school year runs 6/1-5/31.
  # @see Pd::Application::ActiveApplicationModels::APPLICATION_YEARS
  def school_year
    return nil if sessions.empty?

    workshop_year = year
    sessions.order(:start).first.start.month >= 6 ?
      "#{workshop_year}-#{workshop_year.to_i + 1}" :
      "#{workshop_year.to_i - 1}-#{workshop_year}"
  end

  # Note that this is one of (at least) three mechanisms we use to suppress
  # email in various cases -- see the serialized attribute 'suppress_email' and
  # WorkshopMailer.check_should_send, which suppresses ALL email
  # for workshops with a virtual subject (note, this is different than the
  # virtual serialized attribute)
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
        email = Pd::WorkshopMailer.teacher_enrollment_reminder(enrollment, days_before: days)
        email.deliver_now
      rescue => e
        errors << "teacher enrollment #{enrollment.id} - #{e.message}"
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

      # send pre-workshop email for CSD and CSP facilitators 10 days before the workshop only
      next unless days == 10 && (workshop.course == COURSE_CSD || workshop.course == COURSE_CSP)
      workshop.facilitators.each do |facilitator|
        next unless facilitator.email
        begin
          Pd::WorkshopMailer.facilitator_pre_workshop(facilitator, workshop).deliver_now
        rescue => e
          errors << "pre email for facilitator #{facilitator.id} - #{e.message}"
        end
      end
    end

    raise "Failed to send #{days} day workshop reminders: #{errors.join(', ')}" unless errors.empty?
  end

  def self.send_reminder_to_close
    # Collect errors, but do not stop batch. Rethrow all errors below.
    errors = []
    should_have_ended.each do |workshop|
      Pd::WorkshopMailer.organizer_should_close_reminder(workshop).deliver_now
    rescue => e
      errors << "organizer should close workshop #{workshop.id} - #{e.message}"
    end
    raise "Failed to send reminders: #{errors.join(', ')}" unless errors.empty?
  end

  # Send follow up email to teachers that attended CSF Intro workshops which ended exactly X days ago
  def self.send_follow_up_after_days(days)
    # Collect errors, but do not stop batch. Rethrow all errors below.
    errors = []

    scheduled_end_in_days(-days).each do |workshop|
      next unless workshop.course == COURSE_CSF && workshop.subject == SUBJECT_CSF_101
      attended_teachers = workshop.attending_teachers

      workshop.enrollments.each do |enrollment|
        next unless attended_teachers.include?(enrollment.user)

        email = Pd::WorkshopMailer.teacher_follow_up(enrollment)
        email.deliver_now
      rescue => e
        errors << "teacher enrollment #{enrollment.id} - #{e.message}"
        Honeybadger.notify(e,
          error_message: 'Failed to send follow up email to teacher',
          context: {pd_enrollment_id: enrollment.id}
        )
      end
    end

    raise "Failed to send follow up: #{errors.join(', ')}" unless errors.empty?
  end

  def self.send_automated_emails
    send_reminder_for_upcoming_in_days(3)
    send_reminder_for_upcoming_in_days(10)
    send_reminder_to_close
    send_follow_up_after_days(30)
  end

  # Updates enrollments with resolved users.
  def resolve_enrolled_users
    enrollments.each do |enrollment|
      enrollment.update!(user: enrollment.resolve_user) unless enrollment.user
    end
  end

  # Called at the very end of the async close-workshop workflow, to actually send exit
  # surveys to attended teachers.  Note that logic here is more-or-less independent
  # from other logic deciding whether a workshop should have exit surveys.
  def send_exit_surveys
    # FiT workshops should not send exit surveys
    return if SUBJECT_FIT == subject || COURSE_FACILITATOR == course

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

  # Send Post-surveys to facilitators of CSD and CSP workshops
  def send_facilitator_post_surveys
    if course == COURSE_CSD || course == COURSE_CSP
      facilitators.each do |facilitator|
        next unless facilitator.email

        Pd::WorkshopMailer.facilitator_post_workshop(facilitator, self).deliver_now
      end
    end
  end

  def location_address_tba?
    %w(tba tbd n/a).include?(location_address.try(:downcase))
  end

  def location_address_virtual?
    ['virtual', 'virtual workshop'].include? location_address.try(:downcase)
  end

  def process_location
    result = nil

    unless location_address.blank? || location_address_tba? || location_address_virtual?
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
    ::UnitGroup.find_by(name: WORKSHOP_COURSE_ONLINE_LEARNING_MAPPING[course]).try(:plc_course) if WORKSHOP_COURSE_ONLINE_LEARNING_MAPPING[course]
  end

  # Get all the teachers that have actually attended this workshop via the attendence.
  def attending_teachers
    sessions.flat_map(&:attendances).flat_map(&:teacher).uniq
  end

  # Get all teachers who have attended all sessions of this workshop.
  def teachers_attending_all_sessions(filter_by_cdo_scholarship=false)
    teachers_attending = sessions.flat_map(&:attendances).flat_map(&:teacher).compact

    # Filter attendances to only scholarship teachers
    if filter_by_cdo_scholarship
      scholarship_teachers = Pd::ScholarshipInfo.where(
        {
          application_year: school_year,
          course: course_key,
          scholarship_status: Pd::ScholarshipInfoConstants::YES_CDO
        }
      ).pluck(:user_id)
      teachers_attending.select! {|teacher| scholarship_teachers.include? teacher.id}
    end

    # Get number of sessions attended by teacher
    attendance_count_by_teacher = Hash[
      teachers_attending.uniq.map do |teacher|
        [teacher, teachers_attending.count(teacher)]
      end
    ]

    # Return only teachers who attended all sessions
    attendance_count_by_teacher.select {|_, attendances| attendances == sessions.count}.keys
  end

  def local_summer?
    subject == SUBJECT_SUMMER_WORKSHOP
  end

  # return true if this is a CSP Workshop for Returning Teachers
  def csp_wfrt?
    subject == SUBJECT_CSP_FOR_RETURNING_TEACHERS
  end

  def teachercon?
    subject == SUBJECT_TEACHER_CON
  end

  def summer?
    local_summer? || teachercon?
  end

  def fit_weekend?
    [
      SUBJECT_CSP_FIT,
      SUBJECT_CSD_FIT,
      SUBJECT_CSF_FIT
    ].include?(subject)
  end

  def csf?
    course == COURSE_CSF
  end

  def csf_intro?
    course == Pd::Workshop::COURSE_CSF && subject == Pd::Workshop::SUBJECT_CSF_101
  end

  def csf_201?
    course == COURSE_CSF && subject == SUBJECT_CSF_201
  end

  def funded_csf?
    course == COURSE_CSF && funded
  end

  def future_or_current_teachercon_or_fit?
    [
      Pd::Workshop::SUBJECT_TEACHER_CON,
      Pd::Workshop::SUBJECT_FIT
    ].include?(subject) &&
      state != Pd::Workshop::STATE_ENDED
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

  # whether we will show the scholarship dropdown
  def scholarship_workshop?
    csf? || local_summer?
  end

  def pre_survey?
    # CSP for returning teachers does not have a pre-survey. Academic year workshops have multiple pre-survey options,
    # so we do not show any to teachers ourselves.
    return false if subject == SUBJECT_CSP_FOR_RETURNING_TEACHERS || ACADEMIC_YEAR_WORKSHOP_SUBJECTS.include?(subject)
    PRE_SURVEY_BY_COURSE.key? course
  end

  def pre_survey_course_name
    PRE_SURVEY_BY_COURSE[course].try(:[], :course_name)
  end

  def pre_survey_course
    return nil unless pre_survey?
    UnitGroup.find_by_name! pre_survey_course_name
  rescue ActiveRecord::RecordNotFound
    # Raise a RuntimeError if the course name is not found, so we'll be notified in Honeybadger
    # Otherwise the RecordNotFound error will result in a 404, and we won't know.
    raise "No course found for name #{pre_survey_course_name}"
  end

  # @return an array of tuples, each in the format:
  #   [unit_name, [lesson names]]
  # Units represent the localized titles for scripts in the Course
  # Lessons are the stage names for that script (unit) preceded by "Lesson n: "
  def pre_survey_units_and_lessons
    return nil unless pre_survey?
    pre_survey_course.default_scripts.map do |script|
      unit_name = script.title_for_display
      stage_names = script.lessons.where(lockable: false).pluck(:name)
      lesson_names = stage_names.each_with_index.map do |stage_name, i|
        "Lesson #{i + 1}: #{stage_name}"
      end
      [unit_name, lesson_names]
    end
  end

  # Users who could be re-assigned to be the organizer of this workshop
  # @return [ActiveRecord::Relation]
  def potential_organizers
    user_queries = []

    # workshop admins can become the organizer of any workshop
    organizer_roles = [UserPermission::WORKSHOP_ADMIN]

    if regional_partner_id
      # if there is a regional partner, only that partner's PMs can become the organizer
      user_queries << regional_partner_program_managers
    else
      # otherwise, any PM can become the organizer
      organizer_roles << UserPermission::PROGRAM_MANAGER
    end

    user_queries << User.joins(:permissions).merge(UserPermission.where(permission: organizer_roles))

    # any CSF facilitator can become the organizer of a CSF workshop
    if course == Pd::Workshop::COURSE_CSF
      user_queries << User.joins(:courses_as_facilitator).merge(Pd::CourseFacilitator.where(course: Pd::Workshop::COURSE_CSF))
    end

    # Combine multiple queries into single result set.
    user_queries.inject(:union)
  end

  def can_user_delete?(user)
    state != STATE_ENDED && Ability.new(user).can?(:destroy, self)
  end

  def last_valid_day
    last_day = sessions.size

    # If we don't have Jotform survey constants set up for this workshop,
    # return the session size to avoid erroring out in the next step.
    return last_day if VALID_DAYS[CATEGORY_MAP[subject]].nil?

    unless VALID_DAYS[CATEGORY_MAP[subject]].include?(last_day)
      last_day = VALID_DAYS[CATEGORY_MAP[subject]].last
    end

    last_day
  end

  def friday_institute?
    third_party_provider == 'friday_institute'
  end

  def user_attended?(user)
    attending_teachers.include?(user)
  end
end
