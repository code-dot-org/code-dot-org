# == Schema Information
#
# Table name: levels
#
#  id                    :integer          not null, primary key
#  game_id               :integer
#  name                  :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  level_num             :string(255)
#  ideal_level_source_id :bigint           unsigned
#  user_id               :integer
#  properties            :text(4294967295)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#  index_levels_on_type       (type)
#

class Weblab < Weblab2
  serialized_attrs %w(
    project_template_level_name
    start_sources
    hide_share_and_remix
    is_project_level
    encrypted_examples
    submittable
    validation_enabled
  )

  def self.create_from_level_builder(params, level_params)
    raise "Do not create Weblab levels"
  end

  def summarize_for_lab2_properties(script, script_level = nil, current_user = nil, unit_group_unit: nil, widget2_start_sources: nil)
    properties_camelized = super(script, script_level, current_user, unit_group_unit: unit_group_unit)

    # Reform any legacy string startSources
    # This converts it into something that the codebridge useInitialSources can understand.
    if properties_camelized["startSources"].is_a?(String)
      begin
        properties_camelized["startSources"] = JSON.parse(properties_camelized["startSources"])

        # Ensure startSources has folders
        properties_camelized["startSources"]["folders"] ||= {}

        # Ensure file data is correct
        properties_camelized["startSources"]["files"] ||= {}

        if properties_camelized["startSources"]["files"].is_a?(Array)
          files = properties_camelized["startSources"]["files"]
          properties_camelized["startSources"]["files"] = {}

          id = 0
          files.each do |file|
            # Ensurre the file has an id
            id += 1

            properties_camelized["startSources"]["files"][id] = {
              # Ensure 'data' becomes 'contents'
              id: id.to_s,
              active: id == 1,
              folderId: "0",
              name:  file["name"] || "index.html",
              contents: file["data"] || "",
            }
          end
        end
      rescue
        # We don't understand the startSources... let's ensure they are nulled out
        properties_camelized.delete("startSources")
      end
    end

    properties_camelized
  end
end
