
async function request(url, options = {}) {
  const response = await fetch(url, options)
  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ')
  }

  return result
}

export function getTeams(algo = 'selection') {
  return request(`/teams?algo=${algo}`)
}

export function getQueue() {
  return request('/teamqueue')
}

export function addToQueue(teamId) {
  return request('/teamqueue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId })
  })
}

export function processQueue() {
  return request('/teamqueue/process', {
    method: 'DELETE'
  })
}

export function getHistory() {
  return request('/history')
}

export function undoAction() {
  return request('/undo', {
    method: 'POST'
  })
}
export function getScorers() {
  return request('/scorers')
}