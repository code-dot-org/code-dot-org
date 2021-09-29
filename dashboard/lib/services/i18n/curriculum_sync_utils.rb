require_relative 'curriculum_sync_utils/render_translations'
require_relative 'curriculum_sync_utils/serializers'
require_relative 'curriculum_sync_utils/sync_in'
require_relative 'curriculum_sync_utils/sync_out'

module Services
  module I18n
    # This module contains all i18n sync logic specific to the content
    # imported into Code Studio from CurriculumBuilder; Lessons, Activities,
    # Resources, Vocabularies, Objectives, etc.
    module CurriculumSyncUtils
      include RenderTranslations
      REDACT_RESTORE_PLUGINS = %w(resourceLink vocabularyDefinition)

      def self.sync_in
        Services::I18n::CurriculumSyncUtils::SyncIn.run
      end

      def self.sync_out
        Services::I18n::CurriculumSyncUtils::SyncOut.run
      end
    end
  end
end
