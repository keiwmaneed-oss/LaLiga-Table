// =====================================================================
// dashboard.js — frontend
// LaLiga Table & Match Results Tracker
// =====================================================================

// ---------- โหลด 3 endpoint พร้อมกันด้วย Promise.all() ----------
async function loadDashboard() {
  const algo = document.getElementById('algo').value;

  try {
    const [tRes, qRes, hRes] = await Promise.all([
      fetch(`/teams?sort=${algo}`),
      fetch('/teamqueue'),
      fetch('/history'),
    ]);

    if (!tRes.ok) throw new Error('โหลดข้อมูลตารางคะแนนไม่สำเร็จ');
    if (!qRes.ok) throw new Error('โหลดคิวไม่สำเร็จ');
    if (!hRes.ok) throw new Error('โหลดประวัติไม่สำเร็จ');

    const teams = await tRes.json();
    const queue = await qRes.json();
    const history = await hRes.json();

    renderTeams(teams);
    renderTeamQueue(queue);
    renderHistory(history);

    showError('');
  } catch (err) {
    showError('โหลดข้อมูลไม่สำเร็จ: ' + err.message);
  }
}

function showError(msg) {
  const box = document.getElementById('error');

  if (!box) return;

  box.textContent = msg;
  box.style.display = msg ? 'block' : 'none';
}


// ---------- render ตารางทีม ----------
function renderTeams(res) {
  const sortInfo = document.getElementById('sortInfo');

  if (sortInfo) {
    sortInfo.textContent =
      `${res.algorithm} · ${res.count} ทีม · ${res.ms} ms`;
  }

  const container = document.getElementById('characters');

  if (!container) return;

  container.innerHTML = res.data.map(team => `
    <div class="card"
         data-team-id="${team.id}"
         tabindex="0"
         role="button"
         aria-label="ดูรายละเอียด ${team.name}">

      <div class="info">
        <strong><img class="team-logo" src="${team.logo}" alt="">${team.rank ? `${team.rank}. ` : ''}${team.name}</strong>

        <span class="meta">
          แข่ง ${team.matches} · ชนะ ${team.won} · เสมอ ${team.draw} · แพ้ ${team.lost}
        </span>

        <span class="eps">
          ${team.points} คะแนน · ผลต่างประตู ${team.goalDiff}
        </span>
      </div>

      <button
        class="queue-button"
        data-team-id="${team.id}">
        + คิว
      </button>

    </div>
  `).join('');


  // ---------- กดดูรายละเอียดทีม ----------
  document.querySelectorAll('.card').forEach(card => {

    const team = res.data.find(
      t => t.id === Number(card.dataset.teamId)
    );

    card.addEventListener('click', () => {
      openTeamModal(team);
    });

    card.addEventListener('keydown', event => {

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openTeamModal(team);
      }

    });
  });


  // ---------- ปุ่มเพิ่มเข้าคิว ----------
  document.querySelectorAll('.queue-button').forEach(button => {

    button.addEventListener('click', event => {

      event.stopPropagation();

      addToTeamQueue(
        Number(button.dataset.teamId)
      );

    });

  });
}


// ---------- Modal รายละเอียดทีม ----------
function openTeamModal(team) {

  // ถ้าใน index.html ยังใช้ Modal เดิมจากตัวอย่างอาจารย์
  const modal = document.getElementById('characterModal');

  if (!modal) return;


  const modalName = document.getElementById('modalName');
  const modalStatus = document.getElementById('modalStatus');
  const modalSpecies = document.getElementById('modalSpecies');
  const modalGender = document.getElementById('modalGender');
  const modalOrigin = document.getElementById('modalOrigin');
  const modalLocation = document.getElementById('modalLocation');
  const modalEpisodes = document.getElementById('modalEpisodes');


  if (modalName)
    modalName.textContent = team.name;

  if (modalStatus)
    modalStatus.textContent = `${team.points} คะแนน`;

  if (modalSpecies)
    modalSpecies.textContent = `${team.matches} นัด`;

  if (modalGender)
    modalGender.textContent = `ชนะ ${team.won}`;

  if (modalOrigin)
    modalOrigin.textContent = `เสมอ ${team.draw}`;

  if (modalLocation)
    modalLocation.textContent = `แพ้ ${team.lost}`;

  if (modalEpisodes)
    modalEpisodes.textContent =
      `ผลต่างประตู ${team.goalDiff}`;


  const matchesList = document.getElementById('modalMatches');
  if (matchesList) {
    matchesList.innerHTML = team.matchesDetail.length === 0
      ? '<p class="empty">ยังไม่มีข้อมูลนัดที่แข่งจบ</p>'
      : team.matchesDetail.map(match => `
          <div class="match-row ${match.outcome}">
            <span>${new Date(match.date).toLocaleDateString('th-TH')}</span>
            <span class="opponent"><img src="${match.opponentLogo}" alt="">${match.opponent}</span>
            <strong>${match.goals} - ${match.opponentGoals}</strong>
            <b>${match.outcome === 'win' ? 'ชนะ' : match.outcome === 'loss' ? 'แพ้' : 'เสมอ'}</b>
          </div>
        `).join('');
  }


  modal.showModal();
}


function closeCharacterModal() {

  const modal = document.getElementById('characterModal');

  if (modal) {
    modal.close();
  }

}


// ---------- Queue ----------
function renderTeamQueue(res) {

  const queueSize = document.getElementById('queueSize');
  const queueSizePopup = document.getElementById('queueSizePopup');
  const queueList = document.getElementById('watchlist');
  const processButton = document.getElementById('processQueueButton');

  if (queueSize) {
    queueSize.textContent = res.size;
  }

  if (queueSizePopup) {
    queueSizePopup.textContent = res.size;
  }

  if (processButton) {
    processButton.disabled = res.size === 0;
  }

  if (!queueList) return;

  queueList.innerHTML =
    res.size === 0
      ? '<li class="empty">ยังไม่มีทีมในคิว</li>'
      : res.items.map((team, i) => `
          <li class="queue-item">
            <span class="queue-position">${String(i + 1).padStart(2, '0')}</span>
            <img class="popup-team-logo" src="${team.logo}" alt="">
            <strong>${team.name}</strong>
          </li>
        `).join('');
}

function openQueueModal() {
  const modal = document.getElementById('queueModal');

  if (modal) {
    modal.showModal();
  }
}

function closeQueueModal() {
  const modal = document.getElementById('queueModal');

  if (modal) {
    modal.close();
  }
}

function openHistoryModal() {
  const modal = document.getElementById('historyModal');

  if (modal) {
    modal.showModal();
  }
}

function closeHistoryModal() {
  const modal = document.getElementById('historyModal');

  if (modal) {
    modal.close();
  }
}


// ---------- History ----------
function renderHistory(res) {

  const historyList = document.getElementById('history');
  const historySize = document.getElementById('historySize');
  const historySizePopup = document.getElementById('historySizePopup');

  if (historySize) {
    historySize.textContent = res.size;
  }

  if (historySizePopup) {
    historySizePopup.textContent = res.size;
  }

  if (!historyList) return;

  historyList.innerHTML =
    res.size === 0
      ? '<li class="empty">ยังไม่มีประวัติ</li>'
      : res.history.map(h => `
          <li class="history-item">
            <span class="history-action ${h.action.toLowerCase()}">${h.action === 'ADD' ? 'เพิ่มเข้าคิว' : 'ดูทีม'}</span>
            <img class="popup-team-logo" src="${h.team.logo}" alt="">
            <strong>${h.team.name}</strong>
            <time>${h.time}</time>
          </li>
        `).join('');
}


// ---------- เพิ่มทีมเข้าคิว ----------
async function addToTeamQueue(id) {

  try {

    const res = await fetch('/teamqueue', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({ id })
    });


    if (!res.ok) {

      const data = await res.json();

      throw new Error(
        data.error || 'ไม่สามารถเพิ่มทีมเข้าคิวได้'
      );

    }


    await loadDashboard();

  } catch (err) {

    showError(err.message);

  }
}


// ---------- ประมวลผลคิว ----------
async function processQueue() {

  try {

    const res = await fetch(
      '/teamqueue/process',
      {
        method: 'DELETE'
      }
    );


    if (!res.ok) {

      const data = await res.json();

      throw new Error(
        data.error || 'ไม่สามารถประมวลผลคิวได้'
      );

    }


    const data = await res.json();
    await loadDashboard();
    closeQueueModal();
    openTeamModal(data.team);

  } catch (err) {

    showError(err.message);

  }
}


// ---------- Undo ----------
async function undo() {

  try {

    const res = await fetch(
      '/undo',
      {
        method: 'POST'
      }
    );


    if (!res.ok) {

      const data = await res.json();

      throw new Error(
        data.error || 'ไม่สามารถ Undo ได้'
      );

    }


    await loadDashboard();

  } catch (err) {

    showError(err.message);

  }
}


// ---------- เริ่มทำงาน ----------
window.addEventListener(
  'load',
  loadDashboard
)