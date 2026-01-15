import type {FunctionComponent, ReactNode} from 'react';

import {Theme} from '@code-dot-org/component-library/common/contexts';
import Dialog from '@code-dot-org/component-library/dialog';
import Link from '@code-dot-org/component-library/link';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import Markdown from '@code-dot-org/markdown';

import './style.scss';

// External code can specify additional content to be shown, or clear it again.
// Currently used by Music Lab to show image attributions.
let extraCopyrightContent: ReactNode | undefined = undefined;
export const setExtraCopyrightContent = (content?: ReactNode) => {
  extraCopyrightContent = content;
};

export interface CopyrightDialogProps {
  isOpen: boolean;
  theme: Theme;
  closeModal: () => void;
}

const textArtFrom =
  'Minecraft&#8482; &copy; {current_year} Microsoft. All Rights Reserved.<br/>Star Wars&#8482; &copy; {current_year} Disney and Lucasfilm. All Rights Reserved.<br/>Frozen&#8482; &copy; {current_year} Disney. All Rights Reserved.<br/>Ice Age&#8482; &copy; {current_year} 20th Century Fox. All Rights Reserved.<br/>Angry Birds&#8482; &copy; 2009-{current_year} Rovio Entertainment Ltd. All Rights Reserved.<br/>Plants vs. Zombies&#8482; &copy; {current_year} Electronic Arts Inc. All Rights Reserved.<br/>DreamWorks The Bad Guys &copy; {current_year} DreamWorks Animation LLC. All Rights Reserved.<br/>Paramount Pictures Transformers One &copy; {current_year} Paramount Pictures. All Rights Reserved.';

const gnuLicenseLink =
  'https://www.gnu.org/licenses/old-licenses/lgpl-2.1-standalone.html';
const textCodeLicense = `Code.org uses p5.play, which is licensed under [the GNU LGPL 2.1](${gnuLicenseLink}).`;

const donorsLink = 'https://code.org/about/donors';
const partnersLink = 'https://code.org/about/partners';
const teamLink = 'https://code.org/about/team';

const textThanks = `We thank our [donors](${donorsLink}), [partners](${partnersLink}), our [extended team](${teamLink}), and our video cast for their support in creating Code Studio.`;

const textTrademark =
  '&copy; Code.org, {current_year}. Code.org&reg;, the CODE logo, Hour of Code&reg; and CS Discoveries&reg; are trademarks of Code.org.';

const CopyrightDialog: FunctionComponent<CopyrightDialogProps> = ({
  theme,
  isOpen,
  closeModal,
}) => {
  return isOpen ? (
    <Dialog
      title="Copyright"
      onClose={closeModal}
      mode={theme === 'Light' ? 'light' : 'dark'}
      primaryButtonProps={{
        onClick: closeModal,
        text: 'OK',
      }}
      customContent={
        <div>
          <div className="modalBody">
            <Markdown>{textThanks}</Markdown>
            <BodyThreeText>
              We especially want to recognize the engineers from Amazon, Google,
              and Microsoft who helped create these materials.
            </BodyThreeText>
            <Markdown>
              {textArtFrom.replaceAll(
                '{current_year}',
                new Date().getFullYear().toString(),
              )}
            </Markdown>
            <Markdown>{textCodeLicense}</Markdown>
            {extraCopyrightContent && <div>{extraCopyrightContent}</div>}
            <BodyThreeText>Built on GitHub from Microsoft</BodyThreeText>
            <Link
              href="https://aws.amazon.com/what-is-cloud-computing"
              className="awsLogoContainer"
            >
              <img
                src="/shared/images/Powered-By_logo-horiz_RGB.png"
                alt="Powered by AWS Cloud Computing"
                className="awsLogo"
              />
            </Link>
            <Markdown>
              {textTrademark.replaceAll(
                '{current_year}',
                new Date().getFullYear().toString(),
              )}
            </Markdown>
          </div>
          <hr aria-hidden="true" />
        </div>
      }
    />
  ) : null;
};

export default CopyrightDialog;
