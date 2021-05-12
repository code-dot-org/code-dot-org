module CurriculumSyncUtils
  class ActivitySectionSerializer < ActiveModel::Serializer
    attributes :name, :description, :tips, :progression_name, :crowdin_key

    def crowdin_key
      "#{object.key} | #{Rails.application.routes.url_helpers.script_lesson_url(object.lesson.script, object.lesson)}"
    end

    def tips
      object.tips&.map {|tip| tip['markdown']}
    end
  end

  class VocabularySerializer < ActiveModel::Serializer
    attributes :word, :definition, :crowdin_key

    def crowdin_key
      object.key
      #lesson_urls = object.lessons.map do |lesson|
      #  Rails.application.routes.url_helpers.script_lesson_url(lesson.script, lesson)
      #end
      #([object.key] + lesson_urls).join(" | ")
    end
  end

  class LessonGroupSerializer < ActiveModel::Serializer
    attributes :display_name, :crowdin_key

    def crowdin_key
      object.key
    end
  end

  class LessonSerializer < ActiveModel::Serializer
    attributes(
      :crowdin_key,
      :name,
      :overview,
      :preparation,
      :purpose,
      :student_overview,
    )

    def crowdin_key
      object.key
    end
  end

  class LessonActivitySerializer < ActiveModel::Serializer
    attributes :name, :crowdin_key

    def crowdin_key
      object.key
    end
  end

  class ResourceSerializer < ActiveModel::Serializer
    attributes :name, :crowdin_key

    def crowdin_key
      [object.key, object.url].join(" | ")
    end
  end

  class VocabularySerializer < ActiveModel::Serializer
    attributes :crowdin_key, :word, :definition

    def crowdin_key
      object.key
    end
  end

  class ObjectiveSerializer < ActiveModel::Serializer
    attributes :description, :crowdin_key

    def crowdin_key
      object.key
    end
  end
end
