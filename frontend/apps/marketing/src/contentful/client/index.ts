import deliveryClient from '@/contentful/client/deliveryClient';
import previewClient from '@/contentful/client/previewClient';

export function getContentfulClient(isDraftModeEnabled: boolean = false) {
  return isDraftModeEnabled ? previewClient : deliveryClient;
}
