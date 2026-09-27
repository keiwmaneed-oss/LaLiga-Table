const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const API_URL = 'https://api.openligadb.de/getbltable/la1/2026';
const MATCHES_URL = 'https://api.openligadb.de/getmatchdata/la1/2026';

let teams = [];


// ================= TOP SCORERS =================

const topScorers = [
  {
    rank: 1,
    name: 'Raphinha',
    team: 'Barcelona',
    goals: 12
  },
  {
    rank: 2,
    name: 'Sergio Camello',
    team: 'Rayo Vallecano',
    goals: 7
  },
  {
    rank: 2,
    name: 'Kylian Mbappe',
    team: 'Real Madrid',
    goals: 7
  }
];


// ================= LOAD TEAMS =================

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


    const matchesByTeam = new Map();
    const upcomingMatchesByTeam = new Map();


    for (const match of matches) {

      // ================= UPCOMING =================

      if (!match.matchIsFinished) {

        const upcoming = {
          date: match.matchDateTime,
          homeTeam: match.team1.teamName,
          awayTeam: match.team2.teamName
        };

        [
          match.team1.teamId,
          match.team2.teamId
        ].forEach(teamId => {

          const current =
            upcomingMatchesByTeam.get(teamId);

          if (
            !current ||
            new Date(upcoming.date) <
            new Date(current.date)
          ) {

            upcomingMatchesByTeam.set(
              teamId,
              upcoming
            );

          }

        });

        continue;
      }


      // ================= FINISHED MATCH =================

      const result =
        match.matchResults.find(
          item => item.resultTypeID === 2
        ) ||
        match.matchResults[
          match.matchResults.length - 1
        ];

      if (!result) continue;


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

            opponent:
              opponent.teamName,

            opponentLogo:
              opponent.teamIconUrl,

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


    // ================= TEAM DATA =================

    teams = data.map(team => ({

      id: Number(team.teamInfoId),

      name: team.teamName,

      logo: team.teamIconUrl,

      rank: Number(team.rank),

      points: Number(team.points),

      matches: Number(team.matches),

      won: Number(team.won),

      draw: Number(team.draw),

      lost: Number(team.lost),

      goals: Number(team.goals),

      opponentGoals:
        Number(team.opponentGoals),

      goalDiff:
        Number(team.goalDiff),

      matchesDetail:
        matchesByTeam.get(
          team.teamInfoId
        ) || [],

      nextMatch:
        upcomingMatchesByTeam.get(
          team.teamInfoId
        ) || null

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


// ================= SORT =================

function selectionSort(arr) {

  const result = [...arr];

  for (
    let i = 0;
    i < result.length - 1;
    i++
  ) {

    let maxIndex = i;

    for (
      let j = i + 1;
      j < result.length;
      j++
    ) {

      if (
        result[j].points >
        result[maxIndex].points
      ) {

        maxIndex = j;

      }

    }


    if (maxIndex !== i) {

      [
        result[i],
        result[maxIndex]
      ] = [
        result[maxIndex],
        result[i]
      ];

    }

  }

  return result;

}


function insertionSort(arr) {

  const result = [...arr];

  for (
    let i = 1;
    i < result.length;
    i++
  ) {

    const current = result[i];

    let j = i - 1;

    while (
      j >= 0 &&
      result[j].points < current.points
    ) {

      result[j + 1] =
        result[j];

      j--;

    }

    result[j + 1] = current;

  }

  return result;

}


function bubbleSort(arr) {

  const result = [...arr];

  for (
    let i = 0;
    i < result.length;
    i++
  ) {

    for (
      let j = 0;
      j < result.length - i - 1;
      j++
    ) {

      if (
        result[j].points <
        result[j + 1].points
      ) {

        [
          result[j],
          result[j + 1]
        ] = [
          result[j + 1],
          result[j]
        ];

      }

    }

  }

  return result;

}


// ================= TEAMS API =================

app.get('/teams', (req, res) => {

  const algo =
    req.query.algo || 'selection';

  const start =
    performance.now();

  let sortedTeams;


  if (algo === 'insertion') {

    sortedTeams =
      insertionSort(teams);

  } else if (algo === 'bubble') {

    sortedTeams =
      bubbleSort(teams);

  } else {

    sortedTeams =
      selectionSort(teams);

  }


  const end =
    performance.now();


  // สร้างอันดับใหม่จากผล Sort
  // เพื่อให้หน้าเว็บได้อันดับ 1 - 20 แน่นอน

  const rankedTeams =
    sortedTeams.map((team, index) => ({

      ...team,

      rank: index + 1

    }));


  res.json({

    algorithm:
      algo === 'insertion'
        ? 'Insertion Sort'
        : algo === 'bubble'
          ? 'Bubble Sort'
          : 'Selection Sort',

    count:
      rankedTeams.length,

    ms:
      Number((end - start).toFixed(3)),

    data:
      rankedTeams

  });

});


// ================= SCORERS API =================

app.get('/scorers', (req, res) => {

  res.json(topScorers);

});


// ================= QUEUE =================

class Queue {

  constructor() {

    this.items = [];

  }


  enqueue(item) {

    this.items.push(item);

  }


  dequeue() {

    return this.items.shift();

  }


  peek() {

    return this.items[0];

  }


  size() {

    return this.items.length;

  }

}


const queue = new Queue();


// ================= STACK =================

class Stack {

  constructor() {

    this.items = [];

  }


  push(item) {

    this.items.push(item);

  }


  pop() {

    return this.items.pop();

  }


  peek() {

    return this.items[
      this.items.length - 1
    ];

  }


  isEmpty() {

    return this.items.length === 0;

  }


  display() {

    return [
      ...this.items
    ].reverse();

  }

}


const history = new Stack();


// ================= QUEUE GET =================

app.get('/teamqueue', (req, res) => {

  res.json({

    items:
      queue.items,

    size:
      queue.size(),

    next:
      queue.peek() || null

  });

});


// ================= QUEUE ADD =================

app.post('/teamqueue', (req, res) => {

  const teamId =
    Number(req.body.teamId);


  const team =
    teams.find(
      item =>
        Number(item.id) === teamId
    );


  if (!team) {

    return res.status(404).json({

      error: 'ไม่พบทีมนี้',

      receivedTeamId:
        req.body.teamId

    });

  }


  const alreadyInQueue =
    queue.items.some(
      item =>
        Number(item.id) === teamId
    );


  if (alreadyInQueue) {

    return res.status(400).json({

      error: 'ทีมนี้อยู่ในคิวแล้ว'

    });

  }


  queue.enqueue(team);


  history.push({

    action: 'ADD',

    team: team,

    time:
      new Date().toISOString()

  });


  res.json({

    message:
      'เพิ่มทีมเข้าคิวสำเร็จ',

    items:
      queue.items,

    size:
      queue.size()

  });

});


// ================= QUEUE PROCESS =================

app.delete(
  '/teamqueue/process',
  (req, res) => {

    if (queue.size() === 0) {

      return res.status(400).json({

        error: 'ไม่มีทีมในคิว'

      });

    }


    const team =
      queue.dequeue();


    history.push({

      action: 'VIEW',

      team: team,

      time:
        new Date().toISOString()

    });


    res.json({

      message:
        'ดูทีมถัดไปสำเร็จ',

      team:
        team,

      size:
        queue.size(),

      items:
        queue.items

    });

  }
);


// ================= HISTORY =================

app.get('/history', (req, res) => {

  res.json({

    display:
      history.display(),

    size:
      history.items.length

  });

});


// ================= UNDO =================

app.post('/undo', (req, res) => {

  if (history.isEmpty()) {

    return res.status(400).json({

      error: 'ไม่มีอะไรให้ Undo'

    });

  }


  const last =
    history.pop();


  // Undo การเพิ่มทีมเข้าคิว

  if (last.action === 'ADD') {

    const teamId =
      Number(last.team.id);


    for (
      let i = queue.items.length - 1;
      i >= 0;
      i--
    ) {

      if (
        Number(queue.items[i].id) ===
        teamId
      ) {

        queue.items.splice(i, 1);

        break;

      }

    }

  }


  // Undo การดูทีม

  else if (last.action === 'VIEW') {

    if (last.team) {

      queue.items.unshift(
        last.team
      );

    }

  }


  res.json({

    message:
      'Undo สำเร็จ',

    action:
      last.action,

    team:
      last.team,

    queue:
      queue.items,

    history:
      history.display()

  });

});


// ================= START SERVER =================

async function startServer() {

  await loadTeams();

  app.listen(PORT, () => {

    console.log(
      `🚀 Server running at http://localhost:${PORT}`
    );

  });

}


startServer();