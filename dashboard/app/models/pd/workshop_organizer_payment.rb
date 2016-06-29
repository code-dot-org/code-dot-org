class Pd::WorkshopOrganizerPayment

  PAYMENT_CSF_PER_QUALIFIED_TEACHER = 50

  PAYMENT_PER_TEACHER_PER_DAY = 40
  PAYMENT_PER_FACILITATOR_PER_DAY = 500
  PAYMENT_STAFFER_PER_DAY = 250
  PAYMENT_VENUE_SMALL_PER_DAY = 400
  PAYMENT_VENUE_LARGE_PER_DAY = 450
  VENUE_SIZE_TEACHER_THRESHOLD = 10
  PLP_URBAN_MULTIPLIER = 1.25

  PAYMENT_CA_PER_TEACHER_PER_DAY = 20
  PAYMENT_CA_VENUE_PER_DAY = 400
  PAYMENT_CA_STAFFER_PER_DAY = 250

  # Rules are matched in order from top to bottom on course and type, first one wins:
  #  - course: one or more from Pd::Workshop::COURSES
  #  - type: one or more from Pd::Workshop::TYPES
  #  - qualified: either bool or a lambda that returns a bool. If false,
  #               none of the remaining rule parts will be processed.
  #  - payment: a hash of the following payment parts:
  #    Each of the payment fields are optional and can either be
  #    a static payment amount or a lambda that returns an amount:
  #    - teacher
  #    - facilitator
  #    - staffer
  #    - venue
  PAYMENT_RULES = [
    {
      course: Pd::Workshop::COURSE_CSF,
      type: [
        Pd::Workshop::TYPE_PUBLIC,
        Pd::Workshop::TYPE_PRIVATE
      ],
      qualified: true,
      payment: {
        teacher: -> do
          # Teachers must complete > 10 puzzles to qualify
          num_teachers_qualified = @teachers.count do |teacher|
            UserLevel.where(user_id: teacher.id).passing.count > 10
          end

          PAYMENT_CSF_PER_QUALIFIED_TEACHER * num_teachers_qualified
        end
      }
    },
    {
      course: [
        Pd::Workshop::COURSE_CSP,
        Pd::Workshop::COURSE_ECS,
        Pd::Workshop::COURSE_CS_IN_A,
        Pd::Workshop::COURSE_CS_IN_S
      ],
      type: [
        Pd::Workshop::TYPE_PUBLIC,
        Pd::Workshop::TYPE_PRIVATE
      ],
      qualified: -> do
        @teachers.count > 0
      end,
      payment: {
        teacher: -> do
          PAYMENT_PER_TEACHER_PER_DAY * @teacher_days * @plp_multiplier
        end,
        facilitator: -> do
          PAYMENT_PER_FACILITATOR_PER_DAY * @workshop.facilitators.count * @workshop.sessions.count * @plp_multiplier
        end,
        staffer: -> do
          PAYMENT_STAFFER_PER_DAY * @workshop.sessions.count
        end,
        venue: -> do
          if @teachers.count > VENUE_SIZE_TEACHER_THRESHOLD
            PAYMENT_VENUE_LARGE_PER_DAY * @workshop.sessions.count * @plp_multiplier
          else
            PAYMENT_VENUE_SMALL_PER_DAY * @workshop.sessions.count * @plp_multiplier
          end
        end
      }
    },
    {
      course: [
        Pd::Workshop::COURSE_CS_IN_A,
        Pd::Workshop::COURSE_CS_IN_S
      ],
      type: Pd::Workshop::TYPE_DISTRICT,
      qualified: -> do
        @teachers.count > 0
      end,
      payment: {
        teacher: -> do
          PAYMENT_PER_TEACHER_PER_DAY * @teacher_days
        end,
        facilitator: -> do
          PAYMENT_PER_FACILITATOR_PER_DAY * @workshop.facilitators.count * @workshop.sessions.count
        end
      }
    },
    {
      course: [
        Pd::Workshop::COURSE_COUNSELOR,
        Pd::Workshop::COURSE_ADMIN
      ],
      type: [
        Pd::Workshop::TYPE_PUBLIC,
        Pd::Workshop::TYPE_PRIVATE
      ],
      qualified: -> do
        @teachers.count > 0
      end,
      payment: {
        teacher: -> do
          PAYMENT_CA_PER_TEACHER_PER_DAY * @teacher_days * @plp_multiplier
        end,
        staffer: -> do
          PAYMENT_CA_STAFFER_PER_DAY * @workshop.sessions.count * @plp_multiplier
        end,
        venue: -> do
          PAYMENT_CA_VENUE_PER_DAY * @workshop.sessions.count * @plp_multiplier
        end
      }
    }
  ].freeze

  attr_reader :qualified, :teachers, :teacher_days, :plp, :parts, :total

  def initialize(workshop)
    @workshop = workshop
    teacher_attendance_counts = Pd::Attendance.for_workshop(@workshop).group(:teacher_id).count
    @teachers = User.where(id: teacher_attendance_counts.keys).to_a
    @teacher_days = teacher_attendance_counts.values.reduce(&:+)
    @plp = ProfessionalLearningPartner.find_by_contact_id(workshop.organizer.id)

    @plp_multiplier = (@plp && @plp.urban?) ? PLP_URBAN_MULTIPLIER : 1
    @payment_rule = PAYMENT_RULES.find do |rule|
      [rule[:course]].flatten.include?(workshop.course) &&
        [rule[:type]].flatten.include?(workshop.workshop_type)
    end

    @qualified = @payment_rule ? evaluate(@payment_rule[:qualified], false) : false
    @parts = {}.tap do |pay|
      [:teacher, :facilitator, :staffer, :venue].each do |part_name|
        pay[part_name] = evaluate_payment_part part_name
      end
    end
    @total = @parts.values.reduce(&:+)
  end

  private

  def evaluate_payment_part(part_name)
    return 0 unless @qualified
    payment_part = @payment_rule[:payment][part_name]
    return 0 unless payment_part
    evaluate(payment_part)
  end

  def evaluate(rule_part, default = 0)
    return default unless rule_part
    if rule_part.respond_to?(:call)
      instance_exec &rule_part
    else
      rule_part
    end
  end
end
