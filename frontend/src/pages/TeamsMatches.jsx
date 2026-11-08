
import { useEffect, useState } from 'react'
import { getTeams } from '../services/api'

export default function TeamsMatches() {
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError('')

        const result = await getTeams('selection')
        const teamList = result.data || []

        setTeams(teamList)

        if (teamList.length > 0) {
          setSelectedTeam(teamList[0])
        }
      } catch (err) {
        setError(err.message || 'โหลดข้อมูลทีมไม่สำเร็จ')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredTeams = teams.filter(team =>
    team.name?.toLowerCase().includes(search.toLowerCase())
  )

  function formatDate(value) {
    if (!value) return '-'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return value

    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  function getOpponent(match) {
    return (
      match.opponent ||
      match.opponentName ||
      match.teamName ||
      match.name ||
      'ไม่ระบุทีม'
    )
  }

  function getScore(match) {
    if (match.score) return match.score

    if (
      match.goals !== undefined &&
      match.opponentGoals !== undefined
    ) {
      return `${match.goals} - ${match.opponentGoals}`
    }

    return '-'
  }

  return (
    <main className="teams-page">
      <div className="teams-page-header">
        <div>
          <span className="eyebrow">LA LIGA EA SPORTS</span>
          <h2>ทีมและการแข่งขัน</h2>
          <p>ข้อมูลทีม ตารางคะแนน และผลการแข่งขัน</p>
        </div>

        <div className="teams-count">
          <strong>{teams.length}</strong>
          <span>Teams</span>
        </div>
      </div>

      {loading && (
        <div className="panel teams-message">
          <div className="spinner"></div>
          <p>กำลังโหลดข้อมูลทีม...</p>
        </div>
      )}

      {error && (
        <div className="panel teams-message">
          <p className="empty-message">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="teams-layout">

          {/* TEAM LIST */}
          <section className="panel teams-list-panel">
            <div className="teams-section-header">
              <div>
                <span className="eyebrow">ALL CLUBS</span>
                <h3>รายชื่อทีม</h3>
              </div>
            </div>

            <input
              className="team-search"
              type="text"
              placeholder="ค้นหาชื่อทีม..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />

            <div className="teams-grid">
              {filteredTeams.map(team => (
                <button
                  type="button"
                  key={team.id}
                  className={`team-card ${
                    selectedTeam?.id === team.id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedTeam(team)}
                >
                  <img
                    src={team.logo || ''}
                    alt={team.name}
                  />

                  <span>{team.name}</span>

                  <strong>{team.points} PTS</strong>
                </button>
              ))}

              {filteredTeams.length === 0 && (
                <p className="empty-message">
                  ไม่พบทีมที่ค้นหา
                </p>
              )}
            </div>
          </section>

          {/* TEAM DETAILS */}
          <section className="panel team-detail-panel">
            {selectedTeam ? (
              <>
                <div className="team-detail-header">
                  <div className="team-detail-identity">
                    <img
                      src={selectedTeam.logo || ''}
                      alt={selectedTeam.name}
                    />

                    <div>
                      <span className="eyebrow">TEAM PROFILE</span>
                      <h2>{selectedTeam.name}</h2>
                      <p>อันดับที่ {selectedTeam.rank} ในลีก</p>
                    </div>
                  </div>
                </div>

                {/* TEAM STATISTICS */}
                <div className="team-stats">
                  <div>
                    <span>คะแนน</span>
                    <strong>{selectedTeam.points ?? '-'}</strong>
                  </div>

                  <div>
                    <span>แข่ง</span>
                    <strong>{selectedTeam.matches ?? '-'}</strong>
                  </div>

                  <div>
                    <span>ชนะ</span>
                    <strong>{selectedTeam.won ?? '-'}</strong>
                  </div>

                  <div>
                    <span>เสมอ</span>
                    <strong>{selectedTeam.draw ?? '-'}</strong>
                  </div>

                  <div>
                    <span>แพ้</span>
                    <strong>{selectedTeam.lost ?? '-'}</strong>
                  </div>

                  <div>
                    <span>ผลต่างประตู</span>
                    <strong>{selectedTeam.goalDiff ?? '-'}</strong>
                  </div>
                </div>

                {/* NEXT MATCH */}
                <div className="next-match">
                  <h3>การแข่งขันนัดถัดไป</h3>

                  {selectedTeam.nextMatch ? (
                    <div className="next-match-info">
                      <strong>
                        {getOpponent(selectedTeam.nextMatch)}
                      </strong>

                      <span>
                        {formatDate(selectedTeam.nextMatch.date)}
                      </span>
                    </div>
                  ) : (
                    <p>ไม่มีข้อมูลการแข่งขันนัดถัดไป</p>
                  )}
                </div>

                {/* RECENT MATCHES */}
                <div className="team-matches-section">
                  <div className="section-title">
                    <h3>ผลการแข่งขันที่ผ่านมา</h3>
                    <span>
                      {(selectedTeam.matchesDetail || []).length} นัด
                    </span>
                  </div>

                  {(selectedTeam.matchesDetail || []).length > 0 ? (
                    <div className="team-matches-list">
                      {selectedTeam.matchesDetail.map((match, index) => (
                        <div className="match-row" key={index}>
                          <span className="match-date">
                            {formatDate(match.date)}
                          </span>

                          <span className="match-opponent">
                            {getOpponent(match)}
                          </span>

                          <strong className="match-score">
                            {getScore(match)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-message">
                      ยังไม่มีข้อมูลผลการแข่งขัน
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="empty-message">
                เลือกทีมเพื่อดูรายละเอียด
              </p>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
