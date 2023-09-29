module Pd::FacilitatorSpecificForm
  extend ActiveSupport::Concern
  include Pd::Form

  module ClassMethods
    def facilitator_required_fields
      []
    end
  end

  def get_facilitator_names
    []
  end

  def validate_required_fields
    hash = sanitized_form_data_hash

    if get_facilitator_names.any? && !hash.key?(:who_facilitated)
      add_key_error(:who_facilitated)
    end

    # validate facilitator required fields
    each_facilitator_field do |facilitator, field, field_name|
      add_key_error(field_name) unless hash.try(:[], field).try(:[], facilitator)
    end

    super
  end

  def validate_options
    hash = sanitized_form_data_hash

    facilitator_names = get_facilitator_names
    if hash[:who_facilitated] && facilitator_names.any?
      hash[:who_facilitated].each do |facilitator|
        add_key_error(:who_facilitated) unless facilitator_names.include? facilitator
      end
    end

    super
  end

  # Simple helper that iterates over each facilitator as reported by the user
  # and each facilitator-specific field and yields a block with the facilitator,
  # the field, and the combined field name we expect in the flattened version of
  # our hash. Supports either rails-style keys (underscored symbols) or
  # JSON-style keys (camelCased strings)
  def each_facilitator_field(hash = nil, camel = false)
    hash ||= camel ? form_data_hash : sanitized_form_data_hash

    facilitators = hash.try(:[], camel ? 'whoFacilitated' : :who_facilitated) || []

    # validate facilitator required fields
    facilitators.each do |facilitator|
      self.class.facilitator_required_fields.each do |field|
        field = field.to_s.camelize(:lower) if camel
        field_name = "#{field}[#{facilitator}]"
        field_name = field_name.to_sym unless camel
        yield(facilitator, field, field_name)
      end
    end
  end

  # inflate all the facilitator-specific fields (stored as flattened keys) into
  # nested hashes before saving
  #
  # Before:
  #   {
  #     "howClearlyPresented[facilitatorOne@code.org]" => "Clearly",
  #     "howClearlyPresented[facilitatorTwo@code.org]" => "Quite clearly",
  #   }
  #
  # After:
  #   {
  #     "howClearlyPresented" => {
  #       "facilitatorOne@code.org" => "Clearly",
  #       "facilitatorTwo@code.org" => "Quite clearly",
  #     }
  #   }
  def form_data_hash=(hash)
    hash = hash.dup

    each_facilitator_field(hash, true) do |facilitator, field, field_name|
      next unless hash[field_name]

      hash[field] ||= {}
      hash[field][facilitator] = hash.delete(field_name)
    end

    super(hash)
  end

  # Get a summary of the form data hash specific to a facilitator
  # This is used to make the hash a flat hash that only has survey responses relevant for
  # a facilitator. So if the initial survey was something like
  #
  # {
  #   'q1': 'a1',
  #   'q2': {
  #     'f1': 'f1 answer',
  #     'f2': 'f2 answer'
  #   }
  # }
  #
  # generate_summary_for_facilitator(f1) would return
  # {
  #   'q1': 'a1',
  #   'q2': 'f1 answer'
  # }
  def generate_summary_for_facilitator(facilitator_name)
    hash = public_sanitized_form_data_hash.dup

    hash.each do |k, v|
      if v.is_a? Hash
        hash[k] = v.key?(facilitator_name) ? v[facilitator_name] : ''
      end
    end
  end
end
