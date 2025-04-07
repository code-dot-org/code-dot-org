import {Button, LinkButton} from '@code-dot-org/component-library/button';
import TextField from '@code-dot-org/component-library/textField';
import {
  Heading1,
  Heading2,
  BodyTwoText,
  OverlineTwoText,
} from '@code-dot-org/component-library/typography';
import React, {useState} from 'react';

import style from './regionalWorkshopCatalog.module.scss';

export default function RegionalWorkshopCatalog() {
  const [zipCode, setZipCode] = useState('');

  return (
    <div className={style.workshopCatalog}>
      <section className={style.headerContainer}>
        <div className={style.headerText}>
          <Heading1>Find your local workshop and apply</Heading1>
          <BodyTwoText>
            Look up details of the Professional Learning Program in your region
            by submitting your zip code.
          </BodyTwoText>
        </div>
        <div className={style.zipSearchContainer}>
          <div className={style.zipSearchInput}>
            <TextField
              id="zipCode"
              name="zipCode"
              label="School ZIP Code:"
              onChange={e => setZipCode(e.target.value)}
              value={zipCode}
              maxLength={255}
              placeholder="12345"
            />
            <Button text="Submit" color="purple" onClick={() => {}} />
          </div>
          <div className={style.rpInfoContainer}>
            <OverlineTwoText className={style.rpInfoHeader}>
              Your Regional Partner
            </OverlineTwoText>
            <div className={style.rpInfo}>
              <BodyTwoText className={style.rpName}>
                Sample Regional Partner Name
              </BodyTwoText>
              <div className={style.rpInfoButtons}>
                <LinkButton
                  color="black"
                  type="secondary"
                  href={'/'}
                  size="xs"
                  text="Partner info"
                />
                <LinkButton
                  color="black"
                  type="secondary"
                  href={'/'}
                  size="xs"
                  text="Contact"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className={style.workshopContainer}>
        <div className={style.workshopContentContainer}>
          <Heading2>Upcoming workshops</Heading2>
          <BodyTwoText>
            Workshops are always being added. If you do not see the workshop you
            are looking for check back again soon or{' '}
            <a href="/">contact your regional partner</a>.
          </BodyTwoText>
        </div>
      </section>
    </div>
  );
}
