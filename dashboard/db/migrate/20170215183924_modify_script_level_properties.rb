class ModifyScriptLevelProperties < ActiveRecord::Migration[5.0]
  # ScriptLevel.properties is currently a hash representing variant levels. We'd
  # like the property hash to be more generic, so we're moving the variants to
  # exist under their own key within properties

  def up
    ScriptLevel.where.not(properties: nil).each do |script_level|
      obj = JSON.parse script_level.properties
      script_level.update!(properties: {variants: obj}.to_json)
    end
  end

  def down
    ScriptLevel.where.not(properties: nil).each do |script_level|
      obj = JSON.parse script_level.properties
      if obj.keys != ['variants']
        raise "Unable to migration script_level #{script_level.id} down"
      end
      script_level.update!(properties: obj["variants"].to_json)
    end
  end
end
