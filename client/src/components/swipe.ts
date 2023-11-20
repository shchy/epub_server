import { ref } from 'vue'

interface Pos {
  x: number
  y: number
}
type SwipeEvent = 'up' | 'down' | 'left' | 'right'
interface SwipeCallback {
  type: SwipeEvent
  callback: () => void
}

export const swipeGesture = (elm: HTMLElement) => {
  const events = ref<SwipeCallback[]>([])
  const onPos = ref<Pos>()

  elm.addEventListener('touchstart', (e: TouchEvent) => {
    if (e.touches.length != 1) return
    onPos.value = {
      x: e.touches[0].screenX,
      y: e.touches[0].screenY
    }
  })
  elm.addEventListener('touchend', (e: TouchEvent) => {
    if (!onPos.value) return
    if (e.touches.length != 1) return

    handle(onPos.value, {
      x: e.touches[0].screenX,
      y: e.touches[0].screenY
    })
    onPos.value = undefined
  })
  const handle = (s: Pos, e: Pos) => {
    if (s.x < e.x) {
      events.value.filter((x) => x.type == 'right').forEach((x) => x.callback())
    }
    if (e.x < s.x) {
      events.value.filter((x) => x.type == 'left').forEach((x) => x.callback())
    }
    if (s.y < e.y) {
      events.value.filter((x) => x.type == 'down').forEach((x) => x.callback())
    }
    if (e.y < s.y) {
      events.value.filter((x) => x.type == 'up').forEach((x) => x.callback())
    }
  }

  const register = (type: SwipeEvent, cb: () => void) => {
    events.value.push({ type: type, callback: cb })
  }

  return {
    register
  }
}
