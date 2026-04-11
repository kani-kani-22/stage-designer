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
  shape?: "rect" | "ellipse"
}
const getRotation = (el: Element): number => {
  let current: Element | null = el
  let rotation = 0

  while (current) {
    const transform = current.getAttribute("transform")
    if (transform) {
      const match = transform.match(/rotate\(([-\d.]+)(?:[ ,]+[-\d.]+[ ,]+[-\d.]+)?\)/)
      if (match) {
        rotation += Number(match[1])
      }
    }
    current = current.parentElement
  }

  return rotation
}
function App() {
  const [objects, setObjects] = useState<Obj[]>([])
  const [customShape, setCustomShape] = useState<"rect" | "ellipse">("rect")
  const [editX, setEditX] = useState("")
  const [editY, setEditY] = useState("")
  const [editRot, setEditRot] = useState("")
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const text = reader.result as string
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, "image/svg+xml")

  const rects = Array.from(doc.querySelectorAll("rect")).filter(r => {
  const w = Number(r.getAttribute("width") || 0)
  const h = Number(r.getAttribute("height") || 0)
  const x = Number(r.getAttribute("x") || 0)
  const y = Number(r.getAttribute("y") || 0)

  // ステージサイズ除外
  if (w === stageWidth && h === stageHeight) return false

  // 明らかに大きすぎるものも除外
  if (w > 500 && h > 500) return false
    // strokeがnoneなら除外（背景防止）
if (r.getAttribute("stroke") === "none") return false
// 左上固定のゴミ除外（←これ追加）
  if (x === 0 && y === 0 && w >= 180 && h >= 180) return false
  return true
})
  let counters = {
  パネル: 0,
  サブロク: 0,
  サンサン: 0,
  ロクロク: 0,
  カスタム: 0
}
  const newObjs = rects.map((r, i) => {
  const w = Number(r.getAttribute("width") || 50)
  const h = Number(r.getAttribute("height") || 50)

  let name = ""
  let type: "panel" | "platform" = "panel"

  if (w === 182 && h === 182) {
    counters.ロクロク++
    name = `ロクロク${counters.ロクロク}`
    type = "platform"
  } else if (w === 91 && h === 182) {
    counters.サブロク++
    name = `サブロク${counters.サブロク}`
    type = "platform"
  } else if (w === 91 && h === 91) {
    counters.サンサン++
    name = `サンサン${counters.サンサン}`
    type = "platform"
  } else if (w === 91 && h === 10) {
    counters.パネル++
    name = `パネル${counters.パネル}`
    type = "panel"
  } else {
    counters.カスタム++
    name = `カスタム${counters.カスタム}`
    type = "panel"
  }

  // 回転取得
 const rotation = getRotation(r)

  return {
    id: Date.now() + i,
    type,
    x: Number(r.getAttribute("x") || 0),
    y: Number(r.getAttribute("y") || 0),
    width: w,
    height: h,
    rotation,
    zIndex: i,
    name
  }
})
    setObjects(newObjs)
  }
  reader.readAsText(file)
}
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [moveDir, setMoveDir] = useState<{x: number, y: number} | null>(null)

  const [rotatingId, setRotatingId] = useState<number | null>(null)
  const [isRotatingButton, setIsRotatingButton] = useState(false)

  const stageWidth = 2002
  const stageHeight = 1638
  const [rightOpen, setRightOpen] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const selectedObj = objects.find(o => o.id === selectedId)
  const [isExporting, setIsExporting] = useState(false)
  const [curtain, setCurtains] = useState({
  front: 0.27,
  gauze: 0.27,
  back: 0.27
}) // 0〜1
  const [isTouching, setIsTouching] = useState(false)
  const isMobile = window.innerWidth < 768
 const [customSize, setCustomSize] = useState({ w: "182", h: "182" })
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
              x: Math.max(0, Math.min(stageWidth - obj.width, obj.x + moveDir.x * 5)),
y: Math.max(0, Math.min(stageHeight - obj.height, obj.y + moveDir.y * 5))
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
          ? { ...obj, rotation: (obj.rotation + 2) % 360 }
          : obj
      )
    )
  }, 16)

  return () => clearInterval(interval)
}, [isRotatingButton, selectedId])
// 停止
useEffect(() => {
  const stop = () => {
    setMoveDir(null)
    setIsRotatingButton(false)
  }

  window.addEventListener("pointerup", stop)
  window.addEventListener("pointercancel", stop)
  window.addEventListener("touchend", stop)
  window.addEventListener("mouseup", stop)
  return () => {
    window.removeEventListener("pointerup", stop)
    window.removeEventListener("pointercancel", stop)
    window.removeEventListener("touchend", stop)
    window.removeEventListener("mouseup", stop)
  }
}, [])
useEffect(() => {
  if (!selectedObj) return
  setEditX(String(Math.round(selectedObj.x)))
  setEditY(String(Math.round(selectedObj.y)))
  setEditRot(String(Math.round(selectedObj.rotation)))
}, [selectedObj])
  return (
    <div
    style={{
      userSelect: "none",
      WebkitUserSelect: "none",
      touchAction: "manipulation",
      height: "100vh",
      display: "flex",
      flexDirection: "column"
    }}
    > 
      <h1>舞台図エディタ</h1>
<div style={{
  minHeight: 50,
  flexShrink: 0,
  display: "flex",
  gap: 10,
  alignItems: "center",
  padding: "0 10px",
  background: "#fff",
  zIndex: 50
}}>
  {/* ←ここに「SVG保存」「PNG保存」「パーツ」ボタンを移動 */}
  {!isExporting && (
  //^^^^^^^^^^保存・パーツ^^^^^^^^^^^^^^
  <div
    style={{
      display: "flex",
    gap: 6,
    width: "100%",
    }}
  >
  <button
  style={{
    fontSize: isMobile ? 13 : 16,
    padding: isMobile ? "6px 4px" : "8px 10px",
    flex: 1
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
    svg.setAttribute("viewBox", `0 0 ${stageWidth} ${stageHeight}`)
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet")
    svg.style.background = "white"
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
   fontSize: isMobile ? 13 : 16,
    padding: isMobile ? "6px 4px" : "8px 10px",
    flex: 1
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
    fontSize: isMobile ? 13 : 16,
    padding: isMobile ? "6px 4px" : "8px 10px",
    flex: 1
  }}
>
  パーツ
</button>
</div>
)}
</div>
      
<div style={{
   flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
}}>
<svg
  id="stage-svg"
  viewBox={`0 0 ${stageWidth} ${stageHeight}`}
  preserveAspectRatio="xMidYMid meet"
  style={{
    width: "100%",
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
            ? { ...obj, x: Math.max(0, Math.min(stageWidth - obj.width, mouseX - offset.x)),
              y: Math.max(0, Math.min(stageHeight - obj.height, mouseY - offset.y)) }
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
    const offset = stageWidth * curtain.front / 2
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
    const offset = stageWidth * curtain.front / 2
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
{/* 紗幕（点線・下から3.75間） */}
<line
  x1="0"
  x2={stageWidth}
  y1={stageHeight - 182 * 3.75}
  y2={stageHeight - 182 * 3.75}
  stroke="black"
  strokeDasharray="10 10"
  strokeWidth="5"
  opacity={curtain.gauze ? 1 : 0}
/>

{/* 大黒幕（上から0.5間） */}
<line
  x1="0"
  x2={stageWidth}
  y1={182 * 0.5}
  y2={182 * 0.5}
  stroke="black"
  strokeWidth="5"
  opacity={curtain.back ? 1 : 0}
/>


        {/* グリッド */}
        <defs>
          <pattern id="grid" width="182" height="182" patternUnits="userSpaceOnUse">
            <rect width="182" height="182" fill="none" stroke="#ccc" strokeWidth="1" />
          </pattern>
        </defs>

        <rect x="0" y="0" width={stageWidth} height={stageHeight} fill="url(#grid)" />
        //センターライン
        <line
         x1={stageWidth / 2}
          x2={stageWidth / 2}
          y1="0"
          y2={stageHeight}
          stroke="#888"
          strokeDasharray="10 10"
          strokeWidth="2"
          />
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
        {/* 逆T字マーク */}
<g stroke="black" strokeWidth="5">
  {/* 横棒 */}
  <line
    x1={stageWidth / 2 - 40}
    x2={stageWidth / 2 + 40}
    y1={stageHeight - 140}
    y2={stageHeight - 140}
  />

  {/* 縦棒（上に伸びる） */}
  <line
    x1={stageWidth / 2}
    x2={stageWidth / 2}
    y1={stageHeight - 140}
    y2={stageHeight - 200}
  />
</g>
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
             {obj.shape === "ellipse" ? (
  <ellipse
    cx={obj.x + obj.width / 2}
    cy={obj.y + obj.height / 2}
    rx={obj.width / 2}
    ry={obj.height / 2}
    fill="white"
    stroke="black"
    strokeWidth="4"
  />
) : (
  <rect
    x={obj.x}
    y={obj.y}
    width={obj.width}
    height={obj.height}
    fill="white"
    stroke="black"
    strokeWidth="4"
  />
)}
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
                      setSelectedId(copy.id)
                      setRightOpen(false) 
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
      <input
      type="file"
      accept=".svg"
      onChange={handleImport}
      style={{
     marginTop: 10,
     marginBottom: 10
      }}
/>
      </div>
   <div style={{
  position: "fixed",
  bottom: "15vh",
  right: "2vw",
  display: "grid",
  gridTemplateColumns: isMobile ? "50px 50px 50px" : "100px 100px 100px",
  gridTemplateRows: isMobile ? "50px 50px 50px" : "100px 100px 100px",
  gap: 10,
  zIndex: 90
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
{/* ===== レイヤー一覧 ===== */}
<div style={{
  position: "fixed",
  bottom: 0,
  left: 0,
  width: "100%",
  height: isMobile ? "12vh" : 120,
  background: "#fff",
  overflowX: "auto",
  display: "flex",
  gap: 10,
  padding: 10,
  zIndex: 85
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
  onClick={() =>
  setSelectedId(obj.id === selectedId ? null : obj.id)
}
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

     {/* 右パネル */}
     {!isExporting && (
    <div
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        right: rightOpen ? 0 : (isMobile ? "-100%" : -200),
        width: isMobile ? "50%" : 200,
        height: "100vh",
        background: "#eee",
        transition: "0.3s",
        padding: 10,
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <h3>パーツ</h3>
  <button onClick={() => setRightOpen(false)}>✕</button>
</div>
<div>
 <div>
  中割幕:
  <input
    type="range"
    min="0.27"
    max="1"
    step="0.01"
    value={curtain.front}
    onChange={(e) =>
      setCurtains({ ...curtain, front: Number(e.target.value) })
    }
  />
</div>

<div>
  紗幕:
  <input
    type="checkbox"
    checked={curtain.gauze > 0}
    onChange={(e) =>
      setCurtains({ ...curtain, gauze: e.target.checked ? 1 : 0 })
    }
  />
</div>

<div>
  大黒幕:
  <input
    type="checkbox"
    checked={curtain.back > 0}
    onChange={(e) =>
      setCurtains({ ...curtain, back: e.target.checked ? 1 : 0 })
    }
  />
</div>
</div>
<button 
  style={{
  fontSize: 18,
  padding: "12px 16px",
  }}
  onClick={() => {
  const newObj = {
  id: Date.now(),
  type: "panel" as const,
  x: 1001,
  y: 819,
  width: 91,
  height: 10,
  rotation: 0,
  zIndex: objects.length,
  name: `パネル${getNextNumber("パネル")}`,
}

setObjects([...objects, newObj])
setSelectedId(newObj.id)
setRightOpen(false)
}}>
  パネル
</button>
<button 
  style={{
  fontSize: 18,
  padding: "12px 16px",
  }}
  onClick={() => {
  const newObj = {
  id: Date.now(),
  type: "platform" as const,
  x: 1001,
  y: 819,
  width: 91,
  height: 182,
  rotation: 0,
  zIndex: objects.length,
  name: `サブロク${getNextNumber("サブロク")}`,
}

setObjects([...objects, newObj])
setSelectedId(newObj.id)
setRightOpen(false)
}}>
  サブロク
</button>

<button 
  style={{
  fontSize: 18,
  padding: "12px 16px",
  }}
  onClick={() => {
  const newObj = {
  id: Date.now(),
  type: "platform" as const,
  x: 1001,
  y: 819,
  width: 91,
  height: 91,
  rotation: 0,
  zIndex: objects.length,
  name: `サンサン${getNextNumber("サンサン")}`,
}

setObjects([...objects, newObj])
setSelectedId(newObj.id)
setRightOpen(false)
}}>
  サンサン
</button>

<button 
  style={{
  fontSize: 18,
  padding: "12px 16px",
  }}
  onClick={() => {
  const newObj = {
  id: Date.now(),
  type: "platform" as const,
  x: 1001,
  y: 819,
  width: 182,
  height: 182,
  rotation: 0,
  zIndex: objects.length,
  name: `ロクロク${getNextNumber("ロクロク")}`,
}

setObjects([...objects, newObj])
setSelectedId(newObj.id)
setRightOpen(false)
}}>
  ロクロク
</button>
<button onClick={() => {
  setShowCustom(true)
  setRightOpen(false)
}}>
  カスタム追加
</button>
    </div> 
    )}
{showCustom && (
  <div style={{
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#fff",
    padding: 20,
    zIndex: 1000,
    border: "1px solid #ccc"
  }}>
    <h3>カスタムサイズ</h3>
    <div>
    形:
    <select
    value={customShape}
    onChange={(e) =>
      setCustomShape(e.target.value as "rect" | "ellipse")
    }
    >
    <option value="rect">長方形</option>
    <option value="ellipse">丸/楕円</option>
    </select>
    </div>
    <div>
      幅:
    <input
  value={customSize.w}
  onChange={(e) =>
    setCustomSize({ ...customSize, w: e.target.value })
  }
/>
    cm
    </div>
    <div>
      幅:
    <input
      value={customSize.h}
      onChange={(e) =>
        setCustomSize({ ...customSize, h: e.target.value })
      }
    />
    cm
    </div>


    <button
      onClick={() => {
        const newObj = {
          id: Date.now(),
          type: "panel" as const,
          x: 1001,
          y: 819,
          width: Number(customSize.w),
          height: Number(customSize.h),
          rotation: 0,
          zIndex: objects.length,
          shape: customShape ,
          name: `カスタム${getNextNumber("カスタム")}`
        }

        setObjects([...objects, newObj])
        setSelectedId(newObj.id)
        setShowCustom(false)
        setRightOpen(false)
      }}
    >
      追加
    </button>

    <button onClick={() => setShowCustom(false)}>閉じる</button>
  </div>
)}
{!isExporting && selectedObj && (
  //下パネル
  <div
    style={{
      position: "fixed",
      bottom: isMobile ? "14vh" : 130,
      left: 0,
      width: "100%",
      background: "#ddd",
      paddingRight: isMobile ? 120 : 160, 
      padding: 10,
      zIndex: 60,
      display: "flex",
       flexDirection: "column", 
      gap: 6,
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent: "flex-start"
    }}
  >
    <div style={{ display: "flex", gap: 10 }}>
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
    </div>

    <div style={{ display: "flex", gap: 10 }}>
    {/* 座標 */}
    <div>
      X:
      <input
      style={{ width: 60 }}
      type="text"
      value={editX}
      onChange={(e) => {
      setEditX(e.target.value)
      }}
      onBlur={() => {
      const value = Number(editX)
      if (!isNaN(value)) {
      setObjects(objects.map(obj =>
        obj.id === selectedObj.id
          ? { ...obj, x: Math.max(0, Math.min(stageWidth - obj.width, value)) }
          : obj
        ))
      }
      }}
/>
    </div>

    <div>
      Y:
      <input
      style={{ width: 60 }}
  type="text"
  value={editY}
  onChange={(e) => {
    setEditY(e.target.value)
  }}
  onBlur={() => {
    const value = Number(editY)
    if (!isNaN(value)) {
      setObjects(objects.map(obj =>
        obj.id === selectedObj.id
          ? { ...obj, y: Math.max(0, Math.min(stageHeight - obj.height, value)) }
          : obj
      ))
    }
  }}
/>
    </div>
    </div>

    <div>
  回転:
  <input
  style={{ width: 60 }}
  type="text"
  value={editRot}
  onChange={(e) => {
    setEditRot(e.target.value)
  }}
  onBlur={() => {
    const value = Number(editRot)
    if (!isNaN(value)) {
      setObjects(objects.map(obj =>
        obj.id === selectedObj.id
          ? { ...obj, rotation: Math.round(selectedObj.rotation) }
          : obj
      ))
    }
  }}
  />
</div>

  </div>
)}
    </div>
  )
}

export default App