import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

interface XPFloatItem {
  id: string
  amount: number
  x: number
  y: number
}

let addXPFloatFn: ((amount: number, x?: number, y?: number) => void) | null = null

export function mostrarXPFloat(amount: number, x?: number, y?: number) {
  if (addXPFloatFn) {
    addXPFloatFn(amount, x, y)
  }
}

export default function XPFloat() {
  const [items, setItems] = useState<XPFloatItem[]>([])

  useEffect(() => {
    addXPFloatFn = (amount: number, x?: number, y?: number) => {
      const id = crypto.randomUUID()
      setItems((prev) => [
        ...prev,
        {
          id,
          amount,
          x: x ?? window.innerWidth / 2,
          y: y ?? window.innerHeight / 2
        }
      ])

      // Auto-remove after animation
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== id))
      }, 1500)
    }

    return () => {
      addXPFloatFn = null
    }
  }, [])

  if (items.length === 0) return null

  return ReactDOM.createPortal(
    <>
      {items.map((item) => (
        <div
          key={item.id}
          className="xp-float"
          style={{ left: item.x - 30, top: item.y - 20 }}
        >
          +{item.amount} XP
        </div>
      ))}
    </>,
    document.body
  )
}
