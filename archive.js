async function renderArchive() {
  const grid = document.getElementById("archive-grid");
  const personSelect = document.getElementById("filter-person");
  const typeSelect = document.getElementById("filter-type");
  const searchInput = document.getElementById("filter-search");

  let data;
  try {
    data = await loadFamilyData();
  } catch (err) {
    grid.innerHTML = `<p class="empty-state">Could not load family data. Make sure data/people.json is present.</p>`;
    return;
  }

  const media = allMedia(data);

  // Populate person filter
  data.people
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      personSelect.appendChild(opt);
    });

  // Preselect from ?person= URL param (set when arriving from the tree)
  const params = new URLSearchParams(window.location.search);
  const presetPerson = params.get("person");
  if (presetPerson && data.byId[presetPerson]) {
    personSelect.value = presetPerson;
  }

  function draw() {
    const personFilter = personSelect.value;
    const typeFilter = typeSelect.value;
    const searchTerm = searchInput.value.trim().toLowerCase();

    const filtered = media.filter(item => {
      if (personFilter !== "all" && item.personId !== personFilter) return false;
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (searchTerm) {
        const haystack = `${item.title} ${item.personName}`.toLowerCase();
        if (!haystack.includes(searchTerm)) return false;
      }
      return true;
    });

    grid.innerHTML = "";

    if (filtered.length === 0) {
      grid.innerHTML = `<p class="empty-state">No records match. Try clearing a filter — or this is a spot waiting for a document to be added.</p>`;
      return;
    }

    filtered.forEach((item, i) => {
      const card = document.createElement(item.driveLink ? "a" : "div");
      card.className = "record-card";
      if (item.driveLink) {
        card.href = item.driveLink;
        card.target = "_blank";
        card.rel = "noopener";
      }
      card.innerHTML = `
        <span class="media-type">${mediaTypeLabel(item.type)}</span>
        <div class="catalog-number">${catalogNumber(i)}</div>
        <div class="thumb">${item.driveLink ? "Preview" : "Awaiting upload"}</div>
        <h3>${item.title}</h3>
        <div class="bio-snip">${item.personName}</div>
      `;
      grid.appendChild(card);
    });
  }

  personSelect.addEventListener("change", draw);
  typeSelect.addEventListener("change", draw);
  searchInput.addEventListener("input", draw);

  draw();
}

renderArchive();
