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
#  ideal_level_source_id :integer          unsigned
#  user_id               :integer
#  properties            :text(65535)
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
      name 'unique level name here'
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
  # a sublevel URL (/s/:script_name/stage/:stage_pos/puzzle/:puzzle_pos/sublevel/:sublevel_pos).
  # @param [Level] sublevel
  # @return [Integer] The sublevel's position (i.e., its index + 1) under the parent level.
  def sublevel_position(sublevel)
    i = sublevels.index(sublevel)
    i.present? ? i + 1 : nil
  end

  # Summarizes the level.
  # @param [ScriptLevel] script_level. Optional. If provided, the URLs for sublevels,
  # previous/next levels, and script will be included in the summary.
  # @param [Integer] user_id. Optional. If provided, the "perfect" field will be calculated
  # in the sublevel summary.
  # @return [Hash]
  def summarize(script_level: nil, user_id: nil)
    summary = {
      display_name: display_name,
      description: description,
      name: name,
      type: type,
      teacher_markdown: teacher_markdown,
      sublevels: summarize_sublevels(script_level: script_level, user_id: user_id)
    }

    if script_level
      previous_level_url = script_level.previous_level ? build_script_level_url(script_level.previous_level) : nil
      next_level_url = script_level.next_level ? build_script_level_url(script_level.next_level) : nil

      summary.merge!(
        {
          previous_level_url: previous_level_url,
          next_level_url: next_level_url,
          script_url: script_url(script_level.script)
        }
      )
    end

    summary
  end

  # Summarizes the level's sublevels.
  # @param [ScriptLevel] script_level. Optional. If provided, the URLs for sublevels
  # will be included in the summary.
  # @param [Integer] user_id. Optional. If provided, "perfect" field will be calculated for sublevels.
  # @return [Hash[]]
  def summarize_sublevels(script_level: nil, user_id: nil)
    summary = []
    sublevels.each_with_index do |level, index|
      level_info = level.summary_for_lesson_plans

      alphabet = ('a'..'z').to_a

      level_info.merge!(
        {
          id: level.id,
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
        level_info[:perfect] = UserLevel.find_by(level: level, user_id: user_id)&.perfect?
        level_info[:status] = level_info[:perfect] ? SharedConstants::LEVEL_STATUS.perfect : SharedConstants::LEVEL_STATUS.not_tried
      end

      summary << level_info
    end

    summary
  end

  # Returns the sublevel id for a user that has the highest best_result.
  # @param [User]
  # @return [Integer]
  def best_result_sublevel(user)
    ul = user.user_levels.where(level: sublevels).max_by(&:best_result)
    ul&.level
  end

  # Returns an array of BubbleChoice parent levels for any given sublevel name.
  # @param [String] level_name. The name of the sublevel.
  # @return [Array<BubbleChoice>] The BubbleChoice parent level(s) of the given sublevel.
  def self.parent_levels(level_name)
    where("properties -> '$.sublevels' LIKE ?", "%\"#{level_name}\"%")
  end
end
