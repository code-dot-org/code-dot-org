# == Schema Information
#
# Table name: palette_categories
#
#  id         :bigint           not null, primary key
#  key        :string(255)      not null
#  name       :string(255)      not null
#  color      :string(255)      not null
#  lab_id     :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class PaletteCategory < ApplicationRecord
  belongs_to :lab
end
