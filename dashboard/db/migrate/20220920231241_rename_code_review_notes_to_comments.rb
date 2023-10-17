class RenameCodeReviewNotesToComments < ActiveRecord::Migration[6.0]
  def up
    rename_table :code_review_notes, :code_review_comments

    execute <<-SQL.squish
      CREATE VIEW code_review_notes AS SELECT * from code_review_comments;
    SQL
  end

  def down
    execute <<-SQL.squish
      DROP VIEW code_review_notes;
    SQL

    rename_table :code_review_comments, :code_review_notes
  end
end
