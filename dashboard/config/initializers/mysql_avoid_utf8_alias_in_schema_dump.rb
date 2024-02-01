# In MySQL 5.7 and earlier, `utf8` is an alias for `utf8mb3`, the three-byte
# variant of the unicode character set. Starting with MySQL 8, `utf8` is now an
# alias for `utf8mb4`, the four-byte variant.
#
# To help ease our transition from 5.7 to 8, avoid the use of the alias
# entirely and instead use the appropriate explicit value for the current
# verison.
#
# See https://dev.mysql.com/doc/refman/8.0/en/charset-unicode-utf8.html
module MysqlAvoidUtf8AliasInSchemaDump
  # Reimplement ActiveRecord::SchemaDumper::format_options to replace instances
  # of the `utf8` alias with the version-specific value it is aliasing.
  # See https://github.com/rails/rails/blob/7c1db8db9ea62f8e4b66bbeb1691ecbead80fdfe/activerecord/lib/active_record/schema_dumper.rb#L321-L323
  def format_options(options)
    if options.key?(:charset) && options[:charset] == 'utf8'
      options[:charset] = mysql_version < 8 ? 'utf8mb3' : 'utf8mb4'
    end

    if options.key?(:collation) && options[:collation] == 'utf8_unicode_ci'
      options[:collation] = mysql_version < 8 ? 'utf8mb3_unicode_ci' : 'utf8mb4_unicode_ci'
    end

    options.map {|key, value| "#{key}: #{value.inspect}"}.join(', ')
  end

  private

  def mysql_version
    @mysql_version ||= begin
      raw_version = ActiveRecord::Base.connection.select_value('SELECT VERSION()')
      case raw_version
      when /^8.0.\d+/
        8.0
      when /^5.7.\d+/
        5.7
      else
        raise "cannot parse MySQL version #{raw_version.inspect}"
      end
    end
  end
end

ActiveSupport.on_load(:active_record) do
  ActiveRecord::SchemaDumper.prepend MysqlAvoidUtf8AliasInSchemaDump
end
