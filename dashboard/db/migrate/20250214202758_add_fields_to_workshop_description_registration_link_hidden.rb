class AddFieldsToWorkshopDescriptionRegistrationLinkHidden < ActiveRecord::Migration[6.1]
  def change
    add_column :pd_workshops, :description, :text
    add_column :pd_workshops, :registration_link, :text
    add_column :pd_workshops, :hidden, :boolean
  end
end
