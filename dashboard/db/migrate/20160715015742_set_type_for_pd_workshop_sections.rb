class SetTypeForPdWorkshopSections < ActiveRecord::Migration[4.2]
  def up
    Pd::Workshop.where.not(section: nil).find_each do |workshop|
      workshop.section.update!(section_type: Section::TYPE_PD_WORKSHOP)
    end
  end

  def down
    Section.where(section_type: Section::TYPE_PD_WORKSHOP).find_each do |section|
      section.update!(section_type: nil)
    end
  end
end
