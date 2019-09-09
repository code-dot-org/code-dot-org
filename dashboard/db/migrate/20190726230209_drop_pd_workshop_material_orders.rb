class DropPdWorkshopMaterialOrders < ActiveRecord::Migration[5.0]
  def change
    drop_table :pd_workshop_material_orders
  end
end
