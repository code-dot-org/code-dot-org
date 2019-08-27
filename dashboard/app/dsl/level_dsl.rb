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
      return
    end
  end

  def editor_experiment(text)
    @hash[:editor_experiment] = text
  end

  def parse_output
    {name: @name, properties: @hash}
  end
end
