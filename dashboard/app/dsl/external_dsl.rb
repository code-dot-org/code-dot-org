class ExternalDSL < ContentDSL
  def initialize
    @hash = {href: '', options: {skip_dialog: true}}
  end

  def href(url)
    @hash[:href] = url
  end

  def method_missing(key, *args)
    @hash[:options][key.to_sym] = args.first
  end

  def parse_output
    {name: @name, properties: @hash}
  end
end
