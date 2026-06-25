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
#  properties            :text(4294967295)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#  index_levels_on_type       (type)
#

# Lab2 client-side Sprite Lab. Reuses the classic Sprite Lab p5.play engine and
# blocks (see GamelabJr) but renders through the Lab2 framework, so it sets
# uses_lab2 and routes to the spritelab2 entrypoint via game.app. Modeled on
# Dancelab, the other GamelabJr descendant that opts into Lab2.
class Spritelab2 < GamelabJr
  serialized_attrs %w(
    uses_lab2
    guide_mode
    ai_code_generate_adlib
    ai_code_generate_text
    exemplar_sources
  )

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.spritelab2,
        level_num: 'custom',
        properties: {
          uses_lab2: true,
          block_pools: [
            'GamelabJr',
          ],
          helper_libraries: [
            'NativeSpriteLab',
          ],
          use_default_sprites: true,
          hide_animation_mode: true,
          show_type_hints: true,
          hide_custom_blocks: true,
          all_animations_single_frame: true,
          use_modal_function_editor: true,
        }
      )
    )
  end

  # The Lab2 frontend selects its entrypoint by game.app (see
  # Level#summarize_for_lab2_properties), which resolves to 'spritelab2'.
  def project_type
    return game&.app
  end
end
