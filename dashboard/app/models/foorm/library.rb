# == Schema Information
#
# Table name: foorm_libraries
#
#  id         :bigint           not null, primary key
#  name       :string(255)      not null
#  version    :integer          not null
#  published  :boolean          default(TRUE), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_foorm_libraries_on_multiple_fields  (name,version) UNIQUE
#
class Foorm::Library < ApplicationRecord
end
