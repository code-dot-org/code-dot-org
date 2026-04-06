# frozen_string_literal: true

class Policies::DemoSections
  DEMO_TYPES = %i[aif csd].freeze

  def self.demo_student_ids(demo_type)
    ids = CDO.demo_student_ids
    (ids&.dig(demo_type.to_s) || []).map(&:to_i)
  end

  def self.all_demo_student_ids
    DEMO_TYPES.flat_map {|type| demo_student_ids(type)}.uniq
  end

  def self.demo_student?(user_id)
    all_demo_student_ids.include?(user_id.to_i)
  end
end
