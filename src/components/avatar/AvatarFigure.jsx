const Head = () => (
  <>
    <circle className="wa-skin" cx="0" cy="0" r="11" />
    <path className="wa-hair" d="M-11 -2 Q-11 -13 0 -13 Q11 -13 11 -3 Q7 -8 0 -7 Q-7 -7 -11 -2Z" />
    <circle className="wa-eye" cx="5" cy="1" r="1.4" />
  </>
);

// 60 x 92 box, feet on the bottom edge. Faces right; CSS mirrors it for `data-facing="-1"`.
export const ManArt = () => (
  <svg className="wa-man-svg" viewBox="0 0 60 92" width="60" height="92" aria-hidden="true" focusable="false">
    {/* standing / walking */}
    <g className="wa-pose wa-pose--ground">
      <g className="wa-leg wa-leg--back">
        <rect className="wa-pants" x="23" y="56" width="9" height="30" rx="4" />
        <rect className="wa-shoe" x="22" y="84" width="14" height="8" rx="4" />
      </g>
      <g className="wa-arm wa-arm--back">
        <rect className="wa-hoodie-dark" x="14" y="31" width="8" height="26" rx="4" />
      </g>
      <rect className="wa-hoodie" x="17" y="28" width="26" height="34" rx="10" />
      <g className="wa-leg wa-leg--front">
        <rect className="wa-pants" x="29" y="56" width="9" height="30" rx="4" />
        <rect className="wa-shoe" x="28" y="84" width="14" height="8" rx="4" />
      </g>
      <g className="wa-arm wa-arm--front">
        <rect className="wa-hoodie" x="38" y="31" width="8" height="26" rx="4" />
      </g>
      <g transform="translate(30 17)"><Head /></g>
    </g>

    {/* seated on the bike: hips on the saddle, hands on the bar, feet on the pedals */}
    <g className="wa-pose wa-pose--seated">
      <g className="wa-seated-leg wa-seated-leg--a">
        <polyline className="wa-line wa-line--pants" points="30,52 44,62 34,77" />
        <rect className="wa-shoe" x="29" y="75" width="12" height="5" rx="2.5" />
      </g>
      <g transform="rotate(14 30 52)">
        <rect className="wa-hoodie" x="19" y="24" width="22" height="32" rx="9" />
      </g>
      <g className="wa-seated-leg wa-seated-leg--b">
        <polyline className="wa-line wa-line--pants" points="30,52 46,60 40,74" />
        <rect className="wa-shoe" x="35" y="72" width="12" height="5" rx="2.5" />
      </g>
      <line className="wa-line wa-line--arm" x1="36" y1="33" x2="62" y2="49" />
      <g transform="translate(39 19) rotate(8)"><Head /></g>
    </g>
  </svg>
);

// 100 x 58 box, wheel bottoms on the bottom edge. Faces right.
export const BikeArt = () => (
  <svg className="wa-bike-svg" viewBox="0 0 100 58" width="100" height="58" aria-hidden="true" focusable="false">
    <g className="wa-wheel wa-wheel--rear">
      <circle className="wa-tyre" cx="20" cy="44" r="13" />
      <path className="wa-spoke" d="M20 31V57M7 44H33M10.8 34.8L29.2 53.2M29.2 34.8L10.8 53.2" />
    </g>
    <g className="wa-wheel wa-wheel--front">
      <circle className="wa-tyre" cx="80" cy="44" r="13" />
      <path className="wa-spoke" d="M80 31V57M67 44H93M70.8 34.8L89.2 53.2M89.2 34.8L70.8 53.2" />
    </g>
    <path className="wa-frame" d="M20 44 L40 22 L70 22 L45 44 Z M40 22 L45 44 M70 22 L80 44 M70 22 L69 14 M64 14 L75 14 M40 22 L38 17" />
    <rect className="wa-saddle" x="31" y="14" width="14" height="4" rx="2" />
    <g className="wa-crank">
      <line className="wa-frame" x1="45" y1="44" x2="45" y2="52" />
      <rect className="wa-pedal" x="41" y="51" width="8" height="3" rx="1.5" />
    </g>
  </svg>
);
