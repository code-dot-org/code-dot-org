module Services::I18n::CurriculumSyncUtils
  module Serializers
    # Define a custom CollectionSerializer subclass, optimized for crowdin compatibility.
    class CrowdinCollectionSerializer < ActiveModel::Serializer::CollectionSerializer
      # @override
      def serializable_hash(adapter_options, options, adapter_instance)
        # Default CollectionSerializer behavior is to return an array of hashes,
        # where each hash is a single result. We would instead like to return a
        # single hash, keyed by `crowdin_key`.
        # For example:
        # {
        #   "lessons": [
        #     {
        #       "/s/express-2021/lessons/1/levels/2": {
        #         "short_instructions": "In this lesson you will be..."
        #       }
        #     },
        #     {
        #       "/s/express-2021/lessons/1/levels/3": {}
        #     }
        #   ]
        # }
        # becomes
        # {
        #   "lessons": {
        #     "/s/express-2021/lessons/1/levels/2": {
        #       "short_instructions": "In this lesson you will be..."
        #     },
        #     "/s/express-2021/lessons/1/levels/3": {}
        #   }
        # }
        super.reduce(:deep_merge)
      end
    end

    # Define a custom Serializer subclass, optimized for crowdin compatibility.
    class CrowdinSerializer < ActiveModel::Serializer
      config.collection_serializer = CrowdinCollectionSerializer
      config.adapter = :json

      # @override
      def serializable_hash(adapter_options = nil, options = {}, adapter_instance = self.class.serialization_adapter_instance)
        # include nested relationships of an arbitrary depth, rather than the
        # default of only a single level of nesting.
        options[:include_directive] ||= JSONAPI::IncludeDirective.new('**', allow_wildcard: true)
        # compact the result, excluding not only nil values but also empty ones
        result = super.compact_blank
        raise KeyEror.new("Serializer must define :crowdin_key for curriculum content I18N serialization; got #{result.keys.inspect}") unless result.key?(:crowdin_key)
        # We override the default serialization for single objects because we want the crowdin_key
        # moved outside the object. For example:
        # {
        #   "crowdin_key": "/s/express-2021/lessons/1/levels/2",
        #   "short_instructions": "In this lesson you will be..."
        # }
        # becomes
        # {
        #   "/s/express-2021/lessons/1/levels/2": {
        #     "short_instructions": "In this lesson you will be..."
        #   }
        # }
        # The reason we move the crowdin_key outside the object is so all the strings in the
        # object have the crowdin_key as part of their context. The crowdin_key is usually
        # something which makes it easier to identify where the string is used.
        crowdin_key = result.delete(:crowdin_key)
        {crowdin_key => result}
      end

      # Add a 'crowdin_key' attribute to every model. Should return a value that
      # is both capable of uniquely identifying the object in question, and is
      # useful for translators to see.
      #
      # Note that any subclass which overrides this method will also need some
      # associated postprocessing in the sync out.
      #
      # Required for compatiblity with CrowdinCollectionSerializer
      attribute :crowdin_key
      def crowdin_key
        object.try(:key) || object.id
      end
    end

    class ActivitySectionCrowdinSerializer < CrowdinSerializer
      attributes :name, :description, :tips, :progression_name

      def tips
        object.tips&.map {|tip| tip['markdown']}
      end
    end

    class LessonActivityCrowdinSerializer < CrowdinSerializer
      attribute :name

      has_many :activity_sections, serializer: ActivitySectionCrowdinSerializer
    end

    class ResourceCrowdinSerializer < CrowdinSerializer
      attributes :name, :url, :type

      # override
      def crowdin_key
        Services::GloballyUniqueIdentifiers.build_resource_key(object)
      end
    end

    class AnnouncementCrowdinSerializer < CrowdinSerializer
      attributes :notice, :details, :buttonText

      # override
      def crowdin_key
        object.key
      end
    end

    class VocabularyCrowdinSerializer < CrowdinSerializer
      attributes :word, :definition

      # override
      def crowdin_key
        Services::GloballyUniqueIdentifiers.build_vocab_key(object)
      end
    end

    class ObjectiveCrowdinSerializer < CrowdinSerializer
      attribute :description
    end

    class ReferenceGuideCrowdinSerializer < CrowdinSerializer
      attributes :display_name, :content

      # override
      def crowdin_key
        path = Rails.application.routes.url_helpers.course_reference_guide_path(object.course_offering_version, object.key)
        URI.join("https://studio.code.org", path)
      end
    end

    class LessonCrowdinSerializer < CrowdinSerializer
      attributes(
        :name,
        :assessment_opportunities,
        :overview,
        :preparation,
        :purpose,
        :student_overview,
      )

      has_many :lesson_activities, serializer: LessonActivityCrowdinSerializer
      has_many :objectives, serializer: ObjectiveCrowdinSerializer
      has_many :resources, serializer: ResourceCrowdinSerializer
      has_many :vocabularies, serializer: VocabularyCrowdinSerializer

      # override
      def crowdin_key
        path = Rails.application.routes.url_helpers.script_lesson_path(object.script, object)
        URI.join("https://studio.code.org", path)
      end
    end

    class ScriptCrowdinSerializer < CrowdinSerializer
      has_many :resources, serializer: ResourceCrowdinSerializer
      has_many :student_resources, serializer: ResourceCrowdinSerializer
      has_many :reference_guides, serializer: ReferenceGuideCrowdinSerializer do
        object.get_course_version&.reference_guides
      end

      # Optional `only_numbered_lessons` scope to avoid `relative_position` conflicts between Lessons
      has_many :lessons, serializer: LessonCrowdinSerializer do
        scope[:only_numbered_lessons] ? object.lessons.select(&:numbered_lesson?) : object.lessons
      end

      has_many :announcements, serializer: AnnouncementCrowdinSerializer do
        next if object.announcements.nil?

        translatable_announcements = object.announcements.select {|announcement| announcement['key'].present?}
        translatable_announcements.map {|announcement| Announcement.new(announcement)}
      end

      # override
      def crowdin_key
        path = Rails.application.routes.url_helpers.script_path(object)
        URI.join("https://studio.code.org", path)
      end
    end
  end
end
