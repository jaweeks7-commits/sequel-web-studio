---
title: "Accessibility Issues That Quietly Cost You Customers"
description: "Low contrast, tiny tap targets, missing alt text — these aren't just compliance issues. They are reasons real customers couldn't use your site and never told you."
category: findings
length: medium
publishOrder: 21
linkedinReleaseOrder: 15
publishDate: 2026-05-25
---

The word "accessibility" in a website context often gets boxed into a narrow conversation about legal compliance. Avoiding lawsuits. Meeting ADA standards. Adding alt text because a regulation requires it.

That is part of it, but it is not the most useful frame for a small business owner. The more useful frame is this: accessibility issues are reasons real customers couldn't use your website, and those customers never told you. They left, you didn't know they were there, and they bought from someone whose site they could use.

Accessibility issues are silent lost revenue. The lawsuit risk is real, but the lost-customer cost is bigger and far less talked about.

Here are the accessibility issues we find most often in Pro Diagnosis + Remedy Package audits, with the cost to your business attached.

## Low text contrast

Light gray text on a white background. Light blue links on a slightly lighter blue. Text overlaid on a busy hero image without enough contrast for the text to read.

About 8% of men have some form of color vision deficiency. A meaningful percentage of older visitors have reduced visual acuity. Low-contrast text is hard or impossible to read for all of them. They don't email you to say "I couldn't read your homepage." They leave.

The fix is rarely a redesign. It is usually adjusting one or two color values in the site's theme settings.

## Phone numbers and text that aren't actually tappable on mobile

A phone number displayed as text looks the same to a sighted user as a phone number wrapped in a `tel:` link. The difference is what happens when a visitor taps it on their phone. The wrapped version opens the dialer. The unwrapped version does nothing.

For a customer with reduced mobility, who is reaching out to your business specifically because making a phone call is their best option, a non-tappable phone number is a closed door. For any mobile user, it is friction that pushes them toward the next result in Google's list.

We check this on every audit. Every contact phone number on the site should be tappable. We find non-tappable phone numbers more often than you would think.

## Tiny tap targets

Buttons, links, and form fields that are too small to reliably tap with a finger on a phone. Apple's published guidance is 44 by 44 points. Google's is similar. A "Submit" button that is 24 pixels tall is below the threshold, and on a phone with even a slight hand tremor, it is the difference between submitting the form and accidentally tapping the link next to it three times.

This finding is especially common in older site themes that were designed for desktop and only later adapted to mobile.

## Missing alt text on content images

Alt text is the brief description of an image that gets read aloud by screen readers and shown to search engines. For a customer using a screen reader (visually impaired visitors, sometimes drivers, sometimes people with their hands occupied), a homepage hero image with no alt text is a blank space where information should be.

Two clarifications worth making here. Alt text is not required on decorative images (the wood-grain texture in the background of a section, the spacer image between two paragraphs). And alt text is not the place to keyword-stuff for SEO. The alt text should describe what the image actually shows, in the language a person would use.

We find sites that have alt text only on some images, alt text that reads "image1.jpg" (the file name), or sites where the alt text is set to the same text already shown as a caption, which is redundant and confusing.

## Form fields without proper labels

A form field with a placeholder ("Enter your email") but no actual `<label>` element behind it is confusing to screen readers and, on most browsers, makes the field harder to autocomplete correctly. The visitor sees a form. The screen reader user hears "edit field," with no indication of what kind of field it is.

The fix is one line of HTML per field. Most modern CMS form builders do this automatically. Some don't. We check.

## HTML lang attribute missing

This one is invisible to visitors but matters for assistive technology. The `lang="en"` attribute on the root HTML tag tells screen readers (and search engines, and AI assistants) what language the page is in. Without it, screen readers default to system settings and may pronounce English words with French phonetics for a French-speaking user, or vice versa.

It is a one-line fix. We find it missing on roughly half the small business sites we audit.

## Why these add up

Each individual finding is small. The contrast on the hero image. The tap size on one button. The alt text on six images. None of them, alone, would be the reason a customer chose a competitor.

But every finding closes a slightly different door for a slightly different category of visitor. Stacked, the doors are how a meaningful fraction of potential customers fail to convert. They are not the customers who emailed you to complain. They are the customers who never made it to the inbox.

---

If you want to know which accessibility doors are closed on your site and exactly how to open them, that is part of every Pro Diagnosis + Remedy Package.
