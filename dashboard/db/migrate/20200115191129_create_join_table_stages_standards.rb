class CreateJoinTableStagesStandards < ActiveRecord::Migration[5.0]
  def change
    create_join_table :stages, :standards do |t|
      t.references :stage, index: true, null: false
      t.references :standard, index: true, null: false
      t.timestamps
    end
  end
end
