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


  $("addPlayerShortcutBtn").addEventListener(
    "click",
    focusAddPlayer
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

}


/* =========================================================
   LOGIN
========================================================= */

function openLogin() {

  $("loginPanel").style.display = "block";

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


  /* Keep focus here so multiple players can be added quickly. */

  $("playerName").focus();

}


function focusAddPlayer() {

  if (!isAdmin) return;


  const playerInput =
    $("playerName");


  if (!playerInput) return;


  playerInput.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });


  setTimeout(
    () => {
      playerInput.focus();
    },
    250
  );

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
   DOES NOT ARCHIVE
========================================================= */

function newTournament() {

  if (!isAdmin) return;


  const confirmed =
    confirm(
      `Start Tournament ${tournament.number + 1}? The current scoreboard will be cleared and will NOT be archived.`
    );


  if (!confirmed) return;


  tournament = {

    number:
      tournament.number + 1,

    status:
      "LIVE"

  };


  players = [];

  currentMatch = 1;


  Storage.saveTournament(
    tournament
  );


  Storage.savePlayers(
    players
  );


  Storage.saveMatch(
    currentMatch
  );


  $("resultPreview").style.display =
    "none";


  $("resultImage").src =
    "";


  renderEverything();


  alert(
    `Tournament ${tournament.number} started.`
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


  if (!isAdmin) {

    return `
      <td>
        ${value}
      </td>
    `;

  }


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

                    : "—"
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

          <div class="top-five-item">

            <div class="rank">
              #${index + 1}
            </div>


            <div class="player-name">
              ${escapeHTML(
                player.name
              )}
            </div>


            <div class="score">
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
   TOP 10 ONLY
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


  const topTen =
    sorted.slice(0, 10);


  const canvas =
    document.createElement(
      "canvas"
    );


  const rowHeight =
    86;


  const headerHeight =
    305;


  const bottomPadding =
    60;


  canvas.width =
    1800;


  canvas.height =
    Math.max(
      760,
      headerHeight +
      topTen.length * rowHeight +
      bottomPadding
    );


  const ctx =
    canvas.getContext(
      "2d"
    );


  /* =======================================================
     BACKGROUND
  ======================================================= */

  ctx.fillStyle =
    "#07090d";


  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  /* Red top bar */

  ctx.fillStyle =
    "#e3263f";


  ctx.fillRect(
    0,
    0,
    canvas.width,
    18
  );


  /* Orange bottom bar */

  ctx.fillStyle =
    "#ff8a24";


  ctx.fillRect(
    0,
    canvas.height - 12,
    canvas.width,
    12
  );


  /* =======================================================
     TITLE
  ======================================================= */

  ctx.fillStyle =
    "#f5f7fa";


  ctx.font =
    "900 62px Arial";


  ctx.fillText(
    "SOT SCOREBOARD",
    70,
    92
  );


  /* Subtitle */

  ctx.fillStyle =
    "#ff8a24";


  ctx.font =
    "900 26px Arial";


  ctx.fillText(
    "SATURDAY OPEN TOURNAMENT",
    74,
    135
  );


  /* Tournament number */

  ctx.fillStyle =
    "#8f98a8";


  ctx.font =
    "700 23px Arial";


  ctx.fillText(
    `TOURNAMENT ${tournament.number}`,
    74,
    175
  );


  /* =======================================================
     TABLE HEADER
  ======================================================= */

  const tableX =
    50;


  const tableWidth =
    1700;


  const headerY =
    225;


  ctx.fillStyle =
    "#11161e";


  ctx.fillRect(
    tableX,
    headerY - 36,
    tableWidth,
    58
  );


  ctx.fillStyle =
    "#8f98a8";


  ctx.font =
    "900 18px Arial";


  ctx.fillText(
    "RANK",
    72,
    headerY
  );


  ctx.fillText(
    "PLAYER",
    155,
    headerY
  );


  ctx.fillText(
    "WIN",
    700,
    headerY
  );


  ctx.fillText(
    "MVP",
    810,
    headerY
  );


  ctx.fillText(
    "QUADRA",
    920,
    headerY
  );


  ctx.fillText(
    "PENTA",
    1060,
    headerY
  );


  ctx.fillText(
    "PPCC",
    1185,
    headerY
  );


  ctx.fillText(
    "TANK",
    1295,
    headerY
  );


  ctx.fillText(
    "DPS",
    1405,
    headerY
  );


  ctx.fillText(
    "SCORE",
    1510,
    headerY
  );


  /* =======================================================
     PLAYER ROWS
  ======================================================= */

  let y =
    285;


  topTen.forEach(
    (player, index) => {

      const a =
        player.achievements;


      /* Row */

      ctx.fillStyle =
        index % 2 === 0
          ? "#11161e"
          : "#0d1118";


      ctx.fillRect(
        tableX,
        y - 35,
        tableWidth,
        68
      );


      /* Rank */

      ctx.fillStyle =
        index === 0
          ? "#ffb04a"
          : "#f5f7fa";


      ctx.font =
        "900 24px Arial";


      ctx.fillText(
        `#${index + 1}`,
        72,
        y
      );


      /* Player */

      ctx.fillStyle =
        "#f5f7fa";


      ctx.font =
        "900 23px Arial";


      ctx.fillText(
        truncateText(
          ctx,
          player.name,
          500
        ),
        155,
        y
      );


      /* Achievements */

      ctx.font =
        "800 21px Arial";


      ctx.fillStyle =
        "#e7eaf0";


      ctx.fillText(
        String(a.win),
        700,
        y
      );


      ctx.fillText(
        String(a.mvp),
        810,
        y
      );


      ctx.fillText(
        String(a.quadra),
        920,
        y
      );


      ctx.fillText(
        String(a.penta),
        1060,
        y
      );


      ctx.fillText(
        String(a.ppcc),
        1185,
        y
      );


      ctx.fillText(
        String(a.tank),
        1295,
        y
      );


      ctx.fillText(
        String(a.dps),
        1405,
        y
      );


      /* Score */

      ctx.fillStyle =
        "#ff8a24";


      ctx.font =
        "900 24px Arial";


      ctx.fillText(
        String(player.score),
        1510,
        y
      );


      y += rowHeight;

    }
  );


  /* =======================================================
     FOOTER
  ======================================================= */

  ctx.fillStyle =
    "#697282";


  ctx.font =
    "700 17px Arial";


  ctx.fillText(
    `TOP ${topTen.length} • SOT SCOREBOARD`,
    70,
    canvas.height - 32
  );


  /* =======================================================
     DISPLAY IMAGE
  ======================================================= */

  $("resultImage").src =
    canvas.toDataURL(
      "image/png"
    );


  $("resultPreview").style.display =
    "block";


  $("resultPreview").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


/* =========================================================
   CANVAS TEXT HELPER
========================================================= */

function truncateText(
  ctx,
  text,
  maxWidth
) {

  const value =
    String(text);


  if (
    ctx.measureText(value).width <=
    maxWidth
  ) {

    return value;

  }


  let shortened =
    value;


  while (
    shortened.length > 1 &&
    ctx.measureText(
      shortened + "..."
    ).width > maxWidth
  ) {

    shortened =
      shortened.slice(
        0,
        -1
      );

  }


  return shortened + "...";

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


  /* Admin-only shortcut */

  $("addPlayerShortcutBtn").style.display =
    isAdmin
      ? "inline-block"
      : "none";

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
