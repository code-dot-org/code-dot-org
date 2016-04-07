class AddPdWorkshopTables < ActiveRecord::Migration
  def change
    create_table :pd_workshops do |t|
      t.string :workshop_type, null: false
      t.references :organizer, null: false, index: true
      t.string :location_name
      t.string :location_address
      t.string :course, null: false
      t.string :subject
      t.integer :capacity, null: false
      t.string :notes
      t.references :section
      t.datetime :started_at
      t.datetime :ended_at
      t.timestamps
    end

    create_join_table :pd_workshops, :users, table_name: :pd_workshops_facilitators do |t|
      t.index :pd_workshop_id
      t.index :user_id
    end

    create_table :pd_sessions do |t|
      t.references :pd_workshop, index: true
      t.datetime :start, null: false
      t.datetime :end, null: false
      t.timestamps
    end

    create_table :pd_enrollments do |t|
      t.references :pd_workshop, null: false, index: true
      t.string :name, null: false
      t.string :email, null: false
      t.timestamps
    end

    create_table :pd_attendances do |t|
      t.references :pd_session, null: false, index: true
      t.references :teacher, null: false
      t.timestamps
    end

    create_table :pd_district_payment_terms do |t|
      t.references :district
      t.string :course, null: false
      t.string :rate_type, null: false #hourly, daily
      t.decimal :rate, precision: 8, scale: 2, null: false
      t.index [:district_id, :course]
    end

    create_table :pd_plps do |t|
      t.string :name, null: false
      t.references :contact, null: false, index: true
      t.boolean :urban
    end
  end
end
