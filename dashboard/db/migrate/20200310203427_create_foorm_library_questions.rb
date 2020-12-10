class CreateFoormLibraryQuestions < ActiveRecord::Migration[5.0]
  def change
    create_table :foorm_library_questions do |t|
      t.string :library_name, null: false
      t.integer :library_version, null: false
      t.string :question_name, null: false
      t.text :question, null: false

      t.timestamps

      t.index [:library_name, :library_version, :question_name], name: "index_foorm_library_questions_on_multiple_fields", unique: true
    end
  end
end
