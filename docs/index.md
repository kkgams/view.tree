---
title: Development
status: reference
---

# view.tree

## Local Project

Use Node.js 24 and Python 3 (standard library), plus Make, curl and unzip.
`make open` additionally requires macOS Apple Silicon.

```sh
make build
make test
make open
```

Canonical JavaScript loads directly from `src/`; there is no compilation step.
`make build` validates source hashes, imports, syntax and local Project configuration.
`make open` runs that build and downloads the latest released GAMS Host into
ignored `tools/gams.app` only when absent. It preserves accompanying notices in
`tools/gams-release-notices` and explicitly sets `GAMS_APP_CWD` to this repository
to open the local `gams.json`. Existing downloads are never updated implicitly;
launch does not remove Gatekeeper quarantine. First use needs network access.
Installed Units are cached in ignored `gams_modules/`. No sibling checkout is used.

Tree rendering requires user-supplied assets; this repository does not own a font atlas or node skins. Before `make open`, supply files configured in `ui.views.view-tree.config`:

- `dev-assets/font.json`: msdf-atlas-gen-style JSON with `atlas` dimensions, size and distance range, plus `glyphs` with Unicode, advance, plane bounds and atlas bounds.
- `dev-assets/font.png`: matching RGB MSDF atlas.
- `dev-assets/node-idle.png`, `node-hover.png`, `node-selected.png` under `dev-assets/`: nine-slice skins with four-pixel borders.

Adjust paths, channel count, slice borders and render settings in `gams.json` to match your assets. Launch fails early when a configured asset is missing; it does not generate, download or substitute artwork. The Host still validates and loads these assets. Once supplied, the editor starts an untitled tree. File selection and properties use pinned released Views; the parent picker is local.

Inputs under `dev-assets/` are ignored and not packaged. Only sources listed in
`release.json` are deployed by existing release tooling. Runtime/UI behavior,
package identities and version-tag publication are unchanged. Native GUI behavior
is a separate check; `make -n open` does not verify it.

## Documentation

```sh
make serve-docs DOCS_PORT=8081
make validate-docs
make docs
```

These targets use pinned `justgook/wiki` v1.4.0 and this repository's `docs/`.
The independent preview port defaults to 8080. `make docs` builds the portable
site in ignored `build/site/`; `make build-docs` is the same build. Engine
downloads also stay under ignored `build/`.
Every push to `release` builds with `make docs` and deploys GitHub Pages through
`.github/workflows/pages.yml`, independently of version tags and publication
approval variables. Enable GitHub Pages with GitHub Actions as its source.

## Checks and publication

Run `make check` and `make test` with Node.js 24 and Python 3. Existing tests cover
source/release contracts, not native GUI workflows. The tag workflow, licenses,
notices and legal evidence are unchanged. Added development files and docs are
not included in legal evidence snapshots; exact-input approval requires separate
review before publication. Existing publication gates remain strict; see the
repository's `PUBLISHING.md` for the owner-controlled release process.
