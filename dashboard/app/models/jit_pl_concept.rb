# == Schema Information
#
# Table name: jit_pl_concepts
#
#  id           :bigint           not null, primary key
#  name         :string(255)
#  display_name :string(255)
#  properties   :text(65535)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
class JitPlConcept < ApplicationRecord
end
