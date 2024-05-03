import React, {useState} from 'react';

import ChildSectionsWarningDialog from '@cdo/apps/templates/policy_compliance/childAccountPolicy/ChildSectionsWarningDialog';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

interface Props {
  // No props
}

// eslint-disable-next-line no-empty-pattern
export const ChildSectionsWarningNotification: React.FC<Props> = ({}) => {
  const [childSectionsDialogOpen, setChildSectionsDialogOpen] = useState(false);
  const onClose = () => {
    setChildSectionsDialogOpen(!childSectionsDialogOpen);
  };

  return (
    <div>
      <Notification
        type={NotificationType.warning}
        notice={i18n.headsUp()}
        details={i18n.childAccountPolicy_SectionsWarning_notificationDetails()}
        dismissible={true}
        buttonLink="#classroom-sections"
        buttonText={i18n.learnMore()}
        onButtonClick={onClose}
      />
      <ChildSectionsWarningDialog
        isOpen={childSectionsDialogOpen}
        onClose={onClose}
      />
    </div>
  );
};

export default ChildSectionsWarningNotification;
