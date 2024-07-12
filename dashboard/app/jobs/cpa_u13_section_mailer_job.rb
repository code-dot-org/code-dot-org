class CpaU13SectionMailerJob < ApplicationJob
  queue_as :default

  def perform(user, sections)
    CpaU13SectionMailer.cpa_u13_section_warning(user, sections).deliver_later
  end
end
