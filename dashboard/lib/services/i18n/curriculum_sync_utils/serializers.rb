module Services
  module I18n
    module CurriculumSyncUtils
      # Define a custom CollectionSerializer subclass, optimized for crowdin compatibility.
      class CrowdinCollectionSerializer < ActiveModel::Serializer::CollectionSerializer
        # @override
        def serializable_hash(adapter_options, options, adapter_instance)
          # Default CollectionSerializer behavior is to return an array of hashes,
          # where each hash is a single result. We would instead like to return a
          # single hash, keyed by `crowdin_key`
          return super.reduce({}) do |results, result|
            raise KeyEror.new("Serializer must define :crowdin_key for curriculum content I18N serialization; got #{result.keys.inspect}") unless result.key?(:crowdin_key)
            crowdin_key = result.delete(:crowdin_key)
            results[crowdin_key] = result unless result.empty?
            results
          end
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
          super.reject {|_, v| v.blank?}
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
        # Note that we don't include "name" here, because that's already
        # handled by existing logic. We could in the future consider moving
        # that (and possibly script stuff, too) out of whereever it exists
        # and into this logic.
        attributes(
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
