import {getContentfulClient} from '../';
import deliveryClient from '../deliveryClient';
import previewClient from '../previewClient';

jest.mock('@/contentful/client/deliveryClient', () => ({
  default: jest.fn(),
}));

jest.mock('@/contentful/client/previewClient', () => ({
  default: jest.fn(),
}));

describe('getContentfulClient', () => {
  it('should return previewClient when isDraftModeEnabled is true', () => {
    const result = getContentfulClient(true);
    expect(result).toBe(previewClient);
  });

  it('should return deliveryClient when isDraftModeEnabled is false', () => {
    const result = getContentfulClient(false);
    expect(result).toBe(deliveryClient);
  });
});
