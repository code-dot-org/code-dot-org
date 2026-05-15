import {createFileRoute} from '@tanstack/react-router';

import CatalogScreen from '@/modules/catalog/CatalogScreen';

export const Route = createFileRoute('/')({
  component: CatalogScreen,
});
