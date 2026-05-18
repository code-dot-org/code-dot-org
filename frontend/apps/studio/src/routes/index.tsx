import {createFileRoute} from '@tanstack/react-router';

import Catalog from '@/modules/catalog/Catalog';

export const Route = createFileRoute('/')({
  component: Catalog,
});
