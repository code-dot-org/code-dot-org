class CreateLessonsOpportunityStandards < ActiveRecord::Migration[5.2]
  def change
    create_join_table :lessons, :standards, table_name: :lessons_opportunity_standards do |t|
      t.index [:lesson_id, :standard_id], unique: true
      t.index [:standard_id, :lesson_id]
    end
    add_column :lessons_opportunity_standards, :id, :primary_key
    reversible do |dir|
      dir.up do
        execute "ALTER TABLE lessons_opportunity_standards CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci"
      end
    end
  end
end
