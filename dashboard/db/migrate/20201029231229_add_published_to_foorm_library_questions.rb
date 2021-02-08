class AddPublishedToFoormLibraryQuestions < ActiveRecord::Migration[5.0]
  def change
    add_column :foorm_library_questions, :published, :boolean, default: true, null: false
  end
end
