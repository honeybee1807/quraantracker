// Surah Yaaseen Counter
let yaaseenCount = 0;
let groupTotal = 0;

function incrementYaaseen() {
  yaaseenCount++;
  groupTotal++;
  document.getElementById("count").textContent = yaaseenCount;
  document.getElementById("groupTotal").textContent = groupTotal;
}

// Dhikr Counter
let sessionCount = 0;
let savedTotal = 0;

function incrementDhikr() {
  sessionCount++;
  document.getElementById("sessionCount").textContent = sessionCount;
}

function saveDhikr() {
  savedTotal += sessionCount;
  sessionCount = 0; // reset session
  document.getElementById("savedTotal").textContent = savedTotal;
  document.getElementById("sessionCount").textContent = sessionCount;
}
