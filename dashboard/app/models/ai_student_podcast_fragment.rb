# == Schema Information
#
# Table name: ai_student_podcast_fragments
#
#  id             :bigint           not null, primary key
#  user_id        :bigint
#  lesson_id      :integer
#  fragment_type  :string(255)
#  objective_id   :integer
#  podcast_script :text(65535)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
class AiStudentPodcastFragment < ApplicationRecord
end
