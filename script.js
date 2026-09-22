// =========================
// SOT SCOREBOARD
// =========================

const form = document.getElementById("playerForm");

const playerName = document.getElementById("playerName");

const leaderboard = document.getElementById("leaderboard");
const emptyState = document.getElementById("emptyState");
const search = document.getElementById("search");

const totalPlayers = document.getElementById("totalPlayers");
const topScore = document.getElementById("topScore");
const leaderName = document.getElementById("leaderName");

// Scoring settings
const winPoints = document.getElementById("winPoints");
const mvpPoints = document.getElementById("mvpPoints");
const quadraPoints = document.getElementById("quadraPoints");
const pentaPoints = document.getElementById("pentaPoints");
const ppccPoints = document.getElementById("ppccPoints");
const tankPoints = document.getElementById("tankPoints");
const dpsPoints = document.getElementById("dpsPoints");

const applyScoring = document.getElementById("applyScoring");

// =========================
// LOAD DATA
// =========================

let players =
  JSON.parse(localStorage.getItem("sotPlayers")) || [];

let scoring =
  JSON.parse(localStorage.getItem("sotScoring")) || {
    win: 10,
    mvp: 5,
    quadra: 8,
    penta: 12,
    ppcc: 5,
    tank: 1,
    dps: 1
  };

// =========================
// LOAD SCORING SETTINGS
// =========================

function loadScoringSettings() {

  if (winPoints) winPoints.value = scoring.win;
  if (mvpPoints) mvpPoints.value = scoring.mvp;
  if (quadraPoints) quadraPoints.value = scoring.quadra;
  if (pentaPoints) pentaPoints.value = scoring.penta;
  if (ppccPoints) ppccPoints.value = scoring.ppcc;
  if (tankPoints) tankPoints.value = scoring.tank;
  if (dpsPoints) dpsPoints.value = scoring.dps;

}

// =========================
// CALCULATE SOT SCORE
// =========================

function calculateSOTScore(player) {

  return (
    (player.win * scoring.win) +
    (player.mvp * scoring.mvp) +
    (player.quadra * scoring.quadra) +
    (player.penta * scoring.penta) +
    (player.ppcc * scoring.ppcc) +
    (player.tank * scoring.tank) +
    (player.dps * scoring.dps)
  );

}

// =========================
// SAVE PLAYERS
// =========================

function savePlayers() {

  localStorage.setItem(
    "sotPlayers",
    JSON.stringify(players)
  );

}

// =========================
// SAVE SCORING
// =========================

if (applyScoring) {

  applyScoring.addEventListener("click", function() {

    scoring = {

      win: Number(winPoints.value) || 0,

      mvp: Number(mvpPoints.value) || 0,

      quadra: Number(quadraPoints.value) || 0,

      penta: Number(pentaPoints.value) || 0,

      ppcc: Number(ppccPoints.value) || 0,

      tank: Number(tankPoints.value) || 0,

      dps: Number(dpsPoints.value) || 0

    };

    localStorage.setItem(
      "sotScoring",
      JSON.stringify(scoring)
    );

    render();

  });

}

// =========================
// ADD PLAYER
// =========================

if (form) {

  form.addEventListener("submit", function(event) {

    event.preventDefault();

    const name =
      playerName.value.trim();

    if (!name) return;

    players.push({

      id: Date.now(),

      name: name,

      win: 0,

      mvp: 0,

      quadra: 0,

      penta: 0,

      ppcc: 0,

      tank: 0,

      dps: 0

    });

    savePlayers();

    render();

    form.reset();

    playerName.focus();

  });

}

// =========================
// EDIT PLAYER
// =========================

function editPlayer(id) {

  const player =
    players.find(
      player => player.id === id
    );

  if (!player) return;

  const newName =
    prompt(
      "Player name:",
      player.name
    );

  if (newName === null) return;

  const win =
    prompt(
      "Wins:",
      player.win
    );

  if (win === null) return;

  const mvp =
    prompt(
      "MVP:",
      player.mvp
    );

  if (mvp === null) return;

  const quadra =
    prompt(
      "Quadra Kills:",
      player.quadra
    );

  if (quadra === null) return;

  const penta =
    prompt(
      "Penta Kills:",
      player.penta
    );

  if (penta === null) return;

  const ppcc =
    prompt(
      "PPCC ×5:",
      player.ppcc
    );

  if (ppcc === null) return;

  const tank =
    prompt(
      "Perfect Teamfight — Tank 100%:",
      player.tank
    );

  if (tank === null) return;

  const dps =
    prompt(
      "Perfect Teamfight — DPS 100%:",
      player.dps
    );

  if (dps === null) return;

  player.name =
    newName.trim() || player.name;

  player.win =
    Math.max(0, Number(win) || 0);

  player.mvp =
    Math.max(0, Number(mvp) || 0);

  player.quadra =
    Math.max(0, Number(quadra) || 0);

  player.penta =
    Math.max(0, Number(penta) || 0);

  player.ppcc =
    Math.max(0, Number(ppcc) || 0);

  player.tank =
    Math.max(0, Number(tank) || 0);

  player.dps =
    Math.max(0, Number(dps) || 0);

  savePlayers();

  render();

}

// =========================
// DELETE PLAYER
// =========================

function deletePlayer(id) {

  if (
    !confirm(
      "Delete this player?"
    )
  ) {
    return;
  }

  players =
    players.filter(
      player => player.id !== id
    );

  savePlayers();

  render();

}

// =========================
// RENDER LEADERBOARD
// =========================

function render() {

  if (!leaderboard) return;

  const query =
    search
      ? search.value.toLowerCase().trim()
      : "";

  const sorted =
    [...players].sort(
      (a, b) =>
        calculateSOTScore(b) -
        calculateSOTScore(a)
    );

  const filtered =
    sorted.filter(player =>
      player.name
        .toLowerCase()
        .includes(query)
    );

  leaderboard.innerHTML = "";

  if (filtered.length === 0) {

    if (emptyState) {
      emptyState.style.display = "block";
    }

  } else {

    if (emptyState) {
      emptyState.style.display = "none";
    }

    filtered.forEach(
      (player, index) => {

        const score =
          calculateSOTScore(player);

        const row =
          document.createElement("tr");

        row.innerHTML = `

          <td class="rank">
            #${index + 1}
          </td>

          <td class="player-name">
            ${escapeHTML(player.name)}
          </td>

          <td>${player.win}</td>

          <td>${player.mvp}</td>

          <td>${player.quadra}</td>

          <td>${player.penta}</td>

          <td>${player.ppcc}</td>

          <td>${player.tank}</td>

          <td>${player.dps}</td>

          <td class="points">
            ${score}
          </td>

          <td>

            <button
              class="action-btn"
              onclick="editPlayer(${player.id})">
              Edit
            </button>

            <button
              class="action-btn delete"
              onclick="deletePlayer(${player.id})">
              ×
            </button>

          </td>

        `;

        leaderboard.appendChild(row);

      }
    );

  }

  // =========================
  // STATS
  // =========================

  if (totalPlayers) {
    totalPlayers.textContent =
      players.length;
  }

  if (sorted.length > 0) {

    const leader =
      sorted[0];

    const score =
      calculateSOTScore(leader);

    if (topScore) {
      topScore.textContent =
        score;
    }

    if (leaderName) {
      leaderName.textContent =
        leader.name;
    }

  } else {

    if (topScore) {
      topScore.textContent = "0";
    }

    if (leaderName) {
      leaderName.textContent = "—";
    }

  }

}

// =========================
// SEARCH
// =========================

if (search) {

  search.addEventListener(
    "input",
    render
  );

}

// =========================
// SECURITY
// =========================

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent = text;
