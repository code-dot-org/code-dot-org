class DropTableWorkshop < ActiveRecord::Migration[5.0]
  def up
    drop_table :cohorts_deleted_users
    drop_table :cohorts_districts
    drop_table :cohorts_users
    drop_table :cohorts

    drop_table :districts_users
    drop_table :districts

    drop_table :segments

    drop_table :unexpected_teachers_workshops

    drop_table :facilitators_workshops
    drop_table :workshop_attendance
    drop_table :workshop_cohorts
    drop_table :workshops
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
