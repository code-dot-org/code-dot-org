class AddValidationTypeToSchoolInfo < ActiveRecord::Migration[5.0]
  def change
    add_column :school_infos, :validation_type, :string, default: 'full'
  end
end
