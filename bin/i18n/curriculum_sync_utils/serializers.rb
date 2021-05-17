module CurriculumSyncUtils
  class CrowdinCollectionSerializer < ActiveModel::Serializer::CollectionSerializer
    # TODO: finish comment
    # Default CollectionSerializer behavior is to return an array of hashes,
    # where each hash is a single result. We would instead like to return a
    # hash.
    def serializable_hash(adapter_options, options, adapter_instance)
      return super.reduce({}) do |results, result|
        raise KeyEror.new("Serializer must define :crowdin_key for curriculum content I18N serialization; got #{result.keys.inspect}") unless result.key?(:crowdin_key)
        crowdin_key = result.delete(:crowdin_key)
        results[crowdin_key] = result unless result.empty?
        results
      end
    end
  end

  class I18nSerializer < ActiveModel::Serializer
    config.collection_serializer = CrowdinCollectionSerializer
    config.adapter = :json

    def serializable_hash(adapter_options = nil, options = {}, adapter_instance = self.class.serialization_adapter_instance)
      options[:include_directive] ||= JSONAPI::IncludeDirective.new('**', allow_wildcard: true)
      super.compact
    end

    attribute :crowdin_key
    def crowdin_key
      object.try(:key) || object.id
    end
  end

  class LessonGroupI18nSerializer < I18nSerializer
    attribute :display_name
  end

  class ActivitySectionI18nSerializer < I18nSerializer
    attributes :name, :description, :tips, :progression_name

    def tips
      object.tips&.map {|tip| tip['markdown']}
    end
  end

  class LessonActivityI18nSerializer < I18nSerializer
    attribute :name

    has_many :activity_sections, serializer: CurriculumSyncUtils::ActivitySectionI18nSerializer
  end

  class ResourceI18nSerializer < I18nSerializer
    attribute :name

    def crowdin_key
      object.url
    end
  end

  class VocabularyI18nSerializer < I18nSerializer
    attributes :word, :definition
  end

  class ObjectiveI18nSerializer < I18nSerializer
    attribute :description
  end

  class LessonI18nSerializer < I18nSerializer
    attributes(
      :name,
      :overview,
      :preparation,
      :purpose,
      :student_overview,
    )

    has_many :lesson_activities, serializer: CurriculumSyncUtils::LessonActivityI18nSerializer
    has_many :objectives, serializer: CurriculumSyncUtils::ObjectiveI18nSerializer
    has_many :resources, serializer: CurriculumSyncUtils::ResourceI18nSerializer
    has_many :vocabularies, serializer: CurriculumSyncUtils::VocabularyI18nSerializer

    def crowdin_key
      Rails.application.routes.url_helpers.script_lesson_url(object.script, object)
    end
  end

  class ScriptI18nSerializer < I18nSerializer
    has_many :lesson_groups, serializer: CurriculumSyncUtils::LessonGroupI18nSerializer
    has_many :lessons, serializer: CurriculumSyncUtils::LessonI18nSerializer
    has_many :resources, serializer: CurriculumSyncUtils::ResourceI18nSerializer
    has_many :student_resources, serializer: CurriculumSyncUtils::ResourceI18nSerializer

    def crowdin_key
      Rails.application.routes.url_helpers.script_url(object)
    end
  end
end
