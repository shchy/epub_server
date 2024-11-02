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
  const marginPx = window.innerWidth / 10

  elm.addEventListener('touchstart', (e: TouchEvent) => {
    if (e.touches.length != 1) return
    onPos.value = {
      x: e.touches[0].screenX,
      y: e.touches[0].screenY
    }
  })
  elm.addEventListener('touchend', (e: TouchEvent) => {
    if (!onPos.value) return
    if (e.changedTouches.length != 1) return

    handle(onPos.value, {
      x: e.changedTouches[0].screenX,
      y: e.changedTouches[0].screenY
    })
    onPos.value = undefined
  })
  const handle = (s: Pos, e: Pos) => {
    const rightMove = e.x - s.x
    const leftMove = rightMove * -1
    const downMove = e.y - s.y
    const upMove = downMove * -1

    if (Math.abs(rightMove) > Math.abs(downMove)) {
      if (marginPx < rightMove) {
        events.value.filter((x) => x.type == 'right').forEach((x) => x.callback())
      } else if (marginPx < leftMove) {
        events.value.filter((x) => x.type == 'left').forEach((x) => x.callback())
      }
    } else {
      if (marginPx < downMove) {
        events.value.filter((x) => x.type == 'down').forEach((x) => x.callback())
      } else if (marginPx < upMove) {
        events.value.filter((x) => x.type == 'up').forEach((x) => x.callback())
      }
    }
  }

  const register = (type: SwipeEvent, cb: () => void) => {
    events.value.push({ type: type, callback: cb })
  }

  return {
    register
  }
}
