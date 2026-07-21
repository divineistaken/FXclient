import { definePatch } from "../modUtils.js"

export default definePatch(({ insertCode }) => {
  // keep a rolling history of last 5 replays.
  insertCode(
    `this.a5h = bC.a5u.a0a(); /* here */`,
    `__fx.replayHistory.save(this.a5h);`
  )
})