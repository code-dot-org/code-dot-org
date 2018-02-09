class Pd::TeacherApplicationEmailParams
  # Array of string tuples. Replace any of the first strings with the second in partner names.
  PARTNER_NAME_OVERRIDES = [
    ['Share Fair Nation', 'mindSpark Learning (formerly Share Fair Nation)']
  ].freeze

  attr_reader :teacher_application, :errors, :value_overrides, :rules

  def initialize(teacher_application, value_overrides = {})
    raise 'Teacher application required' unless teacher_application

    @teacher_application = teacher_application
    @errors = {}
    @value_overrides = value_overrides || {}

    @rules = get_rules
    apply_overrides @rules
  end

  def valid?
    !@errors.try(&:any?)
  end

  def labeled_rules
    @rules.select {|_, rule| rule.key?(:label)}
  end

  def to_final_params
    raise 'Must be valid before constructing final params. See errors' unless valid?

    rules.map do |key, value|
      if value.key?(:transform)
        value[:transform].call(key, value[:value])
      else
        [
          key,
          value[:value]
        ]
      end
    end.to_h
  end

  private

  # Construct a hash representing param rules for this email, based on the
  # teacher application and any supplied @value_overrides
  # @return [Hash] param rules, representing all required params for this teacher application email
  # Each entry is another Hash, which can have any of the following values:
  #   value: initial value, potentially overridden by @value_overrides
  #   label: label to display in the UI. Without a label, this does not appear in the UI
  #   options: list of available options to display in a select (dropdown)
  #   transform: function to transform the key & value into the final format
  #              (Note this may return a different key than the original,
  #              and only the new key will appear in the final params)
  #   validation: function to validate the value format. Return nil to succeed or an error string
  def get_rules
    email_format_validation = ->(email) {ValidatesEmailFormatOf.validate_email_format(email).try(&:first)}
    effective_partner_name = apply_partner_name_overrides @teacher_application.regional_partner_name
    rules = {
      decision: {label: 'Decision', options: []},
      name: {value: @teacher_application.teacher_name},
      email: {
        value: @teacher_application.primary_email,
        label: 'To',
        validation: email_format_validation
      },
      preferred_first_name_s: {value: @teacher_application.teacher_first_name},
      course_name_s: {value: @teacher_application.program_name},
      regional_partner_name_s: {value: effective_partner_name}
    }
    case @teacher_application.accepted_program.try(:teachercon?)
      when true
        rules[:decision][:options] << :accept_teachercon

        # TeacherCon string is in the format: 'dates : location'
        dates, location = @teacher_application.accepted_workshop.split(':').map(&:strip)
        rules[:teachercon_location_s] = {value: location}
        rules[:teachercon_dates_s] = {value: dates}
      when false
        rules[:decision][:options] << :accept_partner

        # Workshop string is in the format "Partner Name: dates"
        partner_name, dates = @teacher_application.accepted_workshop.split(':').map(&:strip)
        rules[:regional_partner_name_s][:value] = partner_name
        rules[:workshop_dates_s] = {value: dates}
        rules[:regional_partner_contact_person_s] = {label: 'Partner Contact'}
        rules[:regional_partner_contact_person_email_s] = {
          label: 'Partner Email',
          validation: email_format_validation
        }
        rules[:workshop_id_i] = {
          label: 'Workshop Id',
          validation: ->(workshop_id) {Pd::Workshop.exists?(workshop_id) ? nil : 'does not exist'},
          transform: ->(_, workshop_id) do
            [
              :workshop_registration_url_s,
              "https://studio.code.org/pd/workshops/#{workshop_id}/enroll"
            ]
          end
        }
      else # no program
        rules[:decision][:options] << :waitlist
        rules[:decision][:options] << "decline_#{@teacher_application.selected_course}".to_sym
        rules[:teacher_application_id_s] = {value: @teacher_application.id}
    end

    rules
  end

  # Apply @value_overrides to rules and run validations
  def apply_overrides(rules)
    @errors = {}

    @value_overrides.select {|_, value| value.present?}.each do |key, value|
      rule = rules[key.to_sym]
      next unless rule

      value = value.to_s
      rule[:value] = value
      if rule.key?(:options) && !rule[:options].map(&:to_s).include?(value)
        @errors[rule[:label]] = 'is not included in the options'
      end

      if rule.key? :validation
        validation_error = rule[:validation].call(value)
        @errors[rule[:label]] = validation_error if validation_error
      end
    end

    @rules.select {|_, rule| rule[:value].blank?}.each do |key, missing_param|
      @errors[missing_param[:label] || key] = 'is required'
    end

    rules
  end

  def apply_partner_name_overrides(partner_name)
    mutated_partner_name = partner_name.try(:dup) || ''
    PARTNER_NAME_OVERRIDES.each do |override|
      mutated_partner_name.gsub!(override[0], override[1])
    end
    mutated_partner_name
  end
end
