# Base class for Pd::Workshop payment. It calculates workshop duration, attendance numbers,
# and other general fields relevant to payment.
#
# This class is immutable. Calculations are done in the constructor.
# Once initialized, it reports payment data via read-only attributes and methods.
class Pd::Payment::BasePay
  DATE_FORMAT = '%m/%d/%Y'

  attr_reader :workshop, :num_days, :pay_period, :num_qualified_teachers,
    :plp, :section_url, :workshop_url

  # Array of actual attendance count per session. This does not take into account min attendance or max sessions.
  attr_reader :attendance_count_per_session

  # Hash of teacher_id => actual days or hours attended.
  attr_reader :raw_attendance_days_per_teacher, :raw_attendance_hours_per_teacher

  # Hash of teacher_id => days or hours attended, taking into account min attendance and max days/hours.
  attr_reader :adjusted_attendance_days_per_teacher, :adjusted_attendance_hours_per_teacher

  # Total adjusted days attended by all qualified teachers (one per teacher per day)
  attr_reader :total_teacher_attendance_days

  # payment: Hash of payment parts (e.g. :food) to their dollar amounts.
  # payment_total: sum of all payment parts.
  attr_reader :payment, :payment_total

  def initialize(workshop)
    raise 'Workshop required.' unless workshop
    raise 'Workshop must be ended.' unless workshop.ended_at
    @workshop = workshop

    @pay_period = get_pay_period
    @num_days = @workshop.effective_num_days
    @num_hours = @workshop.effective_num_hours

    @raw_attendance_days_per_teacher = Hash.new(0)
    @raw_attendance_hours_per_teacher = Hash.new(0)
    @attendance_count_per_session = []
    @adjusted_attendance_days_per_teacher = {}
    @adjusted_attendance_hours_per_teacher = {}
    calculate_raw_attendance
    calculate_adjusted_attendance

    @num_qualified_teachers = @adjusted_attendance_days_per_teacher.count
    @total_teacher_attendance_days = @adjusted_attendance_days_per_teacher.values.reduce(0, :+)

    @plp = ProfessionalLearningPartner.find_by_contact_id @workshop.organizer.id
    @section_url = CDO.code_org_url("/teacher-dashboard#/sections/#{workshop.section.id}", 'http:')
    @workshop_url = CDO.studio_url("pd/workshop_dashboard/workshops/#{workshop.id}", 'http:')

    @payment = calculate_payment
    @payment_total = @payment.values.reduce(0, :+)
  end

  def adjusted_attending_teacher_ids
    @adjusted_attendance_days_per_teacher.select{|_, days| days > 0}
  end

  # Override to supply a different payment type.
  # Default is either "PLP Urban" or "PLP Non-urban" for workshops organized by a PLP,
  # otherwise nil.
  def payment_type
    return nil unless @plp
    @plp.urban? ? 'PLP Urban' : 'PLP Non-urban'
  end

  # Override in derived classes to apply workshop qualification rules.
  # Default is qualified when at least one teacher attended.
  def qualified?
    @total_teacher_attendance_days > 0
  end

  def num_teachers
    @raw_attendance_days_per_teacher.count
  end

  protected

  # Override in derived classes to apply teacher qualification rules.
  # Return true/false for a given teacher_id, whether the teacher is qualified.
  def teacher_qualified?(_teacher_id)
    true
  end

  # Override in derived classes. Return a hash of payment parts (e.g. :food) to their values.
  # All other fields are already assigned and accessible when this is called.
  def calculate_payment
    {}
  end

  # Calculates raw attendance.
  # Sets the following member variables:
  #   @attendance_count_per_session - array of raw attendance count (number of teachers) per session.
  #   @raw_attendance_days_per_teacher - hash of teacher_id to the raw number of days attended.
  #   @raw_attendance_hours_per_teacher - hash of teacher_id to the raw number of hours attended.
  # Derived classes that override this method should provide values for all of the above members.
  def calculate_raw_attendance
    # Hash of {teacher_id: num_days_attended}
    @workshop.sessions.find_each do |session|
      attendances = Pd::Attendance.where(pd_session_id: session.id)
      attendances.find_each do |attendance|
        @raw_attendance_days_per_teacher[attendance.teacher_id] += 1
        @raw_attendance_hours_per_teacher[attendance.teacher_id] += session.hours
      end
      @attendance_count_per_session << attendances.count
    end
  end

  # Calculates adjusted attendance, after applying min / max attendance and qualification rules
  # Filters out unqualified teachers, and those with 0 attendance, then
  # sets the following member variables:
  #   @adjusted_attendance_days_per_teacher - Hash of teacher_id to the adjusted number of days attended.
  #   @adjusted_attendance_hours_per_teacher - Hash of teacher_id to the adjusted number of hours attended.
  #                                           Unqualified teachers, and those with 0 attendance will be filtered out.
  def calculate_adjusted_attendance
    min_attendance_days = @workshop.min_attendance_days

    # Require min attendance, filter out unqualified teachers, and apply caps (via @num_days & @num_hours).
    @raw_attendance_days_per_teacher.each do |teacher_id, raw_attendance_days|
      adjusted_days = raw_attendance_days < min_attendance_days ? 0 : [raw_attendance_days, @num_days].min
      next unless adjusted_days > 0 && teacher_qualified?(teacher_id)

      @adjusted_attendance_days_per_teacher[teacher_id] = adjusted_days
      adjusted_hours = [@raw_attendance_hours_per_teacher[teacher_id], @num_hours].min
      @adjusted_attendance_hours_per_teacher[teacher_id] = adjusted_hours
    end
  end

  private

  def get_pay_period
    date = @workshop.ended_at

    if date.day <= 15
      d_start = Date.new(date.year, date.month, 1)
      d_end = Date.new(date.year, date.month, 15)
    else
      d_start = Date.new(date.year, date.month, 16)
      d_end = Date.new(date.year, date.month, -1)
    end

    "#{d_start.strftime(DATE_FORMAT)} - #{d_end.strftime(DATE_FORMAT)}"
  end
end
