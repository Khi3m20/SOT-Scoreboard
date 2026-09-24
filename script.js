const PROTOTYPE_ADMINS = [
  {
    username: "JKNN",
    password: "SOTfree"
  }
];

const DEFAULT_SCORING = {
  win: 10,
  mvp: 5,
  quadra: 8,
  penta: 12,
  ppcc: 5,
  tank: 1,
  dps: 1
};

const STORAGE_KEYS = {
  players: "sot_players",
  scoring: "sot_scoring",
  match: "sot_match",
  history: "sot_history",
  tournament: "sot_tournament"
};


/* =========================================================
   STORAGE
   ========================================================= */

const Storage = {

  loadPlayers() {
    try {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEYS.players)
      ) || [];
    } catch {
      return [];
    }
  },

  savePlayers(data) {
    localStorage.setItem(
      STORAGE_KEYS.players,
      JSON.stringify(data)
    );
  },


  loadScoring() {
    try {
      return {
        ...DEFAULT_SCORING,
        ...(JSON.parse(
          localStorage.getItem(STORAGE_KEYS.scoring)
        ) || {})
      };
    } catch {
      return {
        ...DEFAULT_SCORING
      };
    }
  },

  saveScoring(data) {
    localStorage.setItem(
      STORAGE_KEYS.scoring,
      JSON.stringify(data)
    );
  },


  loadMatch() {
    const number = Number(
      localStorage.getItem(STORAGE_KEYS.match)
    );

    return number >= 1 ? number : 1;
  },

  saveMatch(number) {
    localStorage.setItem(
      STORAGE_KEYS.match,
      String(number)
    );
  },


  loadHistory() {
    try {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEYS.history)
      ) || [];
    } catch {
      return [];
    }
  },

  saveHistory(data) {
    localStorage.setItem(
      STORAGE_KEYS.history,
      JSON.stringify(data)
    );
  },


  loadTournament() {
    try {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEYS.tournament)
      ) || {
        number: 1,
        status: "LIVE"
      };
    } catch {
      return {
        number: 1,
        status: "LIVE"
      };
    }
  },

  saveTournament(data) {
    localStorage.setItem(
      STORAGE_KEYS.tournament,
      JSON.stringify(data)
    );
  }

};


/* =========================================================
   STATE
   ========================================================= */

let players = Storage.loadPlayers();

let scoring = Storage.loadScoring();

let currentMatch = Storage.loadMatch();

let tournament = Storage.loadTournament();

let history = Storage.loadHistory();

let isAdmin = false;


/* =========================================================
   HELPER
   ========================================================= */

const $ = id => document.getElementById(id);


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadScoringInputs();

    setupEvents();

    renderEverything();

  }
);


/* =========================================================
   EVENTS
   ========================================================= */

function setupEvents() {

  $("loginBtn").addEventListener(
    "click",
    openLogin
  );


  $("logoutBtn").addEventListener(
    "click",
    logout
  );


  $("loginForm").addEventListener(
    "submit",
    login
  );


  $("playerForm").addEventListener(
    "submit",
    addPlayer
  );


  /* ENTER = ADD PLAYER */

  $("playerName").addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {

        event.preventDefault();

        $("playerForm").requestSubmit();

      }

    }
  );


  $("applyScoring").addEventListener(
    "click",
    applyScoring
  );


  $("updateLeaderboardBtn").addEventListener(
    "click",
    updateLeaderboard
  );


  $("newTournamentBtn").addEventListener(
    "click",
    newTournament
  );


  $("generateResultBtn").addEventListener(
    "click",
    generateResultImage
  );


  $("currentMatch").addEventListener(
    "change",
    event => {
      setMatch(event.target.value);
    }
  );


  $("search").addEventListener(
    "input",
    renderLeaderboard
  );


  /* QUICK ADD PLAYER */

  const addPlayerShortcut =
    $("addPlayerShortcutBtn");

  if (addPlayerShortcut) {

    addPlayerShortcut.addEventListener(
      "click",
      focusAddPlayer
    );

  }

}


/* =========================================================
   LOGIN
   ========================================================= */

function openLogin() {

  $("loginPanel").style.display =
    "block";

  $("loginUsername").focus();

}


function login(event) {

  event.preventDefault();


  const username =
    $("loginUsername").value.trim();


  const password =
    $("loginPassword").value;


  const valid =
    PROTOTYPE_ADMINS.some(
      admin =>
        admin.username === username &&
        admin.password === password
    );


  if (!valid) {

    $("loginMessage").style.display =
      "block";

    $("loginMessage").textContent =
      "Invalid username or password.";

    $("loginMessage").style.color =
      "#ff5260";

    return;

  }


  isAdmin = true;


  $("loginPanel").style.display =
    "none";


  $("adminControls").style.display =
    "grid";


  $("loginBtn").style.display =
    "none";


  $("logoutBtn").style.display =
    "inline-block";


  $("authStatus").textContent =
    "ADMIN";


  $("loginForm").reset();


  $("loginMessage").style.display =
    "none";


  renderEverything();

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {

  isAdmin = false;


  $("adminControls").style.display =
    "none";


  $("loginBtn").style.display =
    "inline-block";


  $("logoutBtn").style.display =
    "none";


  $("authStatus").textContent =
    "VIEWER";


  $("loginPanel").style.display =
    "none";


  renderEverything();

}


/* =========================================================
   ADD PLAYER PANEL
   ========================================================= */

function focusAddPlayer() {

  if (!isAdmin) return;


  const panel =
    $("addPlayerPanel");


  const input =
    $("playerName");


  if (!panel || !input) return;


  panel.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });


  setTimeout(
    () => {
      input.focus();
    },
    300
  );

}


/* =========================================================
   PLAYER
   ========================================================= */

function createPlayer(name) {

  return {

    id:
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"

        ? crypto.randomUUID()

        : Date.now().toString(),

    name,

    achievements: {

      win: 0,

      mvp: 0,

      quadra: 0,

      penta: 0,

      ppcc: 0,

      tank: 0,

      dps: 0

    },

    score: 0,

    updatedAt:
      new Date().toISOString()

  };

}


function addPlayer(event) {

  event.preventDefault();


  if (!isAdmin) return;


  const name =
    $("playerName").value.trim();


  if (!name) return;


  const exists =
    players.some(
      player =>
        player.name.toLowerCase() ===
        name.toLowerCase()
    );


  if (exists) {

    alert(
      "Player already exists."
    );

    $("playerName").focus();

    return;

  }


  players.push(
    createPlayer(name)
  );


  recalculateScores();


  Storage.savePlayers(
    players
  );


  $("playerForm").reset();


  renderEverything();


  $("playerName").focus();

}


function editPlayer(id) {

  if (!isAdmin) return;


  const player =
    players.find(
      p => p.id === id
    );


  if (!player) return;


  const name =
    prompt(
      "Enter new player name:",
      player.name
    );


  if (name === null) return;


  const cleaned =
    name.trim();


  if (!cleaned) return;


  const duplicate =
    players.some(
      p =>
        p.id !== id &&
        p.name.toLowerCase() ===
        cleaned.toLowerCase()
    );


  if (duplicate) {

    alert(
      "Player already exists."
    );

    return;

  }


  player.name = cleaned;


  player.updatedAt =
    new Date().toISOString();


  Storage.savePlayers(
    players
  );


  renderEverything();

}


function deletePlayer(id) {

  if (!isAdmin) return;


  const player =
    players.find(
      p => p.id === id
    );


  if (!player) return;


  if (
    !confirm(
      `Delete ${player.name}?`
    )
  ) return;


  players =
    players.filter(
      p => p.id !== id
    );


  Storage.savePlayers(
    players
  );


  renderEverything();

}


/* =========================================================
   SCORING
   ========================================================= */

function calculateScore(player) {

  const a =
    player.achievements;


  return (

    a.win * scoring.win +

    a.mvp * scoring.mvp +

    a.quadra * scoring.quadra +

    a.penta * scoring.penta +

    a.ppcc * scoring.ppcc +

    a.tank * scoring.tank +

    a.dps * scoring.dps

  );

}


function recalculateScores() {

  players.forEach(
    player => {

      player.score =
        calculateScore(player);

    }
  );

}


function changeAchievement(
  playerId,
  type,
  amount
) {

  if (!isAdmin) return;


  const player =
    players.find(
      p => p.id === playerId
    );


  if (!player) return;


  if (
    !Object.prototype.hasOwnProperty.call(
      player.achievements,
      type
    )
  ) return;


  player.achievements[type] =
    Math.max(
      0,
      player.achievements[type] +
        amount
    );


  player.score =
    calculateScore(player);


  player.updatedAt =
    new Date().toISOString();


  Storage.savePlayers(
    players
  );


  renderEverything();

}


/* =========================================================
   SCORING SETTINGS
   ========================================================= */

function loadScoringInputs() {

  $("winPoints").value =
    scoring.win;


  $("mvpPoints").value =
    scoring.mvp;


  $("quadraPoints").value =
    scoring.quadra;


  $("pentaPoints").value =
    scoring.penta;


  $("ppccPoints").value =
    scoring.ppcc;


  $("tankPoints").value =
    scoring.tank;


  $("dpsPoints").value =
    scoring.dps;

}


function getNumber(id) {

  const value =
    Number($(id).value);


  if (
    Number.isFinite(value) &&
    value >= 0
  ) {

    return Math.floor(value);

  }


  return 0;

}


function applyScoring() {

  if (!isAdmin) return;


  scoring = {

    win:
      getNumber("winPoints"),

    mvp:
      getNumber("mvpPoints"),

    quadra:
      getNumber("quadraPoints"),

    penta:
      getNumber("pentaPoints"),

    ppcc:
      getNumber("ppccPoints"),

    tank:
      getNumber("tankPoints"),

    dps:
      getNumber("dpsPoints")

  };


  Storage.saveScoring(
    scoring
  );


  recalculateScores();


  Storage.savePlayers(
    players
  );


  renderEverything();


  alert(
    "Scoring updated successfully."
  );

}


/* =========================================================
   LIVE MATCH
   ========================================================= */

function changeMatch(amount) {

  if (!isAdmin) return;


  currentMatch =
    Math.max(
      1,
      currentMatch + amount
    );


  Storage.saveMatch(
    currentMatch
  );


  updateMatchDisplay();

}


function setMatch(value) {

  if (!isAdmin) return;


  const number =
    Math.floor(
      Number(value)
    );


  currentMatch =
    Math.max(
      1,
      Number.isFinite(number)
        ? number
        : 1
    );


  Storage.saveMatch(
    currentMatch
  );


  updateMatchDisplay();

}


function updateMatchDisplay() {

  $("currentMatch").value =
    currentMatch;


  $("adminLiveMatchDisplay").textContent =
    `LIVE — MATCH ${currentMatch}`;


  $("viewerLiveMatchDisplay").textContent =
    `LIVE — MATCH ${currentMatch}`;

}


/* =========================================================
   LEADERBOARD
   ========================================================= */

function updateLeaderboard() {

  if (!isAdmin) return;


  recalculateScores();


  players.sort(
    (a, b) => {

      const scoreDifference =
        b.score - a.score;


      if (
        scoreDifference !== 0
      ) {

        return scoreDifference;

      }


      return a.name.localeCompare(
        b.name
      );

    }
  );


  Storage.savePlayers(
    players
  );


  renderEverything();


  alert(
    "Leaderboard updated."
  );

}


/* =========================================================
   NEW TOURNAMENT
   ========================================================= */

function newTournament() {

  if (!isAdmin) return;


  if (!players.length) {

    alert(
      "There are no players to archive."
    );

    return;

  }


  const confirmed =
    confirm(
      "Archive this tournament and start a new one?"
    );


  if (!confirmed) return;


  recalculateScores();


  const archivedTournament = {

    id: Date.now(),

    tournamentNumber:
      tournament.number,

    date:
      new Date().toISOString(),

    matchCount:
      currentMatch,

    players:
      JSON.parse(
        JSON.stringify(players)
      )

  };


  history.unshift(
    archivedTournament
  );


  tournament = {

    number:
      tournament.number + 1,

    status:
      "LIVE"

  };


  players = [];

  currentMatch = 1;


  Storage.saveHistory(
    history
  );


  Storage.saveTournament(
    tournament
  );


  Storage.savePlayers(
    players
  );


  Storage.saveMatch(
    currentMatch
  );


  renderEverything();


  alert(
    `Tournament ${archivedTournament.tournamentNumber} archived.`
  );

}


/* =========================================================
   STATS
   ========================================================= */

function renderStats() {

  $("totalPlayers").textContent =
    players.length;


  const sorted =
    [...players].sort(
      (a, b) =>
        b.score - a.score
    );


  if (!sorted.length) {

    $("topScore").textContent =
      "0";


    $("leaderName").textContent =
      "—";


    return;

  }


  $("topScore").textContent =
    sorted[0].score;


  $("leaderName").textContent =
    sorted[0].name;

}


/* =========================================================
   LEADERBOARD RENDER
   ========================================================= */

function achievementCell(
  player,
  type
) {

  const value =
    player.achievements[type];


  /* VIEWER = DISPLAY ONLY */

  if (!isAdmin) {

    return `
      <td>
        ${value}
      </td>
    `;

  }


  /* ADMIN = EDITABLE */

  return `

    <td>

      <div class="achievement-control">

        <button
          type="button"
          onclick="
            changeAchievement(
              '${player.id}',
              '${type}',
              -1
            )
          "
        >
          −
        </button>


        <strong>
          ${value}
        </strong>


        <button
          type="button"
          onclick="
            changeAchievement(
              '${player.id}',
              '${type}',
              1
            )
          "
        >
          +
        </button>

      </div>

    </td>

  `;

}


function renderLeaderboard() {

  const tbody =
    $("leaderboard");


  const search =
    $("search")
      .value
      .trim()
      .toLowerCase();


  const sorted =
    [...players].sort(
      (a, b) => {

        const scoreDifference =
          b.score - a.score;


        if (
          scoreDifference !== 0
        ) {

          return scoreDifference;

        }


        return a.name.localeCompare(
          b.name
        );

      }
    );


  const filtered =
    sorted.filter(
      player =>
        player.name
          .toLowerCase()
          .includes(search)
    );


  $("emptyState").style.display =
    players.length === 0
      ? "block"
      : "none";


  if (!filtered.length) {

    tbody.innerHTML =
      "";

    return;

  }


  tbody.innerHTML =
    filtered
      .map(
        player => {

          const rank =
            sorted.findIndex(
              p =>
                p.id === player.id
            ) + 1;


          return `

            <tr>

              <td>
                #${rank}
              </td>


              <td>
                ${escapeHTML(
                  player.name
                )}
              </td>


              ${achievementCell(
                player,
                "win"
              )}


              ${achievementCell(
                player,
                "mvp"
              )}


              ${achievementCell(
                player,
                "quadra"
              )}


              ${achievementCell(
                player,
                "penta"
              )}


              ${achievementCell(
                player,
                "ppcc"
              )}


              ${achievementCell(
                player,
                "tank"
              )}


              ${achievementCell(
                player,
                "dps"
              )}


              <td>
                ${player.score}
              </td>


              <td>

                ${
                  isAdmin

                    ? `

                      <button
                        type="button"
                        onclick="
                          editPlayer(
                            '${player.id}'
                          )
                        "
                      >
                        EDIT
                      </button>


                      <button
                        type="button"
                        onclick="
                          deletePlayer(
                            '${player.id}'
                          )
                        "
                      >
                        DELETE
                      </button>

                    `

                    : `

                      <span>
                        —
                      </span>

                    `
                }

              </td>

            </tr>

          `;

        }
      )
      .join("");

}


/* =========================================================
   TOP 5
   ========================================================= */

function renderTopFive() {

  const container =
    $("topFiveList");


  const top =
    [...players]
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(0, 5);


  if (!top.length) {

    container.innerHTML = `

      <div class="empty-state">

        <h3>
          NO PLAYERS YET
        </h3>

        <p>
          Players will appear here once they are added.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    top
      .map(
        (player, index) => `

          <div class="top-player-card">

            <div class="top-player-rank">
              #${index + 1}
            </div>


            <div class="top-player-name">
              ${escapeHTML(
                player.name
              )}
            </div>


            <div class="top-player-score">
              ${player.score}
            </div>

          </div>

        `
      )
      .join("");

}


/* =========================================================
   HISTORY
   ========================================================= */

function renderHistory() {

  const container =
    $("historyList");


  if (!history.length) {

    container.innerHTML = `

      <div class="empty-state">

        <h3>
          NO TOURNAMENT HISTORY
        </h3>

        <p>
          Previous tournaments will appear here.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    history
      .map(
        tournamentData => {

          const sorted =
            [...tournamentData.players]
              .sort(
                (a, b) =>
                  b.score - a.score
              );


          const leader =
            sorted[0];


          return `

            <div class="history-card">

              <div>

                <strong>
                  TOURNAMENT
                  ${tournamentData.tournamentNumber}
                </strong>


                <span>

                  ${formatDate(
                    tournamentData.date
                  )}

                  ·

                  ${tournamentData.matchCount}

                  match${
                    tournamentData.matchCount === 1
                      ? ""
                      : "es"
                  }

                </span>

              </div>


              <div>

                <strong>

                  ${
                    leader
                      ? escapeHTML(
                          leader.name
                        )
                      : "—"
                  }

                </strong>


                <span>

                  ${
                    leader
                      ? leader.score
                      : 0
                  }

                  SOT

                </span>

              </div>

            </div>

          `;

        }
      )
      .join("");

}


/* =========================================================
   RESULT IMAGE
   ========================================================= */

function generateResultImage() {

  if (!isAdmin) return;


  if (!players.length) {

    alert(
      "Add players before generating the result."
    );

    return;

  }


  recalculateScores();


  const sorted =
    [...players].sort(
      (a, b) => {

        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return a.name.localeCompare(
          b.name
        );

      }
    );


  const canvas =
    document.createElement(
      "canvas"
    );


  const width = 1800;

  const headerHeight = 220;

  const tableHeaderHeight = 80;

  const rowHeight = 88;

  const footerHeight = 70;


  canvas.width =
    width;


  canvas.height =
    headerHeight +
    tableHeaderHeight +
    sorted.length * rowHeight +
    footerHeight;


  const ctx =
    canvas.getContext(
      "2d"
    );


  /* =====================================================
     BACKGROUND
     ===================================================== */

  ctx.fillStyle =
    "#07090d";


  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  /* RED TOP BAR */

  ctx.fillStyle =
    "#e3263f";


  ctx.fillRect(
    0,
    0,
    width,
    18
  );


  /* ORANGE BOTTOM BAR */

  ctx.fillStyle =
    "#ff8a24";


  ctx.fillRect(
    0,
    canvas.height - 12,
    width,
    12
  );


  /* =====================================================
     TITLE
     ===================================================== */

  ctx.textAlign =
    "left";


  ctx.fillStyle =
    "#f5f7fa";


  ctx.font =
    "900 58px Arial";


  ctx.fillText(
    "SOT SCOREBOARD",
    70,
    85
  );


  /* SUBTITLE */

  ctx.fillStyle =
    "#ff8a24";


  ctx.font =
    "900 25px Arial";


  ctx.fillText(
    "SATURDAY OPEN TOURNAMENT",
    73,
    125
  );


  /* TOURNAMENT / MATCH */

  ctx.fillStyle =
    "#9aa4b2";


  ctx.font =
    "20px Arial";


  ctx.fillText(
    `TOURNAMENT ${tournament.number}  •  MATCH ${currentMatch}`,
    74,
    160
  );


  /* =====================================================
     COLUMN POSITIONS
     ===================================================== */

  const columns = {

    rank: 70,

    player: 145,

    win: 620,

    mvp: 750,

    quadra: 875,

    penta: 1000,

    ppcc: 1135,

    tank: 1290,

    dps: 1430,

    score: 1635

  };


  /* =====================================================
     TABLE HEADER
     ===================================================== */

  const tableY =
    headerHeight;


  ctx.fillStyle =
    "#151b24";


  ctx.fillRect(
    40,
    tableY,
    width - 80,
    tableHeaderHeight
  );


  ctx.fillStyle =
    "#f5f7fa";


  ctx.font =
    "900 19px Arial";


  ctx.textAlign =
    "left";


  ctx.fillText(
    "#",
    columns.rank,
    tableY + 49
  );


  ctx.fillText(
    "PLAYER",
    columns.player,
    tableY + 49
  );


  ctx.textAlign =
    "center";


  ctx.fillText(
    "WIN",
    columns.win,
    tableY + 49
  );


  ctx.fillText(
    "MVP",
    columns.mvp,
    tableY + 49
  );


  ctx.fillText(
    "QD",
    columns.quadra,
    tableY + 49
  );


  ctx.fillText(
    "PT",
    columns.penta,
    tableY + 49
  );


  ctx.fillText(
    "PPCC",
    columns.ppcc,
    tableY + 49
  );


  ctx.fillText(
    "TANK",
    columns.tank,
    tableY + 49
  );


  ctx.fillText(
    "DPS",
    columns.dps,
    tableY + 49
  );


  /* SCORE HEADER */

  ctx.fillStyle =
    "#ff8a24";


  ctx.fillText(
    "SCORE",
    columns.score,
    tableY + 49
  );


  /* =====================================================
     PLAYER ROWS
     ===================================================== */

  sorted.forEach(
    (player, index) => {

      const y =
        tableY +
        tableHeaderHeight +
        index * rowHeight;


      /* ROW BACKGROUND */

      ctx.fillStyle =
        index % 2 === 0
          ? "#11161e"
          : "#0d1118";


      ctx.fillRect(
        40,
        y,
        width - 80,
        rowHeight
      );


      /* DIVIDER */

      ctx.fillStyle =
        "#252c36";


      ctx.fillRect(
        40,
        y + rowHeight - 1,
        width - 80,
        1
      );


      /* RANK */

      ctx.textAlign =
        "left";


      ctx.font =
        "900 23px Arial";


      ctx.fillStyle =
        index < 3
          ? "#ffb04a"
          : "#f5f7fa";


      ctx.fillText(
        `#${index + 1}`,
        columns.rank,
        y + 55
      );


      /* PLAYER NAME */

      ctx.fillStyle =
        "#f5f7fa";


      ctx.font =
        "900 21px Arial";


      let playerName =
        String(player.name);


      if (
        playerName.length > 25
      ) {

        playerName =
          playerName.substring(
            0,
            22
          ) + "...";

      }


      ctx.fillText(
        playerName,
        columns.player,
        y + 55
      );


      /* ACHIEVEMENTS */

      ctx.textAlign =
        "center";


      ctx.font =
        "900 21px Arial";


      ctx.fillStyle =
        "#dfe4eb";


      const achievements =
        player.achievements || {};


      /* WIN */

      ctx.fillText(
        achievements.win || 0,
        columns.win,
        y + 55
      );


      /* MVP */

      ctx.fillText(
        achievements.mvp || 0,
        columns.mvp,
        y + 55
      );


      /* QUADRA */

      ctx.fillText(
        achievements.quadra || 0,
        columns.quadra,
        y + 55
      );


      /* PENTA */

      ctx.fillText(
        achievements.penta || 0,
        columns.penta,
        y + 55
      );


      /* PPCC */

      ctx.fillText(
        achievements.ppcc || 0,
        columns.ppcc,
        y + 55
      );


      /* PERFECT TANK */

      ctx.fillText(
        achievements.tank || 0,
        columns.tank,
        y + 55
      );


      /* PERFECT DPS */

      ctx.fillText(
        achievements.dps || 0,
        columns.dps,
        y + 55
      );


      /* TOTAL SCORE */

      ctx.fillStyle =
        "#ff8a24";


      ctx.font =
        "900 25px Arial";


      ctx.fillText(
        player.score || 0,
        columns.score,
        y + 55
      );

    }
  );


  /* =====================================================
     FOOTER
     ===================================================== */

  const footerY =
    tableY +
    tableHeaderHeight +
    sorted.length * rowHeight;


  ctx.fillStyle =
    "#0b1018";


  ctx.fillRect(
    40,
    footerY,
    width - 80,
    footerHeight
  );


  ctx.textAlign =
    "left";


  ctx.fillStyle =
    "#9aa4b2";


  ctx.font =
    "18px Arial";


  ctx.fillText(
    "SOT • Saturday Open Tournament",
    70,
    footerY + 43
  );


  ctx.textAlign =
    "right";


  ctx.fillText(
    "NoName",
    width - 70,
    footerY + 43
  );


  /* =====================================================
     PREVIEW
     ===================================================== */

  $("resultImage").src =
    canvas.toDataURL(
      "image/png"
    );


  $("resultPreview").style.display =
    "block";

}


/* =========================================================
   ADMIN / VIEWER UI
   ========================================================= */

function updatePermissionUI() {

  const addPlayerPanel =
    $("addPlayerPanel");

  const addPlayerShortcut =
    $("addPlayerShortcutBtn");


  /*
    ADD PLAYER:
    Admin only.
  */

  if (addPlayerPanel) {

    addPlayerPanel.style.display =
      isAdmin
        ? "block"
        : "none";

  }


  /*
    QUICK ADD:
    Admin only.
  */

  if (addPlayerShortcut) {

    addPlayerShortcut.style.display =
      isAdmin
        ? "inline-block"
        : "none";

  }


  /*
    ADMIN CONTROLS:
    Admin only.
  */

  $("adminControls").style.display =
    isAdmin
      ? "grid"
      : "none";


  /*
    Current match input:
    Viewer can see live match,
    but cannot control it.
  */

  $("currentMatch").disabled =
    !isAdmin;


  /*
    Scoring inputs:
    Viewer cannot edit them.
  */

  [
    "winPoints",
    "mvpPoints",
    "quadraPoints",
    "pentaPoints",
    "ppccPoints",
    "tankPoints",
    "dpsPoints"
  ].forEach(
    id => {

      $(id).disabled =
        !isAdmin;

    }
  );


  /*
    Admin action buttons.
  */

  [
    "applyScoring",
    "updateLeaderboardBtn",
    "newTournamentBtn",
    "generateResultBtn"
  ].forEach(
    id => {

      $(id).disabled =
        !isAdmin;

    }
  );

}


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function renderEverything() {

  recalculateScores();

  renderStats();

  renderLeaderboard();

  renderTopFive();

  renderHistory();

  updateMatchDisplay();

  updatePermissionUI();

}


/* =========================================================
   SECURITY / HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   DATE
   ========================================================= */

function formatDate(
  dateString
) {

  return new Date(
    dateString
  ).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric"
    }
  );

}


/* =========================================================
   DEBUG / FUTURE SUPABASE LAYER
   ========================================================= */

window.SOT = {

  getPlayers: () =>
    players,

  getScoring: () =>
    scoring,

  getHistory: () =>
    history,

  getMatch: () =>
    currentMatch,

  resetAll() {

    localStorage.clear();

    location.reload();

  }

};
