export const MEWP_COURSE = {
  id: 'mewp',
  title: 'MEWP Operator Safety Training',
  subtitle: 'Aerial & Scissor Lifts — Groups A & B, Types 1, 2 & 3',
  standards: ['OSHA 29 CFR 1926.453', 'OSHA 29 CFR 1910.67', 'ANSI A92.22-2018', 'ANSI A92.24-2021', 'CSA B354.6'],
  passingScore: 80,
  chapters: [
    {
      id: 1,
      title: 'Introduction to MEWPs',
      readTime: '8 min',
      content: `
## What is a MEWP?

A **Mobile Elevating Work Platform (MEWP)** is a piece of equipment designed to move persons, tools, and materials to elevated work positions. MEWPs are also commonly referred to as aerial work platforms (AWPs), aerial lifts, or boom lifts.

According to **ANSI A92.22-2018** and **OSHA 29 CFR 1926.453**, all operators must receive formal training before operating any MEWP.

## Why MEWP Training Matters

MEWPs are involved in hundreds of workplace fatalities and thousands of serious injuries every year in the United States. The most common causes include:

- **Falls from the platform** due to improper use of fall protection
- **Tip-overs** caused by operating on uneven or unstable ground
- **Electrocution** from contact with overhead power lines
- **Entrapment** between the platform and overhead structures
- **Struck-by incidents** involving moving equipment

> **OSHA requires** that only trained and authorized workers operate MEWPs. Failure to comply can result in fines up to $15,625 per violation and criminal penalties for willful violations.

## MEWP Classifications Under ANSI A92

The updated ANSI A92 standards classify MEWPs into two groups and three types:

[DIAGRAM:mewp_types]

### Group A — Inside Tipping Lines
The center of the work platform remains within the perimeter of the chassis at all times. Examples include **scissor lifts** and **vertical mast lifts**.

### Group B — Beyond Tipping Lines
The center of the work platform can be positioned beyond the tipping lines of the base. Examples include **articulating boom lifts** and **telescopic boom lifts**.

### Type Classifications
- **Type 1** — Can only travel in the stowed (lowered) position
- **Type 2** — Can be driven elevated, controlled from the chassis
- **Type 3** — Can be driven elevated, controlled from the work platform

## Your Responsibilities as an Operator

Before you ever step onto a MEWP, you must understand that as an operator you are responsible for:

1. Completing authorized training for the specific equipment you will use
2. Inspecting the MEWP before each use
3. Following all manufacturer instructions and safety rules
4. Wearing proper personal protective equipment (PPE)
5. Never operating a MEWP in an unsafe condition
6. Reporting any defects or damage immediately to your supervisor
      `,
      quiz: [
        {
          id: 'q1_1',
          question: 'What does MEWP stand for?',
          options: ['Mobile Elevated Work Platform', 'Mobile Elevating Work Platform', 'Motorized Elevating Work Platform', 'Mobile Equipment Work Platform'],
          correct: 1,
          explanation: 'MEWP stands for Mobile Elevating Work Platform, as defined by ANSI A92 standards.'
        },
        {
          id: 'q1_2',
          question: 'Which MEWP group includes scissor lifts where the platform stays within the chassis perimeter?',
          options: ['Group B', 'Group C', 'Group A', 'Group D'],
          correct: 2,
          explanation: 'Group A MEWPs keep the center of the platform within the chassis perimeter at all times — this includes scissor lifts.'
        },
        {
          id: 'q1_3',
          question: 'According to OSHA, who is allowed to operate a MEWP?',
          options: ['Any employee on the worksite', 'Only employees over 21 years old', 'Only trained and authorized workers', 'Only certified engineers'],
          correct: 2,
          explanation: 'OSHA 29 CFR 1926.453 requires that only trained and authorized workers may operate MEWPs.'
        },
      ]
    },
    {
      id: 2,
      title: 'Pre-Operation Inspection',
      readTime: '10 min',
      content: `
## The Pre-Operation Inspection

A thorough pre-operation inspection is one of the most critical steps in MEWP safety. **ANSI A92.22-2018** requires that a qualified person perform an inspection before each shift or when a different operator takes control of the equipment.

> **Never skip the pre-operation inspection.** Many MEWP accidents are caused by mechanical failures that could have been identified before use.

[DIAGRAM:inspection_checklist]

!! Never skip the pre-operation inspection -- it is required by ANSI A92.22-2018 before every shift.
!! Tag the machine OUT OF SERVICE immediately if any item fails -- never operate a defective MEWP.
!! Report all defects in writing even if you consider them minor.

## The Three-Part Inspection System

### 1. Pre-Start Visual Inspection (Walk-Around)

Before starting the engine or activating controls, walk around the entire machine and inspect:

**Structural Components:**
- Look for visible cracks, bends, dents, or damage to the chassis, boom, and platform
- Check that all safety labels and decals are present and legible
- Inspect tires or wheels for damage, wear, and proper inflation
- Check outriggers or stabilizers for damage (if equipped)
- Verify all guards and covers are in place

**Fluid Levels (where applicable):**
- Engine oil
- Hydraulic fluid
- Coolant
- Fuel or battery charge level

**Fall Protection Anchorages:**
- Inspect all anchor points on the platform
- Verify the lanyard attachment rings are secure and undamaged

### 2. Function Tests (Pre-Start)

With the machine powered off, check:
- All placards, decals, and operating manuals are present
- Emergency lowering controls are accessible and unobstructed
- Platform entry gate closes and latches properly
- No debris, oil, or ice on the platform floor

### 3. Operational Function Tests (Powered)

With the machine powered on at ground level:
- Test all controls for proper operation — up, down, rotate, extend
- Test emergency stop button
- Test horn (if equipped)
- Test all lights (if equipped for the environment)
- Verify the control panel displays no fault codes

## When to Remove a MEWP from Service

You **must** remove a MEWP from service immediately if you discover:

- Any structural damage to the boom, chassis, or platform
- Hydraulic fluid leaks
- Non-functioning or missing safety devices
- Battery that will not hold a charge or a fuel leak
- Controls that stick, are unresponsive, or operate unexpectedly
- Missing or damaged fall protection anchor points

Tag the machine **OUT OF SERVICE** and notify your supervisor. Never attempt to repair a MEWP yourself unless you are a qualified mechanic.

## Documentation

Most employers are required to maintain inspection records. After completing your inspection, fill out the inspection log with:
- Date and time
- Equipment ID number
- Your name
- Any deficiencies found (even minor ones)
- Whether the machine passed or failed
      `,
      quiz: [
        {
          id: 'q2_1',
          question: 'When must a pre-operation inspection be performed?',
          options: ['Once per week', 'Before each shift or when a different operator takes over', 'Only when the equipment looks damaged', 'Once per month'],
          correct: 1,
          explanation: 'ANSI A92.22-2018 requires a pre-operation inspection before each shift or when a different operator takes control of the equipment.'
        },
        {
          id: 'q2_2',
          question: 'You discover a hydraulic fluid leak during your pre-operation inspection. What should you do?',
          options: ['Top off the fluid and continue working', 'Tag it out of service and notify your supervisor', 'Repair the leak yourself', 'Work carefully and monitor the leak'],
          correct: 1,
          explanation: 'Any hydraulic fluid leak requires the machine to be immediately tagged out of service. Never operate a machine with known defects.'
        },
        {
          id: 'q2_3',
          question: 'Which of the following is checked during the powered function test?',
          options: ['Tire pressure', 'Emergency stop button operation', 'Hydraulic fluid level', 'Platform anchor points'],
          correct: 1,
          explanation: 'The emergency stop button must be tested during the powered function test to ensure it operates correctly.'
        },
      ]
    },
    {
      id: 3,
      title: 'Hazard Recognition & Site Assessment',
      readTime: '10 min',
      content: `
## Site Assessment Before Operation

Before positioning or operating a MEWP at any worksite, a **qualified person** must conduct a site assessment to identify and evaluate all potential hazards. This is required by **ANSI A92.22-2018** and strongly recommended by OSHA.

[DIAGRAM:site_hazards]

!! A site assessment is required before every MEWP operation -- ANSI A92.22-2018.
!! A rescue plan must be established and communicated to the entire crew before work begins.
!! Treat ALL overhead power lines as energized unless confirmed otherwise by the utility company.

## The Risk Assessment Process

A proper risk assessment includes identifying:

### 1. Ground Conditions
The ground must be able to support the weight and dynamic forces of the MEWP.

- Check for **soft soil, mud, or sand** that could cause the machine to sink or tip
- Look for **slopes or grades** — most MEWPs have maximum slope ratings (typically 3-5°)
- Identify **drop-offs, holes, or trenches** near the work area
- Check for **floor drains, utility covers, or floor grates** that may not support the load
- Look for **underground utilities** that could collapse under the weight

> **Tip:** When in doubt about ground conditions, contact your supervisor or a structural engineer before operating.

### 2. Overhead Hazards

**Electrical Hazards — The #1 Killer**

Contact with overhead power lines is one of the leading causes of MEWP fatalities. Follow these rules without exception:

- Maintain a minimum distance of **10 feet** from power lines up to 50kV
- For lines above 50kV, add 4 inches per additional 10kV
- Treat ALL overhead lines as energized unless confirmed de-energized by the utility company
- Use a **spotter** when working near overhead lines

**Other Overhead Hazards:**
- Pipes, sprinkler systems, and conduit
- Structural beams, ceilings, and mezzanines
- Moving machinery or cranes
- Other MEWPs or equipment operating above

### 3. Environmental Conditions

**Wind:**
- Most MEWPs have a maximum wind speed rating (typically 28-40 mph)
- Never operate a MEWP in wind speeds exceeding the manufacturer's rating
- Watch for gusts — sudden wind can tip a MEWP or dislodge workers

**Lightning:**
- Immediately lower the platform and move to shelter at the first sign of lightning
- Do not use a MEWP as a lightning shelter — it is a metal structure

**Visibility:**
- Ensure adequate lighting for all operations
- Use additional lighting if working in low-visibility conditions

### 4. Traffic and Pedestrian Hazards

- Establish clear exclusion zones around all MEWP operations
- Use **barricades, cones, and warning signs** to protect pedestrians
- Designate a **spotter** when operating near traffic
- Ensure other workers are aware of overhead MEWP operations — falling objects are a serious hazard

### 5. Site-Specific Hazards

Consider any hazards unique to your work environment:
- Chemical exposure (corrosive vapors, flammable gases)
- Temperature extremes
- Confined spaces or limited egress
- Work over water, machinery, or open pits

## Rescue Planning

**ANSI A92.22-2018 requires** that a rescue plan be in place before beginning any MEWP operation. The plan must include:

- How to lower the platform if the operator becomes incapacitated
- Who is responsible for performing the rescue
- What equipment is needed (emergency lowering key, ladder, etc.)
- When to call emergency services

Every operator and supervisor must know the rescue plan before work begins.
      `,
      quiz: [
        {
          id: 'q3_1',
          question: 'What is the minimum required distance from power lines up to 50kV?',
          options: ['5 feet', '15 feet', '10 feet', '20 feet'],
          correct: 2,
          explanation: 'OSHA requires a minimum clearance of 10 feet from power lines up to 50kV. Treat all lines as energized.'
        },
        {
          id: 'q3_2',
          question: 'Which of the following is required by ANSI A92.22-2018 before beginning MEWP operations?',
          options: ['A written permit signed by OSHA', 'A rescue plan must be in place', 'A minimum of two operators present', 'Daily weather forecasts'],
          correct: 1,
          explanation: 'ANSI A92.22-2018 requires a rescue plan be established before any MEWP operation begins, covering how to lower the platform if the operator is incapacitated.'
        },
        {
          id: 'q3_3',
          question: 'You are setting up a MEWP and notice the ground near the work area has soft, muddy soil. What should you do?',
          options: ['Proceed carefully at reduced speed', 'Contact your supervisor before operating', 'Use outriggers and proceed normally', 'Only work if the platform is less than halfway extended'],
          correct: 1,
          explanation: 'Soft or unstable ground can cause the MEWP to sink or tip over. Contact your supervisor and evaluate the ground conditions before operating.'
        },
      ]
    },
    {
      id: 4,
      title: 'Safe Operation Procedures',
      readTime: '12 min',
      content: `
## Operating a MEWP Safely

Following proper operating procedures is essential to preventing accidents. This chapter covers the key rules and techniques for safe MEWP operation.

!! Never exceed the rated load capacity -- it includes ALL occupants, tools, and materials combined.
!! Always connect your harness to a designated platform anchor point before the platform is elevated.
!! Reposition the machine rather than leaning outside the guardrails to reach your work area.

## Before Entering the Platform

1. **Ensure you are authorized** to operate this specific type and model of MEWP
2. **Complete your pre-operation inspection** (Chapter 2)
3. **Complete your site assessment** (Chapter 3)
4. **Put on your PPE** — at minimum: hard hat, high-visibility vest, safety glasses, and steel-toed boots
5. **Don your fall protection harness** — required on all MEWPs

## Entering and Exiting the Platform

- Use the **designated entry point** (never climb on the outside of the machine)
- Ensure the **gate or chain is closed and secured** before operating
- Maintain **three points of contact** while entering or exiting
- Never jump from the platform at any height

## Fall Protection Requirements

**OSHA and ANSI require** that all occupants of a MEWP wear a full-body harness connected to an anchor point on the platform while the platform is elevated.

- Use a **self-retracting lanyard (SRL) or positioning lanyard** — not a free-fall lanyard
- The lanyard must be **short enough to prevent going over the guardrail**
- Inspect your harness and lanyard before each use
- Never tie off to external structures — only to designated platform anchor points

> **Remember:** The guardrails alone are not sufficient fall protection. You must also wear and connect a harness.

## Operating the Controls

### Ground Controls vs. Platform Controls
- **Ground controls** — used by a supervisor to lower the platform in an emergency
- **Platform controls** — used by the operator to move the machine

**Always use platform controls** when an operator is in the basket. Ground controls should only be used for emergency retrieval.

### Movement Rules
- Move at **slow, controlled speeds** at all times
- **Look in the direction of travel** before moving
- **Never drive with the platform elevated** unless the MEWP is rated for elevated travel (Type 2 or 3)
- **Stop all platform movement** before repositioning the machine
- Do not use the MEWP to push, pull, or pry objects

### Load Capacity
- **Never exceed the rated load capacity** of the platform
- The load capacity includes **all occupants, tools, and materials**
- Distribute the load evenly on the platform floor
- Do not climb on the guardrails to gain additional reach — **reposition the machine**

### Positioning
- Position the machine so you can reach the work **without leaning over the guardrails**
- Never lean outside the platform guardrails
- If you cannot reach the work safely, **lower the platform and reposition**

## Prohibited Operations

The following actions are **strictly prohibited**:

- Operating a MEWP while under the influence of drugs or alcohol
- Carrying passengers unless the platform is rated for multiple occupants
- Using the MEWP as a crane or hoist to lift materials from below
- Operating in wind speeds that exceed the manufacturer's rating
- Driving over surfaces the machine is not rated for
- Modifying the MEWP in any way
- Defeating or bypassing safety devices

## Traveling with the Platform

When traveling on the ground with the platform stowed:
- Lower and secure the platform fully in the travel position
- Check clearance before moving through doorways, under pipes, or on ramps
- Sound the horn when approaching blind corners
- Yield to pedestrians at all times

## Emergency Procedures

If the MEWP tips or begins to fall:
- **Hold on** — do not jump
- Your harness will keep you tethered to the platform
- Brace for impact

If you are stranded with a non-functioning MEWP:
- Do not attempt to climb down
- Activate the emergency lowering system if trained to do so
- Call for help using your phone or radio
- Wait for rescue
      `,
      quiz: [
        {
          id: 'q4_1',
          question: 'Where should you connect your harness lanyard while on a MEWP?',
          options: ['To the guardrail', 'To a nearby structural beam', 'To a designated anchor point on the platform', 'To your belt loop'],
          correct: 2,
          explanation: 'You must connect your harness only to designated anchor points on the platform — never to the guardrails or external structures.'
        },
        {
          id: 'q4_2',
          question: 'The load capacity of a MEWP platform includes:',
          options: ['Only the weight of the operators', 'Operators plus tools and materials', 'Only heavy tools and materials', 'The platform weight plus operators'],
          correct: 1,
          explanation: 'The rated load capacity includes ALL weight on the platform: operators, tools, materials, and equipment.'
        },
        {
          id: 'q4_3',
          question: 'You cannot reach your work area while standing safely inside the platform guardrails. What should you do?',
          options: ['Lean over the guardrail carefully', 'Stand on the guardrail to gain height', 'Lower the platform and reposition the machine', 'Ask a coworker to hold your legs'],
          correct: 2,
          explanation: 'Never lean outside the guardrails. Always lower the platform and reposition the machine to maintain a safe working position.'
        },
      ]
    },
    {
      id: 5,
      title: 'Fall Protection & PPE',
      readTime: '8 min',
      content: `
## Fall Protection for MEWP Operators

Falls from MEWPs are one of the leading causes of serious injury and death in construction and general industry. This chapter covers the specific fall protection requirements for MEWP operations under **OSHA 29 CFR 1926.502** and **ANSI A92.22-2018**.

## Required PPE for MEWP Operation

At minimum, every MEWP operator must wear:

| Equipment | Requirement |
| Full-body harness | Required at all times when platform is elevated |
| Hard hat | Required — protection from falling objects |
| Safety glasses | Required — eye protection |
| High-visibility vest | Strongly recommended |
| Steel-toed boots | Required on most job sites |
| Gloves | Recommended for hand protection |

| Full-body harness | Required at all times on elevated platform |
| Hard hat | Required — falling object protection |
| Safety glasses | Required — eye protection |
| High-vis vest | Strongly recommended |
| Steel-toed boots | Required on most job sites |
| Gloves | Recommended for hand protection |

[DIAGRAM:fall_protection]

!! Retire your harness from service immediately after any fall arrest event -- even if there is no visible damage.
!! Never use a standard 6-foot shock-absorbing lanyard on a MEWP -- the deployment distance can exceed platform height.
!! Connect your harness BEFORE the platform is elevated -- never while elevated.

## Full-Body Harness Requirements

A full-body harness distributes fall arrest forces across the thighs, pelvis, chest, and shoulders — unlike a body belt, which concentrates forces on the abdomen and can cause fatal internal injuries.

**Harness Inspection Checklist:**
- Check all webbing for cuts, frays, burns, or chemical damage
- Inspect all hardware (D-rings, buckles) for cracks, corrosion, or deformation
- Verify all buckles latch and unlatch properly
- Check the back D-ring and shoulder D-rings for secure attachment
- Ensure the harness fits correctly — snug but not restrictive

**When to retire a harness:**
- After any fall arrest event — even if it looks undamaged
- After exposure to chemicals or heat
- When any component shows visible damage
- When the manufacturer's lifespan is exceeded

## Lanyards and Self-Retracting Lifelines

On a MEWP, you must use either:

**Positioning Lanyard** — Keeps you in a working position and limits movement. Does not provide fall arrest — it prevents you from reaching a fall position.

**Self-Retracting Lifeline (SRL)** — Automatically extends and retracts. Locks instantly during a fall. Provides fall arrest protection.

**Do NOT use a standard 6-foot shock-absorbing lanyard on a MEWP platform.** The deployment distance (6 feet + shock absorber extension) can result in you striking the ground or a lower level before the fall is arrested.

## Securing Your Harness on a MEWP

1. Don your harness on the ground, before entering the platform
2. Inspect the anchor point(s) on the platform — they must be rated for fall arrest loads
3. Attach your lanyard to the anchor point before the platform is elevated
4. Keep the lanyard connection short — you should not be able to reach the top of the guardrail
5. Never disconnect your lanyard while the platform is elevated

## Overhead Object Protection

When working under structures, pipes, or other overhead hazards:

- Maintain awareness of the clearance above the platform at all times
- Never allow the platform to contact overhead structures under power
- Use a spotter when operating in tight overhead clearances
- Wear your hard hat — falling objects from above are a constant hazard on job sites

## Rescue from Suspension

If a worker is suspended in their harness following a MEWP incident, rescue must happen quickly. **Suspension trauma** (also called harness-induced pathology) can be fatal within minutes if a suspended worker cannot be rescued.

Signs of suspension trauma:
- Dizziness or fainting
- Nausea
- Difficulty breathing

**Rescue must begin immediately.** This is why every MEWP operation requires a rescue plan (Chapter 3) — the plan must address how to lower or rescue a suspended worker.
      `,
      quiz: [
        {
          id: 'q5_1',
          question: 'Why should you NOT use a standard 6-foot shock-absorbing lanyard on a MEWP?',
          options: ['They are too heavy', 'The deployment distance may not stop a fall before striking the ground', 'They are not OSHA approved', 'They cost too much'],
          correct: 1,
          explanation: 'A standard 6-foot lanyard plus shock absorber extension can result in total fall distances exceeding the platform height, causing ground contact before the fall is arrested.'
        },
        {
          id: 'q5_2',
          question: 'When should a full-body harness be retired from service?',
          options: ['Every 5 years regardless of condition', 'After any fall arrest event, even if undamaged', 'Only when visibly worn out', 'After 500 uses'],
          correct: 1,
          explanation: 'A harness must be removed from service after any fall arrest event. The internal components may be damaged even when there is no visible damage.'
        },
        {
          id: 'q5_3',
          question: 'What is suspension trauma?',
          options: ['An injury from the harness cutting into the skin', 'A potentially fatal condition caused by hanging in a harness for too long', 'A type of fall arrest system', 'Back pain from wearing a harness'],
          correct: 1,
          explanation: 'Suspension trauma (harness-induced pathology) occurs when blood pools in the legs while suspended, blocking return to the heart. It can be fatal within minutes and requires immediate rescue.'
        },
      ]
    },
    {
      id: 6,
      title: 'Electrical Safety',
      readTime: '8 min',
      content: `
## Electrical Hazards and MEWPs

Electrocution is one of the "Fatal Four" — the four most common causes of construction fatalities identified by OSHA. For MEWP operators, **contact with overhead power lines** is the primary electrical hazard and requires constant vigilance.

[DIAGRAM:powerline_distances]

!! Assume ALL overhead lines are energized -- never approach without verifying with the utility company.
!! If you do not know the voltage, maintain the maximum approach distance.
!! Assign a dedicated spotter when working near any overhead power lines.

## Understanding Electrical Hazards

Electricity travels the path of least resistance. When a MEWP boom contacts an energized power line, the electrical current can travel:

- Through the boom and into the platform
- Through an operator's body
- Down through the chassis to the ground

Even a brief contact with an energized line can be instantly fatal.

## Approach Distances — Know These Numbers

**OSHA 29 CFR 1926.1408** establishes minimum approach distances:

| Voltage (Phase to Phase) | Minimum Distance |
| Up to 50kV | 10 feet |
| Over 50kV to 200kV | 15 feet |
| Over 200kV to 350kV | 20 feet |
| Over 350kV to 500kV | 25 feet |
| Over 500kV to 750kV | 35 feet |
| Over 750kV to 1000kV | 45 feet |

| Up to 50kV | 10 feet |
| Over 50kV to 200kV | 15 feet |
| Over 200kV to 350kV | 20 feet |
| Over 350kV to 500kV | 25 feet |
| Over 500kV to 750kV | 35 feet |
| Over 750kV to 1000kV | 45 feet |

> **If you do not know the voltage of a line, treat it as the highest voltage and maintain the maximum distance.**

## Rules for Working Near Power Lines

1. **Assume all lines are energized** — never assume a line is de-energized unless you have written confirmation from the utility company
2. **Survey the site** before each shift for any new overhead lines
3. **Use insulating line hoses or guards** if working within the approach distance is unavoidable (must be installed by the utility)
4. **Assign a dedicated spotter** to watch for line clearance — the spotter does nothing else
5. **De-energize and ground** lines when possible through coordination with the utility company

## If Your MEWP Contacts a Power Line

**If you are in the platform:**
- **DO NOT TOUCH** the boom, guardrails, or any metal part of the machine
- Call for help immediately
- Wait for the utility company to de-energize the line
- Only exit if the machine catches fire — if you must exit, jump clear without touching the machine and the ground simultaneously

**If you are on the ground:**
- **DO NOT TOUCH** the machine or approach within 10 feet
- Call 911 and the utility company immediately
- Keep bystanders away
- Assume ground gradient exists — shuffle away with feet together

## Generator and Electrical Equipment Safety

When using electrical tools or generators on the platform:

- Use **Ground Fault Circuit Interrupter (GFCI)** protection on all electrical equipment
- Inspect all power cords before use — no damaged insulation
- Never use electrical tools in wet conditions without GFCI protection
- Secure all cords so they cannot become entangled in the MEWP components
      `,
      quiz: [
        {
          id: 'q6_1',
          question: 'What is the minimum distance you must maintain from power lines up to 50kV?',
          options: ['5 feet', '10 feet', '15 feet', '20 feet'],
          correct: 1,
          explanation: 'OSHA 29 CFR 1926.1408 requires a minimum 10-foot clearance from power lines up to 50kV.'
        },
        {
          id: 'q6_2',
          question: 'Your MEWP contacts an energized power line while you are on the platform. What should you do?',
          options: ['Jump down immediately', 'Do not touch metal parts — call for help and wait for the utility to de-energize the line', 'Use the emergency lowering system', 'Drive the machine away from the line'],
          correct: 1,
          explanation: 'Do not touch any metal parts. Call for help and wait for the utility company to de-energize the line. Only exit if fire forces you to, and jump clear without touching the machine and ground simultaneously.'
        },
        {
          id: 'q6_3',
          question: 'You are unsure of the voltage of an overhead line. What approach distance should you maintain?',
          options: ['10 feet minimum', 'Treat it as the highest voltage and maintain maximum distance', 'Ask a coworker', '5 feet is always sufficient'],
          correct: 1,
          explanation: 'When the voltage is unknown, always treat the line as the highest possible voltage and maintain the maximum approach distance.'
        },
      ]
    },
    {
      id: 7,
      title: 'Maintenance & Operator Responsibilities',
      readTime: '8 min',
      content: `
!! Never attempt to repair or adjust safety devices -- this must only be done by a qualified mechanic.
!! Workers have the right to refuse unsafe work under OSHA Section 11(c) without fear of retaliation.
!! Never modify a MEWP without written authorization from the manufacturer.

## Operator vs. Mechanic Responsibilities

One of the most important distinctions in MEWP safety is understanding the difference between **operator-level maintenance** and **mechanic-level maintenance**. Operators must never attempt repairs beyond their authorized scope.

## What Operators Are Responsible For

As an operator, your maintenance responsibilities include:

### Daily/Pre-Shift Tasks
- Complete the pre-operation inspection (Chapter 2)
- Check and document fluid levels (report low levels — do not fill unless trained)
- Clean debris, mud, and ice from the platform and controls
- Ensure the operator manual is present on the machine
- Report any damage or defects in writing

### During Operation
- Monitor machine performance for unusual noises, vibrations, or behavior
- Stop immediately if the machine performs unexpectedly
- Do not use a machine that develops a fault during operation

### After Operation
- Stow the platform in the travel position
- Park on level ground away from traffic
- Turn off the machine and remove the key
- Plug in electric MEWPs for charging
- Complete any required end-of-shift documentation

## What Only Qualified Mechanics May Do

The following **must only be performed by qualified, trained mechanics:**

- Adjusting or repairing hydraulic systems
- Replacing or adjusting safety devices, limit switches, or alarms
- Structural repairs to the boom, chassis, or platform
- Electrical system repairs
- Replacing tires on certain machines (can create stored energy hazards)
- Any repair involving disassembly of the drive or lift system

> Never attempt to defeat or bypass a safety device, even temporarily. This is a serious violation of OSHA standards and puts lives at risk.

## Record Keeping Requirements

**ANSI A92.22-2018** requires that the following records be maintained:

| Record Type | Retention Period |
| Pre-shift inspection logs | Minimum 3 months |
| Repair and maintenance records | Life of the machine |
| Operator training records | Duration of employment + 3 years |
| Incident and near-miss reports | Minimum 5 years |

| Pre-shift inspection logs | Minimum 3 months |
| Repair and maintenance records | Life of the machine |
| Operator training records | Duration of employment + 3 years |
| Incident and near-miss reports | Minimum 5 years |

## Machine Modifications

**Never modify a MEWP** without written authorization from the manufacturer. Unauthorized modifications including:
- Extending the platform
- Adding counterweights
- Altering the control system
- Changing the tire type

...can void the manufacturer's warranty, alter the stability of the machine, and create OSHA violations.

## Reporting Unsafe Conditions

If you observe an unsafe condition with a MEWP or a MEWP operation:

1. Stop the operation if you have authority to do so
2. Report to your supervisor immediately
3. Document the condition in writing
4. Tag the machine out of service if it is unsafe to operate

You have the **right to refuse unsafe work** under OSHA Section 11(c). Employers cannot retaliate against workers who report safety violations.
      `,
      quiz: [
        {
          id: 'q7_1',
          question: 'A safety device on your MEWP is malfunctioning. What should you do?',
          options: ['Bypass it temporarily to finish the job', 'Fix it yourself if you know how', 'Tag the machine out of service and report to your supervisor', 'Continue working carefully'],
          correct: 2,
          explanation: 'Never bypass safety devices. Tag the machine out of service and report to your supervisor. Only qualified mechanics may repair safety devices.'
        },
        {
          id: 'q7_2',
          question: 'How long must operator training records be retained?',
          options: ['1 year', 'Duration of employment only', 'Duration of employment plus 3 years', '5 years after employment ends'],
          correct: 2,
          explanation: 'ANSI A92.22-2018 requires operator training records be kept for the duration of employment plus 3 years.'
        },
        {
          id: 'q7_3',
          question: 'Under OSHA Section 11(c), workers have the right to:',
          options: ['Modify equipment for safety', 'Refuse unsafe work without retaliation', 'Perform any maintenance they feel qualified for', 'Ignore supervisor instructions if they feel unsafe'],
          correct: 1,
          explanation: 'OSHA Section 11(c) protects workers who refuse unsafe work or report safety violations from employer retaliation.'
        },
      ]
    },
    {
      id: 8,
      title: 'Emergency Procedures & Rescue',
      readTime: '10 min',
      content: `
## Emergency Preparedness

No matter how well you follow safety procedures, emergencies can still occur. Being prepared — knowing what to do before, during, and after an emergency — can mean the difference between life and death.

[DIAGRAM:emergency_procedures]

!! Do NOT jump from a tipping or falling MEWP -- hold on and brace for impact.
!! Know the location of the emergency lowering system on every machine you operate -- before you need it.
!! A rescue plan must be in place and communicated to everyone on the crew before operations begin.

## Types of MEWP Emergencies

### Tip-Over
A MEWP tip-over occurs when the machine loses stability and falls to one side. Causes include:

- Operating on slopes exceeding the machine's rating
- Ground collapse or soft ground giving way
- Overloading the platform
- Contact with another object at elevation
- High winds

**If a tip-over begins:**
- **Hold on tightly** to the guardrails
- **Do not jump** — your harness is your best protection
- Brace for impact
- After the machine comes to rest, call for help

### Entrapment
An operator becomes entrapped when a body part (most commonly the head, neck, or upper torso) becomes caught between the platform and an overhead structure.

**Prevention:**
- Always look up before raising the platform
- Assign a spotter when working in tight spaces
- Be aware of pinch points between the platform and structures

**If someone is entrapped:**
- Use the emergency lowering system from the ground immediately
- Call 911
- Do not move the machine until emergency personnel arrive unless the patient is in immediate life-threatening danger

### Stranded Operator
If the MEWP loses power or malfunctions with the operator elevated:

1. Stay calm — do not attempt to climb down
2. Attempt to use the manual override or emergency lowering system
3. Use your phone or radio to call for help
4. Wait for rescue — do not jump

### Machine Fire
If a fire starts on or near the MEWP:

1. If on the ground — activate the fire suppression system (if equipped) and call 911
2. If elevated — lower the platform immediately and evacuate
3. If you cannot lower the platform — call for help and prepare to use the emergency descent
4. Never use water on electrical fires

## Emergency Lowering Systems

**Every MEWP must have an emergency lowering system** accessible from the ground. All operators AND ground personnel must know how to use it.

The emergency lowering system allows a person on the ground to lower an elevated platform without the operator's assistance. This is critical when:
- The operator is incapacitated
- The operator is entrapped
- The MEWP loses power

Locate the emergency controls on every machine you operate — before you need them.

## Rescue Plan Requirements

**ANSI A92.22-2018 requires** a written rescue plan before each MEWP operation. The plan must identify:

- **Who** is responsible for rescue (a specific person, not "someone")
- **How** the platform will be lowered
- **What equipment** is needed (emergency key, ladder)
- **When** to call 911

The rescue plan must be communicated to everyone involved in the work before operations begin.

## Post-Incident Procedures

After any MEWP incident — including near misses:

1. **Secure the scene** — prevent further injury
2. **Provide first aid** and call 911 if needed
3. **Do not move the machine** until authorized
4. **Notify your supervisor** immediately
5. **Document everything** — witnesses, conditions, sequence of events
6. **Preserve evidence** — photographs, video
7. **Complete an incident report** as soon as possible

OSHA requires employers to report:
- Worker fatalities within **8 hours**
- Hospitalizations, amputations, or loss of an eye within **24 hours**

## The Final Exam

You have completed all 8 chapters of the MEWP Operator Safety Training. You are now ready to take your **Final Certification Exam**.

The exam consists of **15 questions** drawn from all chapters. You must score **80% or higher (12 out of 15 correct)** to pass and receive your certificate.

Good luck!
      `,
      quiz: [
        {
          id: 'q8_1',
          question: 'A MEWP starts to tip over while you are in the platform. What should you do?',
          options: ['Jump to safety immediately', 'Hold on and do not jump — your harness provides protection', 'Activate the emergency stop', 'Try to counterbalance by leaning the other way'],
          correct: 1,
          explanation: 'Never jump from a tipping MEWP. Hold on tightly — your harness keeps you tethered to the platform, which is your safest option.'
        },
        {
          id: 'q8_2',
          question: 'Within how many hours must an employer report a worker fatality to OSHA?',
          options: ['24 hours', '48 hours', '8 hours', '72 hours'],
          correct: 2,
          explanation: 'OSHA requires employers to report worker fatalities within 8 hours. Hospitalizations, amputations, and loss of an eye must be reported within 24 hours.'
        },
        {
          id: 'q8_3',
          question: 'Who must know how to use the emergency lowering system?',
          options: ['Only the operator', 'Only the supervisor', 'Only trained mechanics', 'Both the operator AND ground personnel'],
          correct: 3,
          explanation: 'Both the operator and ground personnel must know how to use the emergency lowering system — it is specifically designed to be operated by someone on the ground when the operator cannot lower the platform themselves.'
        },
      ]
    }
  ],

  finalExam: [
    {
      id: 'fe1', question: 'What does MEWP stand for?',
      options: ['Mobile Elevated Work Platform', 'Mobile Elevating Work Platform', 'Motorized Elevating Work Platform', 'Mobile Equipment Work Platform'],
      correct: 1, explanation: 'MEWP stands for Mobile Elevating Work Platform — the current standard term used in ANSI A92 and OSHA guidelines, replacing the older term aerial work platform.'
    },
    {
      id: 'fe2', question: 'You need to verify your MEWP training meets industry safe-use requirements. Which type of standard covers this?',
      options: ['An equipment design standard', 'A safe use and training standard', 'A manufacturing quality standard', 'A government inspection standard'],
      correct: 1, explanation: 'Safe use and training standards govern how MEWPs must be operated and how operators must be trained. ANSI A92.22 covers safe use and A92.24 covers training requirements.'
    },
    {
      id: 'fe3', question: 'A scissor lift keeps its platform within the chassis footprint. A boom lift can extend its platform far beyond the wheels. Which group is which?',
      options: ['Both are Group A', 'Scissor lift = Group A, Boom lift = Group B', 'Scissor lift = Group B, Boom lift = Group A', 'Both are Group B'],
      correct: 1, explanation: 'Group A MEWPs like scissor lifts keep the platform within the chassis tipping lines. Group B MEWPs like boom lifts can extend beyond the chassis, creating different stability considerations.'
    },
    {
      id: 'fe4', question: 'When must a pre-operation inspection be performed?',
      options: ['Once per week', 'Before each shift or when a different operator takes control', 'Only after a reported incident', 'Monthly'],
      correct: 1, explanation: 'A pre-operation inspection is required before every shift and whenever a different operator takes control. This catches damage or defects before the equipment is used.'
    },
    {
      id: 'fe5', question: 'What is the minimum safe distance you must keep from power lines rated up to 50kV?',
      options: ['5 feet', '15 feet', '20 feet', '10 feet'],
      correct: 3, explanation: 'OSHA requires a minimum 10-foot clearance from power lines rated up to 50kV. For higher voltages, the distance increases. Always treat all lines as energized.'
    },
    {
      id: 'fe6', question: 'Where must you connect your harness lanyard while elevated on a MEWP?',
      options: ['The guardrail', 'A nearby structural beam', 'A designated platform anchor point', 'Your tool belt'],
      correct: 2, explanation: 'You must connect only to designated anchor points on the platform. Guardrails are not designed for fall arrest forces and external structures are outside the platform entirely.'
    },
    {
      id: 'fe7', question: 'The rated load capacity of a MEWP platform includes:',
      options: ['Only the operators', 'Operators, tools, and all materials', 'Tools and materials only', 'The platform structure itself'],
      correct: 1, explanation: 'The rated load capacity includes everything on the platform: all occupants, tools, equipment, and materials combined. Exceeding it creates serious tip-over risk.'
    },
    {
      id: 'fe8', question: 'A MEWP starts tipping over while you are in the platform. You should:',
      options: ['Jump immediately to avoid being trapped', 'Hold on tightly and do not jump', 'Try to counter-balance by shifting your weight', 'Activate the emergency stop'],
      correct: 1, explanation: 'Never jump from a tipping MEWP. Your harness keeps you tethered. Jumping could result in being crushed by the falling machine. Hold on and brace for impact.'
    },
    {
      id: 'fe9', question: 'Before starting any MEWP operation, what must be established and communicated to the entire crew?',
      options: ['A material delivery schedule', 'A rescue plan for stranded or incapacitated operators', 'A weather monitoring schedule', 'A tool inventory checklist'],
      correct: 1, explanation: 'A rescue plan is required before every MEWP operation. It identifies who performs the rescue, how the platform will be lowered, what equipment is needed, and when to call 911.'
    },
    {
      id: 'fe10', question: 'What should you do if your MEWP boom contacts an energized power line?',
      options: ['Jump clear of the machine immediately', 'Drive away from the line quickly', 'Do not touch metal -- call for help and wait for the utility to de-energize', 'Use the emergency lowering system to descend'],
      correct: 2, explanation: 'Do not touch any metal parts. Electricity travels through the boom. Call for help and wait for the utility to de-energize. Only exit if fire forces you to, and jump clear without touching machine and ground at the same time.'
    },
    {
      id: 'fe11', question: 'After a fall arrest event, a full-body harness should be:',
      options: ['Inspected visually and reused if it looks undamaged', 'Retired from service immediately regardless of appearance', 'Sent for cleaning and put back into service', 'Used only for ground-level work going forward'],
      correct: 1, explanation: 'A harness must be retired after any fall arrest event even if there is no visible damage. Internal webbing fibers can break from arrest forces without showing external signs.'
    },
    {
      id: 'fe12', question: 'Who may repair or adjust safety devices on a MEWP?',
      options: ['Any trained operator', 'The site supervisor', 'Only qualified mechanics', 'The equipment rental company'],
      correct: 2, explanation: 'Only qualified mechanics may repair or adjust safety devices. Operators must never bypass or attempt repairs on safety systems -- this is an OSHA violation.'
    },
    {
      id: 'fe13', question: 'Why is suspension trauma (hanging in a harness after a fall) a life-threatening emergency requiring immediate rescue?',
      options: ['The harness straps cause severe bruising', 'Blood pools in the legs blocking return to the heart -- can be fatal in minutes', 'It causes permanent spinal injury', 'The person may fall again if rescued incorrectly'],
      correct: 1, explanation: 'Suspension trauma occurs when blood pools in the legs while a person hangs motionless. This blocks blood return to the heart and brain and can be fatal within minutes. Immediate rescue is critical.'
    },
    {
      id: 'fe14', question: 'How long must operator training records be kept after an employee leaves the company?',
      options: ['1 year after leaving', '3 years after leaving', 'They can be discarded when the employee leaves', 'They are kept forever'],
      correct: 1, explanation: 'Training records must be kept for the duration of employment plus 3 additional years after the employee leaves, as required by ANSI A92.22-2018.'
    },
    {
      id: 'fe15', question: 'A worker is fatally injured on your jobsite. Within how many hours must the employer notify OSHA?',
      options: ['24 hours', '8 hours', '48 hours', '72 hours'],
      correct: 1, explanation: 'OSHA requires employers to report worker fatalities within 8 hours. Hospitalizations, amputations, and loss of an eye must be reported within 24 hours.'
    },
  ]
}
