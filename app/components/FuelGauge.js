export default function FuelGauge() {
  return (
    <svg
      width="168"
      height="168"
      viewBox="0 0 168 168"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Medidor de combustible"
    >
      <circle cx="84" cy="84" r="80" stroke="#263252" strokeWidth="2" />
      <path
        d="M 24 118 A 68 68 0 1 1 144 118"
        stroke="#1a2540"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 24 118 A 68 68 0 0 1 66 27.6"
        stroke="#ff6b6b"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <path
        d="M 66 27.6 A 68 68 0 0 1 102 27.6"
        stroke="#f5a623"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M 102 27.6 A 68 68 0 0 1 144 118"
        stroke="#34d19a"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <g style={{ transformOrigin: "84px 84px" }}>
        <line
          x1="84"
          y1="84"
          x2="46"
          y2="60"
          stroke="#edf0f7"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <circle cx="84" cy="84" r="7" fill="#edf0f7" />
      <text
        x="84"
        y="146"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="12"
        fill="#8a93ac"
        letterSpacing="1"
      >
        E — F
      </text>
    </svg>
  );
}
