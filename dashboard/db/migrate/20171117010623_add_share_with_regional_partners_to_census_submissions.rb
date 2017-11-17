class AddShareWithRegionalPartnersToCensusSubmissions < ActiveRecord::Migration[5.0]
  def change
    add_column :census_submissions, :share_with_regional_partners, :boolean
  end
end
