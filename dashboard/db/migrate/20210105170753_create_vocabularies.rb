class CreateVocabularies < ActiveRecord::Migration[5.2]
  def change
    create_table :vocabularies do |t|
      t.string :key, null: false
      t.string :word, null: false
      t.text :definition, null: false
      t.integer :course_version_id, null: false

      t.index [:word, :definition], type: :fulltext
      t.index [:key, :course_version_id], unique: true

      t.timestamps
    end
  end
end
