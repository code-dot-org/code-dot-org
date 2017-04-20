# == Schema Information
#
# Table name: levels
#
#  id                       :integer          not null, primary key
#  game_id                  :integer
#  name                     :string(255)      not null
#  created_at               :datetime
#  updated_at               :datetime
#  level_num                :string(255)
#  ideal_level_source_id    :integer
#  solution_level_source_id :integer
#  user_id                  :integer
#  properties               :text(65535)
#  type                     :string(255)
#  md5                      :string(255)
#  published                :boolean          default(FALSE), not null
#  notes                    :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#  index_levels_on_name     (name)
#

# This is a simple extension of the External level type that looks for the string
# <user_id/> in haml and replaces it with the user's id
class UserIdReplace < External
  def properties_with_replaced_markdown(user)
    user_id = user.try(:id).to_s
    properties.merge({'markdown' => properties['markdown'].gsub('<user_id/>', user_id)})
  end

  def update(params)
    super(params)
  end
end
