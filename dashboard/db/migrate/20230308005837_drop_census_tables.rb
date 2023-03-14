class DropCensusTables < ActiveRecord::Migration[6.0]
  def up
    drop_table_if_exists :ib_cs_offerings
    drop_table_if_exists :ib_school_codes
    drop_table_if_exists :census_inaccuracy_investigations
    drop_table_if_exists :census_overrides
    drop_table_if_exists :other_curriculum_offerings
    drop_table_if_exists :state_cs_offerings
  end

  def down
  end

  private

  def drop_table_if_exists(table)
    drop_table table if ActiveRecord::Base.connection.table_exists? table
  end
end
