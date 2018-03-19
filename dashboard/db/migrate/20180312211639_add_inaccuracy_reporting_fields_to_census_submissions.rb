class AddInaccuracyReportingFieldsToCensusSubmissions < ActiveRecord::Migration[5.0]
  def change
    add_column :census_submissions, :inaccuracy_reported, :boolean
    add_column :census_submissions, :inaccuracy_comment, :text
  end
end
