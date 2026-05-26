class RemoveCascadeDeleteFromDemoStudents < ActiveRecord::Migration[7.0]
  # Drop the ON DELETE CASCADE referential action on demo_students.user_id,
  # keeping the foreign key itself for referential integrity. Cleanup of
  # demo_students on account deletion will be handled explicitly in
  # DeleteAccountsHelper (see follow-up PR), consistent with how every other
  # user-referencing table is purged. The cascade is also unsupported by
  # Aurora -> Redshift zero-ETL replication.
  #
  # MySQL has no in-place edit of a foreign key's referential action, so the
  # constraint must be dropped and re-added.
  def up
    remove_foreign_key :demo_students, :users
    add_foreign_key :demo_students, :users
  end

  def down
    remove_foreign_key :demo_students, :users
    add_foreign_key :demo_students, :users, on_delete: :cascade
  end
end
