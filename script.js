const form = document.getElementById("playerForm");

const playerName = document.getElementById("playerName");
const kills = document.getElementById("kills");
const deaths = document.getElementById("deaths");
const assists = document.getElementById("assists");

const leaderboard = document.getElementById("leaderboard");
const emptyState = document.getElementById("emptyState");
const search = document.getElementById("search");

const totalPlayers = document.getElementById("totalPlayers");
const topScore = document.getElementById("topScore");
const leaderName = document.getElementById("leaderName");

const killPoints = document.getElementById("killPoints");
const deathPoints = document.getElementById("deathPoints");
const assistPoints = document.getElementById("assistPoints");

const scorePreview = document.getElementById("scorePreview");
const applyScoring = document.getElementById("applyScoring");


/* =========================
   PLAYER DATA
========================= */

let players =
  JSON.parse(localStorage.getItem("sotPlayers")) || [];


/* =========================
   SCORING SETTINGS
========================= */

let scoring =
  JSON.parse(localStorage.getItem("sotScoring")) || {

    kill: 3,
    death: 2,
    assist: 1

  };


/* =========================
   LOAD SETTINGS
========================= */

function loadScoringSettings() {

  killPoints.value =
    scoring.kill;

  deathPoints.value =
    scoring.death;

  assistPoints.value =
    scoring.assist;

  updatePreview();

}


/* =========================
   SCORE CALCULATOR
========================= */

function calculateSOTScore(
  kill,
  death,
  assist
) {

  return (
    (kill * scoring.kill) +
    (assist * scoring.assist) -
    (death * scoring.death)
  );

}


/* =========================
   SCORE PREVIEW
========================= */

function updatePreview() {

  const k =
    Number(killPoints.value) || 0;

  const d =
    Number(deathPoints.value) || 0;

  const a =
    Number(assistPoints.value) || 0;


  scorePreview.value =
    `K × ${k} + A × ${a} − D × ${d}`;

}


killPoints.addEventListener(
  "input",
  updatePreview
);

deathPoints.addEventListener(
  "input",
  updatePreview
);

assistPoints.addEventListener(
  "input",
  updatePreview
);


/* =========================
   APPLY SCORING
========================= */

applyScoring.addEventListener(
  "click",
  function() {

    scoring = {

      kill:
        Number(killPoints.value) || 0,

      death:
        Number(deathPoints.value) || 0,

      assist:
        Number(assistPoints.value) || 0

    };


    localStorage.setItem(
      "sotScoring",
      JSON.stringify(scoring)
    );


    render();

  }
);


/* =========================
   SAVE PLAYERS
========================= */

function savePlayers() {

  localStorage.setItem(
    "sotPlayers",
    JSON.stringify(players)
  );

}


/* =========================
   ADD PLAYER
========================= */

form.addEventListener(
  "submit",
  function(event) {

    event.preventDefault();

    const name =
      playerName.value.trim();

    if (!name) return;


    players.push({

      id: Date.now(),

      name: name,

      kills:
        Number(kills.value) || 0,

      deaths:
        Number(deaths.value) || 0,

      assists:
        Number(assists.value) || 0

    });


    savePlayers();

    render();


    form.reset();

    kills.value = 0;
    deaths.value = 0;
    assists.value = 0;

    playerName.focus();

  }
);


/* =========================
   DELETE PLAYER
========================= */

function deletePlayer(id) {

  if (!confirm("Delete this player?")) {
    return;
  }


  players =
    players.filter(
      player => player.id !== id
    );


  savePlayers();

  render();

}


/* =========================
   EDIT PLAYER
========================= */

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


  const newKills =
    prompt(
      "Kills:",
      player.kills
    );

  if (newKills === null) return;


  const newDeaths =
    prompt(
      "Deaths:",
      player.deaths
    );

  if (newDeaths === null) return;


  const newAssists =
    prompt(
      "Assists:",
      player.assists
    );

  if (newAssists === null) return;


  player.name =
    newName.trim() || player.name;

  player.kills =
    Math.max(
      0,
      Number(newKills) || 0
    );

  player.deaths =
    Math.max(
      0,
      Number(newDeaths) || 0
    );

  player.assists =
    Math.max(
      0,
      Number(newAssists) || 0
    );


  savePlayers();

  render();

}


/* =========================
   RENDER
========================= */

function render() {

  const query =
    search.value
      .toLowerCase()
      .trim();


  const sorted =
    [...players].sort(
      (a, b) => {

        const scoreA =
          calculateSOTScore(
            a.kills,
            a.deaths,
            a.assists
          );

        const scoreB =
          calculateSOTScore(
            b.kills,
            b.deaths,
            b.assists
          );


        return scoreB - scoreA;

      }
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

    emptyState.style.display =
      "block";

  } else {

    emptyState.style.display =
      "none";


    filtered.forEach(
      (player, index) => {

        const score =
          calculateSOTScore(
            player.kills,
            player.deaths,
            player.assists
          );


        const row =
          document.createElement("tr");


        row.innerHTML = `

          <td class="rank">
            #${index + 1}
          </td>

          <td class="player-name">
            ${escapeHTML(player.name)}
          </td>

          <td>${player.kills}</td>

          <td>${player.deaths}</td>

          <td>${player.assists}</td>

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


  /* =========================
     TOP STATS
  ========================= */

  totalPlayers.textContent =
    players.length;


  if (sorted.length > 0) {

    const leader =
      sorted[0];


    const score =
      calculateSOTScore(
        leader.kills,
        leader.deaths,
        leader.assists
      );


    topScore.textContent =
      score;

    leaderName.textContent =
      leader.name;

  } else {

    topScore.textContent =
      "0";

    leaderName.textContent =
      "—";

  }

}


/* =========================
   SEARCH
========================= */

search.addEventListener(
  "input",
  render
);


/* =========================
   SECURITY
========================= */

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;

}


/* =========================
   START
========================= */

loadScoringSettings();

render();
