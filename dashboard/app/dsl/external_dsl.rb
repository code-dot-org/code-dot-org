class ExternalDSL < ContentDSL
  def initialize
    @hash = {href: '', options: {skip_dialog: true}}
  end

  def parse_output
    {name: @name, properties: @hash}
  end
end
