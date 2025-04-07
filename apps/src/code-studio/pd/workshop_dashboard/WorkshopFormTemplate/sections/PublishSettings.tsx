import Checkbox from '@code-dot-org/component-library/checkbox';
import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import TextField from '@code-dot-org/component-library/textField';
import {Heading2} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {ChangeEvent, FC, memo} from 'react';

import {PublishSettingsProps} from '../types';

import commonStyles from '../styles.module.scss';

export const PublishSettings: FC<PublishSettingsProps> = ({
  config: {fields},
  registrationLink,
  hidden,
  dispatchWorkshop,
}) => {
  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    dispatchWorkshop({
      type: 'UPDATE_WORKSHOP',
      payload: {[event.target.name]: event.target.value},
    });
  };
  return (
    <>
      <Heading2 visualAppearance="heading-sm">Publish Settings</Heading2>
      <div className={commonStyles.row}>
        {fields.registration_link && (
          <TextField
            name="registrationLink"
            helperMessage="You can provide a custom URL for registration. Participants must still enroll in our system later for attendance and surveys. Leave blank to use the default process."
            onChange={handleChange}
            value={registrationLink}
            label="Custom registration link"
            size="s"
            className={classNames(commonStyles.item, {
              [commonStyles.required]: fields.registration_link.required,
            })}
          />
        )}
        {fields.hidden ? (
          <FormFieldWrapper label="Catalog visibility" size="s">
            <Checkbox
              label="Hide this workshop from the public workshop catalog"
              name="hidden"
              checked={hidden}
              size="s"
              onChange={handleChange}
            />
          </FormFieldWrapper>
        ) : (
          <div className={commonStyles.item} />
        )}
      </div>
    </>
  );
};

export default memo(PublishSettings);
