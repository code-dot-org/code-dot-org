require_relative '../test_helper'
require 'cdo/developers_topic'

class DevelopersTopicTest < Minitest::Test
  describe 'dotd' do
    it 'returns the dotd user ID from mention tag' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: yes; DTP: yes; DTL: yes')

      assert_equal 'U12345', DevelopersTopic.dotd
    end

    it 'handles various user ID formats' do
      Slack.stubs(:get_topic).returns('DOTD: <@UABC123XYZ>; DTS: yes; DTT: yes; DTP: yes; DTL: yes')

      assert_equal 'UABC123XYZ', DevelopersTopic.dotd
    end

    it 'raises an exception if topic is malformed' do
      Slack.stubs(:get_topic).returns('DTS: yes; DTT: yes; DTP: yes; DTL: yes')

      assert_raises {DevelopersTopic.dotd}
    end

    it 'raises an exception if topic uses old username format' do
      Slack.stubs(:get_topic).returns('DOTD: @someone; DTS: yes; DTT: yes; DTP: yes; DTL: yes')

      assert_raises {DevelopersTopic.dotd}
    end
  end

  describe 'dts?' do
    it 'returns true when DTS is yes' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: no; DTP: no; DTL: no')

      assert DevelopersTopic.dts?
    end

    it 'returns false when DTS is no' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: no (why); DTT: yes; DTP: yes; DTL: yes')

      refute DevelopersTopic.dts?
    end

    it 'returns false when DTS is missing' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTT: yes; DTP: yes; DTL: yes')

      refute DevelopersTopic.dts?
    end
  end

  describe 'dtt?' do
    it 'returns true when DTT is yes' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: no; DTT: yes; DTP: no; DTL: no')

      assert DevelopersTopic.dtt?
    end

    it 'returns false when DTT is no' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: no (why); DTP: yes; DTL: yes')

      refute DevelopersTopic.dtt?
    end

    it 'returns false when DTT is missing' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTP: yes; DTL: yes')

      refute DevelopersTopic.dtt?
    end
  end

  describe 'dtp?' do
    it 'returns true when DTP is yes' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: no; DTT: no; DTP: yes; DTL: no')

      assert DevelopersTopic.dtp?
    end

    it 'returns false when DTP is no' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: yes; DTP: no (why); DTL: yes')

      refute DevelopersTopic.dtp?
    end

    it 'returns false when DTP is missing' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: yes; DTL: yes')

      refute DevelopersTopic.dtp?
    end
  end

  describe 'dtl?' do
    it 'returns true when DTL is yes' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: no; DTT: no; DTP: no; DTL: yes')

      assert DevelopersTopic.dtl?
    end

    it 'returns false when DTL is no' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: yes; DTP: yes; DTL: no (why)')

      refute DevelopersTopic.dtl?
    end

    it 'returns false when DTL is missing' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: yes; DTP: yes')

      refute DevelopersTopic.dtl?
    end
  end

  describe 'dts' do
    it 'returns DTS message' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: no (why); DTT: yes; DTP: yes; DTL: yes')

      assert_equal 'no (why)', DevelopersTopic.dts
    end

    it 'raises when DTS is missing' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTT: yes; DTP: yes; DTL: yes')

      assert_raises {DevelopersTopic.dts}
    end
  end

  describe 'dtt' do
    it 'returns DTT message' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: no (why); DTP: yes; DTL: yes')

      assert_equal 'no (why)', DevelopersTopic.dtt
    end

    it 'raises when DTT is missing' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTP: yes; DTL: yes')

      assert_raises {DevelopersTopic.dtt}
    end
  end

  describe 'dtp' do
    it 'returns DTP message' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: yes; DTP: no (why); DTL: yes')

      assert_equal 'no (why)', DevelopersTopic.dtp
    end

    it 'raises when DTP is missing' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: yes; DTL: yes')

      assert_raises {DevelopersTopic.dtp}
    end
  end

  describe 'dtl' do
    it 'returns DTL message' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: yes; DTP: yes; DTL: no (why)')

      assert_equal 'no (why)', DevelopersTopic.dtl
    end

    it 'raises when DTL is missing' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: yes; DTP: yes')

      assert_raises {DevelopersTopic.dtl}
    end
  end

  describe 'set_dts' do
    it 'sets DTS message' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: yes; DTP: yes; DTL: yes')
      Slack.expects(:update_topic).with(
        'developers',
        'DOTD: <@U12345>; DTS: no; DTT: yes; DTP: yes; DTL: yes'
      )
      DevelopersTopic.set_dts('no')
    end

    it 'raises when DTS is missing' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTT: yes; DTP: yes; DTL: yes')
      Slack.expects(:update_topic).never
      assert_raises {DevelopersTopic.set_dts('no')}
    end
  end

  describe 'set_dtt' do
    it 'sets DTT message' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: yes; DTP: yes; DTL: yes')
      Slack.expects(:update_topic).with(
        'deploy-status',
        'DOTD: <@U12345>; DTS: yes; DTT: no; DTP: yes; DTL: yes'
      )
      DevelopersTopic.set_dtt('no')
    end

    it 'raises when DTT is missing' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTP: yes; DTL: yes')
      Slack.expects(:update_topic).never
      assert_raises {DevelopersTopic.set_dtt('no')}
    end
  end

  describe 'set_dtp' do
    it 'sets DTP message' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: yes; DTP: yes; DTL: yes')
      Slack.expects(:update_topic).with(
        'deploy-status',
        'DOTD: <@U12345>; DTS: yes; DTT: yes; DTP: no; DTL: yes'
      )
      DevelopersTopic.set_dtp('no')
    end

    it 'raises when DTP is missing' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: yes; DTL: yes')
      Slack.expects(:update_topic).never
      assert_raises {DevelopersTopic.set_dtp('no')}
    end
  end

  describe 'set_dtl' do
    it 'sets DTL message' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: yes; DTP: yes; DTL: yes')
      Slack.expects(:update_topic).with(
        'deploy-status',
        'DOTD: <@U12345>; DTS: yes; DTT: yes; DTP: yes; DTL: no'
      )
      DevelopersTopic.set_dtl('no')
    end

    it 'raises when DTL is missing' do
      Slack.stubs(:get_topic).returns('DOTD: <@U12345>; DTS: yes; DTT: yes; DTP: yes')
      Slack.expects(:update_topic).never
      assert_raises {DevelopersTopic.set_dtl('no')}
    end
  end
end
