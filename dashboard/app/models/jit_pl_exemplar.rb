# == Schema Information
#
# Table name: jit_pl_exemplars
#
#  id                      :bigint           not null, primary key
#  name                    :string(255)
#  properties              :text(65535)
#  jit_pl_concept_id       :bigint
#  jit_pl_misconception_id :bigint
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#
# Indexes
#
#  index_jit_pl_exemplars_on_jit_pl_concept_id        (jit_pl_concept_id)
#  index_jit_pl_exemplars_on_jit_pl_misconception_id  (jit_pl_misconception_id)
#
class JitPlExemplar < ApplicationRecord
end
