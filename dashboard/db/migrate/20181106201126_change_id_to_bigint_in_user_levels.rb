class ChangeIdToBigintInUserLevels < ActiveRecord::Migration[5.0]
  def up
    # This change was already implemented on production using the MySQL gh-ost tool.
    return if Rails.env.production?
    change_column :user_levels, :id, 'BIGINT(11) UNSIGNED', auto_increment: true
  end

  def down
    # This change was already implemented on production using the MySQL gh-ost tool.
    return if Rails.env.production?
    change_column :user_levels, :id, :integer, auto_increment: true
  end
end
