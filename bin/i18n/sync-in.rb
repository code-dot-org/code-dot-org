#!/usr/bin/env ruby

# Pulls in all strings that need to be translated. Pulls source
# files from blockly-core, apps, pegasus, and dashboard
# as well as instructions for levelbuilder supported levels and
# collects them to the single source folder i18n/locales/source.

require File.expand_path('../../../dashboard/config/environment', __FILE__)
require 'fileutils'
require 'json'
require 'digest/md5'

require_relative 'i18n_script_utils'
require_relative 'redact_restore_utils'
Dir[File.expand_path('../resources/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module SyncIn
    def self.perform
      puts "Sync in starting"
      I18n::Resources::Dashboard::CurriculumContent.sync_in
      I18n::Resources::Pegasus::HourOfCode.sync_in
      localize_level_and_project_content
      I18n::Resources::Dashboard::Blocks.sync_in
      I18n::Resources::Apps::Animations.sync_in
      I18n::Resources::Dashboard::SharedFunctions.sync_in
      I18n::Resources::Dashboard::CourseOfferings.sync_in
      I18n::Resources::Dashboard::Standards.sync_in
      I18n::Resources::Dashboard::Docs.sync_in
      I18n::Resources::Apps::ExternalSources.sync_in
      I18n::Resources::Dashboard::Scripts.sync_in
      I18n::Resources::Dashboard::Courses.sync_in
      I18n::Resources::Apps::Labs.sync_in
      I18n::Resources::Pegasus::Markdown.sync_in
      puts "Copying source files"
      I18nScriptUtils.run_bash_script "bin/i18n-codeorg/in.sh"
      redact_level_content
      puts "Sync in completed successfully"
    rescue => exception
      puts "Sync in failed from the error: #{exception}"
      raise exception
    end

    def self.localize_level_and_project_content
      variable_strings = {}
      parameter_strings = {}
      localize_level_content(variable_strings, parameter_strings)
      localize_project_content(variable_strings, parameter_strings)
      write_to_yml("variable_names", variable_strings)
      write_to_yml("parameter_names", parameter_strings)
    end

    def self.get_i18n_strings(level)
      i18n_strings = {}

      case level
      when DSLDefined
        text = level.dsl_text
        i18n_strings["dsls"] = level.class.dsl_class.parse(text, '')[1] if text
      when Level
        %w(
          display_name
          bubble_choice_description
          short_instructions
          long_instructions
          failure_message_overrides
          teacher_markdown
          placeholder
          title
        ).each do |prop|
          i18n_strings[prop] = level.try(prop)
        end

        # authored_hints
        if level.authored_hints
          authored_hints = JSON.parse(level.authored_hints)
          i18n_strings['authored_hints'] = Hash.new unless authored_hints.empty?
          authored_hints.each do |hint|
            markdown = hint['hint_markdown']
            i18n_strings['authored_hints'][hint['hint_id']] = markdown
            # parse and store placeholder texts
            processed_markdown = Nokogiri::HTML(markdown, &:noblanks)
            placeholders = get_all_placeholder_text_types(processed_markdown)
            if placeholders.present?
              i18n_strings['placeholder_texts'] = Hash.new
              i18n_strings['placeholder_texts'].merge! placeholders
            end
          end
        end

        # callouts
        if level.callout_json
          callouts = JSON.parse(level.callout_json)
          i18n_strings['callouts'] = Hash.new unless callouts.empty?
          callouts.each do |callout|
            i18n_strings['callouts'][callout['localization_key']] = callout['callout_text']
          end
        end

        # rubric
        if level.mini_rubric&.to_bool
          rubric_properties = Hash.new
          %w(
            rubric_key_concept
            rubric_performance_level_1
            rubric_performance_level_2
            rubric_performance_level_3
            rubric_performance_level_4
          ).each do |prop|
            prop_value = level.try(prop)
            rubric_properties[prop] = prop_value unless prop_value.nil?
          end
          i18n_strings['mini_rubric'] = Hash.new unless rubric_properties.empty?
          i18n_strings['mini_rubric'].merge! rubric_properties
        end

        # dynamic_instructions
        if level.dynamic_instructions
          dynamic_instructions = JSON.parse(level.dynamic_instructions)
          i18n_strings['dynamic_instructions'] = dynamic_instructions unless dynamic_instructions.empty?
        end

        # parse markdown properties for potential placeholder texts
        documents = []
        %w(
          short_instructions
          long_instructions
        ).each do |prop|
          documents.push level.try(prop) if level.try(prop)
        end
        i18n_strings['placeholder_texts'] = i18n_strings['placeholder_texts'] || Hash.new unless documents.empty?
        documents.each do |document|
          processed_doc = Nokogiri::HTML(document, &:noblanks)
          i18n_strings['placeholder_texts'].merge! get_all_placeholder_text_types(processed_doc)
        end

        # start_html
        if level.start_html
          start_html = Nokogiri::XML(level.start_html, &:noblanks)
          i18n_strings['start_html'] = Hash.new unless level.start_html.empty?

          # match any element that contains text
          start_html.xpath('//*[text()[normalize-space()]]').each do |element|
            i18n_strings['start_html'][element.text] = element.text
          end
        end

        level_xml = Nokogiri::XML(level.to_xml, &:noblanks)
        blocks = level_xml.xpath('//blocks').first
        if blocks
          ## Categories
          block_categories = blocks.xpath('//category')
          i18n_strings['block_categories'] = Hash.new unless block_categories.empty?
          block_categories.each do |category|
            name = category.attr('name')
            i18n_strings['block_categories'][name] = name if name
          end

          ## Function Names
          functions = blocks.xpath("//block[@type=\"procedures_defnoreturn\"]")
          i18n_strings['function_definitions'] = Hash.new unless functions.empty?
          functions.each do |function|
            name = function.at_xpath('./title[@name="NAME"]')
            # The name is used to uniquely identify the function. Skip if there is no name.
            next unless name
            description = function.at_xpath('./mutation/description')
            parameters = function.xpath('./mutation/arg').map do |parameter|
              [parameter["name"], parameter["name"]]
            end.to_h
            function_definition = Hash.new
            function_definition["name"] = name.content
            function_definition["description"] = description.content if description
            function_definition["parameters"] = parameters unless parameters.empty?
            i18n_strings['function_definitions'][name.content] = function_definition
          end

          # Spritelab behaviors
          behaviors = blocks.xpath("//block[@type=\"behavior_definition\"]")
          unless behaviors.empty?
            i18n_strings['behavior_names'] = Hash.new
            i18n_strings['behavior_descriptions'] = Hash.new
          end
          behaviors.each do |behavior|
            name = behavior.at_xpath('./title[@name="NAME"]')
            description = behavior.at_xpath('./mutation/description')
            i18n_strings['behavior_names'][name.content] = name.content if name
            i18n_strings['behavior_descriptions'][description.content] = description.content if description
          end

          ## Variable Names
          variables_get = blocks.xpath("//block[@type=\"variables_get\"]")
          variables_set = blocks.xpath("//block[@type=\"variables_set\"]")
          variables = variables_get + variables_set
          i18n_strings['variable_names'] = Hash.new unless variables.empty?
          variables.each do |variable|
            name = variable.at_xpath('./title[@name="VAR"]')
            i18n_strings['variable_names'][name.content] = name.content if name
          end

          ## Parameter Names
          parameters = blocks.xpath("//block[@type=\"parameters_get\"]")
          i18n_strings['parameter_names'] = Hash.new unless parameters.empty?
          parameters.each do |parameter|
            name = parameter.at_xpath('./title[@name="VAR"]')
            i18n_strings['parameter_names'][name.content] = name.content if name
          end

          ## Placeholder texts
          i18n_strings['placeholder_texts'] = i18n_strings['placeholder_texts'] || Hash.new
          i18n_strings['placeholder_texts'].merge! get_all_placeholder_text_types(blocks)
        end
      end

      if level.is_a? BubbleChoice
        i18n_strings["sublevels"] = {}
        # Block categories, variables, and parameters are handled differently below and are generally covered by the script levels
        ignored_types = %w[block_categories variable_names parameter_names]
        level.sublevels.map do |sublevel|
          i18n_strings["sublevels"][sublevel.name] = get_i18n_strings sublevel
          ignored_types.each do |type|
            i18n_strings["sublevels"][sublevel.name].delete(type) if i18n_strings["sublevels"][sublevel.name].key? type
          end
        end
      end

      if level.is_a? LevelGroup
        i18n_strings["sublevels"] = {}
        level.child_levels.map do |sublevel|
          i18n_strings["sublevels"][sublevel.name] = get_i18n_strings sublevel
        end
      end

      i18n_strings["contained levels"] = level.contained_levels.map do |contained_level|
        get_i18n_strings(contained_level)
      end

      i18n_strings.delete_if {|_, value| value.blank?}
    end

    def self.get_all_placeholder_text_types(blocks)
      results = {}
      results.merge! get_placeholder_texts(blocks, 'text', ['TEXT'])
      results.merge! get_placeholder_texts(blocks, 'studio_ask', ['TEXT'])
      results.merge! get_placeholder_texts(blocks, 'studio_showTitleScreen', %w(TEXT TITLE))
      results
    end

    def self.get_placeholder_texts(document, block_type, title_names)
      results = {}
      document.xpath("//block[@type=\"#{block_type}\"]").each do |block|
        title_names.each do |title_name|
          title = block.at_xpath("./title[@name=\"#{title_name}\"]")

          # Skip empty or untranslatable string.
          # A translatable string must have at least 3 consecutive alphabetic characters.
          next unless /[a-zA-Z]{3,}/.match?(title&.content)

          # Use only alphanumeric characters in lower cases as string key
          text_key = Digest::MD5.hexdigest title.content
          results[text_key] = title.content
        end
      end

      results
    end

    def self.localize_project_content(variable_strings, parameter_strings)
      puts "Preparing project content"
      project_content_file = "../#{I18N_SOURCE_DIR}/course_content/projects.json"
      project_strings = {}

      Dir.chdir(Rails.root) do
        ProjectsController::STANDALONE_PROJECTS.each do |key, value|
          next unless value["i18n"]
          level = Level.find_by_name(value["name"])
          url = "https://studio.code.org/p/#{key}"
          project_strings[url] = get_i18n_strings(level)
          # Block categories are handled differently below and are generally covered by the script levels
          project_strings[url].delete("block_categories") if project_strings[url].key? "block_categories"

          # add project-level variables to the flattened hash structures of
          # all variable & parameter strings
          if project_strings[url].key? "variable_names"
            variable_strings.merge! project_strings[url].delete("variable_names")
          end
          if project_strings[url].key? "parameter_names"
            parameter_strings.merge! project_strings[url].delete("parameter_names")
          end
        end
        project_strings.delete_if {|_, value| value.blank?}

        File.write(project_content_file, JSON.pretty_generate(project_strings))
      end
    end

    def self.localize_level_content(variable_strings, parameter_strings)
      puts "Preparing level content"

      block_category_strings = {}
      progression_strings = {}
      level_content_directory = "../#{I18N_SOURCE_DIR}/course_content"

      # We have to run this specifically from the Rails directory because
      # get_i18n_strings relies on level.dsl_text which relies on level.filename
      # which relies on running a shell command
      Dir.chdir(Rails.root) do
        Unit.all.each do |script|
          next unless ScriptConstants.i18n? script.name
          script_strings = {}
          script.script_levels.each do |script_level|
            level = script_level.oldest_active_level
            # Don't localize encrypted levels; the whole point of encryption is to
            # keep the contents of certain levels secret.
            next if level.encrypted?

            url = I18nScriptUtils.get_level_url_key(script, level)
            script_strings[url] = get_i18n_strings(level)
            progression_strings[script_level.progression] = script_level.progression if script_level.progression

            # extract block category strings; although these are defined for each
            # level, the expectation here is that there is a massive amount of
            # overlap between levels, so we actually want to just present these all
            # as a single group rather than breaking them up by script
            if script_strings[url].key? "block_categories"
              block_category_strings.merge! script_strings[url].delete("block_categories")
            end

            # do the same for variables and parameters
            if script_strings[url].key? "variable_names"
              variable_strings.merge! script_strings[url].delete("variable_names")
            end

            if script_strings[url].key? "parameter_names"
              parameter_strings.merge! script_strings[url].delete("parameter_names")
            end
          end
          script_strings.delete_if {|_, value| value.blank?}

          # We want to make sure to categorize HoC scripts as HoC scripts even if
          # they have a version year, so this ordering is important
          script_i18n_directory =
            if Unit.unit_in_category?('hoc', script.name)
              File.join(level_content_directory, "Hour of Code")
            elsif script.unversioned?
              File.join(level_content_directory, "other")
            else
              File.join(level_content_directory, script.version_year)
            end

          FileUtils.mkdir_p script_i18n_directory
          script_i18n_name = "#{script.name}.json"
          script_i18n_filename = File.join(script_i18n_directory, script_i18n_name)

          next if I18nScriptUtils.unit_directory_change?(script_i18n_name, script_i18n_filename)

          File.write(script_i18n_filename, JSON.pretty_generate(script_strings))
        end
      end

      write_to_yml("block_categories", block_category_strings)
      write_to_yml("progressions", progression_strings)
    end

    def self.write_to_yml(type, strings)
      File.open(File.join(I18N_SOURCE_DIR, "dashboard/#{type}.yml"), 'w') do |file|
        # Format strings for consumption by the rails i18n engine
        formatted_data = {
          "en" => {
            "data" => {
              type => strings.sort.to_h
            }
          }
        }
        file.write(I18nScriptUtils.to_crowdin_yaml(formatted_data))
      end
    end

    def self.select_redactable(i18n_strings)
      redactable_content = %w(
        authored_hints
        long_instructions
        short_instructions
        teacher_markdown
      )

      redactable = i18n_strings.select do |key, _|
        redactable_content.include? key
      end

      if i18n_strings.key? "contained levels"
        contained_levels = i18n_strings["contained levels"].map do |contained_level|
          select_redactable(contained_level)
        end
        contained_levels.select! do |result|
          !result.blank?
        end
        redactable["contained levels"] = contained_levels unless contained_levels.empty?
      end

      redactable.delete_if {|_k, v| v.blank?}
    end

    def self.redact_level_file(source_path)
      return unless File.exist? source_path
      source_data = JSON.parse(File.read(source_path))
      return if source_data.blank?

      redactable_data = source_data.map do |level_url, i18n_strings|
        [level_url, select_redactable(i18n_strings)]
      end.to_h

      backup_path = source_path.sub("source", "original")
      FileUtils.mkdir_p File.dirname(backup_path)
      File.write(backup_path, JSON.pretty_generate(redactable_data))

      redacted_data = RedactRestoreUtils.redact_data(redactable_data, ['blockly'])

      File.write(source_path, JSON.pretty_generate(source_data.deep_merge(redacted_data)))
    end

    def self.redact_level_content
      puts "Redacting level content"

      Dir.glob(File.join(I18N_SOURCE_DIR, "course_content/**/*.json")).each do |source_path|
        redact_level_file(source_path)
      end
    end
  end
end

I18n::SyncIn.perform if __FILE__ == $0
