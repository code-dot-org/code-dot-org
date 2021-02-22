# == Schema Information
#
# Table name: frameworks
#
#  id         :bigint           not null, primary key
#  shortcode  :string(255)      not null
#  name       :string(255)      not null
#  properties :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_frameworks_on_shortcode  (shortcode) UNIQUE
#
class Framework < ApplicationRecord
end
