# == Schema Information
#
# Table name: skills
#
#  id                  :bigint           not null, primary key
#  description         :string(255)      not null
#  evaluation_criteria :text(65535)
#  concept             :string(255)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
#  Note: "concept" already exists as connected to a video "concept" and is also used in some CSF materials in our codebase
#  the "concept" in this skill model is not the same as the "concept" in the video model.
class Skill < ApplicationRecord
  validates :description, presence: true
end
