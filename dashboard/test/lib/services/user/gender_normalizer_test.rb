require 'test_helper'

class Services::User::GenderNormalizerTest < ActiveSupport::TestCase
  let(:described_instance) {described_class.new(raw_input: raw_input)}
  let(:raw_input) {nil}

  describe '#call' do
    subject(:normalize) {described_instance.call}

    context 'when female' do
      f_values = %w(f F female Female girl gal woman feminine she her mujer femail fem 여자 여 여성 kız kadın perempuan أنثى بنت انثي žena weiblich vrouw meisje kobieta fille féminin donna chica kvinde pige tjej kvinna ស្រី famale gril)
      f_values.each do |value|
        let(:raw_input) {value}

        it "returns #{Policies::Gender::NormalizedValues::FEMALE} for #{value}" do
          _(normalize).must_equal Policies::Gender::NormalizedValues::FEMALE
        end
      end
    end

    context 'when male' do
      m_values = ['m', 'M', 'male', 'Male', 'boy', 'guy', 'man', 'masculine', 'him', 'he', 'hombre', 'dude', 'mail', '남자', '남성', 'erkek', 'laki laki', 'laki-laki', 'männlich', 'mänlich', 'jongen', 'muž', 'mężczyzna', 'homme', 'maschio', 'uomo', 'macho', 'chico', 'pojke', 'mal', 'homem']
      m_values.each do |value|
        let(:raw_input) {value}

        it "returns #{Policies::Gender::NormalizedValues::MALE} for #{value}" do
          _(normalize).must_equal Policies::Gender::NormalizedValues::MALE
        end
      end
    end

    context 'when non-binary' do
      n_values = ['n', 'they', 'them', 'nonbinary', 'NonBinary', 'non-binary', 'non binary', 'intersex', 'inter sex', 'genderfluid', 'gender fluid', 'intergender', 'inter gender', 'agender', 'boyflux', 'trans', 'transgender', 'x']
      n_values.each do |value|
        let(:raw_input) {value}

        it "returns #{Policies::Gender::NormalizedValues::NON_BINARY} for #{value}" do
          _(normalize).must_equal Policies::Gender::NormalizedValues::NON_BINARY
        end
      end
    end

    context 'when other' do
      o_values = ['o', 'O', 'notlisted', 'some nonsense']
      o_values.each do |value|
        let(:raw_input) {value}

        it "returns #{Policies::Gender::NormalizedValues::OTHER} for #{value}" do
          _(normalize).must_equal Policies::Gender::NormalizedValues::OTHER
        end
      end
    end

    context 'when blank' do
      let(:raw_input) {''}

      it 'returns nil' do
        _(normalize).must_be_nil
      end
    end

    context 'when nil' do
      it 'returns nil' do
        _(normalize).must_be_nil
      end
    end
  end
end
