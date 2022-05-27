module Services
  module I18n
    module CurriculumSyncUtils
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
          result = super.reject {|_, v| v.blank?}
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

        has_many :activity_sections, serializer: CurriculumSyncUtils::ActivitySectionCrowdinSerializer
      end

      class ResourceCrowdinSerializer < CrowdinSerializer
        attributes :name, :url, :type

        # override
        def crowdin_key
          Services::GloballyUniqueIdentifiers.build_resource_key(object)
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

      class FrameworkCrowdinSerializer < CrowdinSerializer
        attributes :name

        delegate :crowdin_key, to: :object
      end

      class StandardCategoryCrowdinSerializer < CrowdinSerializer
        attributes :description

        delegate :crowdin_key, to: :object
      end

      class StandardCrowdinSerializer < CrowdinSerializer
        attributes :description

        belongs_to :framework, serializer: CurriculumSyncUtils::FrameworkCrowdinSerializer
        belongs_to :parent_category, serializer: CurriculumSyncUtils::StandardCategoryCrowdinSerializer
        belongs_to :category, serializer: CurriculumSyncUtils::StandardCategoryCrowdinSerializer

        delegate :crowdin_key, to: :object
      end

      class LessonCrowdinSerializer < CrowdinSerializer
        attributes(
          :name,
          :overview,
          :preparation,
          :purpose,
          :student_overview,
        )

        has_many :lesson_activities, serializer: CurriculumSyncUtils::LessonActivityCrowdinSerializer
        has_many :objectives, serializer: CurriculumSyncUtils::ObjectiveCrowdinSerializer
        has_many :resources, serializer: CurriculumSyncUtils::ResourceCrowdinSerializer
        has_many :vocabularies, serializer: CurriculumSyncUtils::VocabularyCrowdinSerializer
        has_many :standards, serializer: CurriculumSyncUtils::StandardCrowdinSerializer
        has_many :opportunity_standards, serializer: CurriculumSyncUtils::StandardCrowdinSerializer

        # override
        def crowdin_key
          path = Rails.application.routes.url_helpers.script_lesson_path(object.script, object)
          URI.join("https://studio.code.org", path)
        end
      end

      class ScriptCrowdinSerializer < CrowdinSerializer
        has_many :lessons, serializer: CurriculumSyncUtils::LessonCrowdinSerializer
        has_many :resources, serializer: CurriculumSyncUtils::ResourceCrowdinSerializer
        has_many :student_resources, serializer: CurriculumSyncUtils::ResourceCrowdinSerializer

        # override
        def crowdin_key
          path = Rails.application.routes.url_helpers.script_path(object)
          URI.join("https://studio.code.org", path)
        end
      end
    end
  end
end
