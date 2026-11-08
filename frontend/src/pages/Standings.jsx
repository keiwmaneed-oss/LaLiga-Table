
import { useEffect, useState } from 'react'
import {
  getTeams,
  getQueue,
  addToQueue,
  processQueue,
  getHistory,
  undoAction,
  getScorers
} from '../services/api'

function Standings() {
  const [teams, setTeams] = useState([])
  const [algorithm, setAlgorithm] = useState('selection')
  const [queue, setQueue] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [showQueue, setShowQueue] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const [scorers, setScorers] = useState([])
  const [scorersError, setScorersError] = useState('')
  const [showAllScorers, setShowAllScorers] = useState(false)

  async function loadTeams(algo = algorithm) {
    try {
      setLoading(true)
      setError('')
      const result = await getTeams(algo)
      setTeams(result.data || [])
    } catch (err) {
      setError(err.message || 'โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  async function loadScorers() {
    try {
      setScorersError('')
      const result = await getScorers()
      setScorers(Array.isArray(result) ? result : [])
    } catch (err) {
      console.error('โหลดดาวซัลโวไม่สำเร็จ:', err)
      setScorersError('ไม่สามารถโหลดข้อมูลดาวซัลโวได้')
    }
  }

  async function loadQueue() {
    try {
      const result = await getQueue()
      setQueue(result.items || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function loadHistory() {
    try {
      const result = await getHistory()
      setHistory(result.display || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadTeams(algorithm)
    loadQueue()
    loadHistory()
    loadScorers()
  }, [algorithm])

  function getZone(rank) {
    if (rank <= 4) return 'zone-cl'
    if (rank === 5) return 'zone-europa'
    if (rank === 6) return 'zone-conference'
    if (rank >= 18) return 'zone-relegation'
    return ''
  }

  async function handleAddQueue(team) {
    try {
      await addToQueue(team.id)
      setMessage(`เพิ่ม ${team.name} เข้าคิวแล้ว`)
      await loadQueue()
      await loadHistory()
    } catch (err) {
      setMessage(err.message || 'เพิ่มทีมไม่สำเร็จ')
    }
  }

  async function handleProcessQueue() {
    try {
      const result = await processQueue()
      setMessage(result.message || 'ดำเนินการกับทีมถัดไปแล้ว')
      await loadQueue()
      await loadHistory()
    } catch (err) {
      setMessage(err.message || 'ไม่สามารถดูทีมถัดไปได้')
    }
  }

  async function handleUndo() {
    try {
      const result = await undoAction()
      setMessage(result.message || 'Undo เรียบร้อยแล้ว')
      await loadQueue()
      await loadHistory()
    } catch (err) {
      setMessage(err.message || 'Undo ไม่สำเร็จ')
    }
  }

  function changeTeam(direction) {
    if (!selectedTeam || teams.length === 0) return

    const currentIndex = teams.findIndex(
      team => team.id === selectedTeam.id
    )

    const nextIndex =
      (currentIndex + direction + teams.length) % teams.length

    setSelectedTeam(teams[nextIndex])
  }

  function formatDate(value) {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString('th-TH')
  }

  function getMatchOpponent(match) {
    return (
      match.opponent ||
      match.opponentName ||
      match.teamName ||
      match.name ||
      'ไม่ระบุทีม'
    )
  }

  function getMatchScore(match) {
    if (match.score) return match.score

    if (
      match.goals !== undefined &&
      match.opponentGoals !== undefined
    ) {
      return `${match.goals} - ${match.opponentGoals}`
    }

    return '-'
  }

  function getHistoryText(item) {
    if (typeof item === 'string') return item
    if (!item) return '-'

    return (
      item.message ||
      item.description ||
      `${item.action || ''} ${item.teamName || item.name || ''}`.trim() ||
      JSON.stringify(item)
    )
  }

  function getQueuedTeam(item) {
    if (!item) return null

    const queuedTeam = item.team || item

    const teamId =
      queuedTeam.teamId ??
      queuedTeam.id ??
      item.teamId ??
      item.id

    const teamName =
      queuedTeam.name ||
      queuedTeam.teamName ||
      item.name ||
      item.teamName

    return (
      teams.find(team => String(team.id) === String(teamId)) ||
      teams.find(team => team.name === teamName) ||
      queuedTeam
    )
  }

  return (
    <>
      <div id="error">
        {error && <p>{error}</p>}
      </div>

      <div id="loading" style={{ display: loading ? 'flex' : 'none' }}>
        <div className="spinner"></div>
        <span>กำลังโหลดข้อมูล LaLiga...</span>
      </div>

      {message && (
        <p className="success-message">{message}</p>
      )}

      <main className="layout">
        <section className="main-column">
          <div className="panel standings-panel">
            <div className="panel-title">
              <div>
                <span className="eyebrow">LA LIGA</span>
                <h2>ตารางคะแนน</h2>
              </div>
            </div>

            <div className="zone-legend">
              <span><i className="zone cl"></i> Champions League</span>
              <span><i className="zone europa"></i> Europa League</span>
              <span><i className="zone conference"></i> Conference League</span>
              <span><i className="zone relegation"></i> Relegation</span>
            </div>

            <div className="table-head">
              <span>#</span>
              <span>ทีม</span>
              <span>แข่ง</span>
              <span>ชนะ</span>
              <span>เสมอ</span>
              <span>แพ้</span>
              <span>GD</span>
              <span>PTS</span>
              <span>คิว</span>
            </div>

            <div id="characters">
              {!loading && !error && teams.length === 0 && (
                <p className="empty-message">ไม่พบข้อมูลตารางคะแนน</p>
              )}

              {teams.map(team => (
                <div
                  className={`team-row ${getZone(team.rank)}`}
                  key={team.id}
                >
                  <span className="team-rank">{team.rank}</span>

                  <button
                    className="team-cell team-name"
                    type="button"
                    onClick={() => setSelectedTeam(team)}
                  >
                    {team.logo && (
                      <img
                        className="team-logo"
                        src={team.logo}
                        alt={team.name}
                      />
                    )}
                    <span>{team.name}</span>
                  </button>

                  <span className="stat">{team.matches}</span>
                  <span className="stat">{team.won}</span>
                  <span className="stat">{team.draw}</span>
                  <span className="stat">{team.lost}</span>
                  <span className="stat">{team.goalDiff}</span>
                  <strong className="points">{team.points}</strong>

                  <button
                    className="queue-button"
                    type="button"
                    title="เพิ่มทีมเข้าคิว"
                    onClick={() => handleAddQueue(team)}
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="side-column">
              <div className="panel scorer-panel">
      <div className="side-title">
        <div>
          <span className="eyebrow">TOP PLAYERS</span>
          <h2>ดาวซัลโว</h2>
        </div>
        <span className="title-icon">⚽</span>
      </div>

      <div className="scorer-list">
        {scorersError ? (
          <p className="empty-message">{scorersError}</p>
        ) : scorers.length > 0 ? (
          scorers.slice(0, showAllScorers ? 100 : 10).map((player, index) => (
            <div
              className="scorer-row"
              key={`${player.name}-${index}`}
            >
              <span className="scorer-rank">
                {player.rank || index + 1}
              </span>

              <div className="scorer-info">
                <strong>{player.name}</strong>
                <small>{player.team || 'ไม่ระบุทีม'}</small>
              </div>

              <strong className="scorer-goals">
                {player.goals} ⚽
              </strong>
            </div>
          ))
        ) : (
          <p className="empty-message">
            กำลังโหลดข้อมูลดาวซัลโว...
          </p>
        )}
      </div>

      {scorers.length > 10 && (
        <button
          className="scorer-more-button"
          type="button"
          onClick={() => setShowAllScorers(!showAllScorers)}
        >
          {showAllScorers
            ? 'ย่อรายการ ▲'
            : `ดูเพิ่มเติม (${Math.min(scorers.length, 100)} อันดับ) ▼`}
        </button>
      )}
    </div>

          <div className="panel summary-panel">
            <button
              className="summary-button"
              type="button"
              onClick={() => setShowQueue(true)}
            >
              <span className="summary-icon queue-icon">★</span>
              <span className="summary-copy">
                <strong>ทีมที่เลือก</strong>
                <small>Queue · ดูทีมถัดไป</small>
              </span>
              <span className="badge">{queue.length}</span>
            </button>
          </div>

          <div className="panel summary-panel">
            <button
              className="summary-button"
              type="button"
              onClick={() => setShowHistory(true)}
            >
              <span className="summary-icon history-icon">↶</span>
              <span className="summary-copy">
                <strong>ประวัติการทำงาน</strong>
                <small>Stack · Undo</small>
              </span>
              <span className="badge history-badge">
                {history.length}
              </span>
            </button>
          </div>
        </aside>
      </main>

      <dialog open={Boolean(selectedTeam)} id="characterModal">
        {selectedTeam && (
          <div className="team-modal">
            <div className="team-modal-header">
              <div className="team-modal-name">
                <img
                  src={selectedTeam.logo || ''}
                  alt={selectedTeam.name}
                />
                <div>
                  <span className="eyebrow">TEAM PROFILE</span>
                  <h2>{selectedTeam.name}</h2>
                </div>
              </div>

              <button
                className="icon-close"
                type="button"
                onClick={() => setSelectedTeam(null)}
              >
                ×
              </button>
            </div>

            <div className="team-stats">
              <div><span>คะแนน</span><strong>{selectedTeam.points}</strong></div>
              <div><span>แข่ง</span><strong>{selectedTeam.matches}</strong></div>
              <div><span>ชนะ</span><strong>{selectedTeam.won}</strong></div>
              <div><span>เสมอ</span><strong>{selectedTeam.draw}</strong></div>
              <div><span>แพ้</span><strong>{selectedTeam.lost}</strong></div>
              <div><span>ผลต่างประตู</span><strong>{selectedTeam.goalDiff}</strong></div>
            </div>

            <div className="next-match">
              <h3>การแข่งขันนัดถัดไป</h3>
              {selectedTeam.nextMatch
                ? <p>{getMatchOpponent(selectedTeam.nextMatch)} · {formatDate(selectedTeam.nextMatch.date)}</p>
                : <p>ไม่มีข้อมูลการแข่งขันนัดถัดไป</p>
              }
            </div>

            <div className="section-title">
              <h3>ผลการแข่งขันล่าสุด</h3>
            </div>

            <div id="modalMatches">
              {(selectedTeam.matchesDetail || []).length > 0 ? (
                selectedTeam.matchesDetail.map((match, index) => (
                  <div className="match-row" key={index}>
                    <span className="match-date">
                      {formatDate(match.date)}
                    </span>
                    <span className="match-opponent">
                      {getMatchOpponent(match)}
                    </span>
                    <strong className="match-score">
                      {getMatchScore(match)}
                    </strong>
                  </div>
                ))
              ) : (
                <p className="empty-message">ไม่มีข้อมูลผลการแข่งขัน</p>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={() => changeTeam(-1)}
              >
                ← ทีมก่อนหน้า
              </button>

              <button
                className="primary-button"
                type="button"
                onClick={() => changeTeam(1)}
              >
                ทีมถัดไป →
              </button>

              <button
                className="close-button"
                type="button"
                onClick={() => setSelectedTeam(null)}
              >
                ปิด
              </button>
            </div>
          </div>
        )}
      </dialog>

      <dialog open={showQueue} id="queueModal">
        <div className="popup-content">
          <div className="popup-header">
            <div>
              <span className="popup-eyebrow">QUEUE · FIFO</span>
              <h2>ทีมที่เลือก</h2>
            </div>
            <span className="badge">{queue.length}</span>
          </div>

          <ul className="popup-list queue-team-list">
            {queue.length > 0 ? (
              queue.map((item, index) => {
                const team = getQueuedTeam(item)

                return (
                  <li className="queue-team-card" key={item.id || index}>
                    <div className="queue-team-top">
                      <span className="queue-position">
                        คิวที่ {index + 1}
                      </span>

                      <div className="queue-team-name">
                        {team?.logo && (
                          <img
                            src={team.logo}
                            alt={team.name || 'ทีมฟุตบอล'}
                          />
                        )}

                        <strong>
                          {team?.name ||
                            team?.teamName ||
                            item.name ||
                            item.teamName ||
                            `ทีม ID: ${item.teamId || item.id}`}
                        </strong>
                      </div>
                    </div>

                    <div className="queue-team-stats">
                      <div><small>แข่ง</small><strong>{team?.matches ?? '-'}</strong></div>
                      <div><small>ชนะ</small><strong>{team?.won ?? '-'}</strong></div>
                      <div><small>เสมอ</small><strong>{team?.draw ?? '-'}</strong></div>
                      <div><small>แพ้</small><strong>{team?.lost ?? '-'}</strong></div>
                      <div><small>GD</small><strong>{team?.goalDiff ?? '-'}</strong></div>
                      <div><small>PTS</small><strong>{team?.points ?? '-'}</strong></div>
                    </div>

                    {team?.nextMatch && (
                      <div className="queue-next-match">
                        <small>การแข่งขันนัดถัดไป</small>
                        <p>
                          {getMatchOpponent(team.nextMatch)}
                          {' · '}
                          {formatDate(team.nextMatch.date)}
                        </p>
                      </div>
                    )}

                    {(team?.matchesDetail || []).length > 0 && (
                      <div className="queue-recent-matches">
                        <small>ผลการแข่งขันล่าสุด</small>
                        {team.matchesDetail.slice(0, 3).map((match, matchIndex) => (
                          <div className="queue-match-row" key={matchIndex}>
                            <span>{formatDate(match.date)}</span>
                            <span>{getMatchOpponent(match)}</span>
                            <strong>{getMatchScore(match)}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                )
              })
            ) : (
              <li className="empty-message">ยังไม่มีทีมในคิว</li>
            )}
          </ul>

          <div className="queue-modal-actions">
            <button
              className="primary-button"
              type="button"
              onClick={handleProcessQueue}
              disabled={queue.length === 0}
            >
              ดูทีมถัดไป →
            </button>

            <button
              className="close-button"
              type="button"
              onClick={() => setShowQueue(false)}
            >
              ปิด
            </button>
          </div>
        </div>
      </dialog>

      <dialog open={showHistory} id="historyModal">
        <div className="popup-content">
          <div className="popup-header">
            <div>
              <span className="popup-eyebrow history-eyebrow">STACK · LIFO</span>
              <h2>ประวัติการทำงาน</h2>
            </div>
            <span className="badge history-badge">{history.length}</span>
          </div>

          <ul className="popup-list history-list">
            {history.length > 0 ? history.map((item, index) => (
              <li key={index}>{getHistoryText(item)}</li>
            )) : (
              <li className="empty-message">ยังไม่มีประวัติการทำงาน</li>
            )}
          </ul>

          <div className="queue-modal-actions">
            <button
              className="warn-button"
              type="button"
              onClick={handleUndo}
              disabled={history.length === 0}
            >
              ↶ Undo ล่าสุด
            </button>

            <button
              className="close-button"
              type="button"
              onClick={() => setShowHistory(false)}
            >
              ปิด
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default Standings

