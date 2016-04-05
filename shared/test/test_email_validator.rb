# coding: utf-8
require_relative 'test_helper'

require 'cdo/email_validator'

class EmailValidatorTest < Minitest::Test

  def test_valid_addresses
    valid_addresses = [
      'email@example.com',
      'firstname.lastname@example.com',
      'email@subdomain.example.co.uk',
      'firstname+lastname@example.com',
      'email@123.123.123.123',
      'email@[123.123.123.123]',
      '123456789@example.com',
      'email@example-one.com',
      '_______@example.com',
      'email@example.name',
      'email@example.museum',
      'email@example.co.jp',
      'firstname-lastname@example.com']

    valid_addresses.each do |address|
      assert EmailValidator.email_address?(address), "#{address} should be a valid email address"
    end
  end

  def test_invalid_addresses
    invalid_addresses = [
      nil,
      '',
      ' ',
      ' @ ',
      1234,
      {value: 3},
      'plainaddress',
      '#@%^%#$@#$@#.com',
      'joe@localhost',
      '@example.com',
      'Joe',
      'Smith',
      '<email@example.com>',
      'email.example.com',
      'email@example@example.com',
      'あいうえお@example.com',
      '(Joe',
      'Smith)',
      'email@example',
      'email@example..com']

    invalid_addresses.each do |address|
      assert !EmailValidator.email_address?(address), "#{address} should be an invalid email address"
    end
  end

end
