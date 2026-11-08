
import { useEffect, useState } from 'react'
import { getTeams } from '../services/api'

export default function Statistics() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadStatistics() {
      try {
        setLoading(true)
        setError('')

        const result = await getTeams('selection')
        setTeams(result.data || [])
      } catch (err) {
        setError(err.message || 'โหลดสถิติไม่สำเร็จ')
      } finally {
        setLoading(false)
      }
    }

    loadStatistics()
  }, [])

  // สถิติภาพรวม
  const totalTeams = teams.length

  const totalMatches = Math.round(
    teams.reduce((sum, team) => sum + Number(team.matches || 0), 0) / 2
  )

  const totalGoals = teams.reduce(
    (sum, team) => sum + Number(team.goals || 0),
    0
  )

  const averageGoals = totalMatches > 0
    ? (totalGoals / totalMatches).toFixed(2)
    : '0.00'

  // ทีมคะแนนสูงสุด
  const topTeam = [...teams].sort(
    (a, b) => Number(b.points || 0) - Number(a.points || 0)
  )[0]

  // ทีมยิงประตูมากที่สุด
  const topScoringTeam = [...teams].sort(
    (a, b) => Number(b.goals || 0) - Number(a.goals || 0)
  )[0]

  // ผลต่างประตูดีที่สุด
  const bestGoalDifference = [...teams].sort(
    (a, b) => Number(b.goalDiff || 0) - Number(a.goalDiff || 0)
  )[0]

  // ทีมที่ชนะมากที่สุด
  const mostWinsTeam = [...teams].sort(
    (a, b) => Number(b.won || 0) - Number(a.won || 0)
  )[0]

  // คำนวณจำนวนประตูที่เสีย
  function getConcededGoals(team) {
    return Number(team.goals || 0) - Number(team.goalDiff || 0)
  }

  // ทีมที่เสียประตูมากที่สุด
  const mostConcededTeam = [...teams].sort(
    (a, b) => getConcededGoals(b) - getConcededGoals(a)
  )[0]

  // 10 ทีมคะแนนสูงสุด
  const topTenTeams = [...teams]
    .sort((a, b) => Number(b.points || 0) - Number(a.points || 0))
    .slice(0, 10)

  const highestPoints = Math.max(
    ...topTenTeams.map(team => Number(team.points || 0)),
    1
  )

  // อันดับทีมตามจำนวนประตู
  const goalRanking = [...teams]
    .sort((a, b) => Number(b.goals || 0) - Number(a.goals || 0))

  function formatNumber(value) {
    return Number(value || 0).toLocaleString('th-TH')
  }

  if (loading) {
    return (
      <main className="statistics-page">
        <div className="panel statistics-message">
          <div className="spinner"></div>
          <p>กำลังโหลดข้อมูลสถิติลีก...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="statistics-page">
        <div className="panel statistics-message">
          <p className="empty-message">{error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="statistics-page">

      {/* HEADER */}
      <div className="statistics-header">
        <div>
          <span className="eyebrow">LA LIGA EA SPORTS</span>
          <h2>สถิติลีก</h2>
          <p>ภาพรวมข้อมูลและผลงานของทุกทีมในลีก</p>
        </div>

        <div className="statistics-season">
          <span>LEAGUE DATA</span>
          <strong>2026</strong>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="panel statistics-message">
          <p className="empty-message">ไม่มีข้อมูลสถิติ</p>
        </div>
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <section className="statistics-cards">

            <div className="panel stat-card">
              <div className="stat-card-icon">⚽</div>
              <span>จำนวนทีม</span>
              <strong>{formatNumber(totalTeams)}</strong>
              <small>Teams</small>
            </div>

            <div className="panel stat-card">
              <div className="stat-card-icon">🏟️</div>
              <span>การแข่งขันทั้งหมด</span>
              <strong>{formatNumber(totalMatches)}</strong>
              <small>Matches</small>
            </div>

            <div className="panel stat-card">
              <div className="stat-card-icon">🥅</div>
              <span>ประตูรวม</span>
              <strong>{formatNumber(totalGoals)}</strong>
              <small>Goals</small>
            </div>

            <div className="panel stat-card">
              <div className="stat-card-icon">📊</div>
              <span>ประตูเฉลี่ยต่อแมตช์</span>
              <strong>{averageGoals}</strong>
              <small>Goals / Match</small>
            </div>

          </section>

          {/* BEST TEAMS */}
          <section className="statistics-best-grid">

            {/* ทีมคะแนนสูงสุด */}
            <div className="panel best-team-card">
              <span className="eyebrow">TOP OF THE LEAGUE</span>
              <h3>ทีมคะแนนสูงสุด</h3>

              {topTeam && (
                <div className="best-team-content">
                  <img src={topTeam.logo || ''} alt={topTeam.name} />
                  <div>
                    <strong>{topTeam.name}</strong>
                    <span>{topTeam.points} คะแนน</span>
                  </div>
                </div>
              )}
            </div>

            {/* ทีมยิงประตูมากที่สุด */}
            <div className="panel best-team-card">
              <span className="eyebrow">TOP SCORING TEAM</span>
              <h3>ทีมยิงประตูมากที่สุด</h3>

              {topScoringTeam && (
                <div className="best-team-content">
                  <img
                    src={topScoringTeam.logo || ''}
                    alt={topScoringTeam.name}
                  />
                  <div>
                    <strong>{topScoringTeam.name}</strong>
                    <span>{topScoringTeam.goals ?? 0} ประตู</span>
                  </div>
                </div>
              )}
            </div>

            {/* ผลต่างประตูดีที่สุด */}
            <div className="panel best-team-card">
              <span className="eyebrow">BEST GOAL DIFFERENCE</span>
              <h3>ผลต่างประตูดีที่สุด</h3>

              {bestGoalDifference && (
                <div className="best-team-content">
                  <img
                    src={bestGoalDifference.logo || ''}
                    alt={bestGoalDifference.name}
                  />
                  <div>
                    <strong>{bestGoalDifference.name}</strong>
                    <span>GD {bestGoalDifference.goalDiff}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ทีมชนะมากที่สุด */}
            <div className="panel best-team-card">
              <span className="eyebrow">MOST WINS</span>
              <h3>ทีมที่ชนะมากที่สุด</h3>

              {mostWinsTeam && (
                <div className="best-team-content">
                  <img
                    src={mostWinsTeam.logo || ''}
                    alt={mostWinsTeam.name}
                  />
                  <div>
                    <strong>{mostWinsTeam.name}</strong>
                    <span>{mostWinsTeam.won} ชนะ</span>
                  </div>
                </div>
              )}
            </div>

            {/* ทีมเสียประตูมากที่สุด */}
            <div className="panel best-team-card">
              <span className="eyebrow">MOST GOALS CONCEDED</span>
              <h3>ทีมที่เสียประตูมากที่สุด</h3>

              {mostConcededTeam && (
                <div className="best-team-content">
                  <img
                    src={mostConcededTeam.logo || ''}
                    alt={mostConcededTeam.name}
                  />
                  <div>
                    <strong>{mostConcededTeam.name}</strong>
                    <span>
                      {getConcededGoals(mostConcededTeam)} ประตู
                    </span>
                  </div>
                </div>
              )}
            </div>

          </section>

          {/* POINTS CHART */}
          <section className="panel statistics-chart-panel">
            <div className="statistics-section-header">
              <div>
                <span className="eyebrow">POINTS COMPARISON</span>
                <h3>เปรียบเทียบคะแนน 10 อันดับแรก</h3>
              </div>
              <span className="chart-label">PTS</span>
            </div>

            <div className="points-chart">
              {topTenTeams.map((team, index) => (
                <div className="points-chart-row" key={team.id}>
                  <span className="chart-rank">{index + 1}</span>

                  <div className="chart-team">
                    {team.logo && (
                      <img src={team.logo} alt={team.name} />
                    )}
                    <span>{team.name}</span>
                  </div>

                  <div className="chart-bar-background">
                    <div
                      className="chart-bar"
                      style={{
                        width: `${Math.max(
                          (Number(team.points || 0) / highestPoints) * 100,
                          1
                        )}%`
                      }}
                    />
                  </div>

                  <strong className="chart-value">
                    {team.points}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          {/* GOAL RANKING */}
          <section className="panel goal-ranking-panel">
            <div className="statistics-section-header">
              <div>
                <span className="eyebrow">GOAL RANKING</span>
                <h3>อันดับทีมตามจำนวนประตู</h3>
              </div>
            </div>

            <div className="goal-ranking-table">
              <div className="goal-ranking-head">
                <span>อันดับ</span>
                <span>ทีม</span>
                <span>แข่ง</span>
                <span>ประตู</span>
                <span>GD</span>
              </div>

              {goalRanking.map((team, index) => (
                <div className="goal-ranking-row" key={team.id}>
                  <strong>{index + 1}</strong>

                  <div className="goal-ranking-team">
                    {team.logo && (
                      <img src={team.logo} alt={team.name} />
                    )}
                    <span>{team.name}</span>
                  </div>

                  <span>{team.matches}</span>
                  <strong className="goal-number">
                    {team.goals ?? 0}
                  </strong>
                  <span>{team.goalDiff}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  )
}
