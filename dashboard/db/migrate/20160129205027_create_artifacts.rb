class CreateArtifacts < ActiveRecord::Migration
  def change
    create_table :artifacts do |t|
      t.string :name
      t.text :description
      t.references :learning_module, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
