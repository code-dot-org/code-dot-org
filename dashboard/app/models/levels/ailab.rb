# == Schema Information
#
# Table name: levels
#
#  id                    :integer          not null, primary key
#  game_id               :integer
#  name                  :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  level_num             :string(255)
#  ideal_level_source_id :bigint           unsigned
#  user_id               :integer
#  properties            :text(4294967295)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#  index_levels_on_type       (type)
#

class Ailab < Level
  serialized_attrs %w(
    start_sources
    hide_share_and_remix
    is_project_level
    mode
    dynamic_instructions
    uses_lab2
  )

  DATASETS_MANIFEST_PATH = frontend_dir('packages', 'labs', 'ailab', 'public', 'datasets-manifest.json')
  LAB2_INSTRUCTIONS_PATH = frontend_dir('packages', 'labs', 'ailab', 'public', 'lab2-instructions.json')

  REQUIRE_ACCURACY_RANGE = (0..100)

  validate :validate_lab2_mode

  # Lab 2 levels generate their long instructions, so a stored value would only go stale.
  before_save {properties.delete('long_instructions') if uses_lab2?}

  def self.dataset_ids
    @dataset_ids ||= JSON.parse(File.read(DATASETS_MANIFEST_PATH))['datasets'].pluck('id')
  end

  def self.lab2_instructions
    @lab2_instructions ||= JSON.parse(File.read(LAB2_INSTRUCTIONS_PATH))
  end

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.ailab,
        level_num: 'custom',
        properties: {}
      )
    )
  end

  def localized_dynamic_instructions
    default_value = JSONValue.value(properties['dynamic_instructions'].presence)
    return default_value if default_value.nil?

    parsed_default_value = JSON.parse(default_value)
    parsed_default_value.each_key do |prop|
      parsed_default_value[prop] = I18n.t(
        prop,
        scope: [:data, 'dynamic_instructions', name],
        default: parsed_default_value[prop],
        smart: true
      )
    end

    JSON.dump(parsed_default_value)
  end

  # Markdown of every screen's instructions, for readers who never see the screens.
  # Always use this method for lab2 AI Lab levels rather than calling properties['long_instructions'] directly.
  def generated_long_instructions
    return nil unless uses_lab2?

    authored = authored_dynamic_instructions
    items = self.class.lab2_instructions.map do |screen|
      text = authored[screen['key']]
      text = screen['defaultText'] unless text.is_a?(String) && text.present?
      # Indenting continuation lines keeps multi-line text inside its list item.
      "- _The instructions for the **#{screen['name']}** screen say:_ #{text.gsub("\n", "\n  ")}"
    end
    "This level has dynamic instructions that change as you interact with AI Lab.\n\n#{items.join("\n\n")}"
  end

  def summarize_for_lesson_show(can_view_teacher_markdown)
    summary = super
    summary[:longInstructions] = generated_long_instructions if uses_lab2?
    summary
  end

  def summary_for_lesson_plans(unit_group_unit: nil)
    summary = super
    summary['long_instructions'] = generated_long_instructions if uses_lab2?
    summary
  end

  def get_localized_property(property_name)
    default_value = JSONValue.value(properties[property_name].presence)
    return default_value if default_value.nil? || !should_localize?

    # Translate supported properties
    return localized_dynamic_instructions if property_name == 'dynamic_instructions'

    # Return default value if property is not supported
    default_value
  end

  # Return an 'appOptions' hash derived from the level contents
  def non_blockly_puzzle_level_options
    options = Rails.cache.fetch("#{cache_key}/#{I18n.locale}/non_blockly_puzzle_level_options/v2") do
      level_prop = {}

      properties.each_key do |dashboard|
        apps_prop_name = dashboard.camelize(:lower)
        # Select value from properties json
        # Don't override existing valid (non-nil/empty) values
        value = get_localized_property(dashboard)
        level_prop[apps_prop_name] = value unless value.nil? # make sure we convert false
      end

      level_prop['levelId'] = level_num

      # We don't want this to be cached (as we only want it to be seen by authorized teachers), so
      # set it to nil here and let other code put it in app_options
      level_prop['teacherMarkdown'] = nil

      # Don't set nil values
      level_prop.compact!
    end
    options.freeze
  end

  def uses_lab2?
    JSONValue.value(uses_lab2) == true
  end

  def get_validations
    return nil unless uses_lab2?

    minimum = lab2_mode['requireAccuracy']
    return nil unless minimum.is_a?(Numeric) && minimum.positive?

    [
      {
        'key' => 'accuracy_met',
        'conditions' => [{'name' => 'ACCURACY_AT_LEAST', 'value' => minimum}],
        'message' => '',
        'next' => true,
      },
      {
        'key' => 'accuracy_unmet',
        'conditions' => [],
        'message' => "Train a model with at least #{minimum}% accuracy to continue.",
        'next' => false,
      },
    ]
  end

  # Attributes that are stored as JSON strings but should be passed through to the app as
  # actual JSON objects.  You can list attributes in snake_case here for consistency, but this method
  # returns camelCase properties because of where it's used in the pipeline.
  def self.json_object_attrs
    %w(
      mode
      dynamic_instructions
    ).map {|x| x.camelize(:lower)}
  end

  # Checks the raw value first, since localized_dynamic_instructions raises on anything but a JSON object.
  private def authored_dynamic_instructions
    parsed = begin
      JSON.parse(dynamic_instructions.presence || '{}')
    rescue JSON::ParserError
      nil
    end
    return {} unless parsed.is_a?(Hash)

    JSON.parse(localized_dynamic_instructions || '{}')
  end

  private def lab2_mode
    parsed_mode = begin
      JSON.parse(mode.presence || '{}')
    rescue JSON::ParserError
      nil
    end
    parsed_mode.is_a?(Hash) ? parsed_mode : {}
  end

  private def validate_lab2_mode
    return unless JSONValue.value(uses_lab2) == true

    parsed_mode = lab2_mode

    # The Lab 2 AI Lab currently requires exactly 1 dataset.
    datasets = parsed_mode['datasets']
    unless datasets.is_a?(Array) && datasets.length == 1 && self.class.dataset_ids.include?(datasets.first)
      errors.add(:mode, 'must select exactly one dataset.')
    end

    if parsed_mode.key?('requireAccuracy')
      accuracy = parsed_mode['requireAccuracy']
      unless accuracy.is_a?(Numeric) && REQUIRE_ACCURACY_RANGE.cover?(accuracy)
        errors.add(:mode, 'must have a required accuracy from 0 to 100.')
      end
    end
  end
end
