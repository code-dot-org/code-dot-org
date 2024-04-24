class DropApCsOfferingsTable < ActiveRecord::Migration[6.1]
  def change
    drop_table :ap_cs_offerings if ActiveRecord::Base.connection.table_exists? :ap_cs_offerings
  end
end
