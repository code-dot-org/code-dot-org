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
#  properties            :text(16777215)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#  index_levels_on_name     (name)
#

class Ailab < Level
  serialized_attrs %w(
    project_template_level_name
    start_sources
    hide_share_and_remix
    is_project_level
    submittable
    mode
    dynamic_instructions
  )

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

  # Return an 'appOptions' hash derived from the level contents
  def non_blockly_puzzle_level_options
    options = Rails.cache.fetch("#{cache_key}/non_blockly_puzzle_level_options/v2") do
      level_prop = {}

      properties.keys.each do |dashboard|
        apps_prop_name = dashboard.camelize(:lower)
        # Select value from properties json
        # Don't override existing valid (non-nil/empty) values
        value = JSONValue.value(properties[dashboard].presence)
        level_prop[apps_prop_name] = value unless value.nil? # make sure we convert false
      end

      level_prop['levelId'] = level_num

      # We don't want this to be cached (as we only want it to be seen by authorized teachers), so
      # set it to nil here and let other code put it in app_options
      level_prop['teacherMarkdown'] = nil

      # Don't set nil values
      level_prop.reject! {|_, value| value.nil?}
    end
    options.freeze
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
end
