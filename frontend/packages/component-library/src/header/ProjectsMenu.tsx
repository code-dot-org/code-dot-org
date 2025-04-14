import classNames from 'classnames';
import {HTMLAttributes, useState, useRef} from 'react';

import {Button} from '@/button';
import {Image, ImageProps} from '@/image';
import {BodyFourText} from '@/typography';

import closeOnEvent from './hooks/closeOnEvent';
import {Link} from './types';

import moduleStyles from './header.module.scss';

export interface ProjectLink extends Link {
  image: Extract<ImageProps['src'], string>;
  description?: string;
}

export interface ProjectsMenuProps extends HTMLAttributes<HTMLElement> {
  /** Projects menu label */
  projectsButtonLabel: string;
  /** Projects links */
  projectsLinks: ProjectLink[];
  /** Project custom class name */
  className?: string;
}

const ProjectsMenu: React.FC<ProjectsMenuProps> = ({
  projectsLinks,
  projectsButtonLabel,
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
        text={projectsButtonLabel || 'New Project'}
        type="secondary"
        size="s"
        color="white"
        iconRight={{
          iconName: isOpen ? 'minus' : 'plus',
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
        >
          {projectsLinks.map(
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
