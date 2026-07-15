import {decodeCertificateParams} from './certificateParams';

it('rejects malformed UTF-8 instead of replacing invalid bytes', () => {
  const bytes = [
    ...new TextEncoder().encode('{"course":"'),
    0xc3,
    0x28,
    ...new TextEncoder().encode('"}'),
  ];
  const encoded = btoa(bytes.map(byte => String.fromCharCode(byte)).join(''));

  expect(() => decodeCertificateParams(encoded)).toThrow();
});
