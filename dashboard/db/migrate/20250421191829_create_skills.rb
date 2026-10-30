class CreateSkills < ActiveRecord::Migration[6.1]
  def change
    create_table :skills do |t|
      t.string :description, null: false
      t.text :evaluation_criteria
      t.string :concept

      t.timestamps
    end
  end
end
