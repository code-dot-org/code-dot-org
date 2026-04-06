# frozen_string_literal: true

class Policies::DemoSections
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

  DEMO_TYPES = %i[aif csd].freeze

  def self.demo_student_ids(demo_type)
    env = CDO.rack_env&.to_sym || :development
    if env == :development
      ids = CDO.demo_student_ids
      return (ids&.dig(demo_type.to_s) || []).map(&:to_i)
    end
    DEMO_STUDENT_IDS.dig(env, demo_type.to_sym) || []
  end

  def self.all_demo_student_ids
    DEMO_TYPES.flat_map {|type| demo_student_ids(type)}.uniq
  end

  def self.demo_student?(user_id)
    all_demo_student_ids.include?(user_id.to_i)
  end
end
