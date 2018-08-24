require 'hammerspace'

# On-disk, off-heap key-value interface implemented via Hammerspace.
# Use separate reader and writer objects to optimize the common read-only case.
module Cdo
  class KeyValue
    def initialize(dir)
      @dir = dir
    end

    def reader
      @reader ||= Hammerspace.new(@dir)
    end

    def writer
      @writer ||= Hammerspace.new(@dir)
    end

    def [](key)
      reader[key]
    end

    def []=(key, value)
      writer[key] = value
    end

    def flush
      @reader.close if @reader
      @writer.close if @writer
      @reader = nil
      @writer = nil
    end
  end
end
