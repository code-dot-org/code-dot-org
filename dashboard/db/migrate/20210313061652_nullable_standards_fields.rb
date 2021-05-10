class NullableStandardsFields < ActiveRecord::Migration[5.2]
  def change
    # make sure developers who have not seeded in a while do not run this
    # migration, because an earlier migration will already have removed this
    # column.
    #
    # change_column :standards, :organization, :string, null: true
    # change_column :standards, :organization_id, :string, null: true
  end
end
