// Single source of truth for all site-wide constants.
// Swap these here when Google Workspace lands — nowhere else needs touching.

export const SITE_NAME    = 'Sequel Web Studio';
export const SITE_URL     = import.meta.env.PUBLIC_SITE_URL    ?? 'https://sequelwebstudio.com';
export const CONTACT_EMAIL = import.meta.env.PUBLIC_CONTACT_EMAIL ?? 'jaweeks7@gmail.com';
export const SERVICE_AREA = 'United States';

export const NAV_LINKS = [
  { label: 'Home',     href: '/'         },
  { label: 'Audit',    href: '/audit'    },
  { label: 'Services', href: '/services' },
  { label: 'About',    href: '/about'    },
  { label: 'Contact',  href: '/contact'  },
] as const;

// D5: Pilot pricing through project #10; revisit at project #8-9
export const PRICING = {
  starter: {
    name: 'Starter',
    price: '$1,000',
    tagline: 'One-time project fee',
    features: [
      'Up to 5 pages',
      'Mobile-responsive design',
      'Contact form',
      'Google Analytics setup',
      '30 days of post-launch support',
    ],
  },
  premium: {
    name: 'Premium',
    price: '$2,000',
    tagline: 'One-time project fee',
    features: [
      'Everything in Starter',
      'SEO optimization & keyword research',
      'Blog or news section',
      'Google Business Profile setup',
      '60 days of post-launch support',
    ],
  },
} as const;

// Schema.org WebSite — injected as JSON-LD on every page alongside LocalBusiness
export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type':    'WebSite',
  '@id':      'https://sequelwebstudio.com/#website',
  url:        SITE_URL,
  name:       SITE_NAME,
  publisher:  { '@id': 'https://sequelwebstudio.com/#organization' },
};

// Schema.org LocalBusiness — injected as JSON-LD on every page (D8)
export const LOCAL_BUSINESS_SCHEMA = {
  '@context':  'https://schema.org',
  '@type':     'ProfessionalService',
  '@id':       'https://sequelwebstudio.com/#organization',
  name:        SITE_NAME,
  url:         SITE_URL,
  address: {
    '@type':         'PostalAddress',
    streetAddress:   '9533 Courtright Drive',
    addressLocality: 'Fort Worth',
    addressRegion:   'TX',
    postalCode:      '76244',
    addressCountry:  'US',
  },
  telephone:   '+18177439806',
  email:       CONTACT_EMAIL,
  description: 'Custom-coded websites for small businesses across the US — built to rank on Google, ChatGPT, and voice search. Starting at $1,000.',
  priceRange:  '$1,000 – $2,000',
  image:       `${SITE_URL}/images/joe-headshot.png`,
  founder: {
    '@type': 'Person',
    '@id':   'https://sequelwebstudio.com/#founder',
    name:    'Joe Weeks',
  },
  areaServed: {
    '@type': 'Country',
    name:    'United States',
  },
  serviceType: 'Web Design',
  sameAs: [
    // Add Google Business Profile URL once created — highest-value AI citation signal
  ],
};
