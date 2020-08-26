module ScriptLessons
  class LessonSerializer < ActiveModel::Serializer
    attributes :key, :properties
  end

  class LessonGroupSerializer < ActiveModel::Serializer
    attributes :key

    has_many :lessons, serializer: ScriptLessons::LessonSerializer
  end

  class ScriptSerializer < ActiveModel::Serializer
    attributes :name

    has_many :lesson_groups, serializer: ScriptLessons::LessonGroupSerializer
  end
end
