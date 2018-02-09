class ChangeCensusSummariesTeachesCsDefault < ActiveRecord::Migration[5.0]
  def up
    change_column :census_summaries, :teaches_cs, :string, limit: 1, null: true
  end

  def down
    change_column :census_summaries, :teaches_cs, :string, limit: 1, null: false
  end
end
