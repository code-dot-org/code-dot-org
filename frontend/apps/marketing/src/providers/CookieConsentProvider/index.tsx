import {ConsentManagerProvider, ConsentManagerDialog} from '@c15t/nextjs';

import CookieConsentBanner from '@/components/cookieConsent/CookieConsentBanner';
import {CookieConsentWidget} from '@/components/cookieConsent/CookieConsentWidget';
import {Brand} from '@/config/brand';
import OneTrustLoader from '@/providers/onetrust/OneTrustLoader';

export function CookieConsentProvider({
  children,
  brand,
}: {
  children: React.ReactNode;
  brand: Brand;
}) {
  if (brand === Brand.CS_FOR_ALL) {
    return (
      <ConsentManagerProvider
        options={{
          mode: 'offline',
          translations: {
            translations: {
              en: {
                consentManagerDialog: {
                  title: 'Cookie Preference Center',
                  description:
                    'When you visit our website it may ask your browser to store a small piece of data (text file) called a cookie on your device to remember specific information, such as your language preference or login status. You can choose not to allow some types of cookies (except where strictly necessary to support proper functioning of our site). Click on the different category headings to find out more and change our default settings. However, please be aware that blocking some types of cookies may impact your experience of the site and the services we are able to offer.',
                },
                consentTypes: {
                  necessary: {
                    title: 'Strictly Necessary',
                    description:
                      'These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms. You can set your browser to block or alert you about these cookies, but some parts of the site will not then work. These cookies do not store any personally identifiable information.',
                  },
                  functionality: {
                    title: 'Functional',
                    description:
                      'These cookies enable the website to provide enhanced functionality and personalisation. They may be set by us or by third party providers whose services we have added to our pages. If you do not allow these cookies then some or all of these services may not function properly.',
                  },
                  marketing: {
                    title: 'Marketing',
                    description:
                      'We may use marketing cookies to assess when a user interacts with marketing communications, such as a marketing email or a marketing-based landing page on our website. Collected information is used to evaluate the effectiveness of our email campaigns or to provide better understanding of how our outreach is working so we can improve our communications and provide the most relevant information to our users.',
                  },
                  measurement: {
                    title: 'Performance',
                    description:
                      'These cookies allow us to count and assess visits and traffic sources so we can measure and improve the performance of our site. They help us assess which pages are the most and least popular and see how users move around the site and use the curriculum. If these cookies are disabled, we will not know when a user like yourself has visited our site or be able to monitor the site’s performance.',
                  },
                },
              },
            },
          },
          consentCategories: [
            'necessary',
            'functionality',
            'marketing',
            'measurement',
          ], // Optional: Specify which consent categories to show in the banner.
        }}
      >
        <CookieConsentBanner />
        <ConsentManagerDialog trapFocus={true}></ConsentManagerDialog>

        {children}
      </ConsentManagerProvider>
    );
  }
  return (
    <>
      <OneTrustLoader brand={brand} />
      {children}
    </>
  );
}
