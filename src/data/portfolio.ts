export interface PortfolioItem {
  name:        string;
  url:         string;
  tag:         string;
  href:        string;
  img:         string;
  description: string;
  external:    boolean;
}

export const PORTFOLIO: PortfolioItem[] = [
  // Row 1
  {
    name:        'Greek Café Keller',
    url:         'GreekCafeKeller.com',
    tag:         'Restaurant',
    href:        'https://greekcafekeller.com',
    img:         '/images/Portfolio/greek-cafe-keller.png',
    description: 'Menu, hours, and location for a local Greek café — built to rank for "Greek food near me" and show up in voice and AI searches.',
    external:    true,
  },
  {
    name:        'AI Guide',
    url:         'AIGuide.Live',
    tag:         'AI Education',
    href:        'https://aiguide.live',
    img:         '/images/Portfolio/ai-guide.png',
    description: 'An AI services firm that specializes in deploying voice agents.',
    external:    true,
  },
  {
    name:        'The Straight Edge Lawns',
    url:         'TheStraightEdgeLawns.com',
    tag:         'Lawn Services',
    href:        'https://thestraightedgelawns.com',
    img:         '/images/Portfolio/straight-edge-lawns.png',
    description: 'Service-area-focused site for a lawn care company — clear pricing, service details, and a contact form designed to convert visitors into booked jobs.',
    external:    true,
  },
  // Row 2
  {
    name:        'Cocreator',
    url:         'Cocreator.work',
    tag:         'Garage Epoxy Flooring',
    href:        'https://cocreator.work',
    img:         '/images/Portfolio/cocreator-work.png',
    description: 'Specialty contractor site with before/after framing, service options, and a quote request form — built for homeowners actively comparing vendors.',
    external:    true,
  },
  {
    name:        'Thai Restaurant',
    url:         'ProposedWebsite.com',
    tag:         'Restaurant',
    href:        'https://proposedwebsite.com',
    img:         '/images/Portfolio/thai-restaurant.png',
    description: 'Clean, image-forward site for a Thai restaurant — menu presentation, hours, and a Google Maps presence optimized for local search.',
    external:    true,
  },
  {
    name:        'Bridal Butler',
    url:         'BridalButler.ai',
    tag:         'Wedding Services',
    href:        'https://bridalbutler.ai',
    img:         '/images/Portfolio/bridal-butler.png',
    description: 'Serving wedding venues with AI services and voice agents.',
    external:    true,
  },
];
