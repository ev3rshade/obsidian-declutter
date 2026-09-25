# Fixture vault

`vault/` is a small Obsidian vault seeded with the kinds of clutter Clean Tracker should find.

## Usage

```sh
scripts/install-fixture.sh          # copy main.js/manifest.json (and styles.css if present) into the vault
scripts/install-fixture.sh --reset  # first discard any changes made to the vault, then install
```

Then open `fixtures/vault` as a vault in Obsidian and enable community plugins. The build is gitignored, so it's never committed.

Well-formatted notes follow `Templates/Note Template.md`: frontmatter with `date` and `tags`, an H1 matching the filename, and a `## References` section.

## Seeded issues

### Orphans (no incoming links)

| Note | Notes |
| --- | --- |
| `Notes/Orphan Idea.md` | No links in or out |
| `Notes/Archive/Old Orphan.md` | Has an outgoing link but no backlinks; nested folder |
| `Inbox/Quick capture.md` | Also in the inbox and badly formatted |
| `Inbox/Untitled.md` | Empty file; also in the inbox |
| `Templates/Note Template.md` | Orphan only because it's a template. Should **not** be flagged |

`Home.md` is the hub. Everything else is linked from somewhere.

### Broken links

| In | Link | Kind |
| --- | --- | --- |
| `Notes/Garden Plan.md` | `[[Compost Guide]]` | Missing note |
| `Notes/Reading List.md` | `[[Missing Book\|…]]` | Missing note, with alias |
| `Notes/Reading List.md` | `[[Garden Plan#Harvest]]` | Note exists, heading doesn't |
| `Notes/Reading List.md` | `[spec](Specs/Old%20Spec.md)` | Markdown-style link |
| `Notes/Reading List.md` | `![[cover-art.jpg]]` | Missing embed |
| `Inbox/Call with Sam.md` | `[[Quarterly Numbers]]` | Missing note in inbox |
| `Inbox/Quick capture.md` | `![[missing-sketch.png]]` | Missing embed in inbox |

### Inbox

`Inbox/` holds three notes: `Call with Sam.md` (linked, well formatted), `Quick capture.md` (orphan, no structure) and `Untitled.md` (empty).

### Badly formatted notes

| Note | Problem |
| --- | --- |
| `Notes/No Frontmatter.md` | No properties block, inline tag only |
| `Notes/Broken Frontmatter.md` | Unclosed `---` and invalid YAML |
| `Notes/Wrong Title.md` | H1 doesn't match filename, no `## References`, repeated blank lines, trailing whitespace/tab, skipped heading levels, mixed list markers |
| `Inbox/Quick capture.md` | Plain text, no frontmatter or heading |
| `Inbox/Untitled.md` | Empty |

### Attachments

| File | Status |
| --- | --- |
| `Attachments/diagram.png` | Used, via Markdown image in `Home.md` |
| `Attachments/seedlings.png` | Used, via `![[…]]` in `Garden Plan.md` |
| `Attachments/unused-photo.png` | Unused |
| `Attachments/unused-scan.pdf` | Unused, non-image |
| `Attachments/old/unused-nested.png` | Unused, nested folder |
| `Stray Attachment.png` | Unused, outside the attachment folder |
