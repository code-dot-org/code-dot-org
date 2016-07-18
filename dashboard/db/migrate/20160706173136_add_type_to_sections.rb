class AddTypeToSections < ActiveRecord::Migration
  def change
    # The type of the section, e.g., "classroom", "affiliate_pd", "plp_pd", etc.
    add_column :sections, :type, :string 
  end
end
