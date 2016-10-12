class CreateOpsTables < ActiveRecord::Migration[4.2]
  def change
    create_table :districts do |t|
      t.string :name, null: false
      t.index :name
      t.string :location
      t.references :contact, index: true

      t.timestamps
    end

    create_table :cohorts do |t|  # rubocop:disable Style/SymbolProc
      t.timestamps
    end

    create_table :workshops do |t|
      t.string :name
      t.index :name
      t.string :program_type, null: false
      t.index :program_type
      t.string :location
      t.string :instructions
      t.references :cohort, index: true, null: false
      t.references :facilitator, index: true, null: false

      t.timestamps
    end

    create_table :segments do |t|
      t.references :workshop, index: true, null: false
      t.datetime :start, null: false
      t.index :start
      t.datetime :end
      t.index :end

      t.timestamps
    end

    create_table :workshop_attendance do |t|
      t.references :teacher, index: true, null: false
      t.references :segment, index: true, null: false
      t.string :status, null: false

      t.timestamps
    end

    # Each teacher is associated with at most one district
    create_join_table :users, :districts do |t|
      t.index [:user_id, :district_id]
      t.index [:district_id, :user_id]
    end

    # Each teacher is associated with zero or more cohorts
    create_join_table :users, :cohorts do |t|
      t.index [:user_id, :cohort_id]
      t.index [:cohort_id, :user_id]
    end

    # Each cohort is associated with one or more districts
    create_join_table :cohorts, :districts do |t|
      t.index [:district_id, :cohort_id]
      t.index [:cohort_id, :district_id]
    end
  end
end
