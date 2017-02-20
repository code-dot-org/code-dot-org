class AddValidationTypeToSchoolInfo < ActiveRecord::Migration[5.0]
  def change
    add_column :school_infos, :validation_type, :string, null: false, default: 'full'
  end
end
