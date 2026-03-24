# frozen_string_literal: true

class Policies::DemoSections
  DEMO_SECTION_TYPES = {
    aif: {
      section_name: 'AI Foundations Demo',
      login_type: 'word',
      participant_type: 'student',
      grades: ['9', '10', '11', '12'],
      unit_name: 'aif2-2025',
      unit_group_name: 'artificial-intelligence-foundations-2025',
    },
    csd: {
      section_name: 'CS Discoveries Demo',
      login_type: 'word',
      participant_type: 'student',
      grades: ['6', '7', '8'],
      unit_name: 'csd1-2024',
      unit_group_name: 'csd-2024',
    },
  }.freeze

  DEMO_STUDENT_IDS = {
    production: {
      aif: [],
      csd: [],
    },
    staging: {
      aif: [],
      csd: [],
    },
    adhoc: {
      aif: [2, 3],
      csd: [4, 5],
    },
  }.freeze

  # In development, demo student IDs are read from locals.yml. Example:
  #   demo_student_ids:
  #     aif:
  #       - 1066
  #       - 1067
  #     csd:
  #       - 1068

  def self.get(demo_type:)
    config = DEMO_SECTION_TYPES[demo_type.to_sym]
    return nil unless config
    OpenStruct.new(config.merge(demo_student_ids: demo_student_ids(demo_type)))
  end

  def self.demo_student_ids(demo_type)
    env = CDO.rack_env&.to_sym || :development
    if env == :development
      ids = CDO.demo_student_ids
      return (ids&.dig(demo_type.to_s) || []).map(&:to_i)
    end
    DEMO_STUDENT_IDS.dig(env, demo_type.to_sym) || []
  end

  def self.all_demo_student_ids
    all_types.flat_map {|type| demo_student_ids(type)}.uniq
  end

  def self.demo_student?(user_id)
    all_demo_student_ids.include?(user_id.to_i)
  end

  def self.valid_type?(demo_type)
    DEMO_SECTION_TYPES.key?(demo_type.to_sym)
  end

  def self.all_types
    DEMO_SECTION_TYPES.keys
  end
end
