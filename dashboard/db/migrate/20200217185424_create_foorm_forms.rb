class CreateFoormForms < ActiveRecord::Migration[5.0]
  def change
    create_table :foorm_forms do |t|
      t.string :name, null: false
      t.integer :version, null: false
      t.text :questions, null: false

      t.timestamps

      t.index [:name, :version], unique: true
    end

    create_table :foorm_submissions do |t|
      t.string :form_name, null: false
      t.integer :form_version, null: false
      t.text :answers, null: false

      t.timestamps
    end
  end
end
