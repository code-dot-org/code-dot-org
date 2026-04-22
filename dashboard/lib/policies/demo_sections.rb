# frozen_string_literal: true

class Policies::DemoSections
  DEMO_TYPES = %i[high middle elementary].freeze

  DEMO_SECTION_PRESETS = {
    elementary: {
      section_name: 'Elementary School Practice Section',
      login_type: 'picture',
      participant_type: 'student',
      grades: %w[K 1 2 3 4 5],
      unit_name: 'k5-ai-data-2024',
      unit_display_name: 'AI and Data',
      unit_group_name: 'k5-ai-data-2024',
      unit_group_display_name: 'AI and Data',
      # Purple cat: COLORS[2] = Purple, EMOJIS[10] = 😺
      avatar_color: 2,
      avatar_emoji: 10,
      ai_chat_access_level: 'essential_only',
      ai_tutor_enabled: false,
    }.freeze,
    middle: {
      section_name: 'Middle School Practice Section',
      login_type: 'word',
      participant_type: 'student',
      grades: %w[6 7 8],
      unit_name: 'csd3-2024',
      unit_display_name: 'Interactive Animations and Games',
      unit_group_name: 'csd-2024',
      unit_group_display_name: 'CS Discoveries',
      # Pink fire: COLORS[1] = Pink, EMOJIS[0] = 🔥
      avatar_color: 1,
      avatar_emoji: 0,
      ai_chat_access_level: 'enabled',
      ai_tutor_enabled: true,
    }.freeze,
    high: {
      section_name: 'High School Practice Section',
      login_type: 'email',
      participant_type: 'student',
      grades: %w[9 10 11 12],
      unit_name: 'aif2-2025',
      unit_display_name: 'Artificial Intelligence Foundations',
      unit_group_name: 'artificial-intelligence-foundations-2025',
      unit_group_display_name: 'Artificial Intelligence Foundations',
      # Green robot: COLORS[8] = Green, EMOJIS[5] = 🤖
      avatar_color: 8,
      avatar_emoji: 5,
      ai_chat_access_level: 'enabled',
      ai_tutor_enabled: true,
    }.freeze,
  }.freeze

  def self.get_preset(demo_type)
    DEMO_SECTION_PRESETS[demo_type.to_sym]
  end

  def self.demo_student_ids(demo_type)
    ids = CDO.demo_student_ids
    (ids&.dig(demo_type.to_s) || []).map(&:to_i)
  end

  def self.preset_view(demo_type)
    preset = get_preset(demo_type)
    return nil unless preset

    unit = resolve_unit(preset[:unit_name])
    unit_group = resolve_unit_group(preset[:unit_group_name])

    {
      demo_type: demo_type.to_s,
      section_name: preset[:section_name],
      avatar_color: preset[:avatar_color],
      avatar_emoji: preset[:avatar_emoji],
      login_type: preset[:login_type],
      participant_type: preset[:participant_type],
      unit: build_unit_view(
        unit: unit,
        name: preset[:unit_name],
        display_name: preset[:unit_display_name]
      ),
      unit_group: build_unit_group_view(
        unit_group: unit_group,
        name: preset[:unit_group_name],
        display_name: preset[:unit_group_display_name]
      ),
    }
  end

  def self.preset_views_for_all_types
    DEMO_TYPES.each_with_object({}) do |demo_type, views|
      view = preset_view(demo_type)
      views[demo_type] = view if view
    end
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

  def self.resolve_unit(unit_name)
    return nil if unit_name.blank?

    Unit.get_from_cache(unit_name, raise_exceptions: false)
  end

  def self.resolve_unit_group(unit_group_name)
    return nil if unit_group_name.blank?

    UnitGroup.get_from_cache(unit_group_name)
  end

  def self.build_unit_view(unit:, name:, display_name:)
    return nil if name.blank?

    {
      name: name,
      display_name: unit&.localized_title || display_name,
    }
  end

  def self.build_unit_group_view(unit_group:, name:, display_name:)
    return nil if name.blank?

    {
      name: name,
      display_name: unit_group&.localized_title || display_name,
    }
  end

  private_class_method :resolve_unit, :resolve_unit_group,
    :build_unit_view, :build_unit_group_view
end
