class Eval < Blockly
  serialized_attrs %w(
    solution_blocks
    free_play
  )

  before_save :update_ideal_level_source

  def xml_blocks
    super + %w(solution_blocks)
  end

  def self.builder
    @@eval_builder ||= Level.find_by(name: 'builder')
  end

  # List of possible skins, the first is used as a default.
  def self.skins
    ['eval']
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(
        user: params[:user],
        game: Game.eval,
        level_num: 'custom',
        properties: {
          solution_blocks: params[:program] || '',
          toolbox_blocks: "<xml>#{toolbox}</xml>",
          use_contract_editor: true
        }
    ))
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
      <category name ="Cond">
        <block type="functional_cond_1" />
        <block type="functional_cond_2" />
        <block type="functional_cond_3" />
        <block type="functional_cond_4" />
      </category>
      <category name="Functions" custom="PROCEDURE"/>
      <category name="Variables" custom="FUNCTIONAL_VARIABLE" />
    XML
  end

  def toolbox(type)
    Eval.toolbox
  end
end
