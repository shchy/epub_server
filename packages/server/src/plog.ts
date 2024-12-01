interface LogPoint {
  name: string
  timestamp: number
}
export const plog = ({
  logname,
  disable,
}: {
  logname: string
  disable?: boolean
}) => {
  const points: LogPoint[] = []

  const reset = () => points.splice(0)

  const p = (name?: string) => {
    name = name ?? `p-${points.length.toString().padStart(4, '0')}`

    points.push({
      name: name,
      timestamp: performance.now(),
    })
  }

  const log = () => {
    if (disable) return
    const ps = points.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))
    const lines: string[] = []
    let preview: LogPoint | undefined = undefined
    for (const p of ps) {
      let durationMs = 0
      if (preview) {
        durationMs = Math.round(p.timestamp - preview.timestamp)
      }
      lines.push(`[${logname}]\tname:${p.name}\tduration:${durationMs}ms`)

      preview = p
    }

    for (const line of lines) {
      console.log(line)
    }
  }

  return {
    reset,
    p,
    log,
  }
}
