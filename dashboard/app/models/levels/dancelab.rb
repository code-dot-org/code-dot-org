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
#  ideal_level_source_id :bigint           unsigned
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

  # Used by levelbuilders to set a default song on a Dance Party level.
  def self.hoc_songs
    manifest_json = AWS::S3.create_client.get_object(bucket: 'cdo-sound-library', key: 'hoc_song_meta/songManifest2021.json')[:body].read
    manifest = JSON.parse(manifest_json)
    manifest['songs'].map do |song|
      name = song['text']
      name.prepend("(#{song['yearIntroduced']}) ") if song['yearIntroduced']
      name.concat(" (PG-13)") if song['pg13']
      [name, song['id']]
    end
  end
end
