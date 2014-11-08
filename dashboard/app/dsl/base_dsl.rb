class BaseDSL
  def initialize
    @hash = {}
  end

  def name(text)
    @name = text
  end

  # returns 'xyz' from 'XyzDSL' subclasses
  def prefix()
    self.class.to_s.tap{|s|s.slice!('DSL')}.underscore
  end

  def self.parse_file(filename, name=nil)
    parse(File.read(filename), filename, name)
  end

  def self.parse(str, filename, name=nil)
    object = self.new
    object.name(name) if name.present?
    object.instance_eval(str.to_ascii, filename)
    [object.parse_output, object.i18n_hash]
  end

  # override in subclass
  def parse_output
    @hash
  end

  # after parse has been done, this function returns a hash of all the user-visible strings from this instance
  def i18n_hash
    {"en" => { "data" => { prefix => i18n_strings }}}
  end

  # Implement in subclass
  def i18n_strings
  end

end
