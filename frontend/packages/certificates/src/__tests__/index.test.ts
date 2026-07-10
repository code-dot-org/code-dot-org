import {decodeCertificateParams, encodeCertificateParams} from '..';

it('decodes utf8 certificate params', () => {
  expect(
    decodeCertificateParams(
      'eyJuYW1lIjoiWm_DqyDmnY4g8J-miiIsImNvdXJzZSI6Im9jZWFucyIsImRvbm9yIjoiQ29kZS5vcmcifQ',
    ),
  ).toEqual({
    course: 'oceans',
    donor: 'Code.org',
    name: 'Zoë 李 🦊',
  });
});

it('round-trips utf8 certificate params through encode/decode', () => {
  const params = {course: 'oceans', name: 'Maya שלום'};
  const encoded = encodeCertificateParams(params);

  expect(encoded).not.toMatch(/[+/=]/);
  expect(decodeCertificateParams(encoded)).toEqual(params);
});

it('falls back to hourofcode when the course is absent', () => {
  expect(decodeCertificateParams(btoa('{"name":"Ada"}'))).toEqual({
    course: 'hourofcode',
    name: 'Ada',
  });
});

it('throws on undecodable params', () => {
  expect(() => decodeCertificateParams('not-base64!')).toThrow();
  expect(() => decodeCertificateParams(btoa('[1,2]'))).toThrow();
});
