# == Schema Information
#
# Table name: jit_pl_misconceptions
#
#  id                :bigint           not null, primary key
#  name              :string(255)
#  ai_context        :json
#  properties        :text(65535)
#  jit_pl_concept_id :bigint           not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_jit_pl_misconceptions_on_jit_pl_concept_id  (jit_pl_concept_id)
#
class JitPlMisconception < ApplicationRecord
end
