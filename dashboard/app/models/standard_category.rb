# == Schema Information
#
# Table name: standard_categories
#
#  id                 :bigint           not null, primary key
#  shortcode          :string(255)      not null
#  framework_id       :integer          not null
#  parent_category_id :integer
#  category_type      :string(255)      not null
#  properties         :text(65535)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_standard_categories_on_framework_id_and_shortcode  (framework_id,shortcode) UNIQUE
#  index_standard_categories_on_parent_category_id          (parent_category_id)
#
class StandardCategory < ApplicationRecord
end
