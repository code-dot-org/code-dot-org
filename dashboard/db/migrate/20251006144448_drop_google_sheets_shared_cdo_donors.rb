class DropGoogleSheetsSharedCdoDonors < ActiveRecord::Migration[6.1]
  def change
    drop_table :google_sheets_shared_cdo_donors, if_exists: true
  end
end
