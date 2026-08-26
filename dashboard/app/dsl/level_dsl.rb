# Abstract base class for all level-specific DSLs, which provides some methods
# which are available to all DSL-defined level types.
class LevelDSL < BaseDSL
  def initialize
    super
    @hash[:editor_experiment] = nil
  end

  def encrypted(text)
    @hash['encrypted'] = '1'

    begin
      instance_eval(Encryption.decrypt_object(text))
    rescue OpenSSL::Cipher::CipherError, Encryption::KeyMissingError
      puts "warning: unable to decrypt level #{@name}, skipping"
      @encryption_key_missing = true
      return
    end
  end

  def editor_experiment(text)
    @hash[:editor_experiment] = text
  end

  def parse_output
    output = {name: @name, properties: @hash}
    # Report an undecryptable level to the seed path, which must not record the
    # file's md5 against the stub this parse produced; see parse_dsl_files.
    output[:encryption_key_missing] = true if @encryption_key_missing
    output
  end

  # Serialize all fields specified in the i18n_fields method into a hash.
  #
  # Subclasses should extend the i18n_fields method to define which of the
  # fields they add should be internationalized.
  #
  # @override
  def i18n_hash
    fields = self.class.i18n_fields.
      # we stringify the keys in the hash below, so also stringify these
      map(&:to_str).
      # sort the fields here so the resulting hash is also sorted
      sort

    @hash.
      # always stringify, for consistency
      deep_stringify_keys.
      # only accept keys that the DSL class has specified should be translated
      slice(*fields).
      # filter out any entries with nil key or value
      select {|key, value| key.present? && value.present?}
  end

  # can be extended by subclasses to specify which fields to include in the
  # i18n hash
  def self.i18n_fields
    []
  end
end
