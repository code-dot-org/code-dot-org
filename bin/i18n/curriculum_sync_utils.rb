require_relative 'curriculum_sync_utils/serializers'
require_relative 'curriculum_sync_utils/sync_in'
require_relative 'curriculum_sync_utils/sync_out'

# This module contains all i18n sync logic specific to the content
# imported into Code Studio from CurriculumBuilder; Lessons, Activities,
# Resources, Vocabularies, Objectives, etc.
module CurriculumSyncUtils
  REDACT_RESTORE_PLUGINS = %w(resourceLink vocabularyDefinition)

  def self.sync_in
    puts "Sync in curriculum content"
    CurriculumSyncUtils::SyncIn.serialize
    CurriculumSyncUtils::SyncIn.redact
  end

  def self.sync_out
    puts "Sync out curriculum content"
    CurriculumSyncUtils::SyncOut.reorganize
  end
end
