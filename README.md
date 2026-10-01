# Phishing-Awareness

**Live site:** https://spellskite-coding.github.io/Phishing-Awareness/

A static, risk-free awareness website teaching non-technical users (parents, grandparents) to recognize fake SMS, WhatsApp messages and e-mails (smishing, messaging-app phishing and e-mail phishing). Sibling project to Fake-Captcha-Awareness, same philosophy and visual family.

The website content is in French, as it targets a French-speaking, non-technical audience.

## Features

### Interactive training on a fake phone

The visitor picks an app (Messages / WhatsApp / E-mails), opens each message and decides what to do. Real, legitimate messages are mixed in with the traps, so the lesson is "learn to tell them apart", not "delete everything".

For each message, three actions:
- **Tap the link / reply** (the trap) → red "STOP" screen (if it was a trap)
- **Delete and report** → green "Good reflex" screen
- **Verify another way** → the gold-standard "Best reflex" screen

Each reveal shows what the message was, **the psychological levers it used against you**, and the clue that gave it away. Legitimate messages get a distinct yellow "it was genuine" screen that still teaches the safe habit (and never share a code).

Scenarios are modeled on real French campaigns, with incremental difficulty (1 crude → 2 credible → 3 AI-written, no typos → 4 targeted/advanced):
- **SMS:** blocked parcel with customs fee, unpaid fine (ANTAI), fake bank fraud alert, Chronopost redelivery, tax refund **spoofed into the real "Impots" thread**, plus two legitimate messages (a login code, a medical appointment reminder)
- **WhatsApp:** the "hi mum, new number" scam, a hijacked friend's account ("is this you in the video?"), a fake job offer, and the "send me the 6-digit code" account-takeover
- **E-mail:** a fake Netflix "cancel the payment" lure (the rush-to-cancel bias), a fake EDF overdue bill **with a booby-trapped PDF attachment**, a fake "party photos" e-mail with a **double-extension** attachment (`Photos.jpg.exe`), a fake Microsoft security alert, plus two legitimate e-mails (a shipping confirmation, a library newsletter)

### Learning content

- **"How they manipulate you"**: the six psychological levers (fear, urgency, money, curiosity, authority, trust), each with an example and the neutralizing reflex. Key modern point: with AI, phishing messages no longer have typos — what still gives them away is the sender, the link and what they ask for.
- **"Verify another way"**: the habit that defeats almost every trap, plus how to reveal a link's real destination and how to read a domain from the right.
- **Mini-game "which button are they pushing?"**: identify the main lever behind each message.
- **"I already clicked"**: what to do, with the official French channels (33700, signal-spam.fr, cybermalveillance.gouv.fr, 17Cyber).
- Printable reminder card, sharing buttons, A−/A+ text size, reset button.

## Safety guarantees

- **No real links.** Every address shown is fake and inert (a plain `<span>`, not a real `<a>`). Tapping it only opens the awareness screen.
- **Nothing is sent, nothing is installed**, no attachment is real (they are drawn in the page).
- **No external resources:** no third-party fonts, scripts, images or CDN. Strict CSP (`default-src 'none'`).
- **No cookies, no trackers.** Only the chosen app, the messages already seen and the text size are stored in the browser's `localStorage`, on the visitor's device.
- **Real company/organization names** (La Poste, Ameli, impots.gouv.fr, Netflix…) are used only as realistic examples, **never with their logos**, and every phishing domain shown is obviously invented. The footer states the site is unaffiliated.

## Deploying on GitHub Pages

1. Create a repository, push `index.html`, `style.css`, `app.js` and this README to the root.
2. *Settings › Pages*: source "Deploy from a branch", branch `main`, folder `/ (root)`.
3. The site is published at `https://<username>.github.io/<repository>/`.

**Cache busting:** `index.html` loads `style.css?v=N` and `app.js?v=N`; increment `N` on every release so visitors never get a new page with an old script.

Local testing: open `index.html`, or run `python3 -m http.server` in the folder.

## Accessibility

20 px base text, A−/A+ buttons, high contrast, full keyboard navigation, visible focus, `prefers-reduced-motion` support, modal dialog with focus trap and Escape to close.

## License

To be defined (MIT or CC BY 4.0 recommended, so other awareness trainers can reuse it).
