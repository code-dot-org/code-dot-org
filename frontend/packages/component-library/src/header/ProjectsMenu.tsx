import classNames from 'classnames';
import {Key, AnchorHTMLAttributes, HTMLAttributes, useState} from 'react';

import {Button} from '@/button';
import {Image, ImageProps} from '@/image';

import moduleStyles from './header.module.scss';

export interface ProjectLink extends AnchorHTMLAttributes<HTMLAnchorElement> {
  key: Key;
  label: string;
  href: string;
  image: Extract<ImageProps['src'], string>;
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
        <ul className={moduleStyles.newProjectMenu}>
          {projectsLinks.map(({href, label, image}) => (
            <li key={label}>
              <Image src={image} />
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default ProjectsMenu;
