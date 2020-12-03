class AddTimeSpentToUserLevels < ActiveRecord::Migration[5.0]
  def change
    # This change will be implemented on production using the MySQL gh-ost tool.
    return if Rails.env.production?
    add_column :user_levels, :time_spent, :integer
  end
end
