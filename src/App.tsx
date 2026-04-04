import { useState, useEffect } from "react"


type Obj = {
  id: number
  type: "panel" | "platform"
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
  name: string
}

function App() {
  const [objects, setObjects] = useState<Obj[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [moveDir, setMoveDir] = useState<{x: number, y: number} | null>(null)

  const [rotatingId, setRotatingId] = useState<number | null>(null)
  const [isRotatingButton, setIsRotatingButton] = useState(false)

  const stageWidth = 2002
  const stageHeight = 1638
  const [rightOpen, setRightOpen] = useState(false)
  const selectedObj = objects.find(o => o.id === selectedId)
  const [isExporting, setIsExporting] = useState(false)
  const [curtain, setCurtain] = useState(0) // 0〜1
  const [isTouching, setIsTouching] = useState(false)
  const isMobile = window.innerWidth < 768
  const getNextNumber = (type: string) => {
  return objects.filter(o => o.name.startsWith(type)).length + 1
}

// 移動
useEffect(() => {
  if (!moveDir || !selectedId) return

  const interval = setInterval(() => {
    setObjects(prev =>
      prev.map(obj =>
        obj.id === selectedId
          ? {
              ...obj,
              x: obj.x + moveDir.x * 5,
              y: obj.y + moveDir.y * 5
            }
          : obj
      )
    )
  }, 16)

  return () => clearInterval(interval)
}, [moveDir, selectedId])

// 回転
useEffect(() => {
  if (!isRotatingButton || !selectedId) return

  const interval = setInterval(() => {
    setObjects(prev =>
      prev.map(obj =>
        obj.id === selectedId
          ? { ...obj, rotation: obj.rotation + 2 }
          : obj
      )
    )
  }, 16)

  return () => clearInterval(interval)
}, [isRotatingButton, selectedId])
  return (
    <div
    style={{
      userSelect: "none",
      WebkitUserSelect: "none",
      touchAction: "manipulation"
    }}
    > 
      <h1>舞台図エディタ</h1>

      
<div style={{
  width: "100%",
  maxWidth: 1200,
  margin: "0 auto"
}}>
<svg
  id="stage-svg"
  viewBox={`0 0 ${stageWidth} ${stageHeight}`}
  preserveAspectRatio="xMidYMid meet"
  style={{
    width: "100%",
    height: isMobile ? "55vh" : "70vh",
    aspectRatio: `${stageWidth} / ${stageHeight}`,
    border: "1px solid black",
    touchAction: isTouching ? "none" : "auto",
    display: "block",
    margin: "0 auto"
  }}


  onPointerUp={() => {
    setIsTouching(false)
    setDraggingId(null)
    setRotatingId(null)
  }}

  onPointerCancel={() => {
  setIsTouching(false)
  setDraggingId(null)
  setRotatingId(null)
  }}

  onPointerMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * stageWidth
    const mouseY = ((e.clientY - rect.top) / rect.height) * stageHeight

    // ドラッグ
    if (draggingId !== null) {
      setObjects(prev =>
        prev.map(obj =>
          obj.id === draggingId
            ? { ...obj, x: mouseX - offset.x, y: mouseY - offset.y }
            : obj
        )
      )
    }

    // 回転
    if (rotatingId !== null) {
      setObjects(prev =>
        prev.map(obj => {
          if (obj.id !== rotatingId) return obj

          const centerX = obj.x + obj.width / 2
          const centerY = obj.y + obj.height / 2

          const angle =
            (Math.atan2(mouseY - centerY, mouseX - centerX) * 180) / Math.PI

          return { ...obj, rotation: angle }
        })
      )
    }
  }}
>
        
        {/* 背景 */}
        <rect x="0" y="0" width={stageWidth} height={stageHeight} fill="white" />
{/* 幕（左：なめらか波） */}
<path
  d={(() => {
    const offset = stageWidth * curtain / 2
    const centerY = stageHeight / 2
    const amplitude = 20   // 波の高さ
    const wavelength = 100 // 波の長さ

    let path = `M 0 ${centerY}`

    for (let x = 0; x <= offset; x += 2) {
      const y = centerY + amplitude * Math.sin((2 * Math.PI * x) / wavelength)
      path += ` L ${x} ${y}`
    }

    return path
  })()}
  fill="none"
  stroke="black"
  strokeWidth="4"
/>

{/* 幕（右：なめらか波） */}
<path
  d={(() => {
    const offset = stageWidth * curtain / 2
    const centerY = stageHeight / 2
    const amplitude = 20
    const wavelength = 100

    let path = `M ${stageWidth} ${centerY}`

    for (let x = 0; x <= offset; x += 2) {
      const y = centerY + amplitude * Math.sin((2 * Math.PI * x) / wavelength)
      path += ` L ${stageWidth - x} ${y}`
    }

    return path
  })()}
  fill="none"
  stroke="black"
  strokeWidth="4"
/>


        {/* グリッド */}
        <defs>
          <pattern id="grid" width="182" height="182" patternUnits="userSpaceOnUse">
            <rect width="182" height="182" fill="none" stroke="#ccc" strokeWidth="1" />
          </pattern>
        </defs>

        <rect x="0" y="0" width={stageWidth} height={stageHeight} fill="url(#grid)" />

        {/* 外枠 */}
        <rect
          x="0"
          y="0"
          width={stageWidth}
          height={stageHeight}
          fill="none"
          stroke="black"
          strokeWidth="4"
        />

        {/* オブジェクト */}
        {[...objects].sort((a, b) => a.zIndex - b.zIndex).map((obj) => {
          const centerX = obj.x + obj.width / 2
          const centerY = obj.y + obj.height / 2

          return (
            <g
              key={obj.id}
              transform={`rotate(${obj.rotation}, ${centerX}, ${centerY})`}
              onPointerDown={(e) => {
  e.stopPropagation()

  const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect()
  const mouseX =
    ((e.clientX - rect.left) / rect.width) * stageWidth
  const mouseY =
    ((e.clientY - rect.top) / rect.height) * stageHeight

  setOffset({
    x: mouseX - obj.x,
    y: mouseY - obj.y,
  })

  setDraggingId(obj.id)
  setSelectedId(obj.id)
}}
            >
              {/* 本体 */}
              <rect
               x={obj.x}
               y={obj.y}
                width={obj.width}
               height={obj.height}
                fill="white"
               stroke="black"
               strokeWidth="4"
              />
              {/* 選択UI */}
              {selectedId === obj.id && !isExporting && (
                <>
                  {/* 枠 */}
                  <rect
                    x={obj.x}
                    y={obj.y}
                    width={obj.width}
                    height={obj.height}
                    fill="none"
                    stroke="red"
                    strokeWidth="4"
                  />

                  {/* 回転ハンドル */}
                  <circle
                    cx={centerX}
                    cy={obj.y - 20}
                    r={12}
                    fill="orange"
                    onPointerDown={(e) => {
                    e.stopPropagation()
                    setRotatingId(obj.id)
                  }}
                  />

                  {/* 削除 */}
                  <circle
                    cx={obj.x + obj.width + 20}
                    cy={obj.y}
                    r={12}
                    fill="red"
                    onClick={(e) => {
                      e.stopPropagation()
                      setObjects(objects.filter((o) => o.id !== obj.id))
                      setSelectedId(null)
                    }}
                  />

                  {/* コピー */}
                  <circle
                    cx={obj.x + obj.width + 20}
                    cy={obj.y + 30}
                    r={12}
                    fill="green"
                    onClick={(e) => {
                      e.stopPropagation()
                      const copy = {
                        ...obj,
                        id: Date.now(),
                        x: obj.x + 20,
                        y: obj.y + 20,
                      }
                      setObjects([...objects, copy])
                    }}
                  />
                  {/* 前面へ */}
<circle
  cx={obj.x + obj.width + 20}
  cy={obj.y + 60}
  r={12}
  fill="blue"
  onClick={(e) => {
    e.stopPropagation()
    setObjects(objects.map(o =>
      o.id === obj.id ? { ...o, zIndex: o.zIndex + 1 } : o
    ))
  }}
/>

{/* 背面へ */}
<circle
  cx={obj.x + obj.width + 20}
  cy={obj.y + 90}
  r={12}
  fill="gray"
  onClick={(e) => {
    e.stopPropagation()
    setObjects(objects.map(o =>
      o.id === obj.id ? { ...o, zIndex: o.zIndex - 1 } : o
    ))
  }}
/>
                </>
              )}
            </g>
          )
        })}
        
      </svg>
      </div>
   <div style={{
  position: "fixed",
  bottom: 140,
  right: 0,
  display: "grid",
  gridTemplateColumns: isMobile ? "50px 50px 50px" : "100px 100px 100px",
  gridTemplateRows: isMobile ? "50px 50px 50px" : "100px 100px 100px",
  gap: 10,
  zIndex: 100
}}>
  <div />
  <button
  style={{
  fontSize: isMobile ? 20 : 30,
  padding: isMobile ? "12px" : "25px",
    userSelect: "none",
    WebkitUserSelect: "none"
  }}
    onPointerDown={() => setMoveDir({x:0,y:-1})}
    onPointerUp={() => setMoveDir(null)}
  >↑</button>
  <div />

  <button
  style={{
  fontSize: isMobile ? 20 : 30,
  padding: isMobile ? "12px" : "25px",
    userSelect: "none",
    WebkitUserSelect: "none"
  }}
    onPointerDown={() => setMoveDir({x:-1,y:0})}
    onPointerUp={() => setMoveDir(null)}
  >←</button>

  <button
  style={{
  fontSize: isMobile ? 20 : 30,
  padding: isMobile ? "12px" : "25px",
    userSelect: "none",
    WebkitUserSelect: "none"
  }}
  onPointerDown={() => setIsRotatingButton(true)}
  onPointerUp={() => setIsRotatingButton(false)}
  onPointerLeave={() => setIsRotatingButton(false)}
  onPointerCancel={() => setIsRotatingButton(false)}
>
  ⟳
</button>

  <button
  style={{
  fontSize: isMobile ? 20 : 30,
  padding: isMobile ? "12px" : "25px",
    userSelect: "none",
    WebkitUserSelect: "none"
  }}
    onPointerDown={() => setMoveDir({x:1,y:0})}
    onPointerUp={() => setMoveDir(null)}
  >→</button>

  <div />
  <button
  style={{
  fontSize: isMobile ? 20 : 30,
  padding: isMobile ? "12px" : "25px",
    userSelect: "none",
    WebkitUserSelect: "none"
  }}
    onPointerDown={() => setMoveDir({x:0,y:1})}
    onPointerUp={() => setMoveDir(null)}
  >↓</button>
  <div />
</div>
 <div
 //~~~~~~幕スライダー~~~~~~~
  style={{
    position: "fixed",
    bottom: isMobile ? "calc(38vh)" : 40,
    left: 0,
    width: "100%",
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(6px)",
    padding: isMobile ? 8 : 10,
    zIndex: 9,
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderTop: "1px solid #ccc"
  }}
>
  <div>
    幕:
    <input
      type="range"
      min="0.27"
      max="1"
      step="0.01"
      value={curtain}
      onChange={(e) => setCurtain(Number(e.target.value))}
    />
  </div>
</div>
{/* ===== レイヤー一覧 ===== */}
<div style={{
  position: "fixed",
  bottom: 0,
  left: 0,
  width: "100%",
  height: isMobile ? 70 : 120,
  background: "#fff",
  overflowX: "auto",
  display: "flex",
  gap: 10,
  padding: 10,
  zIndex: 40
}}>
  {objects.map(obj => (
    <div
      key={obj.id}
      style={{
        minWidth: isMobile ? 100 : 140,
        padding: isMobile ? "6px" : "10px",
        border: obj.id === selectedId ? "3px solid red" : "1px solid #ccc",
        borderRadius: 5,
        background: "#fafafa"
      }}
    >
      {/* 名前クリックで選択 */}
      <div
  onClick={() => setSelectedId(obj.id)}
  style={{
    cursor: "pointer",
    padding: "8px",
    userSelect: "none",
    WebkitUserSelect: "none",
    borderRadius: 3,
    background: obj.id === selectedId ? "#ffdede" : "transparent"
  }}
>
  {obj.name}
</div>

     

     
    </div>
  ))}
</div>
{!isExporting && (
  //^^^^^^^^^^保存・パーツ^^^^^^^^^^^^^^
  <div
    style={{
      position: "fixed",
      top: isMobile ? 60 : "auto",
      bottom: isMobile ? "auto" : 220,
      left: isMobile ? 10 : 20,
      right: isMobile ? 10 : "auto",
      zIndex: isMobile ? 15 : 50,
      display: "flex",
      gap: 10,
      justifyContent: isMobile ? "space-between" : "flex-start"
    }}
  >
  <button
  style={{
    fontSize: isMobile ? 14 : 18,
    padding: isMobile ? "10px 12px" : "12px 16px",
    flex: isMobile ? 1 : "none"
  }}
  onClick={() => {
    setIsExporting(true)

    setTimeout(() => {
    const svg = document.getElementById("stage-svg") as unknown as SVGSVGElement
    if (!svg) return
    svg.setAttribute("width", String(stageWidth))
    svg.setAttribute("height", String(stageHeight))
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svg)

    const blob = new Blob([svgString], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "stage.svg"
    a.click()
   setIsExporting(false)
    URL.revokeObjectURL(url)
    svg.setAttribute("width", "800")
    svg.removeAttribute("height")
    }, 100)
  }}
>
  SVG保存
</button>
  <button
  style={{
    fontSize: isMobile ? 14 : 18,
    padding: isMobile ? "10px 12px" : "12px 16px",
    flex: isMobile ? 1 : "none"
  }}
  onClick={() => {
    setIsExporting(true)

    setTimeout(() => {
    const svg = document.getElementById("stage-svg") as unknown as SVGSVGElement
    if (!svg) return
    svg.setAttribute("width", String(stageWidth))
    svg.setAttribute("height", String(stageHeight))

    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svg)

    const canvas = document.createElement("canvas")
    canvas.width = stageWidth
    canvas.height = stageHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    const blob = new Blob([svgString], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)

      const pngUrl = canvas.toDataURL("image/png")

      const a = document.createElement("a")
      a.href = pngUrl
      a.download = "stage.png"
      a.click()
      setIsExporting(false)
      
    }
    img.src = url
    svg.setAttribute("width", "800")
    svg.removeAttribute("height")
    }, 100)
  }}
>
  PNG保存
</button>
<button
  //パーツ追加ボタン
  onClick={() => setRightOpen(true)}
  style={{
    fontSize: isMobile ? 14 : 18,
    padding: isMobile ? "10px 12px" : "12px 16px",
    flex: isMobile ? 1 : "none"
  }}
>
  パーツ
</button>
</div>
)}

     {/* 右パネル */}
     {!isExporting && (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: rightOpen ? 0 : (isMobile ? "-100%" : -200),
        width: isMobile ? "50%" : 200,
        height: "100%",
        background: "#eee",
        transition: "0.3s",
        padding: 10,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <h3>パーツ</h3>
  <button onClick={() => setRightOpen(false)}>✕</button>
</div>

<button 
  style={{
  fontSize: 18,
  padding: "12px 16px",
  }}
  onClick={() => {
  setObjects([...objects, {
    id: Date.now(),
    type: "panel",
    x: 1001,
    y: 819,
    width: 91,
    height: 10,
    rotation: 0,
    zIndex: objects.length,
    name: `パネル${getNextNumber("パネル")}`,
  }])
}}>
  パネル
</button>
<button 
  style={{
  fontSize: 18,
  padding: "12px 16px",
  }}
  onClick={() => {
  setObjects([...objects, {
    id: Date.now(),
    type: "platform",
    x: 1001,
    y: 819,
    width: 91,
    height: 182,
    rotation: 0,
    zIndex: objects.length,
    name: `サブロク${getNextNumber("サブロク")}`,
  }])
}}>
  サブロク
</button>

<button 
  style={{
  fontSize: 18,
  padding: "12px 16px",
  }}
  onClick={() => {
  setObjects([...objects, {
    id: Date.now(),
    type: "platform",
    x: 1001,
    y: 819,
    width: 91,
    height: 91,
    rotation: 0,
    zIndex: objects.length,
    name: `サンサン${getNextNumber("サンサン")}`,
  }])
}}>
  サンサン
</button>

<button 
  style={{
  fontSize: 18,
  padding: "12px 16px",
  }}
  onClick={() => {
  setObjects([...objects, {
    id: Date.now(),
    type: "platform",
    x: 1001,
    y: 819,
    width: 182,
    height: 182,
    rotation: 0,
    zIndex: objects.length,
    name: `ロクロク${getNextNumber("ロクロク")}`,
  }])
}}>
  ロクロク
</button>
    </div> 
    )}
{!isExporting && selectedObj && (
  <div
    style={{
      position: "fixed",
      bottom: isMobile ? 90 : 130,
      left: 0,
      width: "100%",
      background: "#ddd",
      padding: isMobile ? 6 : 10,
      zIndex: 20,
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "center"
    }}
  >

    {/* 名前 */}
    {!isMobile && <strong>{selectedObj.name}</strong>}
    {/* 削除 */}
    <button
      style={{ fontSize: 18, padding: "10px 14px", userSelect: "none",
    WebkitUserSelect: "none" }}
      onClick={() => {
        setObjects(objects.filter(o => o.id !== selectedObj.id))
        setSelectedId(null)
      }}
    >
      削除
    </button>


    {/* 前面 */}
    <button
      style={{ fontSize: 18, padding: "10px 14px" }}
      onClick={() => {
        setObjects(objects.map(o =>
          o.id === selectedObj.id ? { ...o, zIndex: o.zIndex + 1 } : o
        ))
      }}
    >
      前
    </button>

    {/* 背面 */}
    <button
      style={{ fontSize: 18, padding: "10px 14px" }}
      onClick={() => {
        setObjects(objects.map(o =>
          o.id === selectedObj.id ? { ...o, zIndex: o.zIndex - 1 } : o
        ))
      }}
    >
      後
    </button>

    {/* 座標 */}
    <div>
      X:
      <input
        type="number"
        value={Math.round(selectedObj.x)}
        onChange={(e) => {
          const value = Number(e.target.value)
          setObjects(objects.map(obj =>
            obj.id === selectedObj.id ? { ...obj, x: value } : obj
          ))
        }}
      />
    </div>

    <div>
      Y:
      <input
        type="number"
        value={Math.round(selectedObj.y)}
        onChange={(e) => {
          const value = Number(e.target.value)
          setObjects(objects.map(obj =>
            obj.id === selectedObj.id ? { ...obj, y: value } : obj
          ))
        }}
      />
    </div>
    <div>
  回転:
  <input
    type="number"
    step="5"
    min="0"
    max="360"
    value={Math.round(selectedObj.rotation)}
    onChange={(e) => {
      const value = Number(e.target.value) % 360
      setObjects(objects.map(obj =>
        obj.id === selectedObj.id
          ? { ...obj, rotation: value }
          : obj
      ))
    }}
    style={{ width: 60 }}
  />
</div>

  </div>
)}
    </div>
  )
}

export default App