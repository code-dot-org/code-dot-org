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
    [object.parse_output, object.i18n_strings]
  end

  # override in subclass
  def parse_output
    @hash
  end

  # after parse has been done, this function returns a hash of all the
  # user-visible strings from this instance
  def i18n_strings
    @hash.
      # always stringify, for consistency
      deep_stringify_keys.
      # only accept keys that the DSL class has specified should be translated
      slice(*self.class.i18n_fields).
      # filter out any entries with nil key or value
      select {|key, value| key.present? && value.present?}
  end

  # can be extended by subclasses to specify which fields to include in the
  # i18n_strings hash
  def self.i18n_fields
    []
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
