# == Schema Information
#
# Table name: levels
#
#  id                    :integer          not null, primary key
#  game_id               :integer
#  name                  :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  level_num             :string(255)
#  ideal_level_source_id :integer          unsigned
#  user_id               :integer
#  properties            :text(65535)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#  index_levels_on_name     (name)
#

class Unplugged < Level
  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(user: params[:user], game: Game.unplugged, level_num: 'custom'))
  end

  def assign_attributes(new_attributes)
    # Use the existing title and description if they are not provided. When cloning,
    # This gives the new level the title and description of the old level.
    i18n_strings = {
      'title' => new_attributes[:title] ? new_attributes.delete(:title) : title,
      'desc' => new_attributes[:description] ? new_attributes.delete(:description) : description,
    }
    update_i18n(new_attributes[:name], i18n_strings)

    super(new_attributes)
  end

  def title
    I18n.t("data.unplugged.#{name}.title") if name
  end

  def description
    I18n.t("data.unplugged.#{name}.desc") if name
  end

  def update_i18n(name, new_strings)
    return unless name
    unplugged_yml = File.expand_path('config/locales/unplugged.en.yml')
    i18n = File.exist?(unplugged_yml) ? YAML.load_file(unplugged_yml) : {}
    i18n.deep_merge!({'en' => {'data' => {'unplugged' => {name => new_strings}}}})
    File.write(unplugged_yml, i18n.to_yaml(line_width: -1))
  end
end
