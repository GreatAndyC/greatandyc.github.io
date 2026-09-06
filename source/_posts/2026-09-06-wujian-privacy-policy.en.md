---
title: "Wujian Privacy Policy: Keeping Local Item Records and AI Recognition in Bounds"
date: 2026-09-06 18:00:00
lang: en
slug: wujian-privacy-policy
permalink: en/2026/09/06/wujian-privacy-policy/
description: How Wujian handles camera access, item images, local records, and AI requests.
photos:
  - /images/posts/wujian-privacy-policy/local-first-privacy-cover.png
tags:
  - Wujian
  - Privacy
  - AI
categories:
  - Indie Development
toc: true
comments: false
---

<figure class="post-figure">
  <img src="/images/posts/wujian-privacy-policy/local-first-privacy-cover.png" alt="" loading="lazy">
  <figcaption>Wujian's local-first recognition workflow. Cover generated with Codex image generation.</figcaption>
</figure>

Wujian is a mobile app for recording items, organizing rooms and boxes, and using AI to recognize an item when you choose to. Because the app can work with cameras and images, its privacy boundaries should be part of the product design—not something hidden in fine print.

<!-- more -->

## The short version

- Item records are stored on your device by default; Wujian does not require a separate account.
- Only when you actively take a photo and have an AI recognition service configured are the relevant image and request details placed in the recognition queue and sent to your configured model service or custom endpoint; after configuration, a photo is added to the queue after capture.
- Wujian does not sell personal information, serve ads, or build cross-app behavioral profiles.
- API keys are kept in the device's secure storage. Do not place them in screenshots, shared files, or public code.
- You can delete items, clear app data, or uninstall the app to remove local data. Retention on the model-service side is controlled by that provider.

## Scope

This policy covers the Wujian mobile app and its item records, image recognition, model configuration, and export features in the current release. The developer is GreatAndyC. This policy is effective September 6, 2026. If a future release adds a feature that materially changes data handling, this policy will be updated.

## What Wujian handles

Wujian may handle the following information, depending on the features you use:

- **Camera and images**: item photos captured with the in-app camera in the current Android release, used for an item record or the AI recognition queue. Camera access is used for capture, not continuous background collection.
- **Item records**: names, categories, rooms, box numbers, notes, tags, and creation times that you enter or confirm.
- **AI request content**: images, prompts, and model parameters sent to a model service when you actively take a photo and a recognition service is configured. The result is returned to the app so you can review it before saving a record locally.
- **Model configuration**: service URLs, model names, and API keys you enter. API keys are sensitive; use trusted services and rotate them regularly.

Wujian currently does not require sign-in, maintain its own user-account system, or actively collect your name, phone number, contacts, precise location, advertising identifier, or payment information.

## Local-first does not mean offline

“Local-first” means that your item directory and ordinary organization actions center on local device data, without a Wujian cloud account or backend database. It does not mean every feature works fully offline.

When you use AI recognition, the app must send the relevant image and request content over the network to the model service. The current Android release uses a Volcengine Ark-compatible endpoint by default; you can also configure your own compatible endpoint. The service's handling, retention, and processing of requests are governed by its own privacy policy and terms. For highly sensitive content such as identity documents, contracts, or home addresses, check the provider before uploading.

## What happens during AI recognition

A typical recognition flow is:

1. You actively take an item photo in the app.
2. If an AI recognition service is configured, the app automatically adds the photo to the recognition queue after capture; without a configured service, the photo remains in the local confirmation queue.
3. The app sends the necessary image and request parameters to the currently configured model service.
4. The service returns a result, which you can review and edit before saving it to a local item record.

Wujian does not automatically upload your entire item library when you open the app, browse the local directory, or edit an ordinary record. Only photos captured while a recognition service is configured are sent according to the current configuration. Treat the model provider as the recipient of that request and review its latest privacy policy directly.

## API keys and network security

Wujian stores API keys in the secure storage provided by the device and uses them when making requests. The app does not intentionally publish API keys in articles, exports, or public links. However, anyone who can operate your device may be able to change local app configuration, so use reliable device lock protection.

Prefer HTTPS endpoints when connecting to a model service. Custom service URLs are supplied by you, so Wujian cannot guarantee the security, availability, or retention rules of a third-party server. If you suspect a key has been exposed, revoke it with the provider and generate a replacement immediately.

## Sharing, exports, and third-party apps

When you actively export a PDF, Excel file, or Markdown file, or use the system share sheet, the exported content is handed to the system or third-party app you choose. The recipient may receive item names, images, locations, and notes. Wujian does not control that processing; check the file and destination before sharing.

Wujian currently does not integrate advertising SDKs, cross-app tracking SDKs, or a separate behavioral analytics backend.

## Retention and deletion

Local item records remain on the device until you delete them in the app, clear app data, or uninstall the app. Operating-system backups, device migrations, and files you export yourself may create additional copies; manage those copies through the relevant system or app controls.

Requests sent to a model service, including its logs, caches, or possible training use, are handled by that provider according to its policy and your account settings. To delete data held by the provider, use its own deletion, privacy, or account-management channels.

## Developer, contact, and updates

For questions about this policy, data handling, or an AI request, contact the developer through [GreatAndyC on GitHub](https://github.com/GreatAndyC). Please do not include API keys, login credentials, identity documents, or other unnecessary sensitive information in your message.

This policy will be updated as the app and its data practices change. Material changes will be explained clearly in the app or on this page. The date at the top indicates the latest revision.
