class MakeRegionalParterGroupNullable < ActiveRecord::Migration[5.0]
  def change
    change_column_null :regional_partners, :group, true
  end
end
