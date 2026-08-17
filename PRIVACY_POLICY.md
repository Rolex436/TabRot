# Privacy Policy — tab rot

**Last updated:** August 15, 2026

## Overview

tab rot ("the extension") is a browser add-on that visually "decays" tabs left unvisited for a set period. This policy explains what data the extension touches and how it is used.

## Data Collection

**The extension does not collect, transmit, or share any data.** It does not use analytics, telemetry, remote servers, or third-party services of any kind. No network requests are made by the extension itself.

## Data Stored Locally

To function, the extension stores the following information using the browser's built-in `storage.local` API:

- **Tab identifiers** — internal browser tab IDs, used to track rot state per tab.
- **Timestamps** — the last time each tab was activated, used to calculate how "rotten" a tab is.
- **Rot stage** — a numeric value (0–5) representing a tab's current decay stage.
- **User settings** — your chosen rot period (hours-per-stage) and debug-mode toggle.

This data:
- Stays entirely on your device.
- Is never sent to the developer, Anthropic, or any third party.
- Is automatically removed when a tab is closed.
- Can be cleared at any time by removing the extension or clearing browser extension storage.

## Data Read (Not Stored Remotely)

The extension reads, but does not persist beyond local storage or transmit anywhere:

- **Tab titles and favicon URLs** — read to render the decaying favicon/title effect and to display the tab list in the popup.
- **Page favicon images** — fetched by the content script directly in your browser to generate the desaturated/degraded icon; this happens locally via canvas rendering, not through any external service.

## Permissions Used

| Permission | Why it's needed |
|---|---|
| `tabs` | Read tab titles/favicons, detect tab activation, close fully-rotted tabs |
| `storage` | Save rot state and settings locally |
| `alarms` | Periodically check tab rot status (every 1 minute) |
| `http://*/*`, `https://*/*` | Inject the content script that animates the favicon/title on each page |

## Third Parties

None. The extension contains no ads, trackers, or external API calls.

## Children's Privacy

The extension does not knowingly collect any personal information from anyone, including children, because it does not collect personal information at all.

## Changes to This Policy

If this policy changes, the updated version will be posted in this repository with a revised "Last updated" date.

## Contact
 
For questions, open an issue on the [GitHub repository](https://github.com/Rolex436/TabRot).
