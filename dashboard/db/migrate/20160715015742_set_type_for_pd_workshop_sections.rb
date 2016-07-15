class SetTypeForPdWorkshopSections < ActiveRecord::Migration
  def up
    Pd::Workshop.where.not(section:nil).each do |workshop|
      workshop.section.update!(type: Section::TYPE_PD_WORKSHOP)
    end
  end

  def down
    Section.where(type: Section::TYPE_PD_WORKSHOP).each do |section|
      section.update!(type: nil)
    end
  end
end
