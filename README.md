# The Evangelista Archive — starter site

This is a static website (no server, no build step) meant for GitHub Pages.
Everything about a person, and every photo/document/video they're linked to,
lives in one file: `data/people.json`. You (or I, on your behalf) edit that
file to update the whole site — the tree and the archive both read from it.

## File overview

```
index.html      → homepage
tree.html       → interactive family tree
archive.html    → searchable/filterable gallery of all media
style.css       → all visual styling (colors, fonts, layout)
js/common.js    → shared data-loading helpers
js/tree.js      → draws the tree
js/archive.js   → draws the archive grid + filters
data/people.json → ALL your family data lives here
media/          → empty for now — a place to put small optimized photos later
```

## Adding a real person

Add an entry to the `people` array in `data/people.json`:

```json
{
  "id": "unique-id-no-spaces",
  "name": "Full Name",
  "born": "1930",
  "died": "2010",
  "generation": 2,
  "spouse": "spouse-id-or-empty-string",
  "parents": ["parent-id-1", "parent-id-2"],
  "bio": "A sentence or two about them.",
  "media": []
}
```

- `generation` controls which row they appear in on the tree (1 = oldest
  generation shown, 2 = their children, etc).
- `parents` should list the `id`s of people already in the file.
- Leave `spouse` as `""` if not applicable.

## Adding a photo, document, or video

Inside a person's `media` array:

```json
{ "id": "unique-media-id", "type": "photo", "title": "Wedding, 1938", "driveLink": "" }
```

- `type` is one of `photo`, `document`, or `video`.
- **`driveLink`**: paste a Google Drive share link here (right-click the file
  in Drive → "Get link" → make sure it's set to "Anyone with the link"). The
  archive card will then be clickable and open the file in Drive.
- Leave `driveLink` empty (`""`) and the card will just show "Awaiting
  upload" — a visible placeholder reminding you it still needs a link.

For small photos you want hosted directly on the site (loads faster, doesn't
depend on Drive sharing settings), drop a resized copy into `media/` and set
`"driveLink": "media/your-photo.jpg"` — same field, just a local path
instead of a Drive URL.

## Uploading to GitHub

Drag the **entire folder** (keeping `js/` and `data/` as subfolders intact)
into GitHub's "Add file → Upload files" screen. GitHub preserves folder
structure when you drag a folder in. Commit, wait about a minute, and the
live site updates.
