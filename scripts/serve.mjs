import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'

const root = resolve(process.argv[2] || 'dist')
const port = Number(process.env.PORT || 4173)
const mount = process.env.SERVE_BASE || '/'
if (!mount.startsWith('/') || !mount.endsWith('/'))
  throw new Error('SERVE_BASE должен начинаться и заканчиваться /')
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.json': 'application/json',
}
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost')
    if (!url.pathname.startsWith(mount)) {
      res.writeHead(404)
      res.end('Not found')
      return
    }
    const pathname = decodeURIComponent(url.pathname.slice(mount.length)) || 'index.html'
    const file = resolve(root, pathname)
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403)
      res.end()
      return
    }
    const info = await stat(file)
    if (!info.isFile()) {
      res.writeHead(404)
      res.end()
      return
    }
    const data = await readFile(file)
    const range = req.headers.range
    if (range && /\.(wav|mp3)$/.test(file)) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range)
      if (match) {
        const start = Number(match[1])
        const end = Math.min(match[2] === '' ? data.length - 1 : Number(match[2]), data.length - 1)
        if (start > end || start >= data.length) {
          res.writeHead(416, { 'Content-Range': `bytes */${data.length}` })
          res.end()
          return
        }
        res.writeHead(206, {
          'Content-Type': types[extname(file)],
          'Content-Range': `bytes ${start}-${end}/${data.length}`,
          'Content-Length': end - start + 1,
          'Accept-Ranges': 'bytes',
        })
        res.end(data.subarray(start, end + 1))
        return
      }
    }
    res.writeHead(200, {
      'Content-Type': types[extname(file)] || 'application/octet-stream',
      'Content-Length': data.length,
      'Accept-Ranges': 'bytes',
    })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
})
server.listen(port, '127.0.0.1', () => console.log(`Подарок: http://127.0.0.1:${port}${mount}`))
