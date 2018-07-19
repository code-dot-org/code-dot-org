require 'lmdb'
require 'fileutils'
require 'digest'

# Simple wrapper around LMDB to provide a key-value interface.
module Cdo
  class LMDBKeyValue
    def initialize(dir, size: nil)
      FileUtils.mkpath(dir)
      @lmdb = ::LMDB.new(
        dir,
        writemap: true,
        mapasync: true,
        nometasync: true,
        mapsize: size
      )
      @db = @lmdb.database(nil, create: true)
    end

    def transaction(&block)
      @lmdb.transaction(&block)
    end

    def [](key)
      @db[digest(key)]
    end

    def []=(key, value)
      @db[digest(key)] = value
    end

    def close
      @lmdb.close
    end

    protected

    # Shorten key using hash digest to fit within LMDB's key-length limit.
    def digest(key)
      Digest::SHA2.hexdigest(key)
    end
  end
end
