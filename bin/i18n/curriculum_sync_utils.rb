require_relative 'curriculum_sync_utils/serializers'

module CurriculumSyncUtils
  def self.sync_in
    puts "Preparing curriculum content"
    Script.all.each do |script|
      next unless ScriptConstants.i18n? script.name
      # TODO: include the "other directory already exists" logic from localize_level_content
      script_category = script.get_course_version&.key || 'other'
      script_content_dir = File.join(I18N_SOURCE_DIR, 'curriculum_content', script_category)

      path = File.join(script_content_dir, "#{script.name}.json")
      data = ScriptI18nSerializer.new(script).as_json.compact

      FileUtils.mkdir_p(script_content_dir)
      File.write(path, JSON.pretty_generate(data))
    end
  end
end
