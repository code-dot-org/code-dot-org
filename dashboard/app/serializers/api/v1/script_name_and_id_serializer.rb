# == Schema Information
#
# Table name: scripts
#
#  id              :integer          not null, primary key
#  name            :string(255)      not null
#  created_at      :datetime
#  updated_at      :datetime
#  wrapup_video_id :integer
#  hidden          :boolean          default(FALSE), not null
#  user_id         :integer
#  login_required  :boolean          default(FALSE), not null
#  properties      :text(65535)
#
# Indexes
#
#  index_scripts_on_name             (name) UNIQUE
#  index_scripts_on_wrapup_video_id  (wrapup_video_id)
#

class Api::V1::ScriptNameAndIdSerializer < ActiveModel::Serializer
  include ScriptConstants

  attributes :id, :name, :script_name

  def name
    object_name = ScriptConstants.teacher_dashboard_name(object.name)
    object.hidden ? "*" : I18n.t("#{object_name}_name", default: object_name)
  end

  def script_name
    object.name
  end
end
