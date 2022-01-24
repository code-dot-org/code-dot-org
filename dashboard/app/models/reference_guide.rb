# == Schema Information
#
# Table name: reference_guides
#
#  id                :bigint           not null, primary key
#  display_name      :string(255)
#  key               :string(255)      not null
#  course_version_id :integer          not null
#  content           :text(65535)
#  position          :integer          not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
class ReferenceGuide < ApplicationRecord
end
