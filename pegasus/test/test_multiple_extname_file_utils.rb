require_relative './test_helper'
require_relative '../helper_modules/multiple_extname_file_utils'

class MultipleExtnameFileUtilsTest < Minitest::Test
  include Rack::Test::Methods

  def test_all_extnames
    assert_equal [], MultipleExtnameFileUtils.all_extnames("foo")
    assert_equal [".rb"], MultipleExtnameFileUtils.all_extnames("foo.rb")
    assert_equal [".tar", ".gz"], MultipleExtnameFileUtils.all_extnames("foo.tar.gz")
    assert_equal [".js"], MultipleExtnameFileUtils.all_extnames(".eslintrc.js")
  end

  def test_file_has_any_extnames
    assert MultipleExtnameFileUtils.file_has_any_extnames(".js.erb", [".erb"])
    assert MultipleExtnameFileUtils.file_has_any_extnames("foo.js.erb", [".erb", ".haml"])
    assert MultipleExtnameFileUtils.file_has_any_extnames("foo.js.erb", [".erb"])
    assert MultipleExtnameFileUtils.file_has_any_extnames("foo.js.erb", [".js"])

    refute MultipleExtnameFileUtils.file_has_any_extnames(".js.erb", [".js"])
    refute MultipleExtnameFileUtils.file_has_any_extnames("foo.js.erb", [".haml"])
  end

  def test_file_has_only_extnames
    assert MultipleExtnameFileUtils.file_has_only_extnames("foo.js.erb", [".js", ".erb"])
    assert MultipleExtnameFileUtils.file_has_only_extnames("foo.js.erb", [".erb", ".js"])
    assert MultipleExtnameFileUtils.file_has_only_extnames("foo.js.erb", [".js", ".erb", ".haml"])
    assert MultipleExtnameFileUtils.file_has_only_extnames("foo.js.js", [".js", ".erb", ".haml"])

    refute MultipleExtnameFileUtils.file_has_only_extnames("foo.js.erb", [".erb"])
    refute MultipleExtnameFileUtils.file_has_only_extnames("foo.js.erb", [".js"])
    refute MultipleExtnameFileUtils.file_has_only_extnames("foo.js.erb", [".js", ".js", ".haml"])
  end

  def test_find_with_extnames
    dir = File.join(File.dirname(__FILE__), "fixtures/sites/code.org")
    assert_empty MultipleExtnameFileUtils.find_with_extnames(dir, "i18n/public/test_md", [".md"])
    refute_empty MultipleExtnameFileUtils.find_with_extnames(dir, "i18n/public/test_md.fr-FR", [".md"])

    refute_empty MultipleExtnameFileUtils.find_with_extnames(dir, "public/test_view", [".md"])
  end

  def test_find_with_extnames_only_subdirectory
    dir = File.join(File.dirname(__FILE__), "fixtures/sites/code.org/public/")
    subdir = File.join(dir, "folder")
    refute_empty MultipleExtnameFileUtils.find_with_extnames(dir, "test_md", [".md"])
    refute_empty MultipleExtnameFileUtils.find_with_extnames(subdir, "index", [".md"])
    assert_empty MultipleExtnameFileUtils.find_with_extnames(subdir, "../test_md", [".md"])
  end
end
