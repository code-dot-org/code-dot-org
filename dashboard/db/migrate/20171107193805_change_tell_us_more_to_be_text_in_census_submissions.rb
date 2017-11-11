class ChangeTellUsMoreToBeTextInCensusSubmissions < ActiveRecord::Migration[5.0]
  def change
    change_column :census_submissions, :tell_us_more, :text
  end
end
