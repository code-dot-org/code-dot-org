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
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#

class Eval < Blockly
  serialized_attrs %w(
    free_play
    coordinate_grid_background
  )

  # List of possible skins, the first is used as a default.
  def self.skins
    ['eval']
  end

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.eval,
        level_num: 'custom',
        properties: {
          solution_blocks: params[:program] || '',
          toolbox_blocks: "<xml>#{toolbox}</xml>",
          use_contract_editor: true
        }
      )
    )
  end

  def self.toolbox
    <<-XML.strip_heredoc.chomp
      <category name="Number">
        <block type="functional_plus"></block>
        <block type="functional_minus"></block>
        <block type="functional_times"></block>
        <block type="functional_dividedby"></block>
        <block type="functional_math_number"></block>
        <block type="functional_math_number_dropdown">
          <title name="NUM" config="0,1,2,3,4,5,6,7,8,9,10">???</title>
        </block>
        <block type="functional_sqrt"></block>
        <block type="functional_squared"></block>
        <block type="functional_pow"></block>
      </category>
      <category name="String">
        <block type="functional_string"></block>
        <block type="functional_style"></block>
        <block type="string_append"></block>
        <block type="string_length"></block>
      </category>
      <category name="Image">
        <block type="functional_circle"></block>
        <block type="functional_triangle"></block>
        <block type="functional_square"></block>
        <block type="functional_rectangle"></block>
        <block type="functional_ellipse"></block>
        <block type="functional_star"></block>
        <block type="functional_radial_star"></block>
        <block type="functional_polygon"></block>
        <block type="place_image"></block>
        <block type="offset"></block>
        <block type="overlay"></block>
        <block type="underlay"></block>
        <block type="rotate"></block>
        <block type="scale"></block>
        <block type="functional_text"></block>
      </category>
      <category name="Boolean">
        <block type="functional_greater_than" />
        <block type="functional_less_than" />
        <block type="functional_number_equals" />
        <block type="functional_string_equals" />
        <block type="functional_logical_and" />
        <block type="functional_logical_or" />
        <block type="functional_logical_not" />
        <block type="functional_boolean" />
      </category>
      <category name ="Conditionals">
        <block type="functional_cond_number" />
        <block type="functional_cond_string" />
        <block type="functional_cond_image" />
        <block type="functional_cond_boolean" />
      </category>
      <category name="Functions" custom="PROCEDURE"/>
      <category name="Variables" custom="FUNCTIONAL_VARIABLE" />
    XML
  end

  def toolbox(type)
    Eval.toolbox
  end

  # What blocks should be embedded for the given block_xml
  def blocks_to_embed(block_xml)
    # Solution blocks are defined in the form
    # <block type="functional_display" (some attributes)>
    #   <block type="function_input" (some attributes)>
    #     (the blocks we care about)
    #   </block>
    # </block>
    embed_xml = block_xml
    # This regex extracts the blocks we care about
    match = /<xml><block type="functional_display".*?><functional_input.*?>(.*)<\/functional_input><\/block><\/xml>/.match(block_xml)
    embed_xml = match[1] if match && match[1]
    return embed_xml
  end
end
