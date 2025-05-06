class CreateSkills < ActiveRecord::Migration[6.1]
  def change
    drop_table :skills if ActiveRecord::Base.connection.table_exists?(:skills)
    create_table :skills do |t|
      t.string :description, null: false
      t.text :evaluation_criteria
      t.string :concept

      t.timestamps
    end
  end
end
