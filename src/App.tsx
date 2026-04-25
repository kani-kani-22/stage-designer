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
  pivotMode: number
  pattern?: "none" | "diagonal" | "dots"
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
 const getPivot = (obj: Obj) => {
  const mode = obj.pivotMode

  if (obj.name.startsWith("SS")) {
    const points = [
      [obj.x - 17, obj.y + obj.height / 2],
      [obj.x + obj.width, obj.y + obj.height / 2],
      [obj.x + obj.width, obj.y],
      [obj.x + obj.width, obj.y + obj.height],
      [obj.x + obj.width / 2, obj.y + obj.height / 2]
    ]
    return points[mode]
  }

  if (obj.shape === "ellipse") {
    const cx = obj.x + obj.width / 2
    const cy = obj.y + obj.height / 2

    const points = [
      [cx - obj.width / 2, cy],
      [cx, cy - obj.height / 2],
      [cx + obj.width / 2, cy],
      [cx, cy + obj.height / 2],
      [cx, cy]
    ]
    return points[mode]
  }

  const points = [
    [obj.x, obj.y],
    [obj.x + obj.width, obj.y],
    [obj.x + obj.width, obj.y + obj.height],
    [obj.x, obj.y + obj.height],
    [obj.x + obj.width / 2, obj.y + obj.height / 2]
  ]

  return points[mode]
}
const changePivot = (obj: Obj, newMode: number): Obj => {
  const rad = (obj.rotation * Math.PI) / 180

  const [oldPx, oldPy] = getPivot(obj)

  const newObj = { ...obj, pivotMode: newMode }
  const [newPx, newPy] = getPivot(newObj)

  // pivot差分（同じx,yでの差分）
  const dpx = newPx - oldPx
  const dpy = newPy - oldPy

  // 位置補正（回転中心が変わっても見た目が変わらないように）
  const correctedDx = dpx * (Math.cos(rad) - 1) - dpy * Math.sin(rad)
  const correctedDy = dpx * Math.sin(rad) + dpy * (Math.cos(rad) - 1)
  return {
    ...newObj,
    x: obj.x + correctedDx,
    y: obj.y + correctedDy
  }
}

  const [panelView, setPanelView] = useState<"home" | "platform" | "other">("home")
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
    // strokeがnoneなら除外（背景防止）
if (r.getAttribute("stroke") === "none") return false
// 左上固定のゴミ除外（←これ追加）
  if (x === 0 && y === 0 && w >= 180 && h >= 180) return false
  return true
})
const ellipses = Array.from(doc.querySelectorAll("ellipse")).filter(el => {
    if (el.getAttribute("stroke") === "none") return false
    return true
  })
  let counters = {
  パネル: 0,
  サブロク: 0,
  サンサン: 0,
  ロクロク: 0,
  スモーク: 0,
  影段: 0,
  SS: 0,
  カスタム: 0
}
  const rectObjs = rects.map((r, i) => {
    const w = Number(r.getAttribute("width") || 50)
    const h = Number(r.getAttribute("height") || 50)
    let name = ""
    let type: "panel" | "platform" = "panel"
    let pattern: "none" | "diagonal" | "dots" = "none"
    
    const fill = r.getAttribute("fill") || ""
    const hasPattern = fill.includes("pat-diagonal") || fill.includes("pat-dots")
    
    if (hasPattern) {
      // 模様がある場合はカスタム扱い
      counters.カスタム++
      name = `カスタム${counters.カスタム}`
      type = "panel" as const
      if (fill.includes("pat-diagonal")) {
        pattern = "diagonal"
      } else if (fill.includes("pat-dots")) {
        pattern = "dots"
      }
    } else if (w === 182 && h === 182) {
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
    type = "panel" as const
  } else if (w === 48 && h === 34) {
  counters.SS = (counters.SS || 0) + 1
  name = `SS${counters.SS}`
  type = "platform"
  } else if (w === 50 && h === 24) {
  counters.スモーク = (counters.スモーク || 0) + 1
  name = `スモーク${counters.スモーク}`
  type = "platform"
  } else if (w === 182 && h === 91) {
  counters.影段 = (counters.影段 || 0) + 1
  name = `影段${counters.影段}`
  type = "platform"
  } else {
    counters.カスタム++
    name = `カスタム${counters.カスタム}`
    type = "panel" as const

  }

  // 回転取得
 const rotation = getRotation(r)

  return {
    id: Date.now() + i,
    type,
    shape: "rect" as const,
    x: Number(r.getAttribute("x") || 0),
    y: Number(r.getAttribute("y") || 0),
    width: w,
    height: h,
    rotation,
    zIndex: i,
    name,
    pivotMode: 4 ,
    pattern
  }
})
  const ellipseObjs = ellipses.map((el, i) => {
    const rx = Number(el.getAttribute("rx") || 25)
    const ry = Number(el.getAttribute("ry") || 25)
    const cx = Number(el.getAttribute("cx") || 0)
    const cy = Number(el.getAttribute("cy") || 0)
    const w = rx * 2
    const h = ry * 2
    counters.カスタム++

    // 楕円の模様を判定
    const fill = el.getAttribute("fill") || ""
    let pattern: "none" | "diagonal" | "dots" = "none"
    if (fill.includes("pat-diagonal")) {
      pattern = "diagonal"
    } else if (fill.includes("pat-dots")) {
      pattern = "dots"
    }

    return {
      id: Date.now() + 10000 + i,
      type: "panel" as const,
      shape: "ellipse" as const,
      x: cx - rx,
      y: cy - ry,
      width: w, height: h,
      rotation: getRotation(el),
      zIndex: rects.length + i,
      name: `カスタム${counters.カスタム}`,
      pivotMode: 4,
      pattern
    }
  })

  setObjects([...rectObjs, ...ellipseObjs])
  }
  reader.readAsText(file)
}
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [moveDir, setMoveDir] = useState<{x: number, y: number} | null>(null)

  const [rotatingId, setRotatingId] = useState<number | null>(null)
  const [rotateDir, setRotateDir] = useState<1 | -1 | 0>(0)

  const stageWidth = 2002
  const stageHeight = 1638
{/*-----------------ヘルプページ----------------- */}
  const [updateOpen, setUpdateOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpPage, setHelpPage] = useState(0)
  const helpPages = [
  {
    img: "/partssetting.gif",
    text: "パーツボタンから、パネルや平台を出すことができます"
  },
  {
    img: "/partsmoving.gif",
    text: "画面下右側のボタンでパーツを移動・回転させられます\n(ドラッグ機能は動作が微妙です。そのうち直します)"
  },
  { 
    img: "/input.gif",
    text: "数値を入力することでも移動・回転が可能です"  },
  {
    img: "/pivotrotating.gif",
    text: "「角」「中心」ボタンでは、回転の中心と座標表示の基準点を変えられます"
  },
  {
    img: "/partslayer.gif",
    text: "動かすパーツを変えるときは、画面下の名前をタップしてください\n(パーツを直接タッチしても選択できますが、パネルは難しいです)\n名前の下の左右ボタンで表示順を変更できます"
  },
  {
    img: "/curtain.gif",
    text: "パーツボタンから、幕を開閉することができます"
  },
  {
    img: "/customparts.gif",
    text: "カスタム追加ボタンから、長方形や楕円形のパーツも追加することができます"
  },
  {
    img: "/importsvg.gif",
    text: "SVG保存によって、保存したものを下のファイル選択ボタンから読み込んで、途中から再開することができます\n(SVG画像はスマホでは開けないことが多いので、ファイル名を変更して区別してください)"
  },
  {
    img: "/stagepng.png",
    text: "PNG保存では、通常の画像形式で保存できます"
  },
  {
    img: "/kenmode.gif",
    text: "間モードをオンにすると、センターライン/舞台客席側から何間かで座標を入力できます\n回転・座標表示の基準点変更機能と組み合わせて使ってみてください。"
  },
  {
    text: "その他機能として、SSの光路を表示したり、カスタムパーツに模様を追加したりすることができます。"
  }
  ]


  const [rightOpen, setRightOpen] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const selectedObj = objects.find(o => o.id === selectedId)
  const [isExporting, setIsExporting] = useState(false)
  const popupStyle: React.CSSProperties = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "#fff",
  padding: 20,
  zIndex: 2000,
  border: "1px solid #ccc",
  width: "80%",
  maxWidth: 280,
  aspectRatio: "3 / 4",
  borderRadius: 10
}
  const [curtain, setCurtains] = useState({
  front: 0.27,
  gauze: 0,
  back: 0
}) // 0〜1
  const drawSideCurtain = (y: number) => {
  const offset = stageWidth * 0.27 / 2
  const amplitude = 20
  const wavelength = 100

  let left = `M 0 ${y}`
  for (let x = 0; x <= offset; x += 2) {
    const yy = y + amplitude * Math.sin((2 * Math.PI * x) / wavelength)
    left += ` L ${x} ${yy}`
  }

  let right = `M ${stageWidth} ${y}`
  for (let x = 0; x <= offset; x += 2) {
    const yy = y + amplitude * Math.sin((2 * Math.PI * x) / wavelength)
    right += ` L ${stageWidth - x} ${yy}`
  }

  return (
    <>
      <path d={left} stroke="black" strokeWidth="3" fill="none" />
      <path d={right} stroke="black" strokeWidth="3" fill="none" />
    </>
  )
}
  const [isTouching, setIsTouching] = useState(false)
  const isMobile = window.innerWidth < 768

  const [showSSBeam, setShowSSBeam] = useState(false)

  {/* 間モード関係*/}  
  const [useKen, setUseKen] = useState(false)
  const getDisplayX = (obj: Obj) => {
  const [px] = getPivot(obj)

  if (!useKen) return Math.round(px)

  return Math.round((px - stageWidth / 2) / 182 * 10) / 10
}

const getDisplayY = (obj: Obj) => {
  const [, py] = getPivot(obj)

  if (!useKen) return Math.round(py)

  return Math.round((stageHeight - py) / 182 * 10) / 10
}
const applyX = (value: number, obj: Obj) => {
  const [px] = getPivot(obj)

  let targetPx = value
  if (useKen) targetPx = value * 182 + stageWidth / 2

  return obj.x + (targetPx - px)
}
const applyY = (value: number, obj: Obj) => {
  const [, py] = getPivot(obj)

  let targetPy = value
  if (useKen) targetPy = stageHeight - value * 182

  return obj.y + (targetPy - py)
}



 const [customSize, setCustomSize] = useState({ w: "182", h: "182", pattern: "none" as "none" | "diagonal" | "dots" })
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
  if (rotateDir === 0 || !selectedId) return

  const interval = setInterval(() => {
    setObjects(prev =>
      prev.map(obj =>
        obj.id === selectedId
          ? { ...obj, rotation: (obj.rotation + rotateDir * 2 + 360) % 360 }
          : obj
      )
    )
  }, 16)

  return () => clearInterval(interval)
}, [rotateDir, selectedId])
// 停止
useEffect(() => {
  const stop = () => {
    setMoveDir(null)
    setRotateDir(0)
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
  setEditX(String(getDisplayX(selectedObj)))
  setEditY(String(getDisplayY(selectedObj)))
  setEditRot(String(Math.round(selectedObj.rotation)))
}, [selectedObj, useKen])
  return (
    <div
    style={{
      userSelect: "none",
      WebkitUserSelect: "none",
      touchAction: "manipulation",
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      paddingTop: "10px"
    }}
    > 
     <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 10px"
    }}
    >
     <button 
     style={{borderRadius: "50%", width: 30, height: 30 }}
     onClick={() => {
      setHelpOpen(true)
      setUpdateOpen(false)
     }}
     >？
     </button>

     <h1 style={{ margin: 0 }}>舞台図エディタ</h1>

     <button onClick={() => {
      setUpdateOpen(true)
      setHelpOpen(false)
     }}>ver</button>
    </div>
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

          const [centerX, centerY] = getPivot(obj)

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



        {/* グリッド */}
        <defs>
          <pattern id="grid" width="182" height="182" patternUnits="userSpaceOnUse">
            <rect width="182" height="182" fill="none" stroke="#ccc" strokeWidth="1" />
          </pattern>
          <pattern id="pat-diagonal" width="10" height="10" patternUnits="userSpaceOnUse">
            <line x1="0" y1="10" x2="10" y2="0" stroke="#888" strokeWidth="1.5" />
          </pattern>
          <pattern id="pat-dots" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="7.5" cy="7.5" r="3" fill="#888" />
          </pattern>
        </defs>

        <rect x="0" y="0" width={stageWidth} height={stageHeight} fill="url(#grid)" />
        {/*センターライン*/}
        <line
         x1={stageWidth / 2}
          x2={stageWidth / 2}
          y1="0"
          y2={stageHeight}
          stroke="#ccc"
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
        {[...objects].sort((a, b) => b.zIndex - a.zIndex).map((obj) => {
          const [px, py] = getPivot(obj)
          return (
            <g
              key={obj.id}
              transform={`rotate(${obj.rotation}, ${px}, ${py})`}
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
             {obj.name.startsWith("影段") ? (
  <g>
    {/* 外枠 */}
    <rect
      x={obj.x}
      y={obj.y}
      width={obj.width}
      height={obj.height}
      fill="white"
      stroke="black"
      strokeWidth="4"
    />
    {/* 横線4本 */}
    {[1,2].map(i => (
      <line
        key={i}
        x1={obj.x}
        x2={obj.x + obj.width}
        y1={obj.y + (obj.height / 3) * i}
        y2={obj.y + (obj.height / 3) * i}
        stroke="black"
        strokeWidth="3"
      />
    ))}
  </g>

) : obj.name.startsWith("スモーク") ? (
  <g>
    <rect
      x={obj.x}
      y={obj.y}
      width={obj.width}
      height={obj.height}
      fill="white"
      stroke="black"
      strokeWidth="4"
    />
    <text
      x={obj.x + obj.width / 2}
      y={obj.y + obj.height / 2}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="20"
    >
      ス
    </text>
  </g>

) : obj.name.startsWith("SS") ? (
  <g>
    {/* 長方形 */}
    <rect
      x={obj.x}
      y={obj.y}
      width={obj.width}
      height={obj.height}
      fill="white"
      stroke="black"
      strokeWidth="4"
    />
    {/* 半円 */}
    <path
      d={`
        M ${obj.x} ${obj.y}
        A 17 17 0 0 0 ${obj.x} ${obj.y + obj.height}
      `}
      fill="white"
      stroke="black"
      strokeWidth="4"
    />
    {/* SS文字 */}
    <text
      x={obj.x + obj.width / 2}
      y={obj.y + obj.height / 2}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="18"
    >
      SS
    </text>
  </g>

) : obj.shape === "ellipse" ? (
  <g>
    <ellipse
      cx={obj.x + obj.width / 2}
      cy={obj.y + obj.height / 2}
      rx={obj.width / 2}
      ry={obj.height / 2}
      fill="white"
      stroke="black"
      strokeWidth="4"
    />
    {obj.pattern && obj.pattern !== "none" && (
      <ellipse
        cx={obj.x + obj.width / 2}
        cy={obj.y + obj.height / 2}
        rx={obj.width / 2}
        ry={obj.height / 2}
        fill={`url(#pat-${obj.pattern})`}
        stroke="none"
      />
    )}
  </g>
) : (
  <g>
    <rect
      x={obj.x}
      y={obj.y}
      width={obj.width}
      height={obj.height}
      fill="white"
      stroke="black"
      strokeWidth="4"
    />
    {obj.pattern && obj.pattern !== "none" && (
      <rect
        x={obj.x}
        y={obj.y}
        width={obj.width}
        height={obj.height}
        fill={`url(#pat-${obj.pattern})`}
        stroke="none"
      />
    )}
  </g>
)}
{selectedId === obj.id && !isExporting && (() => {
  const [px, py] = getPivot(obj)
  return <circle cx={px} cy={py} r="10" fill="blue" />
})()}
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
                </>
              )}
            </g>
          )
        })}
        {/* SS光路 */}
        {showSSBeam && objects.filter(o => o.name.startsWith("SS")).map(obj => {
          const rad = (obj.rotation * Math.PI) / 180
          // 半円側の上端・下端（ローカル座標）
          const localPoints: [number, number][] = [
            [obj.x, obj.y],
            [obj.x, obj.y + obj.height],
          ]
          return localPoints.map(([lx, ly], pi) => {
            const [px, py] = getPivot(obj)
            // 回転適用
            const dx = lx - px, dy = ly - py
            const rx = dx * Math.cos(rad) - dy * Math.sin(rad) + px
            const ry = dx * Math.sin(rad) + dy * Math.cos(rad) + py
            // 方向ベクトル（半円の向きは左＝-x方向）
            const dirX = -Math.cos(rad)
            const dirY = -Math.sin(rad)
            const far = 3000
            return (
              <line
                key={`ss-beam-${obj.id}-${pi}`}
                x1={rx} y1={ry}
                x2={rx + dirX * far}
                y2={ry + dirY * far}
                stroke="black"
                strokeWidth="2"
                strokeDasharray="12 6 3 6"
                opacity="0.4"
              />
            )
          })
        })}
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
  strokeWidth="5"
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
  strokeWidth="5"
/>
{/* 固定幕 */}
{drawSideCurtain(182 * 1.8)}
{drawSideCurtain(182 * 3.1)}
{drawSideCurtain(stageHeight - 182 * 1.25)}
{drawSideCurtain(stageHeight - 182 * 2.75)}
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
      </svg>
{/*ファイル保存*/}
<input
type="file"
 accept=".svg"
 onChange={handleImport}
 style={{
   marginTop: 10,
   marginBottom: 10,
   alignSelf: "flex-start", 
   marginLeft: 10  
  }}
/>
{/* 間モード・SS光路トグル */}
<div style={{ marginLeft: 10, marginBottom: 10 }}>
  <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
    間モード
    <input
      type="checkbox"
      checked={useKen}
      onChange={(e) => setUseKen(e.target.checked)}
    />
  </label>
  <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
    SSの光路
    <input
      type="checkbox"
      checked={showSSBeam}
      onChange={(e) => setShowSSBeam(e.target.checked)}
    />
  </label>
</div>
</div>
{/*=========使い方ポップアップ========= */}
{helpOpen && (
  <div style={{
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#fff",
    padding: 20,
    zIndex: 2000,
    border: "1px solid #ccc",
    width: "80%",
    maxWidth: 280,
    aspectRatio: "3 / 4",
    textAlign: "center"
  }}>
    <div style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10
}}>

  {/* 左ボタン */}
  <button
    disabled={helpPage === 0}
    onClick={() => setHelpPage(p => p - 1)}
  >
    ←
  </button>

  {/* 画像 */}
  <img
  src={helpPages[helpPage].img}
  style={{
    maxWidth: helpPages[helpPage].img === "/stagepng.png" ? "70%" : "90%",
    maxHeight: "50vh",
    objectFit: "contain"
  }}
/>

  {/* 右ボタン */}
  <button
    disabled={helpPage === helpPages.length - 1}
    onClick={() => setHelpPage(p => p + 1)}
  >
    →
  </button>

</div>

    <div style={{ 
      marginBottom: 10,
      whiteSpace: "pre-line"
    }}>
      {helpPages[helpPage].text}
    </div>

    {/* ページ数 */}
    <div style={{ marginBottom: 8 }}>
      {helpPage + 1} / {helpPages.length}
    </div>

    <button
    style={{paddingBottom: "10px" }} 
    onClick={() => setHelpOpen(false)}>閉じる</button>
  </div>
)}

{/*======更新ポップアップ =======*/}
{updateOpen && (
  <div style={popupStyle}>
    <div style={{ fontWeight: "bold", marginBottom: 10 }}>
  更新内容
</div>

<div style={{ whiteSpace: "pre-line", textAlign: "left", paddingLeft: 10  }}>
{`2026/04/19:
・間モードを追加
・回転中心を追加

2026/04/25:
・回転中心に関するバグを修正
・使い方を整備

2026/04/25:
・円形カスタムパーツインポート時のバグを修正
・SSの光路表示機能を追加
・カスタムパーツに模様機能を追加
・レイヤー一覧の反応を改善
`}
</div>
    <button
    style={
      {paddingBottom: "10px" }
    } 
    onClick={() => setUpdateOpen(false)}>閉じる</button>
  </div>
)}

{(helpOpen || updateOpen || showCustom) && (
  <div
    onClick={() => {
      setHelpOpen(false)
      setUpdateOpen(false)
      setShowCustom(false)
    }}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0)",
      zIndex: 1999
    }}
  />
)}

{/* ===== レイヤー一覧 ===== */}
<div style={{
  position: "fixed",
  bottom: 0,
  left: 0,
  width: "100%",
  boxSizing: "border-box",
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
      onClick={() => setSelectedId(obj.id === selectedId ? null : obj.id)}
      style={{
        minWidth: isMobile ? 100 : 140,
        minHeight: isMobile ? 90 : 110,
        padding: isMobile ? "6px" : "10px",
        border: obj.id === selectedId ? "3px solid red" : "1px solid #ccc",
        borderRadius: 5,
        background: obj.id === selectedId ? "#ffdede" : "#fafafa",
        cursor: "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <div style={{ fontSize: 14, padding: "6px" }}>
        {obj.name}
      </div>
{selectedId === obj.id && (
  <div style={{ display: "flex", justifyContent: "space-between",
     marginTop: 4 , flexShrink: 0 }}>
    
    <button 
    style={{ width: 30, height: 30 }}
    onClick={(e) => {
      e.stopPropagation()
      setObjects(prev => {
        const i = prev.findIndex(o => o.id === obj.id)
        if (i <= 0) return prev
        const arr = [...prev]
        ;[arr[i], arr[i - 1]] = [arr[i - 1], arr[i]]
        return arr.map((o, idx) => ({ ...o, zIndex: idx }))
      })
    }}>
      ←
    </button>

    <button 
    style={{ width: 30, height: 30 }}
    onClick={(e) => {
      e.stopPropagation()
      setObjects(prev => {
        const i = prev.findIndex(o => o.id === obj.id)
        if (i >= prev.length - 1) return prev
        const arr = [...prev]
        ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
        return arr.map((o, idx) => ({ ...o, zIndex: idx }))
      })
    }}>
      →
    </button>

  </div>
)}   
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
     {/* ===== ヘッダー ===== */}
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    {panelView !== "home" && (
      <button onClick={() => setPanelView("home")}>←</button>
    )}
    <h3>パーツ</h3>
    <button onClick={() => 
    {setRightOpen(false)
      setPanelView("home")
    }}>✕</button>
  </div>
 <div>

{/* ================= ホーム ================= */}
{panelView === "home" && (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {/* 幕 */}
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
        x: 1001 - 91 / 2,
        y: 819 - 10 / 2,
        width: 91,
        height: 10,
        rotation: 0,
        zIndex: objects.length,
        name: `パネル${getNextNumber("パネル")}`,
        pivotMode: 4 ,
      }
      setObjects([...objects, newObj])
      setSelectedId(newObj.id)
      setRightOpen(false)
      setPanelView("home")
    }}>
      パネル
    </button>

    <button 
    style={{
      fontSize: 18,
      padding: "12px 16px",
    }}
    onClick={() => setPanelView("platform")}>
      平台
    </button>

    <button 
    style={{
      fontSize: 18,
      padding: "12px 16px",
    }}
    onClick={() => setPanelView("other")}>
      その他
    </button>

    {/* カスタム */}
    <button onClick={() => {
      setShowCustom(true)
      setRightOpen(false)
      setPanelView("home")
    }}>
      カスタム追加
    </button>
  </div>
)}

{/* ================= 平台 ================= */}
{panelView === "platform" && (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <button
    style={{
      fontSize: 18,
      padding: "12px 16px",
    }} 
    onClick={() => {
      const newObj: Obj = {
        id: Date.now(),
        type: "platform",
        x: 1001 - 91 / 2,
        y: 819 - 182 / 2,
        width: 91,
        height: 182,
        rotation: 0,
        zIndex: objects.length,
        name: `サブロク${getNextNumber("サブロク")}`,
        pivotMode: 4 ,
      }
      setObjects([...objects, newObj])
      setSelectedId(newObj.id)
      setRightOpen(false)
      setPanelView("home")
    }}>サブロク</button>

    <button 
    style={{
      fontSize: 18,
      padding: "12px 16px",
    }}
    onClick={() => {
      const newObj: Obj = {
        id: Date.now(),
        type: "platform",
        x: 1001 - 91 / 2,
        y: 819 - 91 / 2,
        width: 91,
        height: 91,
        rotation: 0,
        zIndex: objects.length,
        name: `サンサン${getNextNumber("サンサン")}`,
        pivotMode: 4 ,
      }
      setObjects([...objects, newObj])
      setSelectedId(newObj.id)
      setRightOpen(false)
      setPanelView("home")
    }}>サンサン</button>

    <button 
    style={{
      fontSize: 18,
      padding: "12px 16px",
    }}
    onClick={() => {
      const newObj: Obj = {
        id: Date.now(),
        type: "platform",
        x: 1001 - 182 / 2,
        y: 819 - 182 / 2,
        width: 182,
        height: 182,
        rotation: 0,
        zIndex: objects.length,
        name: `ロクロク${getNextNumber("ロクロク")}`,
        pivotMode: 4 ,
      }
      setObjects([...objects, newObj])
      setSelectedId(newObj.id)
      setRightOpen(false)
      setPanelView("home")
    }}>ロクロク</button>
  </div>
)}

{/* ================= その他 ================= */}
{panelView === "other" && (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <button 
    style={{
      fontSize: 18,
      padding: "12px 16px",
    }}
    onClick={() => {
      const newObj: Obj = {
        id: Date.now(),
        type: "platform",
        x: 1001 - 182 / 2,
        y: 819 - 91 / 2,
        width: 182,
        height: 91,
        rotation: 0,
        zIndex: objects.length,
        name: `影段${getNextNumber("影段")}`,
        pivotMode: 4 ,
      }
      setObjects([...objects, newObj])
      setSelectedId(newObj.id)
      setRightOpen(false)
      setPanelView("home")
    }}>影段</button>

    <button 
    style={{
      fontSize: 18,
      padding: "12px 16px",
    }}
    onClick={() => {
      const newObj: Obj = {
        id: Date.now(),
        type: "platform",
        x: 1001 - 50 / 2,
        y: 819 - 24 / 2,
        width: 50,
        height: 24,
        rotation: 0,
        zIndex: objects.length,
        name: `スモーク${getNextNumber("スモーク")}`,
        pivotMode: 4 ,
      }
      setObjects([...objects, newObj])
      setSelectedId(newObj.id)
      setRightOpen(false)
      setPanelView("home")
    }}>スモーク</button>

    <button 
    style={{
      fontSize: 18,
      padding: "12px 16px",
    }}
    onClick={() => {
      const newObj: Obj = {
        id: Date.now(),
        type: "platform",
        x: 1001 - 48 / 2,
        y: 819 - 34 / 2,
        width: 48,
        height: 34,
        rotation: 0,
        zIndex: objects.length,
        name: `SS${getNextNumber("SS")}`,
        pivotMode: 4 ,
      }
      setObjects([...objects, newObj])
      setSelectedId(newObj.id)
      setRightOpen(false)
      setPanelView("home")
    }}>SS</button>
  </div>
)}

</div>
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
    zIndex: 2000,
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
      高さ:
    <input
      value={customSize.h}
      onChange={(e) =>
        setCustomSize({ ...customSize, h: e.target.value })
      }
    />
    cm
    </div>

    <div style={{ marginTop: 10, marginBottom: 10 }}>
      模様:
      <select
        value={customSize.pattern || "none"}
        onChange={(e) =>
          setCustomSize({ ...customSize, pattern: e.target.value as "none" | "diagonal" | "dots" })
        }
      >
        <option value="none">なし</option>
        <option value="diagonal">斜線</option>
        <option value="dots">ドット</option>
      </select>
    </div>

    <button
      onClick={() => {
        const newObj = {
          id: Date.now(),
          type: "panel" as const,
          x: 1001 - Number(customSize.w) / 2,
          y: 819 - Number(customSize.h) / 2,
          width: Number(customSize.w),
          height: Number(customSize.h),
          rotation: 0,
          zIndex: objects.length,
          shape: customShape ,
          name: `カスタム${getNextNumber("カスタム")}`,
          pivotMode: 4 ,
          pattern: customSize.pattern
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
{/*=========================下パネル=======================================*/}
{!isExporting && selectedObj && (
  <div
  style={{
    position: "fixed",
    bottom: isMobile ? "12vh" : 130,
    left: 0,
    width: "100%",
    boxSizing: "border-box",
    background: "#ddd",
    padding: "6px 8px",
    zIndex: 60,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  }}
>

  {/* ===== 左ブロック ===== */}
  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0, overflow: "hidden" }}>

    {/* 上段 */}
    <div style={{ display: "flex", gap: 10 , minWidth: 200 }}>
      {!isMobile && <strong>{selectedObj.name}</strong>}

      <button 
      style={{
        fontSize: 15,
        padding: "6px 10px",
        height: 36
      }}
      onClick={() => {
        setObjects(objects.filter(o => o.id !== selectedObj.id))
        setSelectedId(null)
      }}>削除</button>

      <button 
      style={{
        fontSize: 16,
        padding: "6px 10px",
        height: 36
      }}
      onClick={() => {
        setObjects(prev =>
  prev.map(o =>
    o.id === selectedObj.id
      ? changePivot(o, (o.pivotMode + 1) % 4)
      : o
  )
)
      }}>
      角
      </button>

      <button 
      style={{
        fontSize: 15,
        padding: "6px 10px",
        height: 36
      }}
      onClick={() => {
  setObjects(prev =>
  prev.map(o =>
    o.id === selectedObj.id
      ? changePivot(o, 4)
      : o
  )
)
  }}>
      中心
      </button>
    </div>

    {/* 中段 */}
    <div style={{ display: "flex", gap: 10 }}>
      <div>
        {useKen ? "中央から:" : "X:"}
        <input
  style={{ width: 60 }}
  type="number"
  value={editX}
  onChange={(e) => setEditX(e.target.value)}
  onBlur={() => {
    const value = Number(editX)
    if (!isNaN(value)) {
      setObjects(objects.map(obj =>
        obj.id === selectedObj.id
          ? {
              ...obj,
              x: Math.max(0, Math.min(
              stageWidth - obj.width,
              applyX(value, obj)
            ))
            }
          : obj
      ))
    }
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter") e.currentTarget.blur()
  }}
/>
      </div>
      <div>
        {useKen ? "手前から:" : "Y:"}
        <input
  style={{ width: 60 }}
  type="number"
  value={editY}
  onChange={(e) => setEditY(e.target.value)}
  onBlur={() => {
    const value = Number(editY)
    if (!isNaN(value)) {
      setObjects(objects.map(obj =>
        obj.id === selectedObj.id
          ? {
              ...obj,
              y: Math.max(0, Math.min(
              stageHeight - obj.height,
              applyY(value, obj)
              ))
            }
          : obj
      ))
    }
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter") e.currentTarget.blur()
  }}
/>
      </div>
    </div>

    {/* 下段 */}
    <div>
      回転:
      <input
  style={{ width: 60 }}
  type="number"
  value={editRot}
  onChange={(e) => setEditRot(e.target.value)}
  onBlur={() => {
    const value = Number(editRot)
    if (!isNaN(value)) {
      setObjects(objects.map(obj =>
        obj.id === selectedObj.id
          ? { ...obj, rotation:((value % 360) + 360) % 360}
          : obj
      ))
    }
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter") e.currentTarget.blur()
  }}
/>
    </div>

  </div>

  {/* ===== 右：ジョイスティック ===== */}
  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, clamp(36px, 10vw, 56px))",
    gridTemplateRows: "repeat(2, clamp(36px, 10vw, 56px))",
    gap: "clamp(2px, 1vw, 6px)",
    flexShrink: 1,
    flex: 1,
    maxWidth: 250,
    aspectRatio: "3 / 2",
    minHeight: 100
  }}>

    <button onPointerDown={() => setRotateDir(-1)}
    onPointerUp={() => setRotateDir(0)}
    onPointerLeave={() => setRotateDir(0)}
    onPointerCancel={() => setRotateDir(0)}>⟲</button>
    <button onPointerDown={() => setMoveDir({x:0,y:-1})}>↑</button>
    <button onPointerDown={() => setRotateDir(1)}
    onPointerUp={() => setRotateDir(0)}
    onPointerLeave={() => setRotateDir(0)}
    onPointerCancel={() => setRotateDir(0)}>⟳</button>

    <button onPointerDown={() => setMoveDir({x:-1,y:0})}>←</button>
    <button onPointerDown={() => setMoveDir({x:0,y:1})}>↓</button>
    <button onPointerDown={() => setMoveDir({x:1,y:0})}>→</button>

  </div>

</div>
)}
    </div>
  )
}

export default App