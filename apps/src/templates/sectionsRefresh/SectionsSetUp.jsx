import React from 'react';
import i18n from '@cdo/locale';
import SetUpSectionForm from './SetUpSectionForm';
import Button from '@cdo/apps/templates/Button';
import moduleStyles from './sections-refresh.module.scss';

export default function SectionsSetUp() {
  return (
    <div>
      <h1>{i18n.setUpClassSectionsHeader()}</h1>
      <p>{i18n.setUpClassSectionsSubheader()}</p>
      <p>
        <a href="code.org">{i18n.setUpClassSectionsSubheaderLink()}</a>
      </p>
      <SetUpSectionForm sectionNum={1} />
      <div className={moduleStyles.buttonsContainer}>
        <Button
          icon="plus"
          text={i18n.addAnotherClassSection()}
          color="white"
          onClick={() => console.log('Add Another Class Section clicked')}
        />
        <Button
          text={i18n.saveClassSections()}
          color="purple"
          onClick={() => console.log('Save class sections clicked')}
        />
      </div>
    </div>
  );
}
