#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_down_base'
require_relative '../course_content'

module I18n
  module Resources
    module Dashboard
      module CourseContent
        class SyncDown < I18n::Utils::SyncDownBase
          config.download_paths << DownloadPath.new(crowdin_src: DIR_NAME)
          config.download_paths << DownloadPath.new(crowdin_src: File.join(I18n::Resources::Dashboard::DIR_NAME, "#{BLOCK_CATEGORIES_TYPE}.yml"))
          config.download_paths << DownloadPath.new(crowdin_src: File.join(I18n::Resources::Dashboard::DIR_NAME, "#{PROGRESSIONS_TYPE}.yml"))
          config.download_paths << DownloadPath.new(crowdin_src: File.join(I18n::Resources::Dashboard::DIR_NAME, "#{PARAMETER_NAMES_TYPE}.yml"))
          config.download_paths << DownloadPath.new(crowdin_src: File.join(I18n::Resources::Dashboard::DIR_NAME, "#{VARIABLE_NAMES_TYPE}.yml"))
        end
      end
    end
  end
end

I18n::Resources::Dashboard::CourseContent::SyncDown.perform if __FILE__ == $0
