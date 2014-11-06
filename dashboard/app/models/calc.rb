class Calc < Blockly
  serialized_attrs %w(
    solution_blocks
    free_play
  )

  before_save :update_ideal_level_source

  def xml_blocks
    super + %w(solution_blocks)
  end

  def self.builder
    @@calc_builder ||= Level.find_by(name: 'builder')
  end

  # List of possible skins, the first is used as a default.
  def self.skins
    ['calc']
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(
        user: params[:user],
        game: Game.calc,
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
    XML
  end

  def toolbox(type)
    Calc.toolbox
  end
end
