require 'fileutils'
require 'json'

require_relative '../../../../dashboard/config/environment'
require_relative '../../i18n_script_utils'
require_relative '../../redact_restore_utils'

module I18n
  module Resources
    module Dashboard
      module Docs
        I18N_SOURCE_DIR_PATH = CDO.dir(I18N_SOURCE_DIR, 'docs').freeze

        # This function localizes content in studio.code.org/docs
        def self.sync_in
          puts 'Preparing docs content'

          # TODO: Adding spritelab and Javalab to translation pipeline
          # Currently supporting translations for applab, gamelab and weblab. NOT translating javalab and spritelab.
          # Javalab documentations exists in a different table because it has a different structure, more align with java.
          # Spritelab uses translatable block names, unlike JavaScript blocks.
          localized_environments = %w(applab gamelab weblab)

          ### Localize Programming Environments
          # For each programming environment, name is used as key, title is used as name
          ProgrammingEnvironment.where(name: localized_environments).sort.each do |env|
            # In the sync-in, each environment is store in an individual file.
            # Files are merged during the sync-out in programming_environments.{locale}.json
            docs_content_file = File.join(I18N_SOURCE_DIR_PATH, "#{env.name}.json")

            programming_env_docs = {}
            programming_env_docs[env.name] = {
              'name' => env.properties['title'],
              'description' => env.properties['description'],
              'categories' => {},
            }
            ### Localize Categories for Navigation
            # Programming environment has a method defined in the programming_environment model that returns the
            # categories for navigation. The method is used to obtain the current categories existing in the database.
            categories_data = programming_env_docs[env.name]['categories']
            env.categories_for_navigation.each do |category_for_navigation|
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

            # Generate a file containing the string of each Programming Environment.
            puts "Preparation of #{docs_content_file}"
            FileUtils.mkdir_p(File.dirname(docs_content_file))
            File.write(docs_content_file, JSON.pretty_generate(programming_env_docs.compact))

            puts "Redaction of #{docs_content_file}"
            backup = docs_content_file.sub('source', 'original')
            FileUtils.mkdir_p(File.dirname(backup))
            FileUtils.cp(docs_content_file, backup)
            RedactRestoreUtils.redact(docs_content_file, docs_content_file, %w[visualCodeBlock link resourceLink])
          end
        end
      end
    end
  end
end
