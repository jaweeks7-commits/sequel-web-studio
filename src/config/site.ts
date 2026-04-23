// Single source of truth for all site-wide constants.
// Swap these here when Google Workspace lands — nowhere else needs touching.

export const SITE_NAME    = 'Sequel Web Studio';
export const SITE_URL     = import.meta.env.PUBLIC_SITE_URL    ?? 'https://sequelwebstudio.com';
export const CONTACT_EMAIL = import.meta.env.PUBLIC_CONTACT_EMAIL ?? 'jaweeks7@gmail.com';
export const SERVICE_AREA = 'Northern Tarrant County, TX';

// D13: Joe's personal cell (public for now; revisit if spam becomes a problem)
export const CONTACT_PHONE = ''; // Joe to fill in

export const NAV_LINKS = [
  { label: 'Home',      href: '/'          },
  { label: 'Services',  href: '/services'  },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'About',     href: '/about'     },
  { label: 'Contact',   href: '/contact'   },
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

// Schema.org LocalBusiness — injected as JSON-LD on every page (D8)
export const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type':    'LocalBusiness',
  name:       SITE_NAME,
  url:        SITE_URL,
  email:      CONTACT_EMAIL,
  areaServed: {
    '@type': 'Place',
    name:    SERVICE_AREA,
  },
  serviceType: 'Web Design',
};
