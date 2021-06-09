require 'cdo/languages'

require_relative 'curriculum_sync_utils/serializers'

# This module contains all i18n sync logic specific to the content
# imported into Code Studio from CurriculumBuilder; Lessons, Activities,
# Resources, Vocabularies, Objectives, etc.
module CurriculumSyncUtils
  def self.sync_in
    puts "Sync in curriculum content"
    sync_in_serialize
    # TODO: redaction
  end

  def self.sync_out
    puts "Sync out curriculum content"
    # TODO: restoration
    sync_out_reorganize
  end

  # Helper method to get the desired destination subdirectory of the given
  # script for the sync in. Note this may be a nested directory like "2021/csf"
  def self.get_script_subdirectory(script)
    # special-case Hour of Code scripts.
    return "Hour of Code" if ScriptConstants.script_in_category?(:hoc, script.name)

    # catchall for scripts without courses
    return 'other' unless script.get_course_version.present?

    # special-case CSF; we want to group all CSF courses together, even though
    # they all have different course offerings.
    return File.join(script.get_course_version.key, 'csf') if script.csf?

    # base case
    return File.join(script.get_course_version.key, script.get_course_version.course_offering.key)
  end

  # Serialize all curriculum data to the I18N source directory.
  #
  # Relies heavily on the custom serializer logic defined in
  # curriculum_sync_utils/serializers to generate a hash of results with
  # translator-readable keys, rather than the basic array that is produced by
  # default.
  def self.sync_in_serialize
    Script.all.each do |script|
      next unless script.is_migrated?
      next unless ScriptConstants.i18n? script.name

      # prepare data
      data = ScriptCrowdinSerializer.new(script).as_json.compact
      data.delete(:crowdin_key) # don't need this for top-level data

      # we expect that some migrated scripts won't have any lesson plan content
      # at all; that's fine, we can just skip those.
      data.reject! {|_, v| v.blank?} # don't want any empty values
      next if data.blank?

      # write data to path
      name = "#{script.name}.json"
      path = File.join(I18N_SOURCE_DIR, 'curriculum_content', get_script_subdirectory(script), name)
      next if I18nScriptUtils.script_directory_change?(name, path)
      FileUtils.mkdir_p(File.dirname(path))
      File.write(path, JSON.pretty_generate(data))
    end
  end

  # Given a deeply-nested hash of serialized objects (as generated by a
  # CrowdinCollectionSerializer) and a Serializer for the top-level object,
  # recursively extract all nested objects and return a flattened hash
  # organized by type.
  #
  # For example, given a hash of scripts like:
  #
  # {
  #   "coursea-2021": {
  #     "lessons": {
  #       "http://studio.code.org/s/coursea-2021/lessons/1": {
  #         "overview": "...",
  #         "preparation": "...",
  #         "purpose": "...",
  #         "student_overview": "...",
  #         "lesson_activities": {
  #           "09eb0525-dfae-44f2-831f-5c1f2ffee133": {
  #             "name": "...",
  #             "activity_sections": {
  #               "ef4f13d4-c5b0-4778-8ca1-359132023d82": {
  #                 "progression_name": "..."
  #               }
  #             }
  #           },
  #           ...
  #         },
  #         "resources": {
  #           "url": {
  #             "name": "..."
  #           },
  #         },
  #       },
  #       ...
  #     },
  #     "resources": {...}
  #   },
  #   "courseb-2021": {
  #     "lessons": {...}
  #     "resources": {...}
  #   },
  #   ...
  # }
  #
  # return:
  #
  # {
  #   "scripts": {
  #     "coursea-2021": {...},
  #     "courseb-2021": {...},
  #     ...
  #   },
  #   "lessons": {
  #     "http://studio.code.org/s/coursea-2021/lessons/1": {
  #       "overview": "...",
  #       "preparation": "...",
  #       "purpose": "...",
  #       "student_overview": "...",
  #     },
  #     "http://studio.code.org/s/courseb-2021/lessons/1": {...},
  #     ...
  #   },
  #   "lesson_activities": {
  #     "09eb0525-dfae-44f2-831f-5c1f2ffee133": {
  #       "name": "...",
  #     },
  #     ...
  #   },
  #   "activity_sections": {
  #     "ef4f13d4-c5b0-4778-8ca1-359132023d82": {
  #       "progression_name": "..."
  #     },
  #     ...
  #   },
  #   "resources": {
  #     "url": {
  #       "name": "..."
  #     },
  #     ...
  #   }
  # }
  def self.flatten(object_hash, serializer, name)
    results = {}
    object_hash.each do |key, object|
      object = object.symbolize_keys

      # store attributes directly on the results for this object
      attributes = object.slice(*serializer._attributes)
      if attributes.present?
        results[name] ||= {}
        results[name][key] = attributes
      end

      # recursively process "reflections" (ie, related model data) into their
      # own objects
      serializer._reflections.each do |reflection_key, reflection|
        next unless object.key?(reflection_key) && object[reflection_key].present?
        results.deep_merge!(flatten(object[reflection_key], reflection.options[:serializer], reflection.name))
      end
    end
    return results
  end

  # The ScriptCrowdinSerializer used in the sync in organizes all content by
  # script; each script is a single file, containing all the individual
  # lessons, activities, etc, for the script. This works great for organizing
  # content in a way that can easily be worked on by translators, but for
  # rendering translations in model and view logic we're going to need to do
  # something different.
  #
  # Specifically, we want to flatten the complex files generated by the
  # sync in. Ultimately, we want one file per content type; one for all
  # lessons, one for all activities, one for all resources, etc.
  def self.sync_out_reorganize
    Languages.get_locale.each do |prop|
      locale = prop[:locale_s]
      next if locale == 'en-US'
      locale_dir = File.join('i18n/locales', locale, 'curriculum_content')
      next unless File.directory?(locale_dir)

      # First we gather together all our script objects into a single hash
      script_objects = {}
      Dir.glob(File.join(locale_dir, '**/*.json')).each do |file|
        data = JSON.parse(File.read(file))
        name = File.basename(file)
        script_objects[name] = data if data.present?
      end

      # Then we recursively flatten all of our hashes of objects, and write
      # each resulting collection of strings out to a rails i18n config file.
      result = flatten(script_objects, ScriptCrowdinSerializer, :scripts)
      result.each do |type, strings|
        dest = File.join(Rails.root, 'config/locales', "#{type}.#{locale}.json")
        data = {locale => {data: {type => strings}}}
        # TODO: normalize keys for lessons and resources
        # route_params = Rails.application.routes.recognize_path(crowdin_key)
        # {:controller=>"lessons", :action=>"show", :script_id=>"coursea-2021", :position=>"1"}
        File.write(dest, JSON.pretty_generate(data))
      end
    end
  end
end
