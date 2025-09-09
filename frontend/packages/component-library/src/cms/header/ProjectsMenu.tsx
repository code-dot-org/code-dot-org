import classNames from 'classnames';
import {HTMLAttributes, useState, useRef} from 'react';

import {Button} from '@/button';
import {Image, ImageProps} from '@/image';
import {BodyFourText} from '@/typography';

import closeOnEvent from './hooks/closeOnEvent';
import {HeaderLink} from './types';

import moduleStyles from './header.module.scss';

export interface ProjectLink extends HeaderLink {
  image: Extract<ImageProps['src'], string>;
  description?: string;
}

export interface ProjectsMenuProps extends HTMLAttributes<HTMLElement> {
  /** Projects button label */
  projectsButtonLabel: string;
  /** Projects menu labels */
  projectsButtonAriaLabel: {
    /** Open label */
    open: 'Open Projects menu' | string;
    /** Close label */
    close: 'Close Projects menu' | string;
    /** Menu label */
    menu: 'Projects menu' | string;
  };
  /** Projects links */
  projectsLinks: ProjectLink[];
  /** Project custom class name */
  className?: string;
}

const ProjectsMenu: React.FC<ProjectsMenuProps> = ({
  projectsButtonLabel,
  projectsButtonAriaLabel,
  projectsLinks,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  closeOnEvent(menuRef, () => setIsOpen(false), isOpen);

  return (
    <div
      ref={menuRef}
      className={classNames(moduleStyles.projectsMenuWrapper, className)}
    >
      <Button
        className={classNames(moduleStyles.newProject)}
        text={projectsButtonLabel}
        ariaLabel={
          isOpen
            ? projectsButtonAriaLabel.close || 'Close Projects menu'
            : projectsButtonAriaLabel.open || 'Open Projects menu'
        }
        type="secondary"
        size="s"
        color="white"
        iconRight={{
          iconName: 'plus',
          iconStyle: 'solid',
        }}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      />

      {isOpen && (
        <ul
          className={classNames(
            moduleStyles.menu,
            moduleStyles.newProjectMenu,
            className,
          )}
          aria-label={projectsButtonAriaLabel.menu || 'Projects menu'}
        >
          {projectsLinks?.map(
            ({key, href, label, image, description, ...link}) => (
              <li key={key}>
                <a href={href} {...link}>
                  <Image src={image} />
                  <div>
                    {label}
                    <BodyFourText className={moduleStyles.description}>
                      {description}
                    </BodyFourText>
                  </div>
                </a>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
};

export default ProjectsMenu;
