---
title: "What We Found After Auditing 24 Business Websites"
description: "After completing 24 structured audits across industries and platforms, the data points to a clear pattern: most sites have more problems than their owners realize, and the same issues show up again and again."
category: findings
length: long
publishOrder: 23
linkedinReleaseOrder: 13
publishDate: 2026-05-25
featured: true
---

After completing 24 structured audits across industries and platforms, we ran the numbers. The sample spans small businesses, dental and medical practices, restaurants, professional services, nonprofits, chambers of commerce, churches, and regional media outlets. Different industries, different platforms, different price points.

Here is what we found.

## The headline numbers

**96% of the 24 sites had at least one critical finding.** Critical means: an issue actively suppressing search visibility, breaking a conversion path, or creating a compliance risk. Not hypothetical — actively costing the business something right now.

**The average site had 4.8 critical issues and 12.3 high-value issues.** High-value means a meaningful gap in visibility or conversion that isn't quite in the "fire alarm" category but still has a real business cost. Combined, that's roughly 17 fixable problems per site before you get to the optional polish items.

**Only one site out of 24 had zero critical findings.** One.

If you assumed your website was "basically fine" — probably a working assumption, not an audited one — you are in good company. Most of the businesses behind these sites believed the same thing.

## The five most common problems

These are ranked by how frequently they appeared as a failing check across the 24 audits.

### 1. AI Citation Readiness: failing on 88% of sites

This was the most common failing check in the entire dataset, and the one most owners had never heard of before reading their audit.

AI Citation Readiness measures whether an AI assistant, ChatGPT, Google's AI Overviews, Perplexity, or Apple's Siri, can accurately describe your business when someone asks. It scores five signals: structured data with complete business details, directory links that help AI tools verify your identity, an llms.txt file giving AI crawlers direct guidance, FAQ schema, and whether your core business information is present in readable text.

The average score across the 24 audits was **1.5 out of 5**. Eighty-two percent of sites with data scored 2 or below.

That number matters more than it would have two years ago. When a potential customer asks ChatGPT "who is the best dentist near me" or "recommend a local landscaping company," the answer does not come from a Google search. It comes from whatever the AI tool has been able to piece together about local businesses. Sites scoring 1 or 2 out of 5 are essentially invisible to that channel.

### 2. Mobile performance: failing on 83% of sites

Four out of every five sites in the sample failed Core Web Vitals on mobile. This is the set of Google performance metrics that directly affects search ranking: Largest Contentful Paint (how fast the main content appears), Total Blocking Time (how long the page is unresponsive to taps), and Cumulative Layout Shift (whether elements jump around as the page loads).

This is not just an SEO problem. A dental practice in the sample had a mobile LCP of over 10 seconds. A restaurant had a mobile performance score of 63 out of 100. For context, Google considers anything below 90 as needing improvement, and anything below 50 as poor.

The cause is almost always specific: an uncompressed hero image, a chat widget loading on every page, a third-party font loading from three different servers simultaneously. The remedy is not "make your site faster." The remedy is "remove this one specific thing." That distinction is what makes the finding actionable.

### 3. Missing or broken H1 heading: failing on 75% of sites

An H1 is the primary heading tag on a webpage, and it is Google's clearest signal for what a page is about. Seventy-five percent of sites in the sample had a problem with the H1 on their homepage: missing entirely, duplicated, or set to a heading level that broke the document structure.

Of the 18 failing sites, 12 were flagged as critical. That means more than half of all sites in the sample had a homepage where Google could not definitively identify the primary topic.

One site in the sample opened with three H3 tags before any H2 appeared. No H1 anywhere on the page. The practice had been in business for years and had invested in professional photography, a custom CMS, and a full content refresh. Nobody had noticed.

### 4. Schema markup missing or incomplete: failing on 75% of sites

Schema is the structured data block that tells search engines and AI tools what your business is, where it is located, what hours you keep, how to reach you, and how to verify you against other authoritative sources. Three-quarters of the sites in the sample had a material problem here.

The failures split roughly three ways:
- Schema present but structurally wrong (telephone number inside the address block, missing required fields, wrong business type from a template default)
- Schema present but not linked (no @id identifier, no sameAs connections to directory listings)
- Schema absent entirely

The third category, missing schema, was more common among sites on managed platforms where the template had never been configured. The second category, present but unlinked, is the one that has become most costly as AI search grows. A schema block with no sameAs connections gives AI tools no way to verify the business against third-party sources. The AI either guesses or omits.

### 5. No proper social share image: failing on 63% of sites

When a page is shared on Facebook, LinkedIn, iMessage, or Slack, the platform pulls the Open Graph image to display as a preview card. Fifteen of the 24 sites had no proper OG image, meaning the preview card was either blank, pulled a random image from the page, or displayed the site's logo at logo dimensions (typically too small to read in a social feed).

This one is almost invisible to the business owner because it only appears in other people's feeds. A professional services firm in the sample was sharing its homepage link in email newsletters. Every recipient clicking through from a mobile device saw a blurry 80-pixel logo as the link preview. The firm had no idea.

## What the passing sites had in common

The one site with zero critical findings, and the handful with very few, shared a few traits: clean HTTPS with proper redirects, a single well-configured analytics setup, semantic heading structure, and some form of schema markup. They were not perfect. But the fundamentals had been done deliberately, not accidentally.

That is the meaningful distinction. The sites in the best shape were not the most expensive ones, or the most recently redesigned ones. They were the ones where someone had gone through and verified the technical basics, even if just once.

## The larger pattern

Across 24 audits, the average site had nearly 17 issues worth fixing before you get to anything optional. Most owners did not know. That is not negligence. A business owner running operations, serving customers, and managing a team does not have the background to identify a broken canonical tag or a missing llms.txt file. That is not their job.

But the cost of those gaps is real. Slower mobile ranking. AI tools that cannot describe the business accurately. Potential customers who click through from a shared link and see an unprofessional preview card. Contact forms that have been silently failing for months.

The research will continue. Each audit adds to the dataset. The patterns are already clear.

---

If you want to know where your site stands against the findings above, the Pro Diagnosis + Remedy Package gives you a complete audit of your homepage and up to five inner pages, with every finding ranked by priority and every remedy written in plain English. No jargon, no upsells.
