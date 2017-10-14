class AddAddressLinesToSchools < ActiveRecord::Migration[5.0]
  def change
    add_column :schools, :address_line1, :string, limit: 30, comment: 'Location address, street 1'
    add_column :schools, :address_line2, :string, limit: 30, comment: 'Location address, street 2'
    add_column :schools, :address_line3, :string, limit: 30, comment: 'Location address, street 3'
  end
end
