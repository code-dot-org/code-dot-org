require_relative '../test_helper'
require 'cdo/http_request_logging'

describe Cdo::HttpRequestLogging do
  subject {Cdo::HttpRequestLogging}

  describe '.severity_for' do
    it 'maps 5xx to :error' do
      _(subject.severity_for(500)).must_equal :error
      _(subject.severity_for(503)).must_equal :error
    end

    it 'maps 4xx to :warn' do
      _(subject.severity_for(400)).must_equal :warn
      _(subject.severity_for(404)).must_equal :warn
      _(subject.severity_for(499)).must_equal :warn
    end

    it 'maps 2xx/3xx to :info' do
      _(subject.severity_for(200)).must_equal :info
      _(subject.severity_for(302)).must_equal :info
    end

    it 'accepts string status codes' do
      _(subject.severity_for('404')).must_equal :warn
    end
  end

  describe '.default_threshold' do
    it 'is :warn in production' do
      CDO.stubs(:rack_env?).with(:production).returns(true)
      _(subject.default_threshold).must_equal :warn
    end

    it 'is :info everywhere else' do
      CDO.stubs(:rack_env?).with(:production).returns(false)
      _(subject.default_threshold).must_equal :info
    end
  end

  describe '.threshold' do
    before do
      CDO.stubs(:rack_env?).with(:production).returns(false) # default :info
    end

    it 'reads the DCDO override' do
      DCDO.stubs(:get).with(Cdo::HttpRequestLogging::DCDO_KEY, :info).returns('warn')
      _(subject.threshold).must_equal :warn
    end

    it 'falls back to the environment default when DCDO is unset' do
      DCDO.stubs(:get).with(Cdo::HttpRequestLogging::DCDO_KEY, :info).returns(:info)
      _(subject.threshold).must_equal :info
    end

    it 'falls back to the environment default on an unrecognized value' do
      DCDO.stubs(:get).with(Cdo::HttpRequestLogging::DCDO_KEY, :info).returns('bogus')
      _(subject.threshold).must_equal :info
    end
  end

  describe '.should_log?' do
    it 'keeps only >= threshold when threshold is :warn' do
      subject.stubs(:threshold).returns(:warn)
      _(subject.should_log?(:info)).must_equal false
      _(subject.should_log?(:warn)).must_equal true
      _(subject.should_log?(:error)).must_equal true
    end

    it 'keeps everything when threshold is :info' do
      subject.stubs(:threshold).returns(:info)
      _(subject.should_log?(:info)).must_equal true
      _(subject.should_log?(:warn)).must_equal true
      _(subject.should_log?(:error)).must_equal true
    end
  end
end
