require_relative 'curriculum_sync_utils/render_translations'
require_relative 'curriculum_sync_utils/serializers'

module Services
  module I18n
    # This module contains all i18n sync logic specific to the content
    # imported into Code Studio from CurriculumBuilder; Lessons, Activities,
    # Resources, Vocabularies, Objectives, etc.
    module CurriculumSyncUtils
      include RenderTranslations
    end
  end
end
