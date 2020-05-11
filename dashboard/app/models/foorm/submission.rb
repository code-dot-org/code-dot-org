# == Schema Information
#
# Table name: foorm_submissions
#
#  id           :integer          not null, primary key
#  form_name    :string(255)      not null
#  form_version :integer          not null
#  answers      :text(65535)      not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#

class Foorm::Submission < ActiveRecord::Base
  belongs_to :foorm_form
  before_validation :strip_emoji_from_answers

  # Drops unicode characters not supported by utf8mb3 strings (most commonly emoji)
  # from the submission answers
  # We can remove this once our database has utf8mb4 support everywhere.
  def strip_emoji_from_answers
    # Drop emoji and other unsupported characters
    self.answers = answers&.strip_utf8mb4&.strip
  end
end
