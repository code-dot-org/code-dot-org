require 'digest'

module ScriptSeed
  class LevelsScriptLevelSerializer < ActiveModel::Serializer
    attributes(
      :seeding_key
    )

    def seeding_key
      object.seeding_key(@scope[:seed_context])
    end
  end

  class ScriptLevelSerializer < ActiveModel::Serializer
    attributes(
      :chapter,
      :position,
      :assessment,
      :properties,
      :named_level,
      :bonus,
      :seeding_key
    )

    def seeding_key
      object.seeding_key(@scope[:seed_context])
    end
  end

  class LessonSerializer < ActiveModel::Serializer
    attributes(
      :key,
      :name,
      :absolute_position,
      :lockable,
      :relative_position,
      :properties,
      :seeding_key
    )

    def seeding_key
      object.seeding_key(@scope[:seed_context])
    end
  end

  class LessonGroupSerializer < ActiveModel::Serializer
    attributes(
      :key,
      :user_facing,
      :position,
      :properties,
      :seeding_key
    )

    def seeding_key
      object.seeding_key(@scope[:seed_context])
    end
  end

  class ScriptSerializer < ActiveModel::Serializer
    attributes(
      :name,
      :wrapup_video_id,
      :hidden,
      :login_required,
      :properties,
      :new_name,
      :family_name,
      :seeding_key
    )

    def seeding_key
      object.seeding_key(@scope[:seed_context])
    end
  end
end
