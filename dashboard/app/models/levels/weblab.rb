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
#

class Weblab < Level
  before_save :fix_examples

  serialized_attrs %w(
    project_template_level_name
    start_sources
    hide_share_and_remix
    is_project_level
    encrypted_examples
    submittable
    validation_enabled
  )

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.weblab,
        level_num: 'custom',
        properties: {},
        validation_enabled: true
      )
    )
  end

  # Return an 'appOptions' hash derived from the level contents
  def non_blockly_puzzle_level_options
    options = Rails.cache.fetch("#{cache_key}/#{I18n.locale}/non_blockly_puzzle_level_options/v2") do
      level_prop = {}

      properties.keys.each do |dashboard|
        # Select value from properties json
        value = JSONValue.value(properties[dashboard].presence)
        apps_prop_name = dashboard.camelize(:lower)
        # Don't override existing valid (non-nil/empty) values
        level_prop[apps_prop_name] = value unless value.nil? # make sure we convert false
      end

      # FND-985 Create shared API to get localized level properties.
      if should_localize?
        localized_long_instructions = I18n.t(name, scope: [:data, 'long_instructions'], default: level_prop['longInstructions'])
        level_prop['longInstructions'] = localized_long_instructions
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

  def fix_examples
    # remove nil and empty strings from examples
    return if examples.nil?
    self.examples = examples.select(&:present?)
  end

  def age_13_required?
    true
  end
end
