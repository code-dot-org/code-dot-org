class ChangeDataTypeForLevelSourcesId < ActiveRecord::Migration[5.2]
  def up
    # This change will be implemented on production using the MySQL gh-ost tool.
    return if Rails.env.production?
    change_column :level_sources, :id, 'BIGINT(11) UNSIGNED', auto_increment: true
  end

  def down
    # This change will be implemented on production using the MySQL gh-ost tool.
    return if Rails.env.production?
    change_column :level_sources, :id, :integer, auto_increment: true
  end
end
