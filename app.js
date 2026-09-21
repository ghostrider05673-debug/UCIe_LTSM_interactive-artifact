// UCIe LTSM Complete Dataset (Section 4.5.3)
const ltsmData = [
    {
        id: "RESET",
        name: "RESET",
        type: "Main State",
        desc: "Initial state after power-on or hard reset. Registers initialized. Sideband and Mainband inactive.",
        paths: [{ target: "SBINIT", condition: "Sideband power good & reset de-asserted", type: "success" }],
        children: []
    },
    {
        id: "SBINIT",
        name: "SBINIT",
        type: "Main State",
        desc: "Sideband Initialization. Trains sideband drivers/clocks and establishes sideband communication.",
        paths: [
            { target: "MBINIT", condition: "Sideband handshake complete", type: "success" },
            { target: "TRAINERROR", condition: "SB Training Timeout", type: "error" }
        ],
        children: []
    },
    {
        id: "MBINIT",
        name: "MBINIT",
        type: "Main State",
        desc: "Mainband Initialization. Negotiates parameters, performs DC calibration, and executes hardware lane repair.",
        paths: [
            { target: "MBTRAIN", condition: "MBINIT sub-phases complete", type: "success" },
            { target: "TRAINERROR", condition: "Unrepairable hardware defect/timeout", type: "error" }
        ],
        children: [
            { id: "MBINIT.PARAM", name: "PARAM", type: "Substate", desc: "Parameter exchange.", paths: [{ target: "MBINIT.CAL", condition: "Param OK", type: "success" }, { target: "TRAINERROR", condition: "Param Mismatch", type: "error" }] },
            { id: "MBINIT.CAL", name: "CAL", type: "Substate", desc: "DC Impedance/Voltage Calibration.", paths: [{ target: "MBINIT.REPAIRCLK", condition: "Cal OK", type: "success" }] },
            { id: "MBINIT.REPAIRCLK", name: "REPAIRCLK", type: "Substate", desc: "Clock lane repair.", paths: [{ target: "MBINIT.REPAIRVAL", condition: "Clock OK", type: "success" }, { target: "TRAINERROR", condition: "Clock Fail", type: "error" }] },
            { id: "MBINIT.REPAIRVAL", name: "REPAIRVAL", type: "Substate", desc: "Valid signal repair.", paths: [{ target: "MBINIT.REVERSALMB", condition: "Valid OK", type: "success" }] },
            { id: "MBINIT.REVERSALMB", name: "REVERSALMB", type: "Substate", desc: "Mainband lane reversal check.", paths: [{ target: "MBINIT.REPAIRMB", condition: "Reversal OK", type: "success" }] },
            { id: "MBINIT.REPAIRMB", name: "REPAIRMB", type: "Substate", desc: "Data lane repair mapping.", paths: [{ target: "MBTRAIN", condition: "Data Repair OK", type: "success" }, { target: "TRAINERROR", condition: "Repair Exceeded", type: "error" }] }
        ]
    },
    {
        id: "MBTRAIN",
        name: "MBTRAIN",
        type: "Main State",
        desc: "Mainband Training. Executes high-speed clock centering, deskew, and eye optimization.",
        paths: [
            { target: "LINKINIT", condition: "Training completed successfully", type: "success" },
            { target: "TRAINERROR", condition: "Training sequence timeout", type: "error" }
        ],
        children: [
            { id: "MBTRAIN.VALVREF", name: "VALVREF", type: "Substate", desc: "Optimizes receiver reference voltage for the Valid signal at the lowest supported data rate.", paths: [{ target: "MBTRAIN.DATAVREF", condition: "Valid Vref optimization complete", type: "success" }] },
            { id: "MBTRAIN.DATAVREF", name: "DATAVREF", type: "Substate", desc: "Optimizes receiver reference voltage for incoming data at the lowest supported data rate.", paths: [{ target: "MBTRAIN.SPEEDIDLE", condition: "Data Vref optimization complete", type: "success" }] },
            { id: "MBTRAIN.SPEEDIDLE", name: "SPEEDIDLE", type: "Substate", desc: "Electrical idle state used to change or restore the operating data rate.", paths: [{ target: "MBTRAIN.TXSELFCAL", condition: "Required data rate selected and handshake complete", type: "success" }] },
            { id: "MBTRAIN.TXSELFCAL", name: "TXSELFCAL", type: "Substate", desc: "Performs implementation-specific transmitter calibration.", paths: [{ target: "MBTRAIN.RXCLKCAL", condition: "Transmitter calibration complete", type: "success" }] },
            { id: "MBTRAIN.RXCLKCAL", name: "RXCLKCAL", type: "Substate", desc: "Calibrates the receiver clock path and applies required I/Q correction.", paths: [{ target: "MBTRAIN.VALTRAINCENTER", condition: "Receiver clock calibration complete", type: "success" }] },
            { id: "MBTRAIN.VALTRAINCENTER", name: "VALTRAINCENTER", type: "Substate", desc: "Centers the forwarded clock relative to the Valid signal.", paths: [{ target: "MBTRAIN.VALTRAINVREF", condition: "Valid-to-clock centering complete", type: "success" }] },
            { id: "MBTRAIN.VALTRAINVREF", name: "VALTRAINVREF", type: "Substate", desc: "Optionally optimizes Valid receiver reference voltage at the operating data rate.", paths: [{ target: "MBTRAIN.DATATRAINCENTER1", condition: "Valid Vref refinement complete or skipped", type: "success" }] },
            { id: "MBTRAIN.DATATRAINCENTER1", name: "DATATRAINCENTER1", type: "Substate", desc: "Centers the forwarded clock relative to data and adjusts transmitter per-bit deskew when needed.", paths: [{ target: "MBTRAIN.DATATRAINVREF", condition: "Data-to-clock centering complete", type: "success" }] },
            { id: "MBTRAIN.DATATRAINVREF", name: "DATATRAINVREF", type: "Substate", desc: "Optionally optimizes data receiver reference voltage at the operating data rate.", paths: [{ target: "MBTRAIN.RXDESKEW", condition: "Data Vref optimization complete or deskew required", type: "success" }] },
            { id: "MBTRAIN.RXDESKEW", name: "RXDESKEW", type: "Substate", desc: "Optionally performs per-lane receiver deskew and transmitter EQ preset adjustment.", paths: [{ target: "MBTRAIN.DATATRAINCENTER2", condition: "Deskew complete or skipped", type: "success" }, { target: "MBTRAIN.DATATRAINCENTER1", condition: "Additional EQ adjustment requested", type: "warn" }] },
            { id: "MBTRAIN.DATATRAINCENTER2", name: "DATATRAINCENTER2", type: "Substate", desc: "Recenters the clock to aggregate data after receiver deskew.", paths: [{ target: "MBTRAIN.LINKSPEED", condition: "Final data-to-clock centering complete", type: "success" }] },
            { id: "MBTRAIN.LINKSPEED", name: "LINKSPEED", type: "Substate", desc: "Checks link stability at the selected operating data rate and resolves errors, repair, or speed degradation.", paths: [
                { target: "LINKINIT", condition: "Final link test passes and done handshake completes", type: "success" },
                { target: "MBTRAIN.REPAIR", condition: "Lane errors are repairable or width degradation is possible", type: "warn" },
                { target: "MBTRAIN.SPEEDIDLE", condition: "Lane errors require a lower operating data rate", type: "warn" },
                { target: "PHYRETRAIN", condition: "Runtime retrain requested or link-test control changed", type: "warn" },
                { target: "TRAINERROR", condition: "Errors cannot be repaired, degraded, or resolved", type: "error" }
            ] },
            { id: "MBTRAIN.REPAIR", name: "REPAIR", type: "Substate", desc: "Applies mainband lane repair for Advanced Package or width degradation for Standard Package.", paths: [
                { target: "MBTRAIN.TXSELFCAL", condition: "Repair or width-degrade handshake completes", type: "success" },
                { target: "TRAINERROR", condition: "Repair unavailable or width degradation impossible", type: "error" }
            ] }
        ]
    },
    {
        id: "LINKINIT",
        name: "LINKINIT",
        type: "Main State",
        desc: "Link Initialization. Handshakes physical layer with adapter layer.",
        paths: [
            { target: "ACTIVE", condition: "Adapter handshake complete (FDI/RDI)", type: "success" },
            { target: "TRAINERROR", condition: "Handshake timeout", type: "error" }
        ],
        children: []
    },
    {
        id: "ACTIVE",
        name: "ACTIVE",
        type: "Main State",
        desc: "Normal Operational State. High-bandwidth flit data transfer.",
        paths: [
            { target: "L1", condition: "L1 low power request", type: "pm" },
            { target: "L2", condition: "L2 deep low power request", type: "pm" },
            { target: "PHYRETRAIN", condition: "Link drift / rate change", type: "warn" },
            { target: "TRAINERROR", condition: "Framing error", type: "error" },
            { target: "RESET", condition: "Forced Reset", type: "reset" }
        ],
        children: []
    },
    {
        id: "PHYRETRAIN",
        name: "PHYRETRAIN",
        type: "Main State",
        desc: "Retraining State. Re-aligns sampling points dynamically.",
        paths: [
            { target: "MBTRAIN.TXSELFCAL", condition: "No lane errors or valid-framing retrain requires recalibration", type: "success" },
            { target: "MBTRAIN.REPAIR", condition: "Lane errors detected and repair resources are available", type: "warn" },
            { target: "MBTRAIN.SPEEDIDLE", condition: "Lane errors cannot be repaired and speed must be degraded", type: "warn" },
            { target: "TRAINERROR", condition: "Retrain handshake or resolution fails", type: "error" }
        ],
        children: []
    },
    {
        id: "L1",
        name: "L1",
        type: "Main State (PM)",
        desc: "L1 low-power state. Mainband clocks are gated while the sideband remains available for wakeup.",
        paths: [
            { target: "MBTRAIN.SPEEDIDLE", condition: "Adapter requests Active or remote partner requests L1 exit", type: "success" }
        ],
        children: []
    },
    {
        id: "L2",
        name: "L2",
        type: "Main State (PM)",
        desc: "L2 deep low-power state. Sideband infrastructure may be powered down and must be reinitialized before link training resumes.",
        paths: [
            { target: "RESET", condition: "Adapter requests Active or remote partner requests L2 exit; restart from RESET", type: "reset" }
        ],
        children: []
    },
    {
        id: "TRAINERROR",
        name: "TRAINERROR",
        type: "Main State (Error)",
        desc: "Error Recovery State. Safe hold state upon failure.",
        paths: [
            { target: "RESET", condition: "Software / Controller Reset", type: "reset" },
            { target: "SBINIT", condition: "Fallback retry", type: "warn" }
        ],
        children: []
    }
];

// Layout Geometry for Main Diagram
const bubblePositions = {
    "RESET": { x: 100, y: 150, category: "init" },
    "SBINIT": { x: 260, y: 150, category: "init" },
    "MBINIT": { x: 420, y: 150, category: "train" },
    "MBTRAIN": { x: 580, y: 150, category: "train" },
    "LINKINIT": { x: 740, y: 150, category: "train" },
    "ACTIVE": { x: 900, y: 150, category: "active" },
    "PHYRETRAIN": { x: 740, y: 380, category: "warn" },
    "L1": { x: 900, y: 380, category: "pm" },
    "L2": { x: 1050, y: 380, category: "pm" },
    "TRAINERROR": { x: 420, y: 380, category: "error" }
};

let showSubstates = false;
const substatePositions = {
    "MBINIT.PARAM": { x: 110, y: 720, category: "train", substate: true },
    "MBINIT.CAL": { x: 250, y: 720, category: "train", substate: true },
    "MBINIT.REPAIRCLK": { x: 390, y: 720, category: "train", substate: true },
    "MBINIT.REPAIRVAL": { x: 530, y: 720, category: "train", substate: true },
    "MBINIT.REVERSALMB": { x: 670, y: 720, category: "train", substate: true },
    "MBINIT.REPAIRMB": { x: 810, y: 720, category: "train", substate: true },
    "MBTRAIN.VALVREF": { x: 70, y: 540, category: "train", substate: true },
    "MBTRAIN.DATAVREF": { x: 180, y: 540, category: "train", substate: true },
    "MBTRAIN.SPEEDIDLE": { x: 290, y: 540, category: "train", substate: true },
    "MBTRAIN.TXSELFCAL": { x: 400, y: 540, category: "train", substate: true },
    "MBTRAIN.RXCLKCAL": { x: 510, y: 540, category: "train", substate: true },
    "MBTRAIN.VALTRAINCENTER": { x: 620, y: 540, category: "train", substate: true },
    "MBTRAIN.VALTRAINVREF": { x: 730, y: 540, category: "train", substate: true },
    "MBTRAIN.DATATRAINCENTER1": { x: 840, y: 540, category: "train", substate: true },
    "MBTRAIN.DATATRAINVREF": { x: 950, y: 540, category: "train", substate: true },
    "MBTRAIN.RXDESKEW": { x: 1060, y: 540, category: "train", substate: true },
    "MBTRAIN.DATATRAINCENTER2": { x: 1170, y: 540, category: "train", substate: true },
    "MBTRAIN.LINKSPEED": { x: 1280, y: 540, category: "train", substate: true },
    "MBTRAIN.REPAIR": { x: 1280, y: 650, category: "warn", substate: true }
};
const stateMap = {};

function buildMap(nodes) {
    nodes.forEach(node => {
        stateMap[node.id] = node;
        if (node.children) buildMap(node.children);
    });
}
buildMap(ltsmData);

function switchView(viewId, btnEl) {
    document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    btnEl.classList.add('active');
}

function setSubstatesVisible(visible) {
    showSubstates = visible;
    const toggle = document.getElementById('substateToggle');
    const svgCanvas = document.getElementById('svgCanvas');
    if (toggle) {
        toggle.setAttribute('aria-pressed', String(visible));
        toggle.textContent = visible ? 'Hide substates' : 'Show substates';
    }
    if (svgCanvas) {
        svgCanvas.setAttribute('height', visible ? '820' : '520');
        svgCanvas.setAttribute('viewBox', visible ? '0 0 1400 820' : '0 0 1200 520');
        svgCanvas.parentElement.classList.toggle('expanded-graph', visible);
    }
    renderBubbleGraph();
}

function renderTree(nodes, container) {
    nodes.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'tree-node';
        const hasChildren = node.children && node.children.length > 0;

        const header = document.createElement('div');
        header.className = 'node-header';
        header.dataset.id = node.id;
        header.innerHTML = `
            <span class="toggle-icon">${hasChildren ? '▶' : '•'}</span>
            <span class="node-title">${node.name}</span>
            <span class="badge">${node.type}</span>
        `;

        nodeEl.appendChild(header);

        if (hasChildren) {
            const childrenEl = document.createElement('div');
            childrenEl.className = 'node-children';
            renderTree(node.children, childrenEl);
            nodeEl.appendChild(childrenEl);

            header.querySelector('.toggle-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                const isExpanded = childrenEl.classList.contains('expanded');
                childrenEl.classList.toggle('expanded', !isExpanded);
                header.querySelector('.toggle-icon').textContent = isExpanded ? '▶' : '▼';
            });
        }

        header.addEventListener('click', () => selectState(node.id));
        container.appendChild(nodeEl);
    });
}

function selectState(stateId) {
    document.querySelectorAll('.node-header').forEach(el => el.classList.remove('active'));
    const activeHeader = document.querySelector(`.node-header[data-id="${stateId}"]`);
    if (activeHeader) activeHeader.classList.add('active');

    const state = stateMap[stateId];
    if (!state) return;

    document.getElementById('stateName').textContent = `${state.name} (${state.id})`;
    document.getElementById('stateDesc').textContent = state.desc;

    const outgoingContainer = document.getElementById('outgoingPaths');
    outgoingContainer.innerHTML = '';
    if (state.paths && state.paths.length > 0) {
        state.paths.forEach(p => {
            const li = document.createElement('li');
            li.className = 'path-item';
            const targetState = stateMap[p.target];
            li.innerHTML = `
                <div>Transition to: <span class="path-target">${targetState ? targetState.name : p.target}</span></div>
                <div class="path-condition">Condition: ${p.condition}</div>
            `;
            li.addEventListener('click', () => selectState(p.target));
            outgoingContainer.appendChild(li);
        });
        document.getElementById('transitionsCard').style.display = 'block';
    } else {
        document.getElementById('transitionsCard').style.display = 'none';
    }

    const incomingContainer = document.getElementById('incomingPaths');
    incomingContainer.innerHTML = '';
    let incomingCount = 0;

    Object.values(stateMap).forEach(s => {
        if (s.paths) {
            s.paths.forEach(p => {
                if (p.target === stateId) {
                    incomingCount++;
                    const li = document.createElement('li');
                    li.className = 'path-item';
                    li.innerHTML = `
                        <div>From: <span class="path-target">${s.name}</span></div>
                        <div class="path-condition">Condition: ${p.condition}</div>
                    `;
                    li.addEventListener('click', () => selectState(s.id));
                    incomingContainer.appendChild(li);
                }
            });
        }
    });

    document.getElementById('incomingCard').style.display = incomingCount > 0 ? 'block' : 'none';
}

function renderMatrixTable() {
    const tableBody = document.getElementById('matrixTableBody');
    tableBody.innerHTML = '';

    Object.values(stateMap).forEach(state => {
        if (state.paths) {
            state.paths.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><span class="state-tag">${state.id}</span></td>
                    <td><span class="state-tag">${p.target}</span></td>
                    <td>${state.type}</td>
                    <td>${p.condition}</td>
                `;
                tableBody.appendChild(tr);
            });
        }
    });
}

function filterType(type) {
    document.querySelectorAll('.path-group').forEach(pathGroup => {
        pathGroup.classList.toggle('hidden-path', type !== 'all' && !pathGroup.classList.contains(`type-${type}`));
    });
}

function renderLegend(container) {
    const existingLegend = document.getElementById('graphLegend');
    if (existingLegend) existingLegend.remove();

    const legend = document.createElement('div');
    legend.id = 'graphLegend';
    legend.className = 'graph-legend-card';
    legend.innerHTML = `
        <div class="legend-title">Arrow Legend</div>
        <button class="legend-item" data-type="all"><span class="legend-color legend-all"></span>All transitions</button>
        <button class="legend-item" data-type="success"><span class="legend-line line-success"></span>Forward / success</button>
        <button class="legend-item" data-type="error"><span class="legend-line line-error"></span>Error / failure</button>
        <button class="legend-item" data-type="warn"><span class="legend-line line-warn"></span>Retrain / recovery</button>
        <button class="legend-item" data-type="pm"><span class="legend-line line-pm"></span>Power management</button>
        <button class="legend-item" data-type="reset"><span class="legend-line line-reset"></span>Reset</button>
    `;

    legend.querySelectorAll('.legend-item').forEach(item => {
        item.addEventListener('click', () => filterType(item.dataset.type));
    });
    container.appendChild(legend);
}

function getRenderedTargetId(sourceId, transition) {
    if (!showSubstates && transition.target.startsWith('MBTRAIN.')) {
        return 'MBTRAIN';
    }
    return transition.target;
}

function getGraphTransitions(sourceId, paths) {
    if (sourceId !== 'PHYRETRAIN') return paths;

    const resolutionPaths = paths.filter(path => ['MBTRAIN.REPAIR', 'MBTRAIN.SPEEDIDLE'].includes(path.target));
    if (resolutionPaths.length < 2) return paths;

    return [
        ...paths.filter(path => !resolutionPaths.includes(path)),
        {
            target: 'MBTRAIN',
            condition: 'Retrain resolution selects repair or speed degradation',
            type: 'warn',
            details: resolutionPaths.map(path => ({
                target: path.target,
                condition: path.condition
            }))
        }
    ];
}

function getCurveMidpoint(sourcePos, targetPos, curveFactor) {
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return {
        x: (sourcePos.x + targetPos.x) / 2 + (-dy / dist) * curveFactor,
        y: (sourcePos.y + targetPos.y) / 2 + (dx / dist) * curveFactor
    };
}

function getRouteClearance(sourceId, targetId, sourcePos, targetPos, curveFactor, positions) {
    const midpoint = getCurveMidpoint(sourcePos, targetPos, curveFactor);
    let minimumClearance = Infinity;

    for (let step = 1; step < 20; step++) {
        const t = step / 20;
        const x = (1 - t) ** 2 * sourcePos.x + 2 * (1 - t) * t * midpoint.x + t ** 2 * targetPos.x;
        const y = (1 - t) ** 2 * sourcePos.y + 2 * (1 - t) * t * midpoint.y + t ** 2 * targetPos.y;

        Object.entries(positions).forEach(([id, position]) => {
            if (id === sourceId || id === targetId) return;
            const radius = position.substate ? 27 : 36;
            minimumClearance = Math.min(minimumClearance, Math.hypot(x - position.x, y - position.y) - radius);
        });
    }

    return minimumClearance;
}

// Advanced Graph Visualizer
function renderBubbleGraph() {
    const nodesGroup = document.getElementById('svgNodes');
    const pathsGroup = document.getElementById('svgTransitions');
    const svgCanvas = document.getElementById('svgCanvas');

    if (!nodesGroup || !pathsGroup || !svgCanvas) return;

    nodesGroup.innerHTML = '';
    pathsGroup.innerHTML = '';

    let defs = svgCanvas.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svgCanvas.prepend(defs);
    }
    defs.innerHTML = `
        <marker id="arrow-success" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8"></path></marker>
        <marker id="arrow-error" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f87171"></path></marker>
        <marker id="arrow-warn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24"></path></marker>
        <marker id="arrow-pm" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#34d399"></path></marker>
        <marker id="arrow-reset" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8"></path></marker>
        <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff"></path></marker>
    `;

    renderLegend(document.getElementById('graphLegendSlot'));

    const currentPositions = showSubstates
        ? { ...bubblePositions, ...substatePositions }
        : { ...bubblePositions };

    if (showSubstates) {
        nodesGroup.innerHTML = `
            <text class="substate-lane-heading" x="25" y="695">MBINIT substates</text>
            <text class="substate-lane-heading" x="25" y="515">MBTRAIN substates</text>
        `;
    }

    // Draw Connectors & Conditions
    Object.keys(currentPositions).forEach(sourceId => {
        const sourceState = stateMap[sourceId];
        const sourcePos = currentPositions[sourceId];

        if (sourceState && sourceState.paths) {
            const graphPaths = getGraphTransitions(sourceId, sourceState.paths);
            graphPaths.forEach((p, idx) => {
                const renderedTargetId = getRenderedTargetId(sourceId, p);
                const targetPos = currentPositions[renderedTargetId];
                if (targetPos) {
                    const gPath = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    const pathType = p.type || 'success';
                    gPath.setAttribute("class", `path-group type-${pathType} source-${sourceId} target-${renderedTargetId}`);
                    gPath.dataset.source = sourceId;
                    gPath.dataset.target = renderedTargetId;

                    const dx = targetPos.x - sourcePos.x;
                    const dy = targetPos.y - sourcePos.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Fan out multiple outgoing paths so their reasons stay readable.
                    let curveFactor = 35;
                    if (pathType === 'error') curveFactor = -55;
                    if (pathType === 'reset') curveFactor = 75;
                    if (dy !== 0 && dx === 0) curveFactor = 30;
                    const fanOffset = (idx - (graphPaths.length - 1) / 2) * 18;
                    curveFactor += fanOffset;
                    if ((sourceId === 'SBINIT' && renderedTargetId === 'TRAINERROR') ||
                        (sourceId === 'TRAINERROR' && renderedTargetId === 'SBINIT')) {
                        curveFactor = 90;
                    }

                    const routeCandidates = [curveFactor - 120, curveFactor - 80, curveFactor - 40, curveFactor, curveFactor + 40, curveFactor + 80, curveFactor + 120];
                    const currentClearance = getRouteClearance(sourceId, renderedTargetId, sourcePos, targetPos, curveFactor, currentPositions);
                    if (currentClearance < 35) {
                        curveFactor = routeCandidates.reduce((best, candidate) => {
                            const bestClearance = getRouteClearance(sourceId, renderedTargetId, sourcePos, targetPos, best, currentPositions);
                            const candidateClearance = getRouteClearance(sourceId, renderedTargetId, sourcePos, targetPos, candidate, currentPositions);
                            return candidateClearance > bestClearance ? candidate : best;
                        }, curveFactor);
                    }

                    const normalX = -dy / dist;
                    const normalY = dx / dist;
                    const midX = (sourcePos.x + targetPos.x) / 2 + normalX * curveFactor;
                    const midY = (sourcePos.y + targetPos.y) / 2 + normalY * curveFactor;

                    const sourceRadius = sourcePos.substate ? 27 : 36;
                    const targetRadius = targetPos.substate ? 27 : 36;
                    const sourceTangentX = midX - sourcePos.x;
                    const sourceTangentY = midY - sourcePos.y;
                    const sourceTangentLength = Math.sqrt(sourceTangentX * sourceTangentX + sourceTangentY * sourceTangentY);
                    const tangentX = targetPos.x - midX;
                    const tangentY = targetPos.y - midY;
                    const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
                    const sourceGap = sourceRadius + 5;
                    const arrowGap = targetRadius + 5;
                    const pathStartX = sourcePos.x + (sourceTangentX / sourceTangentLength) * sourceGap;
                    const pathStartY = sourcePos.y + (sourceTangentY / sourceTangentLength) * sourceGap;
                    const arrowEndX = targetPos.x - (tangentX / tangentLength) * arrowGap;
                    const arrowEndY = targetPos.y - (tangentY / tangentLength) * arrowGap;
                    const d = `M ${pathStartX} ${pathStartY} Q ${midX} ${midY} ${arrowEndX} ${arrowEndY}`;

                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    path.setAttribute("d", d);
                    path.setAttribute("class", `svg-path path-${pathType}`);
                    path.setAttribute("marker-end", `url(#arrow-${pathType})`);
                    path.dataset.marker = `url(#arrow-${pathType})`;
                    gPath.appendChild(path);

                    const hitPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    hitPath.setAttribute("d", d);
                    hitPath.setAttribute("class", "transition-hit-area");
                    gPath.appendChild(hitPath);

                    gPath.addEventListener('mouseenter', () => showTransitionTooltip(sourceId, renderedTargetId, p.condition, gPath, p.details));
                    gPath.addEventListener('mouseleave', () => hideTransitionTooltip(gPath));

                    // Put the transition reason directly on the connector.
                    const labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    labelGroup.setAttribute("class", "path-label-group");
                    const labelOffset = pathType === 'error' ? -8 : 8;
                    labelGroup.setAttribute("transform", `translate(${midX + normalX * labelOffset}, ${midY + normalY * labelOffset})`);

                    const labelBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    labelBg.setAttribute("class", "path-label-bg");
                    labelGroup.appendChild(labelBg);

                    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    text.setAttribute("class", "path-label-text");
                    text.setAttribute("text-anchor", "middle");
                    const words = p.condition.split(' ');
                    let line = '';
                    let lineNumber = 0;
                    words.forEach(word => {
                        const candidate = line ? `${line} ${word}` : word;
                        if (line && candidate.length > 25) {
                            const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                            tspan.setAttribute("x", "0");
                            tspan.setAttribute("dy", lineNumber === 0 ? "0" : "11");
                            tspan.textContent = line;
                            text.appendChild(tspan);
                            line = word;
                            lineNumber++;
                        } else {
                            line = candidate;
                        }
                    });
                    const lastLine = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                    lastLine.setAttribute("x", "0");
                    lastLine.setAttribute("dy", lineNumber === 0 ? "3" : "11");
                    lastLine.textContent = line;
                    text.appendChild(lastLine);
                    labelGroup.appendChild(text);
                    gPath.appendChild(labelGroup);

                    requestAnimationFrame(() => {
                        const bbox = text.getBBox();
                        labelBg.setAttribute("x", bbox.x - 5);
                        labelBg.setAttribute("y", bbox.y - 3);
                        labelBg.setAttribute("width", bbox.width + 10);
                        labelBg.setAttribute("height", bbox.height + 6);
                        labelBg.setAttribute("rx", "4");
                    });

                    pathsGroup.appendChild(gPath);
                }
            });
        }
    });

    // Draw State Nodes (Bubbles)
    Object.keys(currentPositions).forEach(id => {
        const pos = currentPositions[id];
        const state = stateMap[id];
        const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        nodeGroup.setAttribute("class", `svg-node category-${pos.category}${pos.substate ? ' substate' : ''}`);
        nodeGroup.setAttribute("data-id", id);
        nodeGroup.setAttribute("transform", `translate(${pos.x}, ${pos.y})`);

        nodeGroup.innerHTML = `
            <circle r="${pos.substate ? 27 : 36}"></circle>
            <text dy="-3" class="node-name">${pos.substate ? state.name : id}</text>
            <text dy="13" class="node-sub">${pos.substate ? 'Substate' : state.type.split(' ')[0]}</text>
        `;

        // Interactive Focus Effect
        nodeGroup.addEventListener('mouseenter', () => highlightConnections(id));
        nodeGroup.addEventListener('mouseleave', clearHighlights);

        nodeGroup.addEventListener('click', () => {
            showNodeTooltip(id, pos.x, pos.y);
        });

        nodesGroup.appendChild(nodeGroup);
    });
}

function highlightConnections(nodeId) {
    document.querySelectorAll('.svg-node').forEach(n => n.classList.add('dimmed'));
    document.querySelectorAll('.path-group').forEach(p => p.classList.add('dimmed'));

    const activeNode = document.querySelector(`.svg-node[data-id="${nodeId}"]`);
    if (activeNode) activeNode.classList.remove('dimmed');

    document.querySelectorAll('.path-group').forEach(pathGroup => {
        if (pathGroup.dataset.source === nodeId || pathGroup.dataset.target === nodeId) {
            pathGroup.classList.remove('dimmed');
            pathGroup.classList.add('highlighted');
        }
    });
}

function clearHighlights() {
    document.querySelectorAll('.svg-node').forEach(n => n.classList.remove('dimmed'));
    document.querySelectorAll('.path-group').forEach(p => {
        p.classList.remove('dimmed');
        p.classList.remove('highlighted');
    });
}

function showTransitionTooltip(sourceId, targetId, condition, pathGroup, transitionDetails = []) {
    const details = document.getElementById('graphTransitionDetails');
    if (!details) return;

    document.querySelectorAll('.path-group.active-transition').forEach(group => {
        group.classList.remove('active-transition');
        group.querySelector('.svg-path')?.setAttribute('marker-end', group.querySelector('.svg-path').dataset.marker);
    });
    document.querySelectorAll('.svg-node.active-endpoint').forEach(node => {
        node.classList.remove('active-endpoint', 'active-source', 'active-target');
    });
    pathGroup.classList.add('active-transition');
    document.querySelector(`.svg-node[data-id="${sourceId}"]`)?.classList.add('active-endpoint', 'active-source');
    const targetNode = document.querySelector(`.svg-node[data-id="${targetId}"]`);
    targetNode?.classList.add('active-endpoint', 'active-target');

    const source = stateMap[sourceId];
    const target = stateMap[targetId];
    const detailItems = transitionDetails.length > 0
        ? `<div class="transition-options"><span>Resolution options</span>${transitionDetails.map(detail => `<div><strong>${detail.target}</strong><span>${detail.condition}</span></div>`).join('')}</div>`
        : '';
    details.innerHTML = `
        <div class="details-eyebrow">Transition details</div>
        <div class="transition-direction"><span>Direction</span><strong>${source ? source.name : sourceId} &#8594; ${target ? target.name : targetId}</strong></div>
        <h3>Why does the state change?</h3>
        <p class="transition-reason">${condition}</p>
        ${detailItems}
        <p class="transition-context">Hover another arrow to inspect its transition condition.</p>
    `;
    details.classList.add('has-transition');
}

function hideTransitionTooltip(pathGroup) {
    const details = document.getElementById('graphTransitionDetails');
    if (details) details.classList.remove('has-transition');
    pathGroup.classList.remove('active-transition');
    pathGroup.querySelector('.svg-path')?.setAttribute('marker-end', pathGroup.querySelector('.svg-path').dataset.marker);
    document.querySelectorAll('.svg-node.active-endpoint').forEach(node => {
        node.classList.remove('active-endpoint', 'active-source', 'active-target');
    });
}

function showNodeTooltip(id, x, y) {
    const state = stateMap[id];
    let overlay = document.getElementById('graphTooltip');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'graphTooltip';
        overlay.className = 'graph-tooltip-card';
        document.querySelector('.svg-wrapper').appendChild(overlay);
    }

    let pathsHtml = state.paths ? state.paths.map(p => `<li><b>➔ ${p.target}:</b> ${p.condition}</li>`).join('') : 'None';

    overlay.innerHTML = `
        <div class="tooltip-header">
            <h4>${state.name}</h4>
            <button onclick="document.getElementById('graphTooltip').style.display='none'">✕</button>
        </div>
        <p>${state.desc}</p>
        <div class="tooltip-paths">
            <strong>Transitions:</strong>
            <ul>${pathsHtml}</ul>
        </div>
        <button class="tooltip-action-btn" onclick="switchView('tree-view', document.querySelectorAll('.tab-btn')[0]); selectState('${id}');">Inspect in Tree</button>
    `;

    overlay.style.display = 'block';
    overlay.style.left = `${Math.min(x, 700)}px`;
    overlay.style.top = `${Math.min(y, 200)}px`;
}

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('substateToggle').addEventListener('click', () => setSubstatesVisible(!showSubstates));
    renderTree(ltsmData, document.getElementById('treeView'));
    renderMatrixTable();
    renderBubbleGraph();
    selectState('RESET');
});