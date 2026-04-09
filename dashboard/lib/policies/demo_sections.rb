# frozen_string_literal: true

class Policies::DemoSections
  DEMO_TYPES = %i[aif csd csf].freeze

  DEMO_SECTION_PRESETS = {
    aif: {
      section_name: 'My first AIF section',
      login_type: 'email',
      participant_type: 'student',
      grades: ['9', '10'],
      unit_name: 'aif2-2025',
      unit_group_name: 'artificial-intelligence-foundations-2025',
    }.freeze,
    csd: {
      section_name: 'My first CSD section',
      login_type: 'word',
      participant_type: 'student',
      grades: ['7', '8'],
      unit_name: 'csd1-2024',
      unit_group_name: 'csd-2024',
    }.freeze,
    csf: {
      section_name: 'My first CSF section',
      login_type: 'picture',
      participant_type: 'student',
      grades: ['3', '4'],
      unit_name: 'coursed-2024',
      unit_group_name: 'coursed-2024',
    }.freeze,
  }.freeze

  def self.get_preset(demo_type)
    DEMO_SECTION_PRESETS[demo_type.to_sym]
  end

  def self.demo_student_ids(demo_type)
    ids = CDO.demo_student_ids
    (ids&.dig(demo_type.to_s) || []).map(&:to_i)
  end

  def self.all_demo_student_ids
    @all_demo_student_ids ||= DEMO_TYPES.flat_map {|type| demo_student_ids(type)}.to_set
  end

  def self.demo_student?(user_id)
    all_demo_student_ids.include?(user_id.to_i)
  end

  def self.reset_cache!
    @all_demo_student_ids = nil
  end
end
