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
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#

class BubbleChoice < DSLDefined
  include LevelsHelper
  include Rails.application.routes.url_helpers
  include SerializedProperties

  serialized_attrs %w(
    display_name
    description
  )

  def dsl_default
    <<~ruby
      name '#{DEFAULT_LEVEL_NAME}'
      display_name 'level display_name here'
      description 'level description here'

      sublevels
      level 'level1'
      level 'level2'
    ruby
  end

  # Returns all of the sublevels for this BubbleChoice level in order.
  def sublevels
    Level.where(name: properties['sublevels']).sort_by {|l| properties['sublevels'].index(l.name)}
  end

  def sublevel_at(index)
    sublevels[index]
  end

  # Returns a sublevel's position in the parent level. Can be used for generating
  # a sublevel URL (/s/:script_name/lessons/:lesson_pos/levels/:puzzle_pos/sublevel/:sublevel_pos).
  # @param [Level] sublevel
  # @return [Integer] The sublevel's position (i.e., its index + 1) under the parent level.
  def sublevel_position(sublevel)
    i = sublevels.index(sublevel)
    i.present? ? i + 1 : nil
  end

  # @override
  def all_child_levels
    sublevels
  end

  # Summarizes the level.
  # @param [ScriptLevel] script_level. Optional. If provided, the URLs for sublevels,
  # previous/next levels, and script will be included in the summary.
  # @param [User] user
  # @param [Boolean] should_localize If true, translate the summary.
  # @return [Hash]
  def summarize(script_level: nil, user: nil, should_localize: false)
    user_id = user ? user.id : nil
    summary = {
      id: id.to_s,
      display_name: display_name,
      description: description,
      name: name,
      type: type,
      teacher_markdown: teacher_markdown,
      sublevels: summarize_sublevels(script_level: script_level, user_id: user_id, should_localize: should_localize)
    }

    if script_level
      previous_level_url = script_level.previous_level ? build_script_level_url(script_level.previous_level) : nil
      redirect_url = script_level.next_level_or_redirect_path_for_user(user, nil, true)

      summary.merge!(
        {
          previous_level_url: previous_level_url,
          redirect_url: redirect_url,
          script_url: script_url(script_level.script)
        }
      )
    end

    if should_localize
      %i[display_name description].each do |property|
        localized_value = I18n.t(property, scope: [:data, :dsls, name], default: nil, smart: true)
        summary[property] = localized_value unless localized_value.nil?
      end
    end

    summary
  end

  # Summarizes the level's sublevels.
  # @param [ScriptLevel] script_level. Optional. If provided, the URLs for sublevels
  # will be included in the summary.
  # @param [Integer] user_id. Optional. If provided, "perfect" field will be calculated for sublevels.
  # @param [Boolean] should_localize If true, translate the summary.
  # @return [Array]
  def summarize_sublevels(script_level: nil, user_id: nil, should_localize: false)
    summary = []
    sublevels.each_with_index do |level, index|
      level_info = level.summary_for_lesson_plans.symbolize_keys

      alphabet = ('a'..'z').to_a

      level_info.merge!(
        {
          id: level.id.to_s,
          description: level.try(:bubble_choice_description),
          thumbnail_url: level.try(:thumbnail_url),
          position: index + 1,
          letter: alphabet[index],
          icon: level.try(:icon)
        }
      )

      # Make sure display name gets set even if we don't have the display_name property
      level_info[:display_name] = level.display_name || level.name

      level_info[:url] = script_level ?
        build_script_level_url(script_level, {sublevel_position: index + 1}) :
        level_url(level.id)

      if user_id
        level_info[:perfect] = UserLevel.find_by(
          level: level,
          script: script_level.try(:script),
          user_id: user_id
          )&.perfect?
        level_info[:status] = if level_info[:perfect]
                                SharedConstants::LEVEL_STATUS.perfect
                              else
                                SharedConstants::LEVEL_STATUS.not_tried
                              end
      else
        # Pass an empty status if the user is not logged in so the ProgressBubble
        # in the sublevel display can render correctly.
        level_info[:status] = SharedConstants::LEVEL_STATUS.not_tried
      end

      if should_localize
        %i[display_name short_instructions long_instructions].each do |property|
          localized_value = I18n.t(level.name, scope: [:data, property], default: nil, smart: true)
          level_info[property] = localized_value unless localized_value.nil?
        end
      end

      summary << level_info
    end

    summary
  end

  # Returns the sublevel for a user that has the highest best_result.
  # @param [User]
  # @return [Integer]
  def best_result_sublevel(user, script)
    ul = user.user_levels.where(level: sublevels, script: script).max_by(&:best_result)
    ul&.level
  end

  # Returns an array of BubbleChoice parent levels for any given sublevel name.
  # @param [String] level_name. The name of the sublevel.
  # @return [Array<BubbleChoice>] The BubbleChoice parent level(s) of the given sublevel.
  def self.parent_levels(level_name)
    where("properties -> '$.sublevels' LIKE ?", "%\"#{level_name}\"%")
  end

  def supports_markdown?
    true
  end

  def icon
    'fa fa-sitemap'
  end

  def clone_with_suffix(new_suffix, editor_experiment: nil)
    level = super(new_suffix, editor_experiment: editor_experiment)

    new_sublevel_names = sublevels.map do |sublevel|
      sublevel.clone_with_suffix(new_suffix, editor_experiment: editor_experiment).name
    end

    update_params = {
      properties: {
        sublevels: new_sublevel_names
      }
    }
    level.update!(update_params)
    level.rewrite_dsl_file(BubbleChoiceDSL.serialize(level))
    level
  end
end
