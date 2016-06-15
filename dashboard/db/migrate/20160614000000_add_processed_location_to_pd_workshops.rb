class AddProcessedLocationToPdWorkshops < ActiveRecord::Migration
  def up
    add_column :pd_workshops, :processed_location, :text, after: :location_address

    Pd::Workshop.reset_column_information
    Pd::Workshop.find_each do |workshop|
      begin
        workshop.processed_location = Pd::Workshop.process_location(workshop.location_address)
        workshop.save!
      rescue RuntimeError => e
        # Log the error but don't fail the migration if something goes wrong.
        CDO.logger.error "Error processing location for pd_workshop #{workshop.id}: #{e.message}"
      end
    end
  end

  def down
    remove_column :pd_workshops, :processed_location
  end
end
