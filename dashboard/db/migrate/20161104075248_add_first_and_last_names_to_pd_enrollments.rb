class AddFirstAndLastNamesToPdEnrollments < ActiveRecord::Migration[5.0]
  class Pd::Enrollment < ActiveRecord::Base
  end

  def change
    change_table(:pd_enrollments) do |t|
      t.string :first_name, after: :name
      t.string :last_name, after: :first_name
    end

    # Migrate the existing data: Split each (full) name on the first space.
    reversible do |dir|
      dir.up do
        Pd::Enrollment.find_each do |enrollment|
          name_split = (enrollment.name || '').split(' ', 2)
          enrollment.first_name = name_split[0] || ''
          enrollment.last_name = name_split[1] || ''
          enrollment.save!
        end
      end
    end

    # Allow null on existing name column
    change_column_null :pd_enrollments, :name, true
  end
end
