require 'lmdb'
require 'fileutils'
require 'digest'

# Simple wrapper around LMDB to provide a key-value interface.
# Use separate reader and writer objects to optimize the common read-only case.
module Cdo
  class LMDBKeyValue
    def initialize(dir, size: 0)
      FileUtils.mkpath(dir)
      @dir = dir
      @options = {
        writemap: true,
        mapasync: true,
        nometasync: true,
        mapsize: size
      }
    end

    def reader
      return @reader if @reader
      @read_env = ::LMDB.new(@dir, @options.merge(rdonly: true))
      @read_env.transaction(true) do
        @reader = @read_env.database
      end
    rescue LMDB::Error => e
      raise unless e.message == 'No such file or directory'
      # Create database with writer first, then reload read-only environment.
      writer
      retry
    end

    def writer
      return @writer if @writer
      @write_env = ::LMDB.new(@dir, @options)
      @writer = @write_env.database(nil, create: true)
    end

    def [](key)
      reader.get(digest(key))
    end

    def []=(key, value)
      writer.put(digest(key), value)
    end

    def close
      @reader_env.close if @reader_env
      @writer_env.close if @writer_env
    end

    protected

    # Shorten key using hash digest to fit within LMDB's key-length limit.
    def digest(key)
      Digest::SHA2.hexdigest(key.to_s)
    end
  end
end
