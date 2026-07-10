async function renderTree() {
  const wrap = document.getElementById("tree-container");
  let data;
  try {
    data = await loadFamilyData();
  } catch (err) {
    wrap.innerHTML = `<p class="empty-state">Could not load family data. Make sure data/people.json is present.</p>`;
    return;
  }

  const generations = [...new Set(data.people.map(p => p.generation))].sort((a, b) => a - b);
  const rendered = new Set();

  generations.forEach(gen => {
    const row = document.createElement("div");
    row.className = "generation";

    const label = document.createElement("span");
    label.className = "generation-label";
    label.textContent = `Gen. ${gen}`;
    row.appendChild(label);

    data.people
      .filter(p => p.generation === gen)
      .forEach(person => {
        if (rendered.has(person.id)) return;

        const spouse = person.spouse ? data.byId[person.spouse] : null;
        const spouseInSameGen = spouse && spouse.generation === gen;

        if (spouseInSameGen) {
          const pair = document.createElement("div");
          pair.className = "spouse-pair";
          pair.appendChild(makeCard(person));
          const mark = document.createElement("span");
          mark.className = "spouse-mark";
          mark.textContent = "∞";
          pair.appendChild(mark);
          pair.appendChild(makeCard(spouse));
          row.appendChild(pair);
          rendered.add(person.id);
          rendered.add(spouse.id);
        } else {
          row.appendChild(makeCard(person));
          rendered.add(person.id);
        }
      });

    wrap.appendChild(row);
  });

  // SVG overlay for connecting lines, sized to the full container
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "tree-lines");
  wrap.prepend(svg);

  requestAnimationFrame(() => drawLines(data, wrap, svg));
  window.addEventListener("resize", () => {
    svg.innerHTML = "";
    drawLines(data, wrap, svg);
  });
}

function makeCard(person) {
  const a = document.createElement("a");
  a.className = "record-card";
  a.dataset.id = person.id;
  a.href = `archive.html?person=${encodeURIComponent(person.id)}`;
  a.innerHTML = `
    <h3>${person.name}</h3>
    <div class="dates">${personLabel(person)}</div>
  `;
  return a;
}

function drawLines(data, wrap, svg) {
  const containerRect = wrap.getBoundingClientRect();
  svg.setAttribute("width", wrap.scrollWidth);
  svg.setAttribute("height", wrap.scrollHeight);

  function center(el, edge) {
    const r = el.getBoundingClientRect();
    const x = r.left - containerRect.left + r.width / 2;
    const y = edge === "top" ? r.top - containerRect.top : r.bottom - containerRect.top;
    return { x, y };
  }

  // Spouse lines
  document.querySelectorAll(".spouse-pair").forEach(pair => {
    const cards = pair.querySelectorAll(".record-card");
    if (cards.length < 2) return;
    const r1 = cards[0].getBoundingClientRect();
    const r2 = cards[1].getBoundingClientRect();
    const y = r1.top - containerRect.top + r1.height / 2;
    const x1 = r1.right - containerRect.left;
    const x2 = r2.left - containerRect.left;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", "spouse-line");
    path.setAttribute("d", `M ${x1} ${y} L ${x2} ${y}`);
    svg.appendChild(path);
  });

  // Parent -> child lines
  data.people.forEach(person => {
    if (!person.parents || person.parents.length === 0) return;
    const childEl = wrap.querySelector(`.record-card[data-id="${person.id}"]`);
    if (!childEl) return;
    const childPoint = center(childEl, "top");

    const parentEls = person.parents
      .map(pid => wrap.querySelector(`.record-card[data-id="${pid}"]`))
      .filter(Boolean);
    if (parentEls.length === 0) return;

    const parentPoints = parentEls.map(el => center(el, "bottom"));
    const startX = parentPoints.reduce((s, p) => s + p.x, 0) / parentPoints.length;
    const startY = parentPoints[0].y;

    const midY = (startY + childPoint.y) / 2;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      `M ${startX} ${startY} C ${startX} ${midY}, ${childPoint.x} ${midY}, ${childPoint.x} ${childPoint.y}`
    );
    svg.appendChild(path);
  });
}

renderTree();
