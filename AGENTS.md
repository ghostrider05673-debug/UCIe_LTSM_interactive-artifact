# AI Agent Guide

Read this file before changing the project. These instructions apply to the entire repository and are intended for AI coding agents; `README.md` is the human-facing overview.

## Project Purpose

This repository is a dependency-free static web app for exploring the UCIe Link Training and Status State Machine (LTSM). It provides an interactive bubble graph, expandable state tree, transition matrix, and bundled UCIe 3.0 Chapter 7 sideband-message reference. Treat it as an educational reference, not a normative implementation of the UCIe specification.

## Project Map

- `index.html` defines the page structure, four views, and local stylesheet/script/reference links.
- `styles.css` contains the app's visual and responsive styling.
- `app.js` owns the state data, specification notes, graph layout, and rendering/interaction logic.
- `UCIe_3.0_Chapter7_Sideband_Messages 1.html` is the local sideband-message reference embedded by the Sideband Messages view. Its space is URL-encoded in the iframe path in `index.html`; preserve this pairing if renaming it.
- `UCIe_ch_04_logical_physical_layer.pdf` is a bundled local reference document.
- `.github/workflows/static.yml` deploys the static site to GitHub Pages through GitHub Actions.
- `README.md` documents use, local serving, contribution checks, and specification caveats.

There is no package manager manifest, frontend framework, build step, or automated test suite. Keep the implementation plain HTML, CSS, and JavaScript unless a requirement clearly justifies introducing tooling.

## App Architecture

- `ltsmData` in `app.js` is the source of truth for main states and nested substates. State records carry IDs, descriptions, types, outgoing `paths`, and optional `children`.
- Each path records a target ID, trigger condition, and visual transition type (for example `success`, `error`, `warn`, `pm`, or `reset`).
- `buildMap()` recursively flattens `ltsmData` and its children into `stateMap`; views use this map to resolve state IDs.
- `stateSpecNotes` holds state-level explanatory notes and their specification section labels, separately from short state descriptions.
- `bubblePositions` and `substatePositions` control SVG node coordinates and visual categories. `stateEncodings` supplies optional encoding labels. These are presentation data, not the transition model.
- `renderTree`, `renderMatrixTable`, and `renderBubbleGraph` generate the views. `switchView`, `selectState`, `setSubstatesVisible`, and graph event handlers drive interaction.

When adding or changing states, keep IDs unique, preserve parent/child hierarchy, ensure every path target resolves in `stateMap`, and update graph positions/encodings where the UI needs them. Check all affected views because they share the same state and path data. Avoid changing the meaning of a transition condition while only intending to change its visual presentation.

## Accuracy and Sources

- Verify technical claims and transitions against the applicable official UCIe specification edition before editing state data or notes. The bundled PDF and local sideband HTML are useful project references but may not establish the correct edition or normative interpretation for every question.
- Preserve source section identifiers where known. Distinguish specification-backed requirements from explanatory summaries or implementation-dependent behavior; do not invent protocol rules to fill gaps.
- Keep the independent-project disclaimer and avoid implying endorsement by the UCIe Consortium.
- Do not rename or remove bundled references without updating all relative links and README descriptions.

## Working and Validation

- Keep changes focused and follow the existing vanilla JavaScript and CSS patterns. Avoid adding dependencies for changes that can be handled by the existing stack.
- Serve the repository root locally with `py -m http.server 8000` and open `http://localhost:8000` when checking browser behavior. Directly opening `index.html` is possible, but local serving is more reliable for the embedded reference.
- There are no automated tests or build command. For app changes, manually check page load and browser-console errors; graph rendering, transition hover/filter, node selection, and substate toggle; tree selection and incoming/outgoing links; matrix rows; and the embedded sideband reference.
- For documentation-only changes, check Markdown links and referenced filenames. Use `git diff --check` to catch whitespace errors.
- Do not add generated output, virtual environments, or unrelated files to a change.

## GitHub Pages

The workflow in `.github/workflows/static.yml` deploys on pushes to `main` and supports manual dispatch. It uploads the repository root as the Pages artifact. Keep the app's relative asset paths valid from that root; use this Actions workflow rather than switching the repository to branch-based Pages deployment without an explicit request.