// =====================================================
// SOT SCOREBOARD
// SECTION 1A — LOGIN / ADMIN PERMISSIONS
// SECTION 2 — PLAYER ACHIEVEMENTS + / -
// STORAGE LAYER — LOCAL READY / DATABASE READY
// =====================================================


// =====================================================
// AUTH ELEMENTS
// =====================================================

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginPanel = document.getElementById("loginPanel");
const loginForm = document.getElementById("loginForm");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const loginMessage = document.getElementById("loginMessage");
const authStatus = document.getElementById("authStatus");
const adminControls = document.getElementById("adminControls");


// =====================================================
// PROTOTYPE ADMIN ACCOUNTS
// =====================================================

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


// =====================================================
// AUTH STATE
// =====================================================

let isAdmin =
  localStorage.getItem("sotAdminLoggedIn") === "true";


// =====================================================
// STORAGE CONFIG
// =====================================================
//
// IMPORTANT:
// All player/scoring storage goes through this section.
//
// CURRENT:
// LOCAL STORAGE
//
// FUTURE:
// SUPABASE DATABASE
//
// Do NOT put localStorage.setItem/getItem elsewhere.
// =====================================================

const STORAGE_MODE = "local";


// =====================================================
// STORAGE LAYER
// =====================================================

const Storage = {

  // -----------------------------------------------
  // PLAYERS
  // -----------------------------------------------

  loadPlayers() {

    if (STORAGE_MODE === "local") {

      return JSON.parse(
        localStorage.getItem("sotPlayers")
      ) || [];

    }

    // Future:
    // return await Database.loadPlayers();

    return [];

  },


  savePlayers(data) {

    if (STORAGE_MODE === "local") {

      localStorage.setItem(
        "sotPlayers",
        JSON.stringify(data)
      );

      return;

    }

    // Future:
    // await Database.savePlayers(data);

  },


  // -----------------------------------------------
  // SCORING
  // -----------------------------------------------

  loadScoring() {

    if (STORAGE_MODE === "local") {

      return JSON.parse(
        localStorage.getItem("sotScoring")
      ) || {

        win: 10,
        mvp: 5,
        quadra: 8,
        penta: 12,
        ppcc: 5,
        tank: 1,
        dps: 1

      };

    }

    // Future:
    // return await Database.loadScoring();

    return {

      win: 10,
      mvp: 5,
      quadra: 8,
      penta: 12,
      ppcc: 5,
      tank: 1,
      dps: 1

    };

  },


  saveScoring(data) {

    if (STORAGE_MODE === "local") {

      localStorage.setItem(
        "sotScoring",
        JSON.stringify(data)
      );

      return;

    }

    // Future:
    // await Database.saveScoring(data);

  }

};


// =====================================================
// LOAD DATA THROUGH STORAGE LAYER
// =====================================================

let players =
  Storage.loadPlayers();

let scoring =
  Storage.loadScoring();


// =====================================================
// SCOREBOARD ELEMENTS
// =====================================================

const form =
  document.getElementById("playerForm");

const playerName =
  document.getElementById("playerName");

const leaderboard =
  document.getElementById("leaderboard");

const emptyState =
  document.getElementById("emptyState");

const search =
  document.getElementById("search");

const totalPlayers =
  document.getElementById("totalPlayers");

const topScore =
  document.getElementById("topScore");

const leaderName =
  document.getElementById("leaderName");


// =====================================================
// SCORING ELEMENTS
// =====================================================

const winPoints =
  document.getElementById("winPoints");

const mvpPoints =
  document.getElementById("mvpPoints");

const quadraPoints =
  document.getElementById("quadraPoints");

const pentaPoints =
  document.getElementById("pentaPoints");

const ppccPoints =
  document.getElementById("ppccPoints");

const tankPoints =
  document.getElementById("tankPoints");

const dpsPoints =
  document.getElementById("dpsPoints");

const applyScoring =
  document.getElementById("applyScoring");


// =====================================================
// UPDATE AUTH UI
// =====================================================

function updateAuthUI() {

  if (isAdmin) {

    if (authStatus) {
      authStatus.textContent = "ADMIN";
    }

    if (loginBtn) {
      loginBtn.style.display = "none";
    }

    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
    }

    if (adminControls) {
      adminControls.style.display = "block";
    }

  } else {

    if (authStatus) {
      authStatus.textContent = "VIEWER";
    }

    if (loginBtn) {
      loginBtn.style.display = "inline-block";
    }

    if (logoutBtn) {
      logoutBtn.style.display = "none";
    }

    if (adminControls) {
      adminControls.style.display = "none";
    }

  }

  render();

}


// =====================================================
// OPEN LOGIN
// =====================================================

if (loginBtn) {

  loginBtn.addEventListener(
    "click",
    function() {

      if (!loginPanel) return;

      loginPanel.style.display = "block";

      if (loginMessage) {
        loginMessage.style.display = "none";
      }

      if (loginUsername) {
        loginUsername.focus();
      }

    }
  );

}


// =====================================================
// LOGIN
// =====================================================

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();

      const username =
        loginUsername.value
          .trim()
          .toLowerCase();

      const password =
        loginPassword.value;

      const validAdmin =
        PROTOTYPE_ADMINS.find(
          admin =>
            admin.username === username &&
            admin.password === password
        );

      if (!validAdmin) {

        if (loginMessage) {

          loginMessage.textContent =
            "Invalid admin username or password.";

          loginMessage.className =
            "login-message error";

          loginMessage.style.display =
            "block";

        }

        return;

      }

      isAdmin = true;

      localStorage.setItem(
        "sotAdminLoggedIn",
        "true"
      );

      if (loginForm) {
        loginForm.reset();
      }

      if (loginPanel) {
        loginPanel.style.display = "none";
      }

      updateAuthUI();

    }
  );

}


// =====================================================
// LOGOUT
// =====================================================

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    function() {

      isAdmin = false;

      localStorage.removeItem(
        "sotAdminLoggedIn"
      );

      if (loginPanel) {
        loginPanel.style.display = "none";
      }

      if (loginForm) {
        loginForm.reset();
      }

      updateAuthUI();

    }
  );

}


// =====================================================
// LOAD SCORING INTO INPUTS
// =====================================================

function loadScoringSettings() {

  if (winPoints)
    winPoints.value = scoring.win;

  if (mvpPoints)
    mvpPoints.value = scoring.mvp;

  if (quadraPoints)
    quadraPoints.value = scoring.quadra;

  if (pentaPoints)
    pentaPoints.value = scoring.penta;

  if (ppccPoints)
    ppccPoints.value = scoring.ppcc;

  if (tankPoints)
    tankPoints.value = scoring.tank;

  if (dpsPoints)
    dpsPoints.value = scoring.dps;

}


// =====================================================
// CALCULATE SCORE
// =====================================================

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


// =====================================================
// APPLY SCORING
// =====================================================

if (applyScoring) {

  applyScoring.addEventListener(
    "click",
    function() {

      if (!isAdmin) {
        return;
      }

      scoring = {

        win: Number(winPoints.value) || 0,

        mvp: Number(mvpPoints.value) || 0,

        quadra: Number(quadraPoints.value) || 0,

        penta: Number(pentaPoints.value) || 0,

        ppcc: Number(ppccPoints.value) || 0,

        tank: Number(tankPoints.value) || 0,

        dps: Number(dpsPoints.value) || 0

      };

      Storage.saveScoring(scoring);

      render();

    }
  );

}


// =====================================================
// ADD PLAYER
// =====================================================

if (form) {

  form.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();

      if (!isAdmin) {
        return;
      }

      const name =
        playerName.value.trim();

      if (!name) {
        return;
      }

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

      Storage.savePlayers(players);

      form.reset();

      render();

      playerName.focus();

    }
  );

}


// =====================================================
// EDIT PLAYER NAME
// =====================================================

function editPlayer(id) {

  if (!isAdmin) {
    return;
  }

  const player =
    players.find(
      player =>
        player.id === id
    );

  if (!player) {
    return;
  }

  const newName =
    prompt(
      "Player name:",
      player.name
    );

  if (newName === null) {
    return;
  }

  const trimmedName =
    newName.trim();

  if (trimmedName) {
    player.name = trimmedName;
  }

  Storage.savePlayers(players);

  render();

}


// =====================================================
// DELETE PLAYER
// =====================================================

function deletePlayer(id) {

  if (!isAdmin) {
    return;
  }

  if (
    !confirm(
      "Delete this player?"
    )
  ) {
    return;
  }

  players =
    players.filter(
      player =>
        player.id !== id
    );

  Storage.savePlayers(players);

  render();

}


// =====================================================
// CHANGE ACHIEVEMENT
// =====================================================

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
      player =>
        player.id === playerId
    );

  if (!player) {
    return;
  }

  if (
    typeof player[achievement] !==
    "number"
  ) {

    player[achievement] = 0;

  }

  player[achievement] += amount;

  if (player[achievement] < 0) {

    player[achievement] = 0;

  }

  Storage.savePlayers(players);

  render();

}


// =====================================================
// ACHIEVEMENT CONTROL
// =====================================================

function achievementControl(
  player,
  achievement
) {

  const value =
    player[achievement] || 0;

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
        class="achievement-btn admin-action"
        onclick="changeAchievement(${player.id}, '${achievement}', -1)"
      >
        −
      </button>

      <span class="achievement-value">
        ${value}
      </span>

      <button
        type="button"
        class="achievement-btn admin-action"
        onclick="changeAchievement(${player.id}, '${achievement}', 1)"
      >
        +
      </button>

    </div>

  `;

}


// =====================================================
// RENDER LEADERBOARD
// =====================================================

function render() {

  if (!leaderboard) {
    return;
  }

  const query =
    search
      ? search.value
          .toLowerCase()
          .trim()
      : "";

  const sorted =
    [...players].sort(
      (a, b) =>
        calculateSOTScore(b) -
        calculateSOTScore(a)
    );

  const filtered =
    sorted.filter(
      player =>
        player.name
          .toLowerCase()
          .includes(query)
    );

  leaderboard.innerHTML = "";

  if (filtered.length === 0) {

    if (emptyState) {
      emptyState.style.display =
        "block";
    }

  } else {

    if (emptyState) {
      emptyState.style.display =
        "none";
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

          <td class="points">
            ${score}
          </td>

          <td>

            <button
              type="button"
              class="action-btn admin-action"
              onclick="editPlayer(${player.id})"
              ${isAdmin ? "" : "style=\"display:none;\""}
            >
              Edit
            </button>

            <button
              type="button"
              class="action-btn delete admin-action"
              onclick="deletePlayer(${player.id})"
              ${isAdmin ? "" : "style=\"display:none;\""}
            >
              ×
            </button>

          </td>

        `;

        leaderboard.appendChild(row);

      }
    );

  }


  // ===================================================
  // STATS
  // ===================================================

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
      topScore.textContent =
        "0";
    }

    if (leaderName) {
      leaderName.textContent =
        "—";
    }

  }

}


// =====================================================
// SEARCH
// =====================================================

if (search) {

  search.addEventListener(
    "input",
    render
  );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;

}


// =====================================================
// INITIALIZE
// =====================================================

loadScoringSettings();

updateAuthUI();

render();
