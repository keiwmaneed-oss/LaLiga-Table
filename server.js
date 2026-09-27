// =====================================================================
// 801201 — LaLiga Table & Match Results
// Express เป็นตัวกลางระหว่าง browser กับ OpenLigaDB API
// DSA: Sort + Queue + Stack
// =====================================================================

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// ---------------------------------------------------------------------
// TODO 1 — ดึงตารางคะแนน LaLiga จาก API
// LaLiga EA Sports ฤดูกาล 2026/2027
// ---------------------------------------------------------------------

const API_URL = 'https://api.openligadb.de/getbltable/la1/2026';
const MATCHES_URL = 'https://api.openligadb.de/getmatchdata/la1/2026';

let teams = [];

async function loadTeams() {
  try {
    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error('API ตอบ status ' + res.status);
    }

    const data = await res.json();

    let matches = [];

    try {
      const matchesRes = await fetch(MATCHES_URL);

      if (!matchesRes.ok) {
        throw new Error(
          'API นัดแข่งตอบ status ' + matchesRes.status
        );
      }

      matches = await matchesRes.json();

    } catch (err) {
      console.error(
        '⚠️ โหลดข้อมูลนัดแข่งไม่สำเร็จ:',
        err.message
      );
    }

    // ---------------------------------------------------------------
    // จัดกลุ่มผลการแข่งขันตามทีม
    // ---------------------------------------------------------------

    const matchesByTeam = new Map();

    for (const match of matches) {

      if (!match.matchIsFinished) {
        continue;
      }

      const result =
        match.matchResults.find(
          item => item.resultTypeID === 2
        ) ||
        match.matchResults[
          match.matchResults.length - 1
        ];

      if (!result) {
        continue;
      }

      const team1Won =
        result.pointsTeam1 > result.pointsTeam2;

      const team2Won =
        result.pointsTeam2 > result.pointsTeam1;

      const matchInfo = [

        {
          team: match.team1,
          opponent: match.team2,
          goals: result.pointsTeam1,
          opponentGoals: result.pointsTeam2
        },

        {
          team: match.team2,
          opponent: match.team1,
          goals: result.pointsTeam2,
          opponentGoals: result.pointsTeam1
        }

      ];

      matchInfo.forEach(
        (
          {
            team,
            opponent,
            goals,
            opponentGoals
          },
          index
        ) => {

          const outcome =
            goals === opponentGoals
              ? 'draw'
              : (
                  index === 0
                    ? team1Won
                    : team2Won
                )
                ? 'win'
                : 'loss';

          const teamMatches =
            matchesByTeam.get(team.teamId) || [];

          teamMatches.push({

            date: match.matchDateTime,

            opponent: opponent.teamName,

            opponentLogo: opponent.teamIconUrl,

            goals,

            opponentGoals,

            outcome

          });

          matchesByTeam.set(
            team.teamId,
            teamMatches
          );

        }
      );
    }

    // ---------------------------------------------------------------
    // สร้างข้อมูลทีมสำหรับหน้าเว็บ
    // ---------------------------------------------------------------

    teams = data.map(team => ({

      id: team.teamInfoId,

      name: team.teamName,

      logo: team.teamIconUrl,

      rank: team.rank,

      points: team.points,

      matches: team.matches,

      won: team.won,

      draw: team.draw,

      lost: team.lost,

      goals: team.goals,

      opponentGoals: team.opponentGoals,

      goalDiff: team.goalDiff,

      matchesDetail:
        matchesByTeam.get(team.teamInfoId) || []

    }));

    console.log(
      `✅ โหลดตาราง LaLiga สำเร็จ: ${teams.length} ทีม`
    );

  } catch (err) {

    console.error(
      '❌ โหลดข้อมูล LaLiga ไม่สำเร็จ:',
      err.message
    );

  }
}


// =====================================================================
// TODO 2 — SORT
// เรียงคะแนนจากมาก → น้อย
// =====================================================================

// ---------------------------------------------------------------------
// Selection Sort
// ---------------------------------------------------------------------

function selectionSort(arr) {

  const a = [...arr];

  for (
    let i = 0;
    i < a.length - 1;
    i++
  ) {

    let maxIdx = i;

    for (
      let j = i + 1;
      j < a.length;
      j++
    ) {

      if (
        a[j].points >
        a[maxIdx].points
      ) {

        maxIdx = j;

      }

    }

    [
      a[i],
      a[maxIdx]
    ] = [
      a[maxIdx],
      a[i]
    ];

  }

  return a;
}


// ---------------------------------------------------------------------
// Insertion Sort
// ---------------------------------------------------------------------

function insertionSort(arr) {

  const a = [...arr];

  for (
    let i = 1;
    i < a.length;
    i++
  ) {

    const key = a[i];

    let j = i - 1;

    while (
      j >= 0 &&
      a[j].points < key.points
    ) {

      a[j + 1] = a[j];

      j--;

    }

    a[j + 1] = key;

  }

  return a;
}


// ---------------------------------------------------------------------
// Bubble Sort
// ---------------------------------------------------------------------

function bubbleSort(arr) {

  const a = [...arr];

  for (
    let i = 0;
    i < a.length - 1;
    i++
  ) {

    for (
      let j = 0;
      j < a.length - 1 - i;
      j++
    ) {

      if (
        a[j].points <
        a[j + 1].points
      ) {

        [
          a[j],
          a[j + 1]
        ] = [
          a[j + 1],
          a[j]
        ];

      }

    }

  }

  return a;
}


// =====================================================================
// API สำหรับหน้าเว็บ
// =====================================================================

app.get('/teams', (req, res) => {

  const algo =
    req.query.sort || 'selection';

  const t0 = performance.now();

  let sorted;

  if (algo === 'insertion') {

    sorted = insertionSort(teams);

  }
  else if (algo === 'bubble') {

    sorted = bubbleSort(teams);

  }
  else {

    sorted = selectionSort(teams);

  }

  const ms =
    (performance.now() - t0)
      .toFixed(3);

  res.json({

    algorithm: algo,

    count: sorted.length,

    ms: ms,

    data: sorted

  });

});


// =====================================================================
// TODO 3 — QUEUE
// คิวทีมที่ผู้ใช้เลือก
// =====================================================================

class Queue {

  constructor() {

    this.items = [];

  }

  // เพิ่มข้อมูลเข้าท้าย Queue
  enqueue(item) {

    this.items.push(item);

  }

  // นำข้อมูลตัวแรกออกจาก Queue
  dequeue() {

    return this.items.shift();

  }

  // ดูข้อมูลตัวแรกโดยไม่เอาออก
  peek() {

    return this.items[0];

  }

  // ดูจำนวนข้อมูลใน Queue
  size() {

    return this.items.length;

  }

}


// สร้าง Queue สำหรับทีม
const teamQueue = new Queue();


// ---------------------------------------------------------------------
// ดู Queue
// ---------------------------------------------------------------------

app.get('/teamqueue', (req, res) => {

  res.json({

    items: teamQueue.items,

    size: teamQueue.size(),

    next:
      teamQueue.peek() || null

  });

});


// ---------------------------------------------------------------------
// เพิ่มทีมเข้าคิว
// ---------------------------------------------------------------------

app.post('/teamqueue', (req, res) => {

  const team =
    teams.find(
      t =>
        t.id === Number(req.body.id)
    );

  if (!team) {

    return res.status(404).json({

      error: 'ไม่พบทีมนี้'

    });

  }

  // เพิ่มทีมเข้าท้าย Queue
  teamQueue.enqueue(team);

  // บันทึกการทำงานลง Stack
  history.push({

    action: 'ADD',

    team: team,

    time:
      new Date()
        .toLocaleTimeString('th-TH')

  });

  res.status(201).json({

    message:
      `เพิ่ม ${team.name} เข้าคิวแล้ว`,

    size:
      teamQueue.size()

  });

});


// ---------------------------------------------------------------------
// ดูทีมถัดไป / Dequeue
// ---------------------------------------------------------------------

app.delete(
  '/teamqueue/process',
  (req, res) => {

    if (teamQueue.size() === 0) {

      return res.status(400).json({

        error: 'คิวว่าง'

      });

    }

    // เอาทีมตัวแรกออกจาก Queue
    const team =
      teamQueue.dequeue();

    // บันทึกการทำงานลง Stack
    history.push({

      action: 'VIEW',

      team: team,

      time:
        new Date()
          .toLocaleTimeString('th-TH')

    });

    res.json({

      message:
        `ดูข้อมูล ${team.name} เรียบร้อย`,

      team: team,

      size:
        teamQueue.size()

    });

  }
);


// =====================================================================
// TODO 4 — STACK
// เก็บประวัติการทำงาน เพื่อทำ Undo
// =====================================================================

class Stack {

  constructor() {

    this.items = [];

  }

  // เพิ่มข้อมูลบน Stack
  push(item) {

    this.items.push(item);

  }

  // นำข้อมูลล่าสุดออกจาก Stack
  pop() {

    return this.items.pop();

  }

  // ดูข้อมูลล่าสุด
  peek() {

    return this.items[
      this.items.length - 1
    ];

  }

  // ตรวจสอบว่า Stack ว่างหรือไม่
  isEmpty() {

    return this.items.length === 0;

  }

  // แสดงประวัติจากล่าสุด → เก่าสุด
  display() {

    return [
      ...this.items
    ].reverse();

  }

}


// สร้าง Stack สำหรับประวัติ
const history = new Stack();


// ---------------------------------------------------------------------
// ดูประวัติ
// ---------------------------------------------------------------------

app.get('/history', (req, res) => {

  res.json({

    history:
      history.display(),

    size:
      history.items.length

  });

});


// ---------------------------------------------------------------------
// Undo
// ---------------------------------------------------------------------

app.post('/undo', (req, res) => {

  if (history.isEmpty()) {

    return res.status(400).json({

      error:
        'ไม่มีอะไรให้ย้อนกลับ'

    });

  }

  // เอาการทำงานล่าสุดออกจาก Stack
  const last =
    history.pop();


  // ---------------------------------------------------------------
  // ถ้าเป็น ADD
  // ให้เอาทีมที่ถูกเพิ่มออกจาก Queue
  // ---------------------------------------------------------------

  if (last.action === 'ADD') {

    // หา "ทีมล่าสุดที่มี id ตรงกัน"
    // แล้วลบออกเพียง 1 ตัว
    // ไม่ใช้ pop() เพราะทีมที่เพิ่มล่าสุด
    // อาจไม่ได้อยู่ท้าย Queue แล้ว

    for (
      let i =
        teamQueue.items.length - 1;
      i >= 0;
      i--
    ) {

      if (
        teamQueue.items[i].id ===
        last.team.id
      ) {

        teamQueue.items.splice(i, 1);

        break;

      }

    }

  }


  // ---------------------------------------------------------------
  // ถ้าเป็น VIEW
  // ให้เอาทีมกลับไปไว้หน้าสุดของ Queue
  // ---------------------------------------------------------------

  else if (
    last.action === 'VIEW'
  ) {

    teamQueue.items.unshift(
      last.team
    );

  }


  res.json({

    message:
      `ย้อน ${last.action} ของ ${last.team.name} แล้ว`,

    size:
      teamQueue.size()

  });

});


// =====================================================================
// START SERVER
// =====================================================================

loadTeams().then(() => {

  app.listen(
    PORT,
    () => {

      console.log(
        `🚀 LaLiga Dashboard: http://localhost:${PORT}`
      );

    }
  );

});