import classNames from 'classnames';
import {Key, AnchorHTMLAttributes, HTMLAttributes, useState} from 'react';

import {Button} from '@/button';
import {Image, ImageProps} from '@/image';
import {BodyFourText} from '@/typography';

import moduleStyles from './header.module.scss';

export interface ProjectLink extends AnchorHTMLAttributes<HTMLAnchorElement> {
  key: Key;
  label: string;
  href: string;
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

  return (
    <>
      <Button
        className={classNames(moduleStyles.newProject, className)}
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
          {projectsLinks.map(({href, label, image, description, ...link}) => (
            <li key={label}>
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
          ))}
        </ul>
      )}
    </>
  );
};

export default ProjectsMenu;
