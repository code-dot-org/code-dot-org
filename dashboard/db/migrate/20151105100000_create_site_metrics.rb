class CreateSiteMetrics < ActiveRecord::Migration
  def change
    create_table(:site_metrics, id: false) do |t|
      t.date 'date'
      t.integer 'total_users'
      t.integer 'total_students'
      t.integer 'total_teachers'
      t.integer 'seven_day_users'
      t.integer 'seven_day_students'
      t.integer 'seven_day_teachers'
      t.integer 'thirty_day_users'
      t.integer 'thirty_day_students'
      t.integer 'thirty_day_teachers'

      t.timestamps null: false
    end
  end
end
