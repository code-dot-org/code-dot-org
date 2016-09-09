class MakeWorkshopSectionTypeMoreGranular < ActiveRecord::Migration[4.2]
  def up
    Section.where(section_type: 'pd_workshop').each do |section|
      workshop = Pd::Workshop.find_by(section_id: section.id)

      # Set section_type to the more granular type.
      # Unless the associated workshop was hard-deleted in the past, in which case set it to null.
      section.update!(section_type: workshop.try(:section_type))
    end
  end
end
