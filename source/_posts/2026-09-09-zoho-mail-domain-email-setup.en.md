---
title: Setting Up a Custom-Domain Mailbox with Zoho Mail
date: 2026-09-09 12:00:00
lang: en
slug: zoho-mail-domain-email-setup
permalink: en/2026/09/09/zoho-mail-domain-email-setup/
description: A record of connecting Zoho Mail to a domain and completing email authentication in Cloudflare.
hide_public_email: true
photos:
  - /images/posts/zoho-mail-domain-email-setup/01-zoho-pricing.png
tags:
  - Zoho Mail
  - Domain
  - Cloudflare
  - Email
categories:
  - Technology
toc: true
---

**Turning `example.com` into a verifiable studio mailbox that can send and receive email.**

<!-- more -->

> Translation note: This English version was translated by Codex (GPT-5) on 2026-09-09. The source text is the corresponding Chinese post in this repository.

## Final structure

This setup uses three layers:

| Service | Responsibility |
| --- | --- |
| Spaceship | Registering and holding the domain |
| Cloudflare | Hosting DNS records |
| Zoho Mail | Hosting the studio mailbox |

Website A/CNAME records and email MX/TXT records can coexist. Configuring email does not mean migrating the website.

For a one-person studio, the account structure can be:

- Main user: `owner@example.com`
- Public alias: `hello@example.com`
- Booking alias: `booking@example.com`
- DMARC reporting alias: `dmarc@example.com`

Aliases share one inbox. When Lisa needs her own password and mailbox, create a real `lisa@example.com` user instead.

## 1. Choose a Zoho plan

Yesterday’s signup flow did not show a Free plan. It showed Mail Lite, Mail Premium, and Workplace instead. The screenshot showed Mail Lite 5 GB at US$1 per user per month with annual billing.

<figure class="post-figure">
  <img src="/images/posts/zoho-mail-domain-email-setup/01-zoho-pricing.png" alt="Zoho Mail pricing page showing Mail Lite, Mail Premium, and Workplace">
  <figcaption>Zoho Mail pricing page during signup, showing Mail Lite, Mail Premium, and Workplace with annual billing selected.</figcaption>
</figure>

Even where Zoho Free is available, it is mainly intended for the web interface and the official app; it normally does not include IMAP, POP, or ActiveSync. If the current account has no Free entry, continue with the plan Zoho actually shows. Do not fabricate a region or repeatedly delete organizations just to look for a free plan.

## 2. Register the organization and enter an address

During Zoho Mail business-email signup, choose to use an existing domain and enter:

```text
example.com
```

Enter real address information and keep the country/region, city, and billing information consistent. Hong Kong generally has no universal postal code. Leave it blank when the form allows that; if the form requires a number, follow the current Zoho form or payment requirements instead of inventing a postal code.

## 3. Verify the domain with TXT

Zoho needs proof that you control the domain’s DNS. The verification page normally offers TXT, CNAME, and HTML. This setup used TXT:

1. Select `TXT` on Zoho’s domain-verification page.
2. Note the Host/Name and complete Value shown by Zoho.
3. Sign in to the platform that actually hosts the DNS. In this case, that is Cloudflare, not Spaceship.
4. Open `example.com` → `DNS` → `Add record`.
5. Fill in the fields as follows:

   | Field | How to fill it |
   | --- | --- |
   | Type | `TXT` |
   | Name | Use the Host shown by Zoho; it is often `@` |
   | Content | Paste Zoho’s current verification string in full |
   | TTL | `Auto` |

6. Save the record and click verify in Zoho.

This is not an A record. An A record points a domain to a website IP address; a TXT record carries verification or authentication text. Adding the verification TXT does not affect the website, but do not delete existing A/CNAME records.

## 4. Configure MX, SPF, and basic DNS

After domain verification, use Zoho’s DNS setup wizard to add MX, SPF, and DMARC as instructed. Zoho automatically added these items during this setup, so they should not be added again manually.

If manual configuration is necessary, follow one rule: copy the values shown in the current Zoho page. Do not use old tutorials or guess the values.

In Cloudflare:

- MX records must be DNS only; do not proxy them.
- TXT, SPF, DKIM, and DMARC records must also remain unproxied.
- If an SPF TXT record already exists, do not add a second SPF record. Keep one valid SPF policy, combining entries only when necessary.
- Do not change the website’s A/CNAME records or recreate existing MX records.

## 5. Add DKIM

In the configuration record, the DKIM page was still disabled and had no TXT host record, so it needed to be completed separately:

<figure class="post-figure">
  <img src="/images/posts/zoho-mail-domain-email-setup/06-zoho-dkim-settings.png" alt="Zoho DKIM settings page showing DKIM is not enabled">
  <figcaption>Zoho’s DKIM settings page, showing that DKIM was not enabled and no TXT record was available yet.</figcaption>
</figure>

1. Open Zoho Mail Admin Console → `DKIM`.
2. Click “Add”.
3. Use this selector:

   ```text
   zoho
   ```

4. Let Zoho generate the TXT host record and TXT value.
5. Add a TXT record in Cloudflare:

   | Field | Value |
   | --- | --- |
   | Type | `TXT` |
   | Name | `zoho._domainkey` |
   | Content | The complete DKIM TXT value generated by Zoho |
   | TTL | `Auto` |

6. Return to Zoho, verify the record, and enable DKIM after verification succeeds.

Text such as `v=DKIM1; k=rsa; p=...` is only a format example. The actual DKIM public key is long and must come from Zoho’s current output.

## 6. Set up DMARC

The Cloudflare configuration already contained an `_dmarc` TXT record, so the correct action was to edit it rather than add a second DMARC record. Start with these values in Zoho’s DMARC generator:

| Zoho field | Initial value |
| --- | --- |
| Action on authentication failure | Do nothing (`p=none`) |
| Aggregate report address | `dmarc@example.com` |
| Forensic report address | `dmarc@example.com` |
| Action on subdomain failure | Do nothing (`sp=none`) |
| Policy percentage | `100` |
| SPF alignment | Relaxed |
| DKIM alignment | Relaxed |

<figure class="post-figure">
  <img src="/images/posts/zoho-mail-domain-email-setup/05-zoho-dmarc-generator.png" alt="Zoho DMARC generator">
  <figcaption>Zoho’s DMARC generator: start with p=none to monitor authentication before tightening the policy.</figcaption>
</figure>

After clicking Generate, copy the complete string actually produced by Zoho. Then in Cloudflare:

1. Find the existing `_dmarc` TXT record.
2. Click Edit.
3. Replace only the Content.
4. Keep the Name as `_dmarc` and TTL as `Auto`.
5. Save, then return to Zoho and verify.

Starting with `p=none` lets you monitor authentication results without accidentally blocking website forms, booking systems, or future SaaS services that may send mail for the domain. Once every legitimate sender is confirmed, consider moving gradually to `p=quarantine` or `p=reject`.

## 7. Create the main user and aliases

After domain verification, open Zoho Mail Admin Console → `Users` → `Add User` and create the real main user:

- Mailbox: `owner@example.com`
- Display name: `Andy Cao`

Then add aliases for this user:

- `hello@example.com`: public on business cards and the website
- `booking@example.com`: photography bookings
- `dmarc@example.com`: DMARC reports, not for public use

Set `hello@example.com` as the default sending address so clients see the studio mailbox rather than the administrative login address.

When Lisa needs to use email independently, create a new user rather than another alias:

```text
Zoho Mail Admin Console → Users → Add User
```

## 8. Install Zoho Mail App and test

Both Free and Lite plans can use the Zoho web interface. Free also supports the official mobile app, but it cannot connect to Gmail, Apple Mail, or Outlook through IMAP, POP, or ActiveSync.

This setup uses the Zoho Mail App directly, while Gmail remains the private mailbox and Google-services account. Perform a two-way test:

1. Send an email from private Gmail to `hello@example.com`.
2. Confirm that Zoho receives it.
3. Reply from Zoho using `hello@example.com`.
4. In Gmail, confirm the sender displays correctly, the message is not treated as spam, and no obvious `via` or authentication anomaly appears.

## 9. Final checklist

Return to Zoho Admin Console and check the following:

- [ ] Domain verification succeeded
- [ ] MX is verified and mail reaches Zoho
- [ ] SPF is verified
- [ ] DKIM was generated, verified, and enabled
- [ ] DMARC is verified and Cloudflare has only one `_dmarc` TXT record
- [ ] `hello@` can receive mail and send as the sender
- [ ] `dmarc@` exists as an alias for reports
- [ ] The main website A/CNAME records were not changed accidentally

Once complete, `example.com` has more than a custom mailbox address: it has mail delivery, sender authorization, a digital signature, and a policy for handling failed authentication.
