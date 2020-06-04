class BaseDSL
  def initialize
    @hash = {}
  end

  def name(text)
    @name = text
  end

  # returns 'xyz' from 'XyzDSL' subclasses
  def prefix
    self.class.to_s.tap {|s| s.slice!('DSL')}.underscore
  end

  def self.parse_file(filename, name=nil)
    text = File.read(filename)
    parse(text, filename, name)
  end

  def self.parse(str, filename, name=nil)
    object = new
    object.name(name) if name.present?
    ascii = str ? str.to_ascii : ''
    object.instance_eval(ascii, filename)
    [object.parse_output, object.i18n_hash]
  end

  # override in subclass
  def parse_output
    @hash
  end

  # After parse has been done, this function returns a hash of all the
  # user-visible strings from this instance.
  #
  # Override in subclass to provide class-specific functionality.
  def i18n_hash
    {}
  end

  def self.boolean(name)
    define_method(name) do |val|
      instance_variable_set "@#{name}", ActiveModel::Type::Boolean.new.deserialize(val)
    end
  end

  def self.string(name)
    define_method(name) do |val|
      instance_variable_set "@#{name}", val
    end
  end

  def self.integer(name)
    define_method(name) do |val|
      instance_variable_set "@#{name}", ActiveModel::Type::Integer.new.deserialize(val)
    end
  end
end
