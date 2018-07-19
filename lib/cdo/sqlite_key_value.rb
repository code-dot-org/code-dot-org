require 'sqlite3'

# Simple wrapper around sqlite3 to provide a key-value interface.
module Cdo
  class SqliteKeyValue
    def initialize(file, table: 'kv', size: nil)
      # Set various open flags.
      flags = ::SQLite3::Constants::Open::READWRITE | ::SQLite3::Constants::Open::CREATE |
        ::SQLite3::Constants::Open::SHAREDCACHE |
        ::SQLite3::Constants::Open::NOMUTEX

      @sqlite = ::SQLite3::Database.new(file, flags: flags)
      # Set various pragma statements for better performance.
      @sqlite.journal_mode = 'memory'
      @sqlite.synchronous = 'off'
      @sqlite.mmap_size = size if size
      @sqlite.read_uncommitted =  true

      @sqlite.execute("create table if not exists #{table} (k blob not null primary key, v blob)")
      @select = @sqlite.prepare("select v from #{table} where k = ?")
      @replace = @sqlite.prepare("replace into #{table} values (?, ?)")
      @data_written = false
    end

    def transaction(&block)
      @sqlite.transaction(&block)
      if @data_written
        @sqlite.execute('VACUUM')
        @data_written = false
      end
    end

    def [](key)
      rows = @select.execute!(key)
      rows.empty? ? nil : rows.first.first
    end

    def []=(key, value)
      @data_written = true
      @replace.execute!(key, value)
    end

    def close
      [@select, @replace].each(&:close)
      @sqlite.close
    end
  end
end
