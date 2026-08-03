import { describe, it, expect } from 'vitest'
import { sparklinePoints } from './sparkline.js'

describe('sparklinePoints', () => {
  it('меньше двух точек — рисовать нечего', () => {
    expect(sparklinePoints([])).toBeNull()
    expect(sparklinePoints([100])).toBeNull()
  })

  it('растущий вес идёт вниз по Y (меньше Y — выше на экране)', () => {
    const r = sparklinePoints([80, 100], { width: 100, height: 40, padding: 0 })
    const [, first] = r.points.split(' ')
    const [x1, y1] = r.points.split(' ')[0].split(',').map(Number)
    const [x2, y2] = r.points.split(' ')[1].split(',').map(Number)
    expect(x2).toBeGreaterThan(x1)
    expect(y2).toBeLessThan(y1)
  })

  it('одинаковые значения — ровная линия по середине', () => {
    const r = sparklinePoints([100, 100, 100], { width: 100, height: 40, padding: 0 })
    const ys = r.points.split(' ').map((p) => Number(p.split(',')[1]))
    expect(ys[0]).toBe(ys[1])
    expect(ys[1]).toBe(ys[2])
  })

  it('last указывает на координаты последней точки', () => {
    const r = sparklinePoints([80, 90, 100], { width: 100, height: 40, padding: 0 })
    const lastPoint = r.points.split(' ').at(-1).split(',').map(Number)
    expect(r.last.x).toBeCloseTo(lastPoint[0])
    expect(r.last.y).toBeCloseTo(lastPoint[1])
  })
})
