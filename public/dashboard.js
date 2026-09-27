let selectedTeams = [];
let modalTeamSequence = [];
let modalTeamIndex = -1;
let availableTeams = [];


// ================= LOAD DASHBOARD =================

async function loadDashboard() {

  const loading = document.getElementById("loading");
  const error = document.getElementById("error");

  loading.style.display = "flex";
  error.textContent = "";

  try {

    const algo = document.getElementById("algo").value;

    const response = await fetch(`/teams?algo=${algo}`);

    if (!response.ok) {
      throw new Error("โหลดข้อมูลทีมไม่สำเร็จ");
    }

    const result = await response.json();

    availableTeams = result.data;

    renderTeams(availableTeams);
    renderSortInfo(result);

    await loadQueue();
    await loadHistory();
    await loadScorers();

  } catch (err) {

    console.error(err);

    error.textContent =
      "เกิดข้อผิดพลาดในการโหลดข้อมูล: " + err.message;

  } finally {

    loading.style.display = "none";

  }

}


// ================= SORT INFO =================

function renderSortInfo(result) {

  const element = document.getElementById("sortInfo");

  element.textContent =
    `${result.algorithm} · ${result.count} ทีม · ${result.ms} ms`;

}


// ================= STANDING ZONE =================

function getStandingClass(rank) {

  if (rank >= 1 && rank <= 4) {
    return "zone-cl";
  }

  if (rank === 5) {
    return "zone-europa";
  }

  if (rank === 6) {
    return "zone-conference";
  }

  if (rank >= 18) {
    return "zone-relegation";
  }

  return "";

}


// ================= RENDER TEAMS =================

function renderTeams(teams) {

  const container = document.getElementById("characters");

  container.innerHTML = "";

  teams.forEach(team => {

    const row = document.createElement("div");

    row.className =
      `team-row ${getStandingClass(team.rank)}`;

    const isSelected =
      selectedTeams.some(item => item.id === team.id);

    row.innerHTML = `

      <div class="team-rank">
        ${team.rank}
      </div>

      <div class="team-cell">

        <img
          class="team-logo"
          src="${team.logo || ""}"
          alt=""
        >

        <span class="team-name">
          ${team.name}
        </span>

      </div>

      <div class="stat">
        ${team.matches}
      </div>

      <div class="stat">
        ${team.won}
      </div>

      <div class="stat">
        ${team.draw}
      </div>

      <div class="stat">
        ${team.lost}
      </div>

      <div class="stat">
        ${team.goalDiff > 0 ? "+" : ""}
        ${team.goalDiff}
      </div>

      <div class="points">
        ${team.points}
      </div>

      <div>

        <button
          class="queue-button ${isSelected ? "selected" : ""}"
          onclick="addToQueue(${team.id})"
          title="เพิ่มทีมเข้าคิว"
        >
          ${isSelected ? "✓" : "+"}
        </button>

      </div>

    `;

    row.querySelector(".team-cell").onclick =
      () => openTeamModal(team.id);

    container.appendChild(row);

  });

}


// ================= SCORERS =================

async function loadScorers() {

  const container = document.getElementById("scorers");

  try {

    const response = await fetch("/scorers");

    if (!response.ok) {
      throw new Error("โหลดดาวซัลโวไม่สำเร็จ");
    }

    const scorers = await response.json();

    if (!scorers.length) {

      container.innerHTML =
        `<div class="empty-message">ไม่มีข้อมูลดาวซัลโว</div>`;

      return;
    }

    container.innerHTML = scorers.map(player => `

      <div class="scorer-item">

        <div class="scorer-rank">
          ${player.rank}
        </div>

        <div class="scorer-info">

          <span class="scorer-name">
            ${player.name}
          </span>

          <span class="scorer-team">
            ${player.team}
          </span>

        </div>

        <div class="scorer-goals">
          ${player.goals} ⚽
        </div>

      </div>

    `).join("");

  } catch (err) {

    console.error(err);

    container.innerHTML =
      `<div class="empty-message">
        ไม่สามารถโหลดข้อมูลดาวซัลโวได้
      </div>`;

  }

}


// ================= TEAM MODAL =================

// เปิดดูจากตาราง
function openTeamModal(teamId) {

  const team =
    availableTeams.find(item => item.id === teamId);

  if (!team) return;

  // ถ้าเปิดจากตาราง = ดูได้ทุกทีม
  modalTeamSequence = availableTeams;

  modalTeamIndex =
    availableTeams.findIndex(
      item => item.id === teamId
    );

  renderTeamModal(team);

  document
    .getElementById("characterModal")
    .showModal();

  updateModalButtons();

}


// ================= RENDER TEAM MODAL =================

function renderTeamModal(team) {

  document.getElementById("modalName").textContent =
    team.name;

  document.getElementById("modalLogo").src =
    team.logo || "";

  document.getElementById("modalStatus").textContent =
    team.points;

  document.getElementById("modalSpecies").textContent =
    team.matches;

  document.getElementById("modalGender").textContent =
    team.won;

  document.getElementById("modalOrigin").textContent =
    team.draw;

  document.getElementById("modalLocation").textContent =
    team.lost;

  document.getElementById("modalEpisodes").textContent =
    team.goalDiff > 0
      ? `+${team.goalDiff}`
      : team.goalDiff;

  renderNextMatch(team);
  renderMatches(team);

  updateModalButtons();

}


// ================= MODAL BUTTON =================

function updateModalButtons() {

  const nextButton =
    document.querySelector(
      '#characterModal button[onclick="showNextTeam()"]'
    );

  if (!nextButton) return;

  // ไม่มีทีม
  if (!modalTeamSequence.length) {

    nextButton.textContent = "ปิด";
    nextButton.onclick = closeCharacterModal;

    return;
  }

  // ถ้าเป็นทีมสุดท้าย
  if (
    modalTeamIndex >=
    modalTeamSequence.length - 1
  ) {

    nextButton.textContent = "ปิด";
    nextButton.onclick = closeCharacterModal;

  } else {

    nextButton.textContent = "ดูทีมต่อไป →";
    nextButton.onclick = showNextTeam;

  }

}


// ================= CLOSE MODAL =================

function closeCharacterModal() {

  document
    .getElementById("characterModal")
    .close();

}


// ================= NEXT MATCH =================

function renderNextMatch(team) {

  const container =
    document.getElementById("nextMatch");

  if (!team.nextMatch) {

    container.innerHTML = `
      <div class="next-match-title">
        NEXT MATCH
      </div>

      <div class="next-match-content">
        ยังไม่มีข้อมูลนัดถัดไป
      </div>
    `;

    return;
  }

  const match = team.nextMatch;

  const date =
    new Date(match.date).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short"
    });

  container.innerHTML = `

    <div class="next-match-title">
      NEXT MATCH · ${date}
    </div>

    <div class="next-match-content">

      ${match.homeTeam}

      <span> vs </span>

      ${match.awayTeam}

    </div>

  `;

}


// ================= MATCH HISTORY =================

function renderMatches(team) {

  const container =
    document.getElementById("modalMatches");

  const matches =
    (team.matchesDetail || [])
      .slice(-5)
      .reverse();

  if (!matches.length) {

    container.innerHTML =
      `<div class="empty-message">
        ยังไม่มีข้อมูลการแข่งขัน
      </div>`;

    return;
  }

  container.innerHTML =
    matches.map(match => {

      const date =
        new Date(match.date)
          .toLocaleDateString("th-TH");

      let resultClass = "match-draw";
      let resultText = "เสมอ";

      if (match.outcome === "win") {

        resultClass = "match-win";
        resultText = "ชนะ";

      }

      if (match.outcome === "loss") {

        resultClass = "match-loss";
        resultText = "แพ้";

      }

      return `

        <div class="match-row">

          <span class="match-date">
            ${date}
          </span>

          <span class="match-opponent">
            vs ${match.opponent}
          </span>

          <span class="match-score">
            ${match.goals} - ${match.opponentGoals}
          </span>

          <span class="${resultClass}">
            ${resultText}
          </span>

        </div>

      `;

    }).join("");

}


// ================= MODAL NEXT / PREVIOUS =================

function showNextTeam() {

  if (!modalTeamSequence.length) {

    closeCharacterModal();
    return;

  }

  // ถ้าอยู่ทีมสุดท้ายแล้ว = ปิด
  if (
    modalTeamIndex >=
    modalTeamSequence.length - 1
  ) {

    closeCharacterModal();
    return;

  }

  modalTeamIndex++;

  renderTeamModal(
    modalTeamSequence[modalTeamIndex]
  );

}


function showPreviousTeam() {

  if (!modalTeamSequence.length) return;

  // ถ้าเป็นทีมแรก ไม่วนไปท้าย
  if (modalTeamIndex <= 0) {
    return;
  }

  modalTeamIndex--;

  renderTeamModal(
    modalTeamSequence[modalTeamIndex]
  );

}


// ================= QUEUE =================

async function loadQueue() {

  try {

    const response =
      await fetch("/teamqueue");

    const data =
      await response.json();

    selectedTeams =
      data.items || [];

    updateQueueUI();

  } catch (err) {

    console.error("Queue:", err);

  }

}


// ================= UPDATE QUEUE UI =================

function updateQueueUI() {

  const size =
    selectedTeams.length;

  document.getElementById("queueSize").textContent =
    size;

  document.getElementById("queueSizePopup").textContent =
    size;

  renderQueue();

  renderTeams(availableTeams);

}


// ================= RENDER QUEUE =================

function renderQueue() {

  const list =
    document.getElementById("watchlist");

  if (!selectedTeams.length) {

    list.innerHTML = `
      <li class="empty-message">
        ยังไม่มีทีมในคิว
      </li>
    `;

    return;
  }

  list.innerHTML =
    selectedTeams.map((team, index) => `

      <li>

        <span>
          <strong>${team.name}</strong>
        </span>

        <span class="queue-position">
          #${index + 1}
        </span>

      </li>

    `).join("");

}


// ================= ADD TO QUEUE =================

async function addToQueue(teamId) {

  try {

    const response =
      await fetch("/teamqueue", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          teamId
        })

      });

    const data =
      await response.json();

    if (!response.ok) {

      alert(
        data.error ||
        "เพิ่มทีมไม่สำเร็จ"
      );

      return;

    }

    await loadQueue();
    await loadHistory();

  } catch (err) {

    console.error(err);

    alert(
      "ไม่สามารถเพิ่มทีมเข้าคิวได้"
    );

  }

}


// ================= PROCESS QUEUE =================

async function processQueue() {

  if (!selectedTeams.length) {

    alert("ยังไม่มีทีมในคิว");

    return;
  }

  try {

    const response =
      await fetch("/teamqueue/process", {
        method: "DELETE"
      });

    const data =
      await response.json();

    if (!response.ok) {

      alert(
        data.error ||
        "ไม่สามารถดูทีมถัดไปได้"
      );

      return;

    }

    /*
      สำคัญ:
      หลังจาก Queue ทำงานไป 1 ทีม
      data.team คือทีมที่ถูกเปิดดู

      เราจะใช้ selectedTeams
      เป็นลำดับสำหรับการดูต่อ
    */

    // เก็บรายการ Queue ก่อน loadQueue
    const queueSequence = [
      data.team,
      ...selectedTeams.filter(
        team =>
          Number(team.id) !==
          Number(data.team.id)
      )
    ];

    // อัปเดต Queue
    await loadQueue();

    // อัปเดต History
    await loadHistory();

    if (data.team) {

      // ใช้เฉพาะทีมที่อยู่ใน Queue
      modalTeamSequence =
        queueSequence;

      modalTeamIndex = 0;

      renderTeamModal(data.team);

      document
        .getElementById("characterModal")
        .showModal();

      updateModalButtons();

    }

  } catch (err) {

    console.error(err);

    alert(
      "เกิดข้อผิดพลาดในการประมวลผล Queue"
    );

  }

}


// ================= QUEUE MODAL =================

function openQueueModal() {

  document
    .getElementById("queueModal")
    .showModal();

}


function closeQueueModal() {

  document
    .getElementById("queueModal")
    .close();

}


// ================= HISTORY =================

async function loadHistory() {

  try {

    const response =
      await fetch("/history");

    const data =
      await response.json();

    document.getElementById("historySize").textContent =
      data.size || 0;

    document.getElementById("historySizePopup").textContent =
      data.size || 0;

    renderHistory(
      data.display || []
    );

  } catch (err) {

    console.error(
      "History:",
      err
    );

  }

}


// ================= RENDER HISTORY =================

function renderHistory(history) {

  const list =
    document.getElementById("history");

  if (!history.length) {

    list.innerHTML = `
      <li class="empty-message">
        ยังไม่มีประวัติการทำงาน
      </li>
    `;

    return;
  }

  list.innerHTML =
    history.map(item => {

      const action =
        item.action === "ADD"
          ? "เพิ่มทีมเข้าคิว"
          : "ดูทีม";

      const className =
        item.action === "ADD"
          ? "history-add"
          : "history-view";

      return `

        <li>

          <span class="${className}">
            ${action}
          </span>

          <strong>
            ${item.team?.name || "-"}
          </strong>

        </li>

      `;

    }).join("");

}


// ================= HISTORY MODAL =================

function openHistoryModal() {

  document
    .getElementById("historyModal")
    .showModal();

}


function closeHistoryModal() {

  document
    .getElementById("historyModal")
    .close();

}


// ================= UNDO =================

async function undo() {

  try {

    const response =
      await fetch("/undo", {
        method: "POST"
      });

    const data =
      await response.json();

    if (!response.ok) {

      alert(
        data.error ||
        "ไม่มีอะไรให้ Undo"
      );

      return;

    }

    await loadQueue();
    await loadHistory();

  } catch (err) {

    console.error(err);

    alert("Undo ไม่สำเร็จ");

  }

}


// ================= START =================

loadDashboard();