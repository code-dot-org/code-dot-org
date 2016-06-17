class AddDistrictToUser < ActiveRecord::Migration
  def change
    add_column :users, :country, :string
    add_column :users, :school_type, :string
    add_column :users, :school_state, :string
    add_column :users, :school_zip, :integer
    add_column :users, :school_district_id, :integer
    add_column :users, :school_district_other, :boolean
  end
end
