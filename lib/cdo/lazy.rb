module Cdo
  # Lazy-loads a delegated object from a block.
  #
  # Example:
  #
  # > lazy = Cdo.lazy {puts 'loaded!'; 'Lazy'}; true
  # => true
  # > puts lazy
  # loaded!
  # Lazy
  # => nil
  #
  # NOTE: lazy `nil` / `false` values are 'truthy' in boolean expressions:
  #
  # > nil && true
  # => nil
  # > Cdo.lazy {nil} && true
  # => true
  class Lazy < SimpleDelegator
    def initialize(&block)
      @block = block
    end

    def __getobj__
      __setobj__(@block.call) unless defined?(@delegate_sd_obj)
      super
    end

    undef_method(:instance_of?, :kind_of?, :is_a?, :nil?, :class)
  end

  def self.lazy(&block)
    Lazy.new(&block)
  end
end
