const express = require('express')
const path = require('path')
const app = express()

app.use(express.static(path.join(__dirname, '../dist')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  next()
})

// Endpoint de ping para detectar LAN
app.get('/ping', (req, res) => res.json({ status: 'ok', time: Date.now() }))

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

const PORT = process.env.PORT || 80
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ EduPlataforma en http://192.168.1.50:${PORT}`)
})
