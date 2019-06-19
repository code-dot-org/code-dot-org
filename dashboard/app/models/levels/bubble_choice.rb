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
#  ideal_level_source_id :integer
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
    title
    description
  )

  def dsl_default
    <<ruby
name 'unique level name here'
title 'level title here'
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

  # Summarizes the level.
  # @param [ScriptLevel] script_level. Optional. If provided, the URLs for sublevels,
  # previous/next levels, and script will be included in the summary.
  # @return [Hash]
  def summarize(script_level: nil)
    summary = {
      title: title,
      description: description,
      sublevels: summarize_sublevels(script_level: script_level)
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
  # @return [Hash[]]
  def summarize_sublevels(script_level: nil)
    summary = []
    sublevels.each_with_index do |level, index|
      level_info = {
        id: level.id,
        title: level.display_name || level.name,
        thumbnail_url: level.try(:thumbnail_url)
      }

      if script_level
        level_info[:url] = build_script_level_url(script_level, {sublevel_position: index + 1})
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
end
