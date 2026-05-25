---
title: "The Conversion-Path Failures We Routinely Find"
description: "Forms that don't submit on mobile, CTAs below the fold, contact info three taps deep — the quiet breaks that cost real revenue every month."
category: findings
length: medium
publishOrder: 20
linkedinReleaseOrder: 10
publishDate: 2026-05-25
---

A small business website's conversion path is the sequence a visitor follows from landing on the homepage to actually contacting you. Land, decide to reach out, find the phone number or form, complete the action, become a lead.

Every step in that sequence is a place the path can break. When it breaks, the visitor leaves, and they don't tell you they left. The site looks fine in analytics ("we got two hundred visits this month"). The phone doesn't ring as much as it should. Nobody can quite explain why.

Conversion-path failures are usually the highest-impact findings in a Pro Diagnosis + Remedy Package because fixing one of them often pays back the audit cost in a month. Here are the breaks we most frequently surface.

## The form that looks like it works but doesn't

A visitor fills out your contact form. They click submit. They see a "Thanks, we'll be in touch!" message. They go about their day, expecting your call.

You never receive the form submission.

This happens more often than it should, and it usually traces to one of three causes:

1. The form's email destination was changed at some point (a forwarding email expired, a staff member's email was removed) and the form never got updated. Submissions go to a dead address.
2. The form widget has a configuration error specific to one browser or one mobile platform. Submissions from iPhone Safari succeed visually but fail to fire the email. Submissions from Android Chrome work fine.
3. A spam filter on the receiving inbox is catching the form's email and dropping it into junk. You never see it.

The only reliable way to catch this finding is to actually submit the form, on multiple devices, and verify the email arrives. We do this on every audit. It is one of the highest-yield checks we run.

## The phone number that isn't tappable

A phone number displayed as plain text on a website looks identical to a phone number wrapped in a `tel:` link. The difference is invisible until a mobile visitor taps it.

The wrapped version opens the phone's dialer with the number pre-filled. The unwrapped version does nothing. Visitors who tapped expecting to call and got nothing rarely retype the number into their dialer. They go back, click the next search result, and call that business instead.

This is a one-line fix in nearly every CMS. We find it missing on a significant share of the small business sites we audit.

## The contact info that is three taps deep on mobile

On desktop, your site might have a clean header with phone, email, and address visible at the top of every page. On mobile, that header collapses into a hamburger menu, and the contact info gets tucked behind two more taps: tap the menu icon, scroll down, tap "Contact," wait for the page to load.

A visitor in a hurry, on their phone, who wants to call you right now, will not make those three taps. They will leave.

The fix is usually to keep the phone number visible in the mobile header, even when the rest of the navigation is collapsed. Most modern themes support this. Many sites haven't enabled it.

## The CTA below the fold on mobile

A "call to action" is the button you want a visitor to click. "Get a Quote." "Book Now." "Call Today."

On desktop, the CTA is often in the hero section, plainly visible above the fold. On mobile, the hero section is taller (because mobile screens are taller and the image scales differently), and the CTA gets pushed below the visible area of the screen. A visitor on a phone has to scroll to see the button.

Most visitors don't scroll. The CTA the homepage was designed around might be invisible to the majority of mobile visitors, who are the majority of all visitors.

The fix involves repositioning the CTA so it sits within the first viewport on mobile. Sometimes we recommend a sticky button that stays visible as the user scrolls.

## The contact form with too many fields

You know your business. You know what information you need from a lead to qualify them. So you build a form that asks for it: name, email, phone, address, service requested, preferred timeframe, budget range, description of the project, three checkboxes about what you found us.

Every additional field cuts the completion rate. We have audited sites where the form was so long that the realistic completion rate was a fraction of what it could have been with three fields instead of ten.

The fix is usually structural: start with the minimum (name, email or phone, brief message) and qualify further in the follow-up call or email. Two-stage forms outperform one-stage forms in nearly every test.

## The form behind a CAPTCHA that fails silently

A modern web form usually has some kind of bot protection. CAPTCHAs, Cloudflare Turnstile, hCaptcha, Google reCAPTCHA. These are necessary; without them, the form will be flooded with spam submissions.

Sometimes the bot protection misfires. The form fails to submit, the visitor sees a confusing error, the form's email never sends. We have audited sites where the spam protection was actively blocking the real form submissions while the spam volume kept arriving through a different path.

We check the bot protection on every audit. We confirm a real submission goes through. If it doesn't, that becomes a Critical finding.

## What you can do today

Before the audit, do this: open your own site on your phone, find your contact form, fill it out with real info, and submit it. Verify the email arrives in your inbox. Then call your phone number from a fresh device. Then scroll the homepage on your phone and see if the CTA is visible in the first viewport without scrolling.

If any of those tests fail, you have your most important finding without paying anyone. If they pass, there are still the harder failures (the silent ones, the schema-level ones, the duplicate-tracking ones) that the audit is built to surface.

---

If you want a thorough check of your conversion path, top to bottom, that is what the Pro Diagnosis + Remedy Package is built to deliver.
