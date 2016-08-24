class CreateCohortsDeletedUsers < ActiveRecord::Migration[4.2]
  def change
    create_join_table :users, :cohorts, table_name: :cohorts_deleted_users do |t|
      t.index [:user_id, :cohort_id]
      t.index [:cohort_id, :user_id]
    end
  end
end
