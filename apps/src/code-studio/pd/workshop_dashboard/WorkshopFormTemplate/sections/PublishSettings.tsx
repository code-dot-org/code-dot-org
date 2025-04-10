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
  errors,
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

  if (!fields.registration_link && !fields.hidden) {
    return null;
  }

  return (
    <section>
      <Heading2 visualAppearance="heading-sm">Publish Settings</Heading2>
      {(fields.registration_link || fields.hidden) && (
        <div className={commonStyles.row}>
          {fields.registration_link && (
            <TextField
              name={fields.registration_link.stateKey}
              helperMessage={fields.registration_link.helperMessage}
              onChange={handleChange}
              value={registrationLink}
              label={fields.registration_link.label}
              size="s"
              className={classNames(commonStyles.item, {
                [commonStyles.required]: fields.registration_link.required,
              })}
              errorMessage={errors.registrationLink}
            />
          )}
          {fields.hidden ? (
            <FormFieldWrapper
              label={fields.hidden.label}
              size="s"
              errorMessage={errors.hidden}
            >
              <Checkbox
                label={fields.hidden.helperMessage}
                name={fields.hidden.stateKey}
                checked={hidden}
                size="s"
                onChange={handleChange}
              />
            </FormFieldWrapper>
          ) : (
            <div className={commonStyles.item} />
          )}
        </div>
      )}
    </section>
  );
};

export default memo(PublishSettings);
