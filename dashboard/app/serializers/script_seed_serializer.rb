module ScriptSeed
  class ScriptLevelSerializer < ActiveModel::Serializer
    attributes(
      :chapter,
      :position,
      :assessment,
      :properties,
      :named_level,
      :bonus,
      :level_names
    )

    def level_names
      # TODO: this creates a ton of queries. Can be greatly improved with a refactor to query for all levels at once.
      object.levels.map(&:name)
    end
  end

  class LessonSerializer < ActiveModel::Serializer
    attributes(
      :name,
      :absolute_position,
      :lockable,
      :relative_position,
      :properties,
      :key,
      :script_levels
    )

    has_many :script_levels, serializer: ScriptSeed::ScriptLevelSerializer
  end

  class LessonGroupSerializer < ActiveModel::Serializer
    attributes(
      :key,
      :user_facing,
      :position,
      :properties
    )

    has_many :lessons, serializer: ScriptSeed::LessonSerializer
  end

  class ScriptSerializer < ActiveModel::Serializer
    attributes(
      :name,
      :wrapup_video_id,
      :hidden,
      :login_required,
      :properties,
      :new_name,
      :family_name
    )

    has_many :lesson_groups, serializer: ScriptSeed::LessonGroupSerializer
  end
end
