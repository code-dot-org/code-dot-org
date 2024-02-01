# In MySQL 5.7 and earlier, `utf8` is an alias for `utf8mb3`, the three-byte
# variant of the unicode character set. Starting with MySQL 8, `utf8` is now an
# alias for `utf8mb4`, the four-byte variant.
#
# To help ease our transition from 5.7 to 8, avoid the use of the alias
# entirely and instead use the appropriate explicit value for the current
# verison.
#
# TODO infra: once we have fully upgraded to MySQL 8+, we can remove this.
#
# See https://dev.mysql.com/doc/refman/8.0/en/charset-unicode-utf8.html
module MysqlAvoidUtf8AliasInSchemaDump
  # Reimplement ActiveRecord::SchemaDumper::format_options to replace instances
  # of the `utf8` alias with the version-specific value it is aliasing.
  # See https://github.com/rails/rails/blob/v6.1.7.3/activerecord/lib/active_record/schema_dumper.rb#L276-L278
  def format_options(options)
    options.map do |key, value|
      if key == :charset && value == 'utf8'
        value = current_mysql_version < 8 ? 'utf8mb3' : 'utf8mb4'
      end

      if key == :collation && value == 'utf8_unicode_ci'
        value = current_mysql_version < 8 ? 'utf8mb3_unicode_ci' : 'utf8mb4_unicode_ci'
      end

      "#{key}: #{value.inspect}"
    end.join(', ')
  end

  private

  def current_mysql_version
    @current_mysql_version ||= begin
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
