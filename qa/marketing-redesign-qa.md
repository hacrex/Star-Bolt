# Marketing redesign QA notes

## Desktop production preview

The rebuilt homepage was inspected at `http://127.0.0.1:4175/` after the new UI/UX specification and marketing CSS were applied. The first viewport now presents an asymmetric hero, high-contrast oversized display typography, an existing Star Lyrix gold artwork stage, a layered lyric quote card, orbit geometry, a compact content rail, and clear public/creator calls to action. The page reads as an editorial music-media destination rather than a sequence of plain SaaS cards.

The visual pass found decorative off-canvas rings creating horizontal overflow. The marketing home now uses `overflow-x: clip` so those rings remain atmospheric without producing a page-level horizontal scrollbar. The public Shorts and Lyrics Reader states remain visible and honest when external catalog configuration is unavailable. The protected creator actions continue to route through authentication.
