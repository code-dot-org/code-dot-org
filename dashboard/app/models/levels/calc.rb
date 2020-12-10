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

class Calc < Blockly
  serialized_attrs %w(
    free_play
    input_output_table
  )

  # List of possible skins, the first is used as a default.
  def self.skins
    ['calc']
  end

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.calc,
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
      <category name="Functions" custom="PROCEDURE" />
      <category name="Variables" custom="FUNCTIONAL_VARIABLE" />
    XML
  end

  def toolbox(type)
    Calc.toolbox
  end
end
