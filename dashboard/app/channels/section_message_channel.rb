class SectionMessageChannel < ApplicationCable::Channel
  def subscribed
    current_user.sections_as_student.each do |section|
      stream_from "section-messages-#{section.id}"
    end
  end

  def self.broadcast(section_id, payload)
    ActionCable.server.broadcast("section-messages-#{section_id}", payload)
  end
end
