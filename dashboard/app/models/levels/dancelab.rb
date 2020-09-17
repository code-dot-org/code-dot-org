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
#  properties            :text(16777215)
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

class Dancelab < GamelabJr
  serialized_attrs %w(
    default_song
  )

  def self.skins
    ['dance']
  end

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.dance,
        level_num: 'custom',
        properties: {
          block_pools: [
            "Dancelab",
          ],
          helper_libraries: [
            "DanceLab",
          ],
          hide_animation_mode: true,
          show_type_hints: true,
          use_modal_function_editor: true,
        }
      )
    )
  end

  def common_blocks(type)
  end

  def self.hoc_songs
    manifest_json = AWS::S3.create_client.get_object(bucket: 'cdo-sound-library', key: 'hoc_song_meta/songManifest2019.json')[:body].read
    manifest = JSON.parse(manifest_json)
    manifest['songs'].map do |song|
      name = "#{song['text']}#{song['pg13'] ? ' (PG-13)' : ''}"
      name = "#{song['2019'] ? '(2019) ' : ''}#{name}"
      [name, song['id']]
    end
  end
end
