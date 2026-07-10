// Loads data/people.json once and exposes small helpers.
// Every page that needs family data calls loadFamilyData() first.

async function loadFamilyData() {
  const res = await fetch("data/people.json");
  if (!res.ok) throw new Error("Could not load data/people.json");
  const data = await res.json();
  data.byId = {};
  data.people.forEach(p => (data.byId[p.id] = p));
  return data;
}

function personLabel(person) {
  const born = person.born || "?";
  const died = person.died || (person.died === "" ? "" : "?");
  return died ? `${born}–${died}` : `b. ${born}`;
}

function catalogNumber(index) {
  return `No. ${String(index + 1).padStart(3, "0")}`;
}

function mediaTypeLabel(type) {
  const labels = { photo: "Photograph", document: "Document", video: "Film / Video" };
  return labels[type] || type;
}

// Flattens every media item across all people into one list, tagging
// each item with who it belongs to — used by the archive page.
function allMedia(data) {
  const items = [];
  data.people.forEach(person => {
    (person.media || []).forEach(m => {
      items.push({ ...m, personId: person.id, personName: person.name });
    });
  });
  return items;
}
