# == Schema Information
#
# Table name: reference_guides
#
#  id                         :bigint           not null, primary key
#  key                        :string(255)      not null
#  course_version_id          :bigint           not null
#  parent_reference_guide_key :string(255)
#  display_name               :string(255)
#  content                    :text(65535)
#  position                   :integer          not null
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#
# Indexes
#
#  index_reference_guides_on_course_version_id_and_key         (course_version_id,key) UNIQUE
#  index_reference_guides_on_course_version_id_and_parent_key  (course_version_id,parent_reference_guide_key)
#
class ReferenceGuide < ApplicationRecord
end
