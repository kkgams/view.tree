---
title: Tree Views
status: reference
---

# Tree Views

Tree editor and parent picker for [GAMS](https://github.com/kkgams/gams).

| View | Source / release file | Screenshot | Author |
| --- | --- | --- | --- |
| `view-tree` | `src/view.tree/views/view-tree.js` / `view.tree.zip` | Not available | [GAMS contributors](https://github.com/kkgams/view.tree) |
| `view-tree-parent` | `src/view.tree-parent/views/view-tree-parent.js` / `view.tree-parent.zip` | Not available | GAMS contributors |

## Development

Requires Make, Node.js 24, Python 3, curl, zip, unzip and tar. Canonical JavaScript loads directly; no compilation or package installation is needed.

| Command | Purpose |
| --- | --- |
| `make check` | Check JavaScript syntax and local Project configuration |
| `make test` | Run checks and parent-picker save/result/selection regressions |
| `make package` | Build incremental ZIPs and `SHA256SUMS` under `build.nosync/` |
| `make open` | Open local `gams.json` in the released Host (macOS Apple Silicon) |
| `make serve-docs` | Preview pinned wiki; independent `DOCS_PORT=8080` |
| `make validate-docs` | Validate wiki |
| `make docs` | Build `build.nosync/site/` |
| `make clean` | Remove generated `build.nosync/`, marked Host downloads and configured completed Unit caches; refuse tracked files, symlinks and unidentified tools/caches |

Supply the font atlas and node skins described in the inputs below before opening. Supplied inputs are not packaged. Existing Host downloads are never updated implicitly; notices remain beside the app. First use requires network. No sibling checkout is needed.

## Supplied inputs

Tree rendering requires user-supplied assets; this repository does not own a font atlas or node skins. Before `make open`, supply files configured in `ui.views.view-tree.config`:

- `dev-assets/font.json`: msdf-atlas-gen-style JSON with `atlas` dimensions, size and distance range, plus `glyphs` with Unicode, advance, plane bounds and atlas bounds.
- `dev-assets/font.png`: matching RGB MSDF atlas.
- `dev-assets/node-idle.png`, `node-hover.png`, `node-selected.png` under `dev-assets/`: nine-slice skins with four-pixel borders.

Adjust paths, channel count, slice borders and render settings in `gams.json` to match your assets. Launch fails early when a configured asset is missing; it does not generate, download or substitute artwork. The Host still validates and loads these assets. Once supplied, the editor starts an untitled tree. File selection and properties use pinned released Views; the parent picker is local.

