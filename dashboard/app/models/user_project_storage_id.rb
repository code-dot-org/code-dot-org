# == Schema Information
#
# Table name: user_project_storage_ids
#
#  id      :integer          not null, primary key
#  user_id :integer
#
# Indexes
#
#  user_id                         (user_id) UNIQUE
#  user_storage_ids_user_id_index  (user_id)
#
class UserProjectStorageId < ApplicationRecord
  belongs_to :user
  has_many :projects, inverse_of: :user_project_storage_id
end
