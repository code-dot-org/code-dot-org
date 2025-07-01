import deliveryClient from '@/contentful/client/deliveryClient';
import previewClient from '@/contentful/client/previewClient';

export function getContentfulClient(isDraftModeEnabled: boolean) {
  return isDraftModeEnabled ? previewClient : deliveryClient;
}
