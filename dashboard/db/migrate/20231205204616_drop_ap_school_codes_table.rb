class DropApSchoolCodesTable < ActiveRecord::Migration[6.1]
  def change
    drop_table :ap_school_codes if ActiveRecord::Base.connection.table_exists? :ap_school_codes
  end
end
