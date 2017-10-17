class ChangeAddressLine1LimitInSchools < ActiveRecord::Migration[5.0]
  def change
    change_column :schools, :address_line1, :string, limit: 50, comment: 'Location address, street 1'
  end
end
