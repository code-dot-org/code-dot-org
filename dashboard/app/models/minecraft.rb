class Minecraft < Blockly
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
    ['minecraft']
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(
        user: params[:user],
        game: Game.minecraft,
        level_num: 'custom',
        properties: {
          solution_blocks: params[:program] || '',
          toolbox_blocks: "<xml>#{toolbox}</xml>",
        }
    ))
  end

  def self.toolbox
    <<-XML.strip_heredoc.chomp
      <category name="Functions" custom="PROCEDURE"/>
    XML
  end

  def toolbox(type)
    Minecraft.toolbox
  end
end
