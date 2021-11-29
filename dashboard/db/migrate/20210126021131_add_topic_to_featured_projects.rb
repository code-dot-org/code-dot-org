class AddTopicToFeaturedProjects < ActiveRecord::Migration[5.2]
  def change
    add_column :featured_projects, :topic, :string
    add_index :featured_projects, :topic
    execute "ALTER TABLE featured_projects CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci"
  end
end
