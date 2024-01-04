#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_up_base'
require_relative '../course_content'

module I18n
  module Resources
    module Dashboard
      module CourseContent
        class SyncUp < I18n::Utils::SyncUpBase
          config.source_paths << File.join(I18N_SOURCE_DIR_PATH, '**/*.{json,yml}')
          config.source_paths << File.join(I18n::Resources::Dashboard::I18N_SOURCE_DIR_PATH, "#{BLOCK_CATEGORIES_TYPE}.yml")
          config.source_paths << File.join(I18n::Resources::Dashboard::I18N_SOURCE_DIR_PATH, "#{PROGRESSIONS_TYPE}.yml")
          config.source_paths << File.join(I18n::Resources::Dashboard::I18N_SOURCE_DIR_PATH, "#{PARAMETER_NAMES_TYPE}.yml")
          config.source_paths << File.join(I18n::Resources::Dashboard::I18N_SOURCE_DIR_PATH, "#{VARIABLE_NAMES_TYPE}.yml")
        end
      end
    end
  end
end

I18n::Resources::Dashboard::CourseContent::SyncUp.perform if __FILE__ == $0
