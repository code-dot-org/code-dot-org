class CreateSectionCalendarPlans < ActiveRecord::Migration[7.0]
  def change
    create_table :section_calendar_plans do |t|
      t.integer :section_id, null: false
      t.integer :unit_id, null: false
      t.string :course_name, null: false
      t.integer :unit_position, null: false
      t.date :start_date
      t.string :mode, null: false, default: 'weekly_minutes'
      t.integer :weekly_instructional_minutes, null: false, default: 225
      t.integer :created_by_user_id
      t.integer :updated_by_user_id

      t.timestamps
    end

    add_index :section_calendar_plans, :section_id
    add_index :section_calendar_plans, :unit_id
    add_index :section_calendar_plans,
      [:section_id, :course_name, :unit_position],
      unique: true,
      name: 'idx_section_calendar_plans_section_unit'

    create_table :section_calendar_sessions do |t|
      t.integer :section_calendar_plan_id, null: false
      t.string :client_id, null: false
      t.integer :weekday, null: false
      t.string :start_time, null: false
      t.integer :duration_minutes, null: false
      t.integer :position, null: false, default: 0
      t.boolean :active, null: false, default: true

      t.timestamps
    end

    add_index :section_calendar_sessions,
      [:section_calendar_plan_id, :client_id],
      unique: true,
      name: 'idx_section_calendar_sessions_client'
    add_index :section_calendar_sessions,
      [:section_calendar_plan_id, :weekday, :position],
      name: 'idx_section_calendar_sessions_order'

    create_table :section_calendar_one_off_sessions do |t|
      t.integer :section_calendar_plan_id, null: false
      t.string :client_id, null: false
      t.date :session_date, null: false
      t.string :start_time, null: false
      t.integer :duration_minutes, null: false
      t.integer :position, null: false, default: 0

      t.timestamps
    end

    add_index :section_calendar_one_off_sessions,
      [:section_calendar_plan_id, :client_id],
      unique: true,
      name: 'idx_section_calendar_one_offs_client'
    add_index :section_calendar_one_off_sessions,
      [:section_calendar_plan_id, :session_date, :position],
      name: 'idx_section_calendar_one_offs_order'

    create_table :section_calendar_cancellations do |t|
      t.integer :section_calendar_plan_id, null: false
      t.integer :section_calendar_session_id
      t.integer :section_calendar_one_off_session_id
      t.date :session_date, null: false
      t.string :reason

      t.timestamps
    end

    add_index :section_calendar_cancellations,
      [:section_calendar_plan_id, :session_date],
      name: 'idx_section_calendar_cancellations_date'
    add_index :section_calendar_cancellations,
      :section_calendar_session_id,
      name: 'idx_section_calendar_cancellations_session'
    add_index :section_calendar_cancellations,
      :section_calendar_one_off_session_id,
      name: 'idx_section_calendar_cancellations_one_off'

    create_table :section_calendar_items do |t|
      t.integer :section_calendar_plan_id, null: false
      t.string :client_id, null: false
      t.string :item_type, null: false
      t.integer :lesson_id
      t.string :placeholder_title
      t.integer :planned_minutes
      t.date :session_date
      t.string :session_client_id
      t.integer :session_sort
      t.boolean :removed, null: false, default: false

      t.timestamps
    end

    add_index :section_calendar_items,
      [:section_calendar_plan_id, :client_id],
      unique: true,
      name: 'idx_section_calendar_items_client'
    add_index :section_calendar_items,
      [:section_calendar_plan_id, :session_date, :session_sort],
      name: 'idx_section_calendar_items_session'
    add_index :section_calendar_items,
      [:section_calendar_plan_id, :session_client_id, :session_sort],
      name: 'idx_section_calendar_items_session_client'
    add_index :section_calendar_items, :lesson_id
  end
end
