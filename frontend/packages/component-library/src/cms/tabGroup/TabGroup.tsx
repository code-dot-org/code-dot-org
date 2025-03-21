import classNames from 'classnames';
import {useMemo} from 'react';

import Accordion from '@/accordion';
import {AccordionItem} from '@/accordion/Accordion';
import {LinkButton, LinkButtonProps} from '@/button';
import Image, {ImageProps} from '@/cms/image';
import Tabs, {TabModel, TabsProps} from '@/tabs';
import {BodyThreeText, Heading3, Heading4} from '@/typography';

import moduleStyles from './tabGroup.module.scss';

export interface TabGroupTabModel extends Omit<TabModel, 'tabContent'> {
  /** Content of the Tab */
  tabContent: {
    /** Tab Image props */
    image: ImageProps;
    /** Tab CTA Button props */
    button: LinkButtonProps;
    /** Tab Title */
    title: string;
    /** Tab Description */
    description: string;
  };
}
export interface TabGroupProps
  extends Omit<TabsProps, 'tabs' | 'mode' | 'size' | 'type' | 'onTabClose'> {
  /** Array of props for Tabs to render */
  tabs: (TabModel | TabGroupTabModel)[];
  /** The function that is called when a Tab is clicked/selected tab is changed */
  onChange: (value: string) => void;
  /** The name attribute specifies the name of a Tabs group.
     The name attribute is used to reference elements in a JavaScript.
     */
  name: string;
  /** The value of the default selected Tab. Also can be used to change Selected tab from Consumer(Parent Component) */
  defaultSelectedTabValue: string;
}

const isTabGroupTabModel = (
  tab: TabModel | TabGroupTabModel,
): tab is TabGroupTabModel =>
  (tab as TabGroupTabModel).tabContent?.image !== undefined;

const parseTabsGroupTabToRegularTab = (tab: TabGroupTabModel | TabModel) => {
  if (isTabGroupTabModel(tab)) {
    return {
      ...tab,
      tabContent: (
        <div className={moduleStyles.tabGroupModelTabContainer}>
          <Image
            className={moduleStyles.tabGroupModelTabImageContainer}
            {...tab.tabContent.image}
          />
          <div className={moduleStyles.tabGroupModelTabContentContainer}>
            <Heading3>{tab.tabContent.title}</Heading3>
            <BodyThreeText>{tab.tabContent.description}</BodyThreeText>
            <LinkButton {...tab.tabContent.button} />
          </div>
        </div>
      ),
    };
  } else {
    return tab; // No need to modify if it's a standard TabModel
  }
};

const parseTabsGroupTabToAccordionItem = (
  tab: TabGroupTabModel | TabModel,
): AccordionItem => {
  if (isTabGroupTabModel(tab)) {
    return {
      id: tab.value,
      label: tab.text || tab.value,
      content: (
        <div className={moduleStyles.tabGroupAccordionItemContainer}>
          <div className={moduleStyles.tabGroupAccordionItemContentContainer}>
            <Heading4>{tab.tabContent.title}</Heading4>
            <BodyThreeText>{tab.tabContent.description}</BodyThreeText>
            <LinkButton {...tab.tabContent.button} />
          </div>
          <Image
            className={moduleStyles.tabGroupAccordionItemImage}
            {...tab.tabContent.image}
          />
        </div>
      ),
    };
  } else {
    return {
      id: tab.value,
      label: tab.text || tab.value,
      content: tab.tabContent,
    };
  }
};

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/TabGroup.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: TabGroup Component.
 * Renders a group of tabs with content. Tabs are displayed on Desktop and Accordion on Mobile.
 */
const TabGroup: React.FunctionComponent<TabGroupProps> = ({
  tabs,
  onChange,
  defaultSelectedTabValue,
  name,
  ...rest
}) => {
  const parsedTabs = useMemo(
    () => tabs.map(parseTabsGroupTabToRegularTab),
    [tabs],
  );
  const parsedAccordionItems = useMemo(
    () => tabs.map(parseTabsGroupTabToAccordionItem),
    [tabs],
  );

  return (
    <div className={moduleStyles.tabGroupContainer}>
      {/* Tabs component is displayed on Desktop (implemented via scss)*/}
      <Tabs
        tabs={parsedTabs}
        onChange={onChange}
        defaultSelectedTabValue={defaultSelectedTabValue}
        name={name}
        size="m"
        type="_tabGroup"
        {...rest}
        tabsContainerClassName={classNames(
          moduleStyles.tabsContainer,
          rest.tabsContainerClassName,
        )}
        tabPanelsContainerClassName={classNames(
          moduleStyles.tabPanelsContainer,
          rest.tabPanelsContainerClassName,
        )}
      />
      {/* Accordion component is displayed on Mobile. (implemented via scss)*/}
      {/* role='region' is used here since tab group is meant to contain 5 items tops. Also used for testing. */}
      <Accordion
        items={parsedAccordionItems}
        className={moduleStyles.tabsAccordion}
        role="region"
      />
    </div>
  );
};

export default TabGroup;
