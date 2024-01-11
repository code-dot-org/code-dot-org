#!/usr/bin/env ruby

require_relative '../../../../../dashboard/config/environment'
require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../../../redact_restore_utils'
require_relative '../docs'

module I18n
  module Resources
    module Dashboard
      module Docs
        class SyncIn < I18n::Utils::SyncInBase
          def process
            progress_bar.total += programming_envs.size

            # For each programming environment, name is used as key, title is used as name
            programming_envs.each do |programming_env|
              # Generate a file containing the string of each Programming Environment.
              i18n_source_file_path = File.join(I18N_SOURCE_DIR_PATH, "#{programming_env.name}.json")
              I18nScriptUtils.write_json_file(i18n_source_file_path, i18n_data_of(programming_env))

              # Redact the file content
              i18n_original_file_path = i18n_source_file_path.sub(I18N_SOURCE_DIR_PATH, I18N_BACKUP_DIR_PATH)
              I18nScriptUtils.copy_file(i18n_source_file_path, i18n_original_file_path)
              RedactRestoreUtils.redact(i18n_source_file_path, i18n_source_file_path, REDACT_PLUGINS)
            ensure
              progress_bar.increment
            end
          end

          private

          def programming_envs
            @programming_envs ||= ProgrammingEnvironment.where(name: TRANSLATABLE_PROGRAMMING_ENVS).order(:name)
          end

          # TODO: refactor the programming env i18n data serialization
          def i18n_data_of(programming_env)
            i18n_data = {}

            i18n_data[programming_env.name] = {
              'name' => programming_env.properties['title'],
              'description' => programming_env.properties['description'],
              'categories' => {},
            }

            ### Localize Categories for Navigation
            # Programming environment has a method defined in the programming_environment model that returns the
            # categories for navigation. The method is used to obtain the current categories existing in the database.
            categories_data = i18n_data[programming_env.name]['categories']
            programming_env.categories_for_navigation.each do |category_for_navigation|
              category_key = category_for_navigation[:key]
              categories_data.store(
                category_key, {
                  'name' => category_for_navigation[:name],
                  'expressions' => {}
                }
              )

              ### localize Programming Expressions
              # expression_docs.properties['syntax'] is not translated as it is the JavaScript expression syntax
              expressions_data = categories_data[category_key]['expressions']

              # TODO: Fix the block as `category_for_navigation[:docs]` can also contain ProgrammingClass
              category_for_navigation[:docs].each do |expression|
                expression_key = expression[:key]
                expression_docs = ProgrammingExpression.find_by_id(expression[:id])
                expressions_data.store(
                  expression_key, {
                    'content' => expression_docs.properties['content'],
                    'examples' => ({} unless expression_docs.properties['examples'].nil?),
                    'palette_params' => ({} unless expression_docs.properties['palette_params'].nil?),
                    'return_value' => expression_docs.properties['return_value'],
                    'short_description' => expression_docs.properties['short_description'],
                    'tips' => expression_docs.properties['tips']
                  }.compact
                )

                ### Localize Examples
                # Programming expressions may have 0 or more examples.
                # Only example["name"] and example["description"] are translated. example["code"] is NOT translated.
                example_docs = expressions_data[expression_key]['examples']
                expression_docs.properties['examples']&.each do |example|
                  unless example['name'].nil_or_empty? && example['description'].nil_or_empty?
                    example_docs.store(
                      example['name'], {
                        'name' => (example['name'] if example['name']),
                        'description' => (example['description'] if example['description']),
                      }.compact
                    )
                  end
                end

                ### localize Parameters
                # Programming expresions may have 0 or more parameters.
                # Parameter name (param["name"]) is not translated as it needs to match the JavaScript expression syntax.
                param_docs = expressions_data[expression_key]['palette_params']
                expression_docs.properties['palette_params']&.each do |param|
                  param_docs.store(
                    param['name'], {
                      'type' => (param['type'] if param['type']),
                      'description' => (param['description'] if param['description'])
                    }.compact
                  )
                end
              end
            end

            i18n_data.compact
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::Docs::SyncIn.perform if __FILE__ == $0
