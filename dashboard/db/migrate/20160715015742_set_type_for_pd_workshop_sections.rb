class SetTypeForPdWorkshopSections < ActiveRecord::Migration
  def up
    Pd::Workshop.where.not(section:nil).each do |workshop|
      workshop.section.update!(section_type: Section::TYPE_PD_WORKSHOP)
    end
  end

  def down
    Section.where(section_type: Section::TYPE_PD_WORKSHOP).each do |section|
      section.update!(section_type: nil)
    end
  end
end
