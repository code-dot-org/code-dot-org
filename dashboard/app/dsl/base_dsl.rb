class BaseDSL
  def initialize
    @hash = {}
  end

  def name(text)
    @name = text
  end

  def encrypted(text)
    @hash[:encrypted] = '1'
    instance_eval(Encryption::decrypt_object(text))
  end

  # returns 'xyz' from 'XyzDSL' subclasses
  def prefix()
    self.class.to_s.tap{|s|s.slice!('DSL')}.underscore
  end

  def self.parse_file(filename, name=nil)
    text = File.read(filename)
    parse(text, filename, name)
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
    # Filter out any entries with nil key or value
    hash = i18n_strings.select { |key, value| key && value }
    {"en" => { "data" => { prefix => hash}}}
  end

  # Implement in subclass
  def i18n_strings
  end

  def self.boolean(name)
    define_method(name) do |val|
      instance_variable_set "@#{name}", ActiveRecord::ConnectionAdapters::Column::value_to_boolean(val)
    end
  end

  def self.string(name)
    define_method(name) do |val|
      instance_variable_set  "@#{name}", val
    end
  end

  def self.integer(name)
    define_method(name) do |val|
      instance_variable_set "@#{name}", ActiveRecord::ConnectionAdapters::Column::value_to_integer(val)
    end
  end
end
