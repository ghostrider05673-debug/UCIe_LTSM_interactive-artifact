# UCIe LTSM State Machine Explorer

A small, browser-based reference for exploring the UCIe Link Training and Status State Machine (LTSM). It presents the state flow in interactive diagrams and tables, alongside a local reference for UCIe 3.0 sideband messages.

## What You Can Do

- **Bubble Graph:** Explore state transitions, hover over arrows to read conditions, click a state for details, and filter transitions by category.
- **Substates:** Reveal the MBINIT and MBTRAIN substate flows from the graph's **Show substates** control.
- **Tree Hierarchy:** Browse main states and substates, then inspect descriptions, specification notes, and incoming or outgoing transitions.
- **Transition Matrix:** Scan transitions as a table of source, target, type, and trigger condition.
- **Sideband Messages:** Open the bundled UCIe 3.0 Chapter 7 sideband-message reference.

## Run Locally

No build step, package installation, or framework is required. Clone or download the repository, then serve the project directory with a local web server. For example, with Python installed:

```powershell
py -m http.server 8000
```

Open <http://localhost:8000> in a browser. Stop the server with `Ctrl+C`.

You can also open `index.html` directly in a browser. Serving the files locally is recommended so the bundled sideband reference loads consistently.

## Publish with GitHub Pages

This is a static site deployed with the repository's GitHub Actions workflow at `.github/workflows/static.yml`:

1. Push the project to GitHub with the workflow on the `main` branch.
2. In the repository, open **Settings → Pages** and set the deployment source to **GitHub Actions** if it is not already selected.
3. The workflow deploys on pushes to `main`; it can also be started manually from the **Actions** tab.
4. Open the published URL shown in the Pages settings or the deployment summary.

The workflow publishes the repository root. Keep the HTML, CSS, JavaScript, and bundled reference files together there; the app uses relative paths to load them.

## Project Files

| File | Purpose |
| --- | --- |
| `index.html` | Main page structure and the four view containers |
| `styles.css` | Layout, responsive styling, and graph presentation |
| `app.js` | LTSM state/transition data and rendering and interaction logic |
| `UCIe_3.0_Chapter7_Sideband_Messages 1.html` | Bundled sideband-message reference shown in the app |
| `UCIe_ch_04_logical_physical_layer.pdf` | Local UCIe logical/physical-layer reference document |

## For Developers

The app is plain HTML, CSS, and JavaScript with no external runtime dependencies or build tooling. Start by opening `index.html` and `app.js`:

- State and transition definitions are in `ltsmData` in `app.js`.
- State-specific explanatory notes are in `stateSpecNotes` in `app.js`.
- Graph node positions and visual encodings are maintained in the graph configuration in `app.js`.
- The HTML provides the view containers; `app.js` renders the tree, matrix, and SVG graph into them.

When changing state data, check that each transition target refers to a known state or substate and that the graph, tree, and matrix remain consistent. Keep local assets beside `index.html` unless you also update their relative paths.

### Manual smoke check

There is currently no automated test or build command. After a change, serve the project locally and verify:

1. The page loads without browser-console errors.
2. The graph renders; state selection, transition hover, category filters, and the substate toggle work.
3. The tree shows state details and transition links, and the matrix lists transitions.
4. The Sideband Messages view displays its bundled reference.

## Specification Note

The state descriptions and transitions are an educational visualization based on UCIe specification material, including UCIe 3.0 sections referenced in the app. Consult the applicable official UCIe specification for normative requirements; this explorer is not a substitute for it. Verify technical changes against the relevant specification edition before updating the dataset or notes.

UCIe and related specifications are maintained by the Universal Chiplet Interconnect Express (UCIe) Consortium. This project is an independent reference tool and is not an official UCIe Consortium product.