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
      __setobj__(super(&@block))
    end

    def is_a?(class1)
      class1 == Lazy || __getobj__.is_a?(class1)
    end
    alias kind_of? is_a?

    def instance_of?(class1)
      class1 == Lazy || __getobj__.instance_of?(class1)
    end

    undef_method(:nil?, :class)
  end

  def self.lazy(&block)
    Lazy.new(&block)
  end
end
