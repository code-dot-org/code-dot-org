require_relative 'curriculum_sync_utils/serializers'

module CurriculumSyncUtils
  def self.sync_in
    puts "Preparing curriculum content"
    Script.all.each do |script|
      # TODO: what else do we want to consider when deciding what to sync?
      next unless script.is_migrated?
      # TODO: include the "other directory already exists" logic from localize_level_content
      # prepare path
      script_category = script.get_course_version&.key || 'other'
      script_content_dir = File.join(I18N_SOURCE_DIR, 'curriculum_content', script_category)
      path = File.join(script_content_dir, "#{script.name}.json")

      # prepare data
      data = ScriptI18nSerializer.new(script).as_json.compact
      data.delete(:crowdin_key) # don't need this for top-level data

      next unless data.present?

      # write data to path
      FileUtils.mkdir_p(script_content_dir)
      File.write(path, JSON.pretty_generate(data))
    end
  end
end
