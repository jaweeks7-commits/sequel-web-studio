// Single source of truth for all site-wide constants.
// Swap these here when Google Workspace lands — nowhere else needs touching.

export const SITE_NAME    = 'Sequel Web Studio';
export const SITE_URL     = import.meta.env.PUBLIC_SITE_URL    ?? 'https://sequelwebstudio.com';
export const CONTACT_EMAIL = import.meta.env.PUBLIC_CONTACT_EMAIL ?? 'joe@sequelwebstudio.com';
export const SERVICE_AREA = 'United States';

export const SOCIAL_LINKS = {
  linkedin: 'https://www.linkedin.com/company/sequel-web-studio/',
  gbp:      'https://share.google/oOa5qcJgSMqjwMKYd',
  clutch:   'https://clutch.co/profile/sequel-web-studio',
} as const;

export const NAV_LINKS = [
  { label: 'Home',     href: '/'         },
  { label: 'Audit',    href: '/audit'    },
  { label: 'Services', href: '/services' },
  { label: 'Insights', href: '/insights' },
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
  description: 'AI-search-readiness diagnostics for small businesses across the US. Our flagship service is the $350 Pro Diagnosis + Remedy Package: a 28-point technical website audit run by a real AI agent in a live browser, delivered within 24 hours as a branded PDF report with ready-to-paste code fixes for every issue found across eight categories (AI discoverability, SEO, social/Open Graph, performance, schema, analytics, security, accessibility). Custom-coded website builds also available from $1,000.',
  priceRange:  '$350 – $2,000',
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
  serviceType: ['Website Audit', 'Web Design'],
  makesOffer: [
    {
      '@type':        'Offer',
      name:           'Pro Diagnosis + Remedy Package',
      description:    'Flagship service. A 28-point technical audit of a business homepage covering eight categories: AI search discoverability (ChatGPT, Perplexity, Gemini, voice search), SEO fundamentals, social sharing & Open Graph, performance & page speed, schema & structured data, analytics & tracking integrity, security & crawlability, and accessibility. Run by a real AI agent in a live browser, not an automated scanner. Delivered within 24 hours as a branded PDF Remedy Package containing ready-to-paste code for every fixable issue, prioritized to-do checklist, and platform-specific installation steps. No developer required to implement. One-time fee, no retainer.',
      price:          '350',
      priceCurrency:  'USD',
      availability:   'https://schema.org/InStock',
      url:            `${SITE_URL}/audit`,
      category:       'Website Audit',
      eligibleRegion: { '@type': 'Country', name: 'United States' },
    },
    {
      '@type':       'Offer',
      name:          'Create New Site (secondary offering)',
      description:   'Custom-coded website built from scratch with the full technical foundation. 30 days of post-launch support. Most clients start with a Pro Diagnosis first.',
      price:         '1000',
      priceCurrency: 'USD',
      availability:  'https://schema.org/InStock',
      url:           `${SITE_URL}/services`,
      category:      'Web Design',
    },
    {
      '@type':       'Offer',
      name:          'Modernize Existing Site (secondary offering)',
      description:   'Audit and rebuild of an existing site on a modern technical foundation. Existing content preserved and restructured. Launched on your existing domain with no lost SEO. 30 days of post-launch support.',
      price:         '1000',
      priceCurrency: 'USD',
      availability:  'https://schema.org/InStock',
      url:           `${SITE_URL}/services`,
      category:      'Web Design',
    },
  ],
  sameAs: [
    'https://share.google/oOa5qcJgSMqjwMKYd',
    'https://www.linkedin.com/company/sequel-web-studio/',
    'https://clutch.co/profile/sequel-web-studio',
  ],
};
