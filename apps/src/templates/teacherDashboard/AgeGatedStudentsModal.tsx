import React from 'react';

import i18n from '@cdo/locale';

import SafeMarkdown from '../SafeMarkdown';

import style from '@cdo/apps/templates/teacherDashboard/age-gated-students-modal.module.scss';

interface Props {
  onClose: () => void;
}

const AgeGatedStudentsModal: React.FC<Props> = ({onClose}) => {
  return (
    <div className={style.modalContainer} id="modal" onClick={onClose}>
      <div className={style.modalContent}>
        <h2>{i18n.childAccountPolicy_studentParentalConsentStatus()}</h2>
        <p>{i18n.childAccountPolicy_studentParentalConsentNotice()}</p>
        <br />
        <SafeMarkdown
          markdown={i18n.childAccountPolicy_consentProcessReadMore({url: '/'})}
        />
        <table>
          <thead>
            <tr>
              <th>Header 1</th>
              <th>Header 2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Data 1</td>
              <td>Data 2</td>
            </tr>
          </tbody>
        </table>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default AgeGatedStudentsModal;
