export default function CourseDiagram({ id }) {
  const diagrams = {

    mewp_types: (
      <div style={{margin:'1.5rem 0', overflowX:'auto'}}>
        <svg width="100%" viewBox="0 0 680 360" xmlns="http://www.w3.org/2000/svg" style={{fontFamily:'Inter,sans-serif'}}>
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
            </marker>
          </defs>
          {/* Title */}
          <text x="340" y="28" textAnchor="middle" fontWeight="700" fontSize="15" fill="#0A1F44">MEWP Classification — ANSI A92</text>

          {/* Group A box */}
          <rect x="40" y="50" width="270" height="280" rx="10" fill="#E6F1FB" stroke="#185FA5" strokeWidth="1.5"/>
          <rect x="40" y="50" width="270" height="36" rx="10" fill="#0A1F44"/>
          <rect x="40" y="72" width="270" height="14" fill="#0A1F44"/>
          <text x="175" y="73" textAnchor="middle" fontWeight="700" fontSize="13" fill="#C9A84C">GROUP A — Inside Tipping Lines</text>
          <text x="175" y="103" textAnchor="middle" fontSize="11" fill="#185FA5">Platform stays within chassis footprint</text>

          {/* Group A types */}
          {[
            { y: 122, label: 'Type 1', sub: 'Travels in stowed position only', ex: 'e.g. manual push scissor lift' },
            { y: 192, label: 'Type 2', sub: 'Driven elevated — chassis controls', ex: 'e.g. electric scissor lift' },
            { y: 262, label: 'Type 3', sub: 'Driven elevated — platform controls', ex: 'e.g. self-propelled scissor lift' },
          ].map(t => (
            <g key={t.y}>
              <rect x="58" y={t.y} width="234" height="58" rx="6" fill="white" stroke="#B5D4F4" strokeWidth="1"/>
              <text x="175" y={t.y+18} textAnchor="middle" fontWeight="700" fontSize="12" fill="#0A1F44">{t.label}</text>
              <text x="175" y={t.y+34} textAnchor="middle" fontSize="11" fill="#374151">{t.sub}</text>
              <text x="175" y={t.y+49} textAnchor="middle" fontSize="10" fill="#9ca3af">{t.ex}</text>
            </g>
          ))}

          {/* Group B box */}
          <rect x="370" y="50" width="270" height="280" rx="10" fill="#FAECE7" stroke="#993C1D" strokeWidth="1.5"/>
          <rect x="370" y="50" width="270" height="36" rx="10" fill="#0A1F44"/>
          <rect x="370" y="72" width="270" height="14" fill="#0A1F44"/>
          <text x="505" y="73" textAnchor="middle" fontWeight="700" fontSize="13" fill="#C9A84C">GROUP B — Beyond Tipping Lines</text>
          <text x="505" y="103" textAnchor="middle" fontSize="11" fill="#993C1D">Platform can extend past chassis</text>

          {[
            { y: 122, label: 'Type 1', sub: 'Travels in stowed position only', ex: 'e.g. towable boom lift' },
            { y: 192, label: 'Type 2', sub: 'Driven elevated — chassis controls', ex: 'e.g. telescopic boom lift' },
            { y: 262, label: 'Type 3', sub: 'Driven elevated — platform controls', ex: 'e.g. articulating boom lift' },
          ].map(t => (
            <g key={t.y}>
              <rect x="388" y={t.y} width="234" height="58" rx="6" fill="white" stroke="#F5C4B3" strokeWidth="1"/>
              <text x="505" y={t.y+18} textAnchor="middle" fontWeight="700" fontSize="12" fill="#0A1F44">{t.label}</text>
              <text x="505" y={t.y+34} textAnchor="middle" fontSize="11" fill="#374151">{t.sub}</text>
              <text x="505" y={t.y+49} textAnchor="middle" fontSize="10" fill="#9ca3af">{t.ex}</text>
            </g>
          ))}

          {/* Divider label */}
          <text x="340" y="198" textAnchor="middle" fontSize="11" fill="#888" fontStyle="italic">vs.</text>
        </svg>
      </div>
    ),

    powerline_distances: (
      <div style={{margin:'1.5rem 0', overflowX:'auto'}}>
        <svg width="100%" viewBox="0 0 680 320" xmlns="http://www.w3.org/2000/svg" style={{fontFamily:'Inter,sans-serif'}}>
          <text x="340" y="24" textAnchor="middle" fontWeight="700" fontSize="14" fill="#0A1F44">Minimum Approach Distances — OSHA 29 CFR 1926.1408</text>

          {/* Ground */}
          <rect x="40" y="270" width="600" height="30" rx="4" fill="#d1fae5" stroke="#6ee7b7" strokeWidth="1"/>
          <text x="340" y="289" textAnchor="middle" fontSize="11" fill="#065f46" fontWeight="600">GROUND LEVEL</text>

          {/* MEWP outline */}
          <rect x="80" y="200" width="60" height="68" rx="4" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/>
          <rect x="95" y="165" width="30" height="36" rx="3" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1"/>
          <text x="110" y="245" textAnchor="middle" fontSize="10" fill="#1e40af" fontWeight="600">MEWP</text>
          <text x="110" y="258" textAnchor="middle" fontSize="9" fill="#1e40af">platform</text>

          {/* Power line */}
          <line x1="200" y1="50" x2="640" y2="50" stroke="#dc2626" strokeWidth="3" strokeDasharray="8 3"/>
          <circle cx="240" cy="50" r="5" fill="#dc2626"/>
          <circle cx="340" cy="50" r="5" fill="#dc2626"/>
          <circle cx="440" cy="50" r="5" fill="#dc2626"/>
          <circle cx="540" cy="50" r="5" fill="#dc2626"/>
          <circle cx="620" cy="50" r="5" fill="#dc2626"/>
          <text x="430" y="40" textAnchor="middle" fontSize="12" fill="#dc2626" fontWeight="700">⚡ ENERGIZED POWER LINE</text>

          {/* Distance arrows for different voltages */}
          {[
            { x: 200, dist: '10 ft', volt: 'up to 50kV', color: '#dc2626' },
            { x: 310, dist: '15 ft', volt: '50–200kV', color: '#ea580c' },
            { x: 420, dist: '20 ft', volt: '200–350kV', color: '#d97706' },
            { x: 530, dist: '25 ft', volt: '350–500kV', color: '#65a30d' },
          ].map(d => (
            <g key={d.x}>
              <line x1={d.x} y1="55" x2={d.x} y2="265" stroke={d.color} strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#arr)"/>
              <rect x={d.x-32} y="140" width="64" height="34" rx="4" fill="white" stroke={d.color} strokeWidth="1.5"/>
              <text x={d.x} y="153" textAnchor="middle" fontSize="12" fill={d.color} fontWeight="700">{d.dist}</text>
              <text x={d.x} y="167" textAnchor="middle" fontSize="9" fill="#4b5563">{d.volt}</text>
            </g>
          ))}

          <text x="340" y="308" textAnchor="middle" fontSize="10" fill="#6b7280" fontStyle="italic">If voltage is unknown — maintain maximum distance</text>
        </svg>
      </div>
    ),

    inspection_checklist: (
      <div style={{margin:'1.5rem 0'}}>
        <div style={{background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden'}}>
          <div style={{background:'#0A1F44', padding:'0.75rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span style={{color:'#C9A84C', fontWeight:700, fontSize:'0.9rem'}}>Pre-Operation Inspection Checklist</span>
            <span style={{color:'#9ca3af', fontSize:'0.75rem'}}>Required before every shift — ANSI A92.22-2018</span>
          </div>
          {[
            { phase: '1. Walk-Around (Power Off)', color: '#0A1F44', items: [
              'No visible cracks, bends, or damage to boom/chassis/platform',
              'All safety labels and decals present and legible',
              'Tires/wheels undamaged, properly inflated',
              'Guards and covers in place',
              'Fluid levels checked (oil, hydraulic, coolant, fuel/battery)',
              'Fall protection anchor points secure and undamaged',
            ]},
            { phase: '2. Pre-Start Checks', color: '#1e40af', items: [
              'Operator manual present on machine',
              'Emergency lowering controls accessible',
              'Platform entry gate closes and latches',
              'Platform floor clear of debris, ice, or oil',
            ]},
            { phase: '3. Powered Function Tests', color: '#065f46', items: [
              'All controls operate smoothly (up, down, rotate, extend)',
              'Emergency stop button functions correctly',
              'Horn and lights functional (if required)',
              'No fault codes on control panel',
            ]},
          ].map((section, si) => (
            <div key={si}>
              <div style={{background: si===0 ? '#EFF6FF' : si===1 ? '#EFF6FF' : '#F0FDF4', padding:'0.5rem 1.25rem', borderTop:'1px solid #e5e7eb'}}>
                <span style={{fontWeight:700, fontSize:'0.85rem', color: section.color}}>{section.phase}</span>
              </div>
              {section.items.map((item, ii) => (
                <div key={ii} style={{display:'flex', alignItems:'flex-start', gap:'0.75rem', padding:'0.5rem 1.25rem', borderTop:'1px solid #f3f4f6', background: ii%2===0?'white':'#fafafa'}}>
                  <span style={{width:18,height:18,border:'2px solid #d1d5db',borderRadius:3,flexShrink:0,marginTop:1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#9ca3af'}}>☐</span>
                  <span style={{fontSize:'0.85rem', color:'#374151'}}>{item}</span>
                </div>
              ))}
            </div>
          ))}
          <div style={{padding:'0.75rem 1.25rem', background:'#fff8e6', borderTop:'2px solid #C9A84C'}}>
            <span style={{fontSize:'0.8rem', color:'#7a5c00', fontWeight:600}}>⚠ If ANY item fails — tag the machine OUT OF SERVICE and notify your supervisor immediately.</span>
          </div>
        </div>
      </div>
    ),

    fall_protection: (
      <div style={{margin:'1.5rem 0', overflowX:'auto'}}>
        <svg width="100%" viewBox="0 0 680 340" xmlns="http://www.w3.org/2000/svg" style={{fontFamily:'Inter,sans-serif'}}>
          <text x="340" y="24" textAnchor="middle" fontWeight="700" fontSize="14" fill="#0A1F44">Full-Body Harness — Key Components</text>

          {/* Human figure */}
          {/* Head */}
          <circle cx="270" cy="65" r="22" fill="#fde68a" stroke="#92400e" strokeWidth="1.5"/>
          {/* Body */}
          <rect x="245" y="88" width="50" height="80" rx="8" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/>
          {/* Arms */}
          <line x1="245" y1="100" x2="210" y2="140" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round"/>
          <line x1="295" y1="100" x2="330" y2="140" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round"/>
          {/* Legs */}
          <line x1="258" y1="168" x2="248" y2="230" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round"/>
          <line x1="282" y1="168" x2="292" y2="230" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round"/>

          {/* Harness straps */}
          {/* Shoulder straps */}
          <line x1="258" y1="88" x2="240" y2="130" stroke="#C9A84C" strokeWidth="4" strokeLinecap="round"/>
          <line x1="282" y1="88" x2="300" y2="130" stroke="#C9A84C" strokeWidth="4" strokeLinecap="round"/>
          {/* Chest strap */}
          <line x1="245" y1="118" x2="295" y2="118" stroke="#C9A84C" strokeWidth="3" strokeLinecap="round"/>
          {/* Leg straps */}
          <line x1="252" y1="168" x2="238" y2="200" stroke="#C9A84C" strokeWidth="4" strokeLinecap="round"/>
          <line x1="288" y1="168" x2="302" y2="200" stroke="#C9A84C" strokeWidth="4" strokeLinecap="round"/>
          {/* Back D-ring */}
          <circle cx="270" cy="105" r="8" fill="none" stroke="#991b1b" strokeWidth="3"/>
          <text x="270" y="108" textAnchor="middle" fontSize="8" fill="#991b1b" fontWeight="700">D</text>

          {/* Labels right side */}
          {[
            { y: 65, label: 'Hard hat required', color: '#0A1F44' },
            { y: 95, label: 'Back D-ring — primary anchor point', color: '#991b1b' },
            { y: 120, label: 'Chest strap — connects shoulders', color: '#92400e' },
            { y: 155, label: 'Waist belt — positioning only', color: '#374151' },
            { y: 185, label: 'Leg straps — prevent harness riding up', color: '#374151' },
          ].map((l, i) => (
            <g key={i}>
              <line x1="320" y1={l.y} x2="360" y2={l.y} stroke="#d1d5db" strokeWidth="1" strokeDasharray="3 2"/>
              <text x="366" y={l.y+4} fontSize="11" fill={l.color} fontWeight={l.color==="#991b1b"?"700":"400"}>{l.label}</text>
            </g>
          ))}

          {/* SRL shown attached */}
          <line x1="270" y1="97" x2="270" y2="55" stroke="#991b1b" strokeWidth="2" strokeDasharray="4 2"/>
          <rect x="255" y="38" width="30" height="18" rx="4" fill="#fef2f2" stroke="#991b1b" strokeWidth="1.5"/>
          <text x="270" y="50" textAnchor="middle" fontSize="9" fill="#991b1b" fontWeight="700">SRL</text>

          <text x="340" y="320" textAnchor="middle" fontSize="10" fill="#6b7280" fontStyle="italic">Always connect harness to a designated platform anchor point — never to the guardrail</text>
        </svg>
      </div>
    ),

    site_hazards: (
      <div style={{margin:'1.5rem 0', overflowX:'auto'}}>
        <svg width="100%" viewBox="0 0 680 300" xmlns="http://www.w3.org/2000/svg" style={{fontFamily:'Inter,sans-serif'}}>
          <text x="340" y="24" textAnchor="middle" fontWeight="700" fontSize="14" fill="#0A1F44">Site Hazard Assessment — Key Categories</text>

          {[
            { x:40, y:45, w:150, h:120, color:'#dc2626', bg:'#fef2f2', title:'⚡ Electrical', items:['Overhead power lines','Exposed wiring','Energized equipment'] },
            { x:205, y:45, w:150, h:120, color:'#d97706', bg:'#fff8e6', title:'🏗 Ground', items:['Soft/muddy soil','Slopes over 3-5°','Holes and drop-offs'] },
            { x:370, y:45, w:150, h:120, color:'#2563eb', bg:'#eff6ff', title:'🌬 Environmental', items:['High winds (>28 mph)','Lightning','Poor visibility'] },
            { x:535, y:45, w:140, h:120, color:'#16a34a', bg:'#f0fdf4', title:'👷 People', items:['Pedestrian zones','Other equipment','Overhead workers'] },
            { x:40, y:185, w:150, h:95, color:'#7c3aed', bg:'#f5f3ff', title:'🔧 Overhead', items:['Power lines','Pipes & conduit','Structural beams'] },
            { x:205, y:185, w:150, h:95, color:'#0891b2', bg:'#f0f9ff', title:'🚧 Traffic', items:['Vehicle traffic','Exclusion zones','Spotters required'] },
            { x:370, y:185, w:310, h:95, color:'#0A1F44', bg:'#f9fafb', title:'📋 Required Before Starting', items:['Site assessment complete','Rescue plan in place','All hazards communicated to crew'] },
          ].map((box, i) => (
            <g key={i}>
              <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="8" fill={box.bg} stroke={box.color} strokeWidth="1.5"/>
              <text x={box.x+10} y={box.y+20} fontSize="12" fontWeight="700" fill={box.color}>{box.title}</text>
              {box.items.map((item, j) => (
                <text key={j} x={box.x+14} y={box.y+38+(j*18)} fontSize="11" fill="#374151">• {item}</text>
              ))}
            </g>
          ))}
        </svg>
      </div>
    ),

    emergency_procedures: (
      <div style={{margin:'1.5rem 0', overflowX:'auto'}}>
        <svg width="100%" viewBox="0 0 680 380" xmlns="http://www.w3.org/2000/svg" style={{fontFamily:'Inter,sans-serif'}}>
          <defs>
            <marker id="earr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
            </marker>
          </defs>
          <text x="340" y="24" textAnchor="middle" fontWeight="700" fontSize="14" fill="#0A1F44">Emergency Response Flowchart</text>

          {/* Start */}
          <rect x="265" y="38" width="150" height="36" rx="18" fill="#0A1F44"/>
          <text x="340" y="60" textAnchor="middle" fontSize="12" fontWeight="700" fill="#C9A84C">EMERGENCY OCCURS</text>
          <line x1="340" y1="74" x2="340" y2="98" stroke="#374151" strokeWidth="1.5" markerEnd="url(#earr)"/>

          {/* Decision */}
          <polygon points="340,98 430,128 340,158 250,128" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5"/>
          <text x="340" y="124" textAnchor="middle" fontSize="11" fill="#92400e">Are you</text>
          <text x="340" y="140" textAnchor="middle" fontSize="11" fill="#92400e">elevated?</text>

          {/* Yes branch */}
          <line x1="430" y1="128" x2="520" y2="128" stroke="#374151" strokeWidth="1.5" markerEnd="url(#earr)"/>
          <text x="475" y="122" textAnchor="middle" fontSize="10" fill="#374151">YES</text>
          <rect x="520" y="108" width="130" height="40" rx="6" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.5"/>
          <text x="585" y="125" textAnchor="middle" fontSize="11" fill="#991b1b" fontWeight="600">STAY in platform</text>
          <text x="585" y="140" textAnchor="middle" fontSize="10" fill="#991b1b">Hold on — do not jump</text>

          {/* No branch */}
          <line x1="340" y1="158" x2="340" y2="188" stroke="#374151" strokeWidth="1.5" markerEnd="url(#earr)"/>
          <text x="352" y="177" fontSize="10" fill="#374151">NO</text>

          {/* Ground actions */}
          <rect x="240" y="188" width="200" height="40" rx="6" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.5"/>
          <text x="340" y="205" textAnchor="middle" fontSize="11" fill="#065f46" fontWeight="600">Call 911 if injury</text>
          <text x="340" y="220" textAnchor="middle" fontSize="10" fill="#065f46">Secure the scene</text>

          <line x1="340" y1="228" x2="340" y2="258" stroke="#374151" strokeWidth="1.5" markerEnd="url(#earr)"/>

          <rect x="220" y="258" width="240" height="40" rx="6" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5"/>
          <text x="340" y="275" textAnchor="middle" fontSize="11" fill="#1e40af" fontWeight="600">Use emergency lowering</text>
          <text x="340" y="290" textAnchor="middle" fontSize="10" fill="#1e40af">to retrieve elevated operator</text>

          <line x1="340" y1="298" x2="340" y2="328" stroke="#374151" strokeWidth="1.5" markerEnd="url(#earr)"/>

          <rect x="215" y="328" width="250" height="40" rx="6" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1.5"/>
          <text x="340" y="345" textAnchor="middle" fontSize="11" fill="#5b21b6" fontWeight="600">Do NOT move machine</text>
          <text x="340" y="360" textAnchor="middle" fontSize="10" fill="#5b21b6">Notify supervisor — complete incident report</text>

          {/* Also from elevated */}
          <line x1="585" y1="148" x2="585" y2="273" stroke="#dc2626" strokeWidth="1" strokeDasharray="4 3"/>
          <line x1="585" y1="273" x2="462" y2="273" stroke="#dc2626" strokeWidth="1" markerEnd="url(#earr)" strokeDasharray="4 3"/>
          <text x="640" y="215" fontSize="10" fill="#dc2626" fontStyle="italic">if fire</text>
          <text x="620" y="228" fontSize="10" fill="#dc2626" fontStyle="italic">— jump</text>
          <text x="620" y="241" fontSize="10" fill="#dc2626" fontStyle="italic">clear</text>
        </svg>
      </div>
    ),
  }

  return diagrams[id] || null
}
