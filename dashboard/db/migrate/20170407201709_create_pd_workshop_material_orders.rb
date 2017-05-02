class CreatePdWorkshopMaterialOrders < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_workshop_material_orders do |t|
      t.timestamps
      t.integer :pd_enrollment_id, null: false
      t.integer :user_id, null: false
      t.string :school_or_company
      t.string :street, null: false
      t.string :apartment_or_suite
      t.string :city, null: false
      t.string :state, null: false
      t.string :zip_code, null: false
      t.string :phone_number, null: false
      t.datetime :order_attempted_at
      t.datetime :ordered_at
      t.text :order_response
      t.text :order_error
      t.string :order_id
      t.string :order_status
      t.datetime :order_status_last_checked_at
      t.datetime :order_status_changed_at
      t.string :tracking_id
      t.string :tracking_url
    end

    add_index :pd_workshop_material_orders, :pd_enrollment_id, unique: true
    add_index :pd_workshop_material_orders, :user_id, unique: true
  end
end
