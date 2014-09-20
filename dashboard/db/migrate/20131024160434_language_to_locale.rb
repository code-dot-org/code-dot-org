class LanguageToLocale < ActiveRecord::Migration

  def up
    execute "ALTER TABLE users CHANGE language locale VARCHAR(10)"
    execute "UPDATE users SET locale = 'en-US' WHERE locale IS NULL;"
    execute "ALTER TABLE users MODIFY locale VARCHAR(10) NOT NULL DEFAULT 'en-US';"
    execute "UPDATE users SET locale = 'en-US' WHERE locale = 'en';"
  end

  def down
    execute "UPDATE users SET locale = 'en' WHERE locale = 'en-US';"
    execute "ALTER TABLE users CHANGE locale language VARCHAR(2);"
  end

end
