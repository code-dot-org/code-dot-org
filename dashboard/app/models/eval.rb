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
          toolbox_blocks: "<xml>#{toolbox}</xml>"
        }
    ))
  end

  def self.toolbox
    <<-XML.strip_heredoc.chomp
      <block type="functional_plus"></block>
      <block type="functional_minus"></block>
      <block type="functional_times"></block>
      <block type="functional_dividedby"></block>
      <block type="functional_math_number"></block>
      <block type="functional_string"></block>
      <block type="functional_style"></block>
      <block type="functional_circle"></block>
      <block type="functional_triangle"></block>
      <block type="functional_square"></block>
      <block type="functional_rectangle"></block>
      <block type="functional_ellipse"></block>
      <block type="functional_star"></block>
      <block type="place_image"></block>
      <block type="overlay"></block>
      <block type="underlay"></block>
      <block type="rotate"></block>
      <block type="scale"></block>
      <block type="functional_text"></block>

    XML
  end

  def toolbox(type)
    Eval.toolbox
  end
end
