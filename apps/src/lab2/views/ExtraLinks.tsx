import {Heading3, StrongText} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import {useFetch} from '@cdo/apps/util/useFetch';
import React, {useState} from 'react';
import moduleStyles from './extra-links.module.scss';

interface ExtraLinksProps {
  levelId: number;
}

interface ExtraLinksResponse {
  links: {[key: string]: {text: string; url: string}[]};
}

const ExtraLinks: React.FunctionComponent<ExtraLinksProps> = ({
  levelId,
}: ExtraLinksProps) => {
  const {loading, data, status} = useFetch(`/levels/${levelId}/extra_links`);
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log({loading, data, status});
  if (loading || status !== 200) {
    return <></>;
  }
  const linkData = data as ExtraLinksResponse;
  const onClose = () => setIsModalOpen(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        text={'Extra Links'}
        className={moduleStyles.extraLinksButton}
      />
      {isModalOpen && (
        <AccessibleDialog onClose={onClose}>
          <Heading3>Extra links</Heading3>

          <button
            type="button"
            onClick={onClose}
            className={moduleStyles.xCloseButton}
          >
            <i id="x-close" className="fa-solid fa-xmark" />
          </button>
          {Object.entries(linkData.links).map(([listTitle, links]) => (
            <div>
              <StrongText>{listTitle}</StrongText>
              <ul>
                {links.map(link => (
                  <li>
                    {link.url ? (
                      <a href={link.url}>{link.text}</a>
                    ) : (
                      <p>{link.text}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* <Button onClick={onClose} text={'Close'} /> */}
        </AccessibleDialog>
      )}
    </>
  );
};

export default ExtraLinks;
