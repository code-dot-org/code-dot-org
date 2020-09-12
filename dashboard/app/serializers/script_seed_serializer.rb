module ScriptSeed
  class ScriptLevelSerializer < ActiveModel::Serializer
    attributes(
      :level_names, :lesson_key, :lesson_group_key, :script_name, # Uniquely identifying key
      # Other attributes
      :chapter,
      :position,
      :assessment,
      :properties,
      :named_level,
      :bonus
    )

    def level_names
      # TODO: this creates a ton of queries. Can be greatly improved with a refactor to query for all levels at once.
      # Or maybe we can just use a join
      object.levels.map(&:name)
    end

    def lesson_key
      object.lesson.key
    end

    def lesson_group_key
      object.lesson.lesson_group.key
    end

    def script_name
      object.script.name
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
      object.lesson_group.key
    end

    def script_name
      object.script.name
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
      object.script.name
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
