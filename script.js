// ============================================================
// SOT SCOREBOARD
// SECTION 1 + SECTION 2 + SECTION 3
// ============================================================


// ============================================================
// PROTOTYPE ADMIN LOGIN
// ============================================================

const PROTOTYPE_ADMINS = [
  {
    username: "admin",
    password: "sotdemo"
  },
  {
    username: "jk",
    password: "sotdemo"
  }
];

let isAdmin =
  localStorage.getItem("sotAdminLoggedIn") === "true";


// ============================================================
// STORAGE LAYER
// ============================================================

const STORAGE_MODE = "local";

const Storage = {

  loadPlayers() {
    return JSON.parse(
      localStorage.getItem("sotPlayers") || "[]"
    );
  },

  savePlayers(data) {
    localStorage.setItem(
      "sotPlayers",
      JSON.stringify(data)
    );
  },

  loadScoring() {
    return JSON.parse(
      localStorage.getItem("sotScoring") ||
      JSON.stringify({
        win: 10,
        mvp: 5,
        quadra: 8,
        penta: 12,
        ppcc: 5,
        tank: 1,
        dps: 1
      })
    );
  },

  saveScoring(data) {
    localStorage.setItem(
      "sotScoring",
      JSON.stringify(data)
    );
  },

  loadMatch() {
    return Number(
      localStorage.getItem("sotCurrentMatch")
    ) || 1;
  },

  saveMatch(match) {
    localStorage.setItem(
      "sotCurrentMatch",
      String(match)
    );
  },

  loadTournamentStatus() {
    return (
      localStorage.getItem("sotTournamentStatus") ||
      "LIVE"
    );
  },

  saveTournamentStatus(status) {
    localStorage.setItem(
      "sotTournamentStatus",
      status
    );
  }
};


// ============================================================
// DATA
// ============================================================

let players = Storage.loadPlayers();

let scoring = Storage.loadScoring();

let currentMatch = Storage.loadMatch();

let tournamentStatus =
  Storage.loadTournamentStatus();


// ============================================================
// BASIC HELPERS
// ============================================================

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ============================================================
// AUTH UI
// ============================================================

function updateAuthUI() {

  const authStatus =
    document.getElementById("authStatus");

  const loginBtn =
    document.getElementById("loginBtn");

  const logoutBtn =
    document.getElementById("logoutBtn");

  const adminControls =
    document.getElementById("adminControls");

  const liveControl =
    document.getElementById("liveControl");

  if (authStatus) {
    authStatus.textContent =
      isAdmin ? "ADMIN" : "VIEWER";
  }

  if (loginBtn) {
    loginBtn.style.display =
      isAdmin ? "none" : "inline-block";
  }

  if (logoutBtn) {
    logoutBtn.style.display =
      isAdmin ? "inline-block" : "none";
  }

  if (adminControls) {
    adminControls.style.display =
      isAdmin ? "block" : "none";
  }

  if (liveControl) {
    liveControl.style.display =
      isAdmin ? "block" : "none";
  }

  document
    .querySelectorAll(".admin-action")
    .forEach(element => {
      element.style.display =
        isAdmin ? "" : "none";
    });

  updateMatchUI();
}


// ============================================================
// LOGIN PANEL
// ============================================================

function openLogin() {

  const panel =
    document.getElementById("loginPanel");

  if (panel) {
    panel.style.display = "block";
  }
}


function closeLogin() {

  const panel =
    document.getElementById("loginPanel");

  if (panel) {
    panel.style.display = "none";
  }
}


// ============================================================
// LOGIN
// ============================================================

function login(username, password) {

  const valid =
    PROTOTYPE_ADMINS.some(
      account =>
        account.username === username &&
        account.password === password
    );

  const message =
    document.getElementById("loginMessage");

  if (!valid) {

    if (message) {
      message.textContent =
        "Invalid username or password.";
      message.style.display = "block";
    }

    return false;
  }

  isAdmin = true;

  localStorage.setItem(
    "sotAdminLoggedIn",
    "true"
  );

  if (message) {
    message.style.display = "none";
  }

  closeLogin();

  updateAuthUI();

  render();

  return true;
}


// ============================================================
// LOGOUT
// ============================================================

function logout() {

  isAdmin = false;

  localStorage.removeItem(
    "sotAdminLoggedIn"
  );

  closeLogin();

  updateAuthUI();

  render();
}


// ============================================================
// SCORE CALCULATION
// ============================================================

function calculateScore(player) {

  return (
    Number(player.win || 0) * Number(scoring.win || 0) +
    Number(player.mvp || 0) * Number(scoring.mvp || 0) +
    Number(player.quadra || 0) * Number(scoring.quadra || 0) +
    Number(player.penta || 0) * Number(scoring.penta || 0) +
    Number(player.ppcc || 0) * Number(scoring.ppcc || 0) +
    Number(player.tank || 0) * Number(scoring.tank || 0) +
    Number(player.dps || 0) * Number(scoring.dps || 0)
  );
}


// ============================================================
// PLAYER STORAGE
// ============================================================

function savePlayers() {
  Storage.savePlayers(players);
}


// ============================================================
// ADD PLAYER
// ============================================================

function addPlayer(name) {

  if (!isAdmin) {
    alert("Admin access required.");
    return;
  }

  const playerName =
    name.trim();

  if (!playerName) {
    return;
  }

  const player = {

    id: Date.now(),

    name: playerName,

    win: 0,
    mvp: 0,
    quadra: 0,
    penta: 0,
    ppcc: 0,
    tank: 0,
    dps: 0
  };

  players.push(player);

  savePlayers();

  render();
}


// ============================================================
// EDIT PLAYER
// ============================================================

function editPlayer(id) {

  if (!isAdmin) {
    alert("Admin access required.");
    return;
  }

  const player =
    players.find(
      p => p.id === id
    );

  if (!player) return;

  const newName =
    prompt(
      "Edit player name:",
      player.name
    );

  if (!newName || !newName.trim()) {
    return;
  }

  player.name =
    newName.trim();

  savePlayers();

  render();
}


// ============================================================
// DELETE PLAYER
// ============================================================

function deletePlayer(id) {

  if (!isAdmin) {
    alert("Admin access required.");
    return;
  }

  const player =
    players.find(
      p => p.id === id
    );

  if (!player) return;

  const confirmed =
    confirm(
      `Delete ${player.name}?`
    );

  if (!confirmed) {
    return;
  }

  players =
    players.filter(
      p => p.id !== id
    );

  savePlayers();

  render();
}


// ============================================================
// ACHIEVEMENT + / -
// ============================================================

function changeAchievement(
  playerId,
  achievement,
  amount
) {

  if (!isAdmin) {
    return;
  }

  const player =
    players.find(
      p => p.id === playerId
    );

  if (!player) {
    return;
  }

  player[achievement] =
    Number(player[achievement] || 0) +
    amount;

  if (player[achievement] < 0) {
    player[achievement] = 0;
  }

  savePlayers();

  render();
}


// ============================================================
// ACHIEVEMENT CONTROL
// ============================================================

function achievementControl(
  player,
  achievement
) {

  const value =
    Number(player[achievement] || 0);

  if (!isAdmin) {
    return `
      <span class="achievement-value">
        ${value}
      </span>
    `;
  }

  return `
    <div class="achievement-control">

      <button
        type="button"
        onclick="changeAchievement(${player.id}, '${achievement}', -1)"
      >
        −
      </button>

      <span class="achievement-value">
        ${value}
      </span>

      <button
        type="button"
        onclick="changeAchievement(${player.id}, '${achievement}', 1)"
      >
        +
      </button>

    </div>
  `;
}


// ============================================================
// SCORING SETTINGS
// ============================================================

function getScoringInputs() {

  return {
    win:
      document.getElementById("winPoints"),

    mvp:
      document.getElementById("mvpPoints"),

    quadra:
      document.getElementById("quadraPoints"),

    penta:
      document.getElementById("pentaPoints"),

    ppcc:
      document.getElementById("ppccPoints"),

    tank:
      document.getElementById("tankPoints"),

    dps:
      document.getElementById("dpsPoints")
  };
}


function loadScoringSettings() {

  const inputs =
    getScoringInputs();

  Object.keys(inputs)
    .forEach(key => {

      if (inputs[key]) {
        inputs[key].value =
          scoring[key];
      }

    });
}


function applyScoring() {

  if (!isAdmin) {
    alert("Admin access required.");
    return;
  }

  const inputs =
    getScoringInputs();

  Object.keys(inputs)
    .forEach(key => {

      if (!inputs[key]) {
        return;
      }

      let value =
        parseFloat(inputs[key].value);

      if (isNaN(value) || value < 0) {
        value = 0;
      }

      scoring[key] = value;

    });

  Storage.saveScoring(scoring);

  loadScoringSettings();

  render();
}


// ============================================================
// LIVE CONTROL — SECTION 3
// ============================================================

function updateMatchUI() {

  const input =
    document.getElementById(
      "currentMatch"
    );

  if (input) {
    input.value =
      currentMatch;
  }

  const liveDisplay =
    document.getElementById(
      "liveMatchDisplay"
    );

  if (liveDisplay) {

    if (tournamentStatus === "FINAL") {

      liveDisplay.textContent =
        `🏁 FINAL — MATCH ${currentMatch}`;

    } else {

      liveDisplay.textContent =
        `🔴 LIVE — MATCH ${currentMatch}`;

    }
  }
}


// ============================================================
// SET MATCH
// ============================================================

function setMatch(value) {

  if (!isAdmin) {
    updateMatchUI();
    return;
  }

  let match =
    parseInt(value, 10);

  if (
    isNaN(match) ||
    match < 1
  ) {
    match = 1;
  }

  currentMatch =
    match;

  Storage.saveMatch(
    currentMatch
  );

  updateMatchUI();

  render();
}


// ============================================================
// CHANGE MATCH
// ============================================================

function changeMatch(amount) {

  if (!isAdmin) {
    return;
  }

  currentMatch += amount;

  if (currentMatch < 1) {
    currentMatch = 1;
  }

  Storage.saveMatch(
    currentMatch
  );

  updateMatchUI();

  render();
}


// ============================================================
// FINALIZE TOURNAMENT
// ============================================================

function finalizeTournament() {

  if (!isAdmin) {
    alert("Admin access required.");
    return;
  }

  if (
    tournamentStatus === "FINAL"
  ) {

    alert(
      "This tournament is already finalized."
    );

    return;
  }

  const confirmed =
    confirm(
      "Finalize this tournament?\n\n" +
      "The tournament status will change from LIVE to FINAL."
    );

  if (!confirmed) {
    return;
  }

  tournamentStatus =
    "FINAL";

  Storage.saveTournamentStatus(
    tournamentStatus
  );

  updateMatchUI();

  render();

  alert(
    "Tournament finalized."
  );
}


// ============================================================
// LEADERBOARD
// ============================================================

function renderLeaderboard() {

  const tbody =
    document.getElementById(
      "leaderboard"
    );

  const emptyState =
    document.getElementById(
      "emptyState"
    );

  if (!tbody) {
    return;
  }

  const sortedPlayers =
    [...players]
      .map(player => ({
        ...player,
        score:
          calculateScore(player)
      }))
      .sort(
        (a, b) =>
          b.score - a.score
      );

  tbody.innerHTML = "";

  if (
    sortedPlayers.length === 0
  ) {

    if (emptyState) {
      emptyState.style.display =
        "block";
    }

    return;
  }

  if (emptyState) {
    emptyState.style.display =
      "none";
  }

  sortedPlayers.forEach(
    (player, index) => {

      const row =
        document.createElement("tr");

      row.innerHTML = `

        <td>
          ${index + 1}
        </td>

        <td>
          <strong>
            ${escapeHTML(player.name)}
          </strong>
        </td>

        <td>
          ${achievementControl(
            player,
            "win"
          )}
        </td>

        <td>
          ${achievementControl(
            player,
            "mvp"
          )}
        </td>

        <td>
          ${achievementControl(
            player,
            "quadra"
          )}
        </td>

        <td>
          ${achievementControl(
            player,
            "penta"
          )}
        </td>

        <td>
          ${achievementControl(
            player,
            "ppcc"
          )}
        </td>

        <td>
          ${achievementControl(
            player,
            "tank"
          )}
        </td>

        <td>
          ${achievementControl(
            player,
            "dps"
          )}
        </td>

        <td>
          <strong>
            ${player.score}
          </strong>
        </td>

        <td class="admin-action">

          <button
            type="button"
            onclick="editPlayer(${player.id})"
          >
            EDIT
          </button>

          <button
            type="button"
            onclick="deletePlayer(${player.id})"
          >
            DELETE
          </button>

        </td>

      `;

      tbody.appendChild(row);
    }
  );
}


// ============================================================
// STATS
// ============================================================

function renderStats() {

  const totalPlayers =
    document.getElementById(
      "totalPlayers"
    );

  const topScore =
    document.getElementById(
      "topScore"
    );

  const leaderName =
    document.getElementById(
      "leaderName"
    );

  const sortedPlayers =
    [...players]
      .map(player => ({
        ...player,
        score:
          calculateScore(player)
      }))
      .sort(
        (a, b) =>
          b.score - a.score
      );

  if (totalPlayers) {
    totalPlayers.textContent =
      players.length;
  }

  if (
    sortedPlayers.length === 0
  ) {

    if (topScore) {
      topScore.textContent = "0";
    }

    if (leaderName) {
      leaderName.textContent = "—";
    }

    return;
  }

  if (topScore) {
    topScore.textContent =
      sortedPlayers[0].score;
  }

  if (leaderName) {
    leaderName.textContent =
      sortedPlayers[0].name;
  }
}


// ============================================================
// SEARCH
// ============================================================

function searchPlayers() {

  const input =
    document.getElementById(
      "search"
    );

  const query =
    input
      ? input.value
        .trim()
        .toLowerCase()
      : "";

  const rows =
    document.querySelectorAll(
      "#leaderboard tr"
    );

  rows.forEach(row => {

    const name =
      row
        .cells[1]
        ?.textContent
        .toLowerCase() || "";

    row.style.display =
      name.includes(query)
        ? ""
        : "none";
  });
}


// ============================================================
// MAIN RENDER
// ============================================================

function render() {

  renderLeaderboard();

  renderStats();

  updateAuthUI();

  updateMatchUI();

  loadScoringSettings();

  searchPlayers();
}


// ============================================================
// EVENT LISTENERS
// ============================================================

// Login button

document
  .getElementById("loginBtn")
  ?.addEventListener(
    "click",
    openLogin
  );


// Logout button

document
  .getElementById("logoutBtn")
  ?.addEventListener(
    "click",
    logout
  );


// Login form

document
  .getElementById("loginForm")
  ?.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();

      const username =
        document
          .getElementById(
            "loginUsername"
          )
          .value
          .trim();

      const password =
        document
          .getElementById(
            "loginPassword"
          )
          .value;

      login(
        username,
        password
      );
    }
  );


// Add player form

document
  .getElementById("playerForm")
  ?.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();

      const input =
        document.getElementById(
          "playerName"
        );

      if (!input) {
        return;
      }

      addPlayer(
        input.value
      );

      input.value = "";
    }
  );


// Apply scoring

document
  .getElementById("applyScoring")
  ?.addEventListener(
    "click",
    applyScoring
  );


// Search

document
  .getElementById("search")
  ?.addEventListener(
    "input",
    searchPlayers
  );


// ============================================================
// INITIALIZATION
// ============================================================

loadScoringSettings();

updateAuthUI();

updateMatchUI();

render();
