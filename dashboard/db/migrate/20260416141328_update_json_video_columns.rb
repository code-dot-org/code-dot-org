class UpdateJSONVideoColumns < ActiveRecord::Migration[7.0]
  def up
    change_column :json_videos, :description, :text
    rename_column :json_videos, :lab, :labs
    execute "UPDATE json_videos SET labs = CASE WHEN labs IS NULL OR labs = '' THEN NULL ELSE JSON_ARRAY(labs) END"
    change_column :json_videos, :labs, :json
    rename_column :json_videos, :version, :json_schema_version
  end

  def down
    rename_column :json_videos, :json_schema_version, :version
    change_column :json_videos, :labs, :string
    execute "UPDATE json_videos SET labs = JSON_UNQUOTE(JSON_EXTRACT(labs, '$[0]')) WHERE labs IS NOT NULL"
    rename_column :json_videos, :labs, :lab
    change_column :json_videos, :description, :string
  end
end
