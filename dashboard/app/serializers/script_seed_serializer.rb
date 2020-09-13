require 'digest'

module ScriptSeed
  def self.lesson_from_scope(scope, script_level)
    lesson = scope[:lessons].select {|l| l.id == script_level.stage_id}.first
    raise "No lesson found. scope: #{scope}" unless lesson
    lesson
  end

  def self.lesson_group_from_scope(scope, script_level)
    lesson = lesson_from_scope(scope, script_level)
    lesson_group = scope[:lesson_groups].select {|lg| lg.id == lesson.lesson_group_id}.first
    raise "No lesson group found. scope: #{scope}" unless lesson_group
    lesson_group
  end

  def self.levels_from_scope(scope, script_level)
    my_levels_script_levels = scope[:levels_script_levels].select {|lsl| lsl.script_level_id == script_level.id}
    my_levels_script_levels.map do |lsl|
      # n^2, probably doesn't matter since it's in memory and not that much stuff
      level = scope[:levels].select {|l| l.id == lsl.level_id}.first
      raise "No level found. scope: #{scope}" unless level
      level
    end
  end

  class LevelsScriptLevelSerializer < ActiveModel::Serializer
    attributes(
      :level_key, :script_level_seeding_id
    )

    def level_key
      my_level = @scope[:levels].select {|l| l.id == object.level_id}.first
      raise "No level found. scope: #{scope}" unless my_level

      my_level.unique_key
    end

    def script_level_seeding_id
      my_script_level = @scope[:script_levels].select {|sl| sl.id == object.script_level_id}.first
      raise "No script level found. scope: #{scope}" unless my_script_level

      levels = ScriptSeed.levels_from_scope(@scope, my_script_level)
      lesson = ScriptSeed.lesson_from_scope(@scope, my_script_level)
      lesson_group = ScriptSeed.lesson_group_from_scope(@scope, my_script_level)

      ScriptLevel.generate_seeding_id(levels, lesson, lesson_group, @scope[:script])
    end
  end

  class ScriptLevelSerializer < ActiveModel::Serializer
    attributes(
      :level_names, :lesson_key, :lesson_group_key, :script_name, # Uniquely identifying key
      :seeding_id, # hash of the uniquely identifying key
      # Other attributes
      :chapter,
      :position,
      :assessment,
      :properties,
      :named_level,
      :bonus
    )

    def level_names
      ScriptSeed.levels_from_scope(@scope, object).map(&:unique_key)
    end

    def lesson_key
      ScriptSeed.lesson_from_scope(@scope, object).key
    end

    def lesson_group_key
      ScriptSeed.lesson_group_from_scope(@scope, object).key
    end

    def script_name
      @scope[:script_name]
    end

    def seeding_id
      levels = ScriptSeed.levels_from_scope(@scope, object)
      lesson = ScriptSeed.lesson_from_scope(@scope, object)
      lesson_group = ScriptSeed.lesson_group_from_scope(@scope, object)

      ScriptLevel.generate_seeding_id(levels, lesson, lesson_group, @scope[:script])
    end
  end

  class LessonSerializer < ActiveModel::Serializer
    attributes(
      :key, :lesson_group_key, :script_name, # Uniquely identifying key
      # Other attributes
      :name,
      :absolute_position,
      :lockable,
      :relative_position,
      :properties
    )

    def lesson_group_key
      lesson_group = @scope[:lesson_groups].select {|lg| lg.id == object.lesson_group_id}.first
      raise "No lesson group found. scope: #{scope}" unless lesson_group
      lesson_group.key
    end

    def script_name
      @scope[:script_name]
    end
  end

  class LessonGroupSerializer < ActiveModel::Serializer
    attributes(
      :key, :script_name, # Uniquely identifying key
      # Other attributes
      :user_facing,
      :position,
      :properties
    )

    def script_name
      @scope[:script_name]
    end
  end

  class ScriptSerializer < ActiveModel::Serializer
    attributes(
      :name, # Uniquely identifying key
      # Other attributes
      :wrapup_video_id,
      :hidden,
      :login_required,
      :properties,
      :new_name,
      :family_name
    )
  end
end
