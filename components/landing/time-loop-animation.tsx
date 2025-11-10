"use client"

import { useEffect, useRef } from "react"

export function TimeLoopAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const timeBlocks = [
      { x: 150, y: 100, width: 80, height: 40, targetY: 100, color: "rgba(108, 123, 242, 0.8)" },
      { x: 150, y: 160, width: 120, height: 40, targetY: 160, color: "rgba(215, 185, 255, 0.8)" },
      { x: 150, y: 220, width: 100, height: 40, targetY: 220, color: "rgba(108, 123, 242, 0.6)" },
      { x: 150, y: 280, width: 90, height: 40, targetY: 280, color: "rgba(215, 185, 255, 0.6)" },
    ]

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2

      // Animate time blocks being rearranged
      const cycle = (Math.sin(time * 0.8) + 1) / 2 // 0 to 1

      timeBlocks.forEach((block, index) => {
        // Calculate rearrangement animation
        const shuffleOffset = Math.sin(time * 0.8 + index * 0.5) * 20
        const scaleEffect = 1 + Math.sin(time * 1.2 + index * 0.3) * 0.1

        // Draw time block with rounded corners
        const x = centerX - block.width / 2 + shuffleOffset
        const y = block.y
        const w = block.width * scaleEffect
        const h = block.height
        const radius = 8

        ctx.fillStyle = block.color
        ctx.beginPath()
        ctx.roundRect(x, y, w, h, radius)
        ctx.fill()

        // Draw resize handles
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
        ctx.beginPath()
        ctx.arc(x + w, y + h / 2, 4, 0, Math.PI * 2)
        ctx.fill()

        // Draw time label
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`${9 + index}:00`, x + w / 2, y + h / 2 + 4)
      })

      // Draw adjustment arrows
      const arrowOpacity = (Math.sin(time * 2) + 1) / 2
      ctx.strokeStyle = `rgba(108, 123, 242, ${arrowOpacity * 0.6})`
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      // Vertical adjustment arrow
      ctx.beginPath()
      ctx.moveTo(centerX + 100, 140)
      ctx.lineTo(centerX + 100, 240)
      ctx.stroke()

      // Arrow head
      ctx.beginPath()
      ctx.moveTo(centerX + 95, 235)
      ctx.lineTo(centerX + 100, 240)
      ctx.lineTo(centerX + 105, 235)
      ctx.stroke()

      ctx.setLineDash([])

      // Draw "조율 중..." text
      ctx.fillStyle = `rgba(108, 123, 242, ${0.4 + arrowOpacity * 0.4})`
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("조율 중...", centerX, 340)

      time += 0.02
      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} width={400} height={400} className="max-w-full h-auto" />
}
