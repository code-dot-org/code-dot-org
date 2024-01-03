require 'test_helper'

class Policies::GenderTest < ActiveSupport::TestCase
  test 'normalize' do
    f_values = %w(f F female Female girl gal woman feminine she her mujer femail fem)
    m_values = %w(m M male Male boy guy man masculine him he hombre dude mail)
    n_values = ['n', 'they', 'them', 'nonbinary', 'NonBinary', 'non-binary', 'non binary', 'intersex', 'inter sex', 'genderfluid', 'gender fluid', 'intergender', 'inter gender', 'agender', 'boyflux', 'trans', 'transgender']
    o_values = ['o', 'O', 'notlisted', 'some nonsense']

    f_values.each {|s| assert_equal 'f', Policies::Gender.normalize(s)}
    m_values.each {|s| assert_equal 'm', Policies::Gender.normalize(s)}
    n_values.each {|s| assert_equal 'n', Policies::Gender.normalize(s)}
    o_values.each {|s| assert_equal 'o', Policies::Gender.normalize(s)}

    assert_nil Policies::Gender.normalize('')
    assert_nil Policies::Gender.normalize(nil)
  end
end
