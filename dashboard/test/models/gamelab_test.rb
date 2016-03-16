require 'test_helper'

class GamelabTest < ActiveSupport::TestCase
  APPS_PATH = '../apps'

  test 'palette JSON matches gamelab/levels.js levels.custom JSON' do
    file_contents = IO.read("#{APPS_PATH}/src/gamelab/levels.js")

    # Use regular expression to extract values of codeFunctions member
    # from levels.custom object in gamelab/levels.js
    # See regex demo at http://rubular.com/r/iXOyE8dAPj
    code_functions = /\s*
      levels\.custom\s*=       # Find assignment of levels.custom
      [^}]*                    # Skip other properties up to codeFunctions
      '?codeFunctions'?\s*:\s* # Find codeFunctions property
      (\{[^}]*\})              # Capture value of property
    /mx.match(file_contents)[1]

    assert_same_keys(JSON.parse(code_functions), JSON.parse(Gamelab.palette),
                     'gamelab/levels.js', 'gamelab.rb',
                     "Ruby-JavaScript palette mismatch")
  end

end
