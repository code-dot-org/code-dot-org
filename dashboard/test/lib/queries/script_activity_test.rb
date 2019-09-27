require 'test_helper'

class ScriptActivityTest < ActiveSupport::TestCase
  test 'user is working on scripts' do
    user = create :user
    s1 = create :user_script, user: user, started_at: (Time.now - 10.days), last_progress_at: (Time.now - 4.days)
    s2 = create :user_script, user: user, started_at: (Time.now - 50.days), last_progress_at: (Time.now - 3.days)
    c = create :user_script, user: user, started_at: (Time.now - 10.days), completed_at: (Time.now - 8.days)

    # all scripts
    assert_equal [s2, s1, c], user.user_scripts
    assert_equal [s2.script, s1.script, c.script], user.scripts

    # working on scripts
    assert_equal [s2.script, s1.script], Queries::ScriptActivity.working_on_scripts(user)
    # primary script -- most recently progressed in
    assert_equal s2.script, Queries::ScriptActivity.primary_script(user)

    # add an assigned script that's more recent
    a = create :user_script, user: user, started_at: (Time.now - 1.day)
    assert_equal [a.script, s2.script, s1.script], Queries::ScriptActivity.working_on_scripts(user)
    assert_equal a.script, Queries::ScriptActivity.primary_script(user)

    # make progress on an older script
    s1.update_attribute(:last_progress_at, Time.now - 3.hours)
    assert_equal [s1.script, a.script, s2.script], Queries::ScriptActivity.working_on_scripts(user)
    assert_equal s1.script, Queries::ScriptActivity.primary_script(user)
  end

  test 'user should prefer working on 20hour instead of hoc' do
    user = create :user

    twenty_hour = Script.twenty_hour_script
    hoc = Script.find_by(name: 'hourofcode')

    # do a level that is both in script 1 and hoc
    [twenty_hour, hoc].each do |script|
      UserScript.create! user: user, script: script
    end

    assert_equal [twenty_hour, hoc], Queries::ScriptActivity.working_on_scripts(user)
  end
end
