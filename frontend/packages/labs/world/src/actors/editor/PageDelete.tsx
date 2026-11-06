import {Button} from '@mui/material';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

/** Delete, on the page of the thing it deletes: "Delete step". */
export const PageDelete = ({
  what,
  onDelete,
}: {
  what: string;
  onDelete: () => void;
}) => (
  <Button
    variant="text"
    size="extraSmall"
    startIcon={<FontAwesomeV6Icon iconName="trash" iconStyle="solid" />}
    onClick={onDelete}
  >
    Delete {what}
  </Button>
);
