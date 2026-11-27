import { useId } from 'react'
import { giftConfig } from '../config/gift.config'
import { mixColors } from '../utils/colors'

// Собственная процедурная графика. Все лепестки, ветви и листья — SVG.
export function FlowerHead({
  x = 0,
  y = 0,
  scale = 1,
  tone = 'pink',
  open = true,
}: {
  x?: number
  y?: number
  scale?: number
  tone?: 'pink' | 'cream' | 'rose'
  open?: boolean
}) {
  const uid = useId().replaceAll(':', '')
  const p = giftConfig.palette
  const colors =
    tone === 'cream'
      ? [
          mixColors(p.cream, '#ffffff', 0.4),
          mixColors(p.cream, p.gold, 0.47),
          mixColors(p.gold, p.brown, 0.18),
        ]
      : tone === 'rose'
        ? [mixColors(p.powder, p.cream, 0.2), p.rose, mixColors(p.rose, p.brown, 0.38)]
        : [mixColors(p.cream, p.powder, 0.12), p.powder, mixColors(p.powder, p.rose, 0.75)]
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <radialGradient id={uid} cx="38%" cy="25%" r="80%">
          <stop stopColor={colors[0]} />
          <stop offset=".65" stopColor={colors[1]} />
          <stop offset="1" stopColor={colors[2]} />
        </radialGradient>
      </defs>
      <g className={`flower-head ${open ? 'bloomed' : 'bud'}`}>
        {[0, 1, 2].map((ring) => (
          <g key={ring} transform={`rotate(${ring * 24}) scale(${1 - ring * 0.23})`}>
            {Array.from({ length: 7 }, (_, i) => (
              <path
                key={i}
                d="M0 5 C-29 -8 -38 -45 -19 -51 C-6 -62 8 -49 10 -35 C34 -53 43 -32 27 -16 C20 -7 10 4 0 5Z"
                fill={`url(#${uid})`}
                stroke={colors[2]}
                strokeOpacity=".19"
                strokeWidth=".7"
                transform={`rotate(${(i * 360) / 7})`}
                opacity={0.93}
              />
            ))}
          </g>
        ))}
        <circle r="9" fill="#bb945b" />
        {Array.from({ length: 12 }, (_, i) => (
          <circle
            key={i}
            cx={Math.cos(i * 2.4) * (i % 2 ? 6 : 9)}
            cy={Math.sin(i * 2.4) * (i % 2 ? 6 : 9)}
            r="1.4"
            fill="#f8df9d"
          />
        ))}
      </g>
    </g>
  )
}

function Leaf({
  x,
  y,
  angle = 0,
  scale = 1,
}: {
  x: number
  y: number
  angle?: number
  scale?: number
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <path
        d="M0 0 C-36 -9 -43 -35 -37 -52 C-9 -49 3 -27 0 0Z"
        fill={giftConfig.palette.sage}
        opacity=".82"
      />
      <path
        d="M0 0 -33 -44"
        stroke={mixColors(giftConfig.palette.sage, giftConfig.palette.brown, 0.3)}
        strokeWidth="1"
        opacity=".6"
      />
    </g>
  )
}

export function Sprig({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 300 460" fill="none" aria-hidden="true">
      <g transform={flip ? 'translate(300 0) scale(-1 1)' : undefined}>
        <path
          d="M150 448 C107 349 182 247 128 102 M146 358 Q68 300 62 220 M144 288 Q241 242 242 157 M151 218 Q71 164 84 105"
          stroke="#899b7d"
          strokeWidth="2.2"
        />
        <Leaf x={143} y={370} angle={-20} scale={1.25} />
        <Leaf x={138} y={333} angle={108} scale={1.1} />
        <Leaf x={143} y={290} angle={-25} />
        <Leaf x={159} y={267} angle={110} />
        <Leaf x={63} y={230} angle={-36} scale={0.8} />
        <Leaf x={93} y={283} angle={50} scale={0.8} />
        <Leaf x={217} y={212} angle={95} />
        <Leaf x={235} y={184} angle={20} scale={0.7} />
        <Leaf x={120} y={193} angle={-15} scale={0.8} />
        <Leaf x={139} y={137} angle={108} scale={0.7} />
        <FlowerHead x={128} y={103} scale={0.9} />
        <FlowerHead x={61} y={211} scale={0.65} tone="cream" />
        <FlowerHead x={239} y={146} scale={0.57} tone="rose" />
        <path d="M130 107 Q74 78 52 29 M244 155 Q282 99 266 57" stroke="#b6a17c" strokeWidth="1" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <ellipse
              cx={54 + i * 12}
              cy={34 + i * 14}
              rx="5"
              ry="10"
              transform={`rotate(-30 ${54 + i * 12} ${34 + i * 14})`}
              fill="#d5bb89"
              opacity=".65"
            />
            <circle cx={269 - i * 3} cy={64 + i * 16} r="3" fill="#d4af77" />
          </g>
        ))}
      </g>
    </svg>
  )
}

export function BouquetArt({
  className = '',
  animated = false,
}: {
  className?: string
  animated?: boolean
}) {
  const flowers = [
    [170, 185, 0.88, 'cream'],
    [295, 130, 1, 'pink'],
    [410, 190, 0.9, 'cream'],
    [230, 247, 1.12, 'rose'],
    [355, 253, 1.15, 'pink'],
    [146, 282, 0.65, 'pink'],
    [437, 294, 0.7, 'rose'],
    [287, 337, 1, 'cream'],
    [373, 356, 0.65, 'pink'],
  ] as const
  return (
    <svg
      data-bouquet="true"
      className={`${className} ${animated ? 'animated-bouquet' : ''}`}
      viewBox="0 0 580 650"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Букет розовых и кремовых цветов, перевязанный лентой"
      role="img"
    >
      <g className="bouquet-stems">
        {flowers.map(([x, y], i) => (
          <path
            key={i}
            d={`M${x} ${y} Q${x + (i % 2 ? 45 : -45)} 410 ${280 + i * 5} ${590 - i * 3}`}
            stroke={i % 2 ? '#91a17f' : '#a8b5a2'}
            strokeWidth="5"
            strokeLinecap="round"
          />
        ))}
      </g>
      <path
        d="M290 550 Q130 370 95 175 M301 539 Q451 388 488 188 M276 493 Q181 265 224 82 M312 515 Q390 210 366 87"
        stroke="#879777"
        strokeWidth="3"
      />
      {[
        [150, 331, -35],
        [184, 400, -40],
        [233, 443, 5],
        [377, 425, 100],
        [430, 354, 115],
        [451, 268, 100],
        [108, 228, -20],
        [222, 150, 30],
        [363, 145, 100],
        [315, 427, 35],
      ].map(([x, y, a], i) => (
        <Leaf key={i} x={x} y={y} angle={a} scale={1.35} />
      ))}
      <g className="bouquet-flowers">
        {flowers.map(([x, y, s, t], i) => (
          <g key={i} style={{ animationDelay: `${0.2 + i * 0.16}s` }}>
            <FlowerHead x={x} y={y} scale={s} tone={t} />
          </g>
        ))}
      </g>
      <g className="bouquet-ribbon">
        <path
          d="M269 502 C202 449 175 478 209 506 C229 518 249 510 283 515 C326 448 365 470 342 501 C327 517 307 510 283 515"
          fill="#c89091"
          stroke="#b7797b"
          strokeWidth="1.5"
        />
        <path
          d="M278 514 Q269 566 220 583 L243 591 L256 615 Q291 559 287 514 M290 516 Q305 573 358 584 L340 598 L341 616 Q302 597 281 519"
          fill="#d8a5a5"
        />
        <ellipse cx="283" cy="513" rx="13" ry="9" fill="#b87980" />
      </g>
      {[
        [108, 365],
        [465, 139],
        [210, 87],
        [417, 434],
      ].map(([x, y], i) => (
        <g key={i} stroke="#c9a464" opacity=".75">
          <path d={`M${x - 5} ${y}h10 M${x} ${y - 5}v10`} />
        </g>
      ))}
    </svg>
  )
}

export function Ambient({ garden = false }: { garden?: boolean }) {
  return (
    <div className={`ambient ${garden ? 'garden-ambient' : ''}`} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${8 + i * 11}%`,
            animationDelay: `${-i * 2.7}s`,
            animationDuration: `${19 + (i % 4) * 3}s`,
            top: `${-15 - i * 3}%`,
          }}
        />
      ))}
      {garden &&
        Array.from({ length: 12 }, (_, i) => (
          <span
            key={`g${i}`}
            className="firefly"
            style={{
              left: `${5 + i * 8}%`,
              top: `${25 + (i % 4) * 16}%`,
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
    </div>
  )
}
