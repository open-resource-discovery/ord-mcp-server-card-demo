# MCP Server Registry — Spacecraft Systems

> Maintained manually by the ops team. Last updated: 2026-09-01.  
> Add the server URLs you need to your `mcp-servers.json` or `claude_desktop_config.json`.

---

## Thruster Control

- **URL:** `http://thruster.local:3000`
- **Description:** Controls and monitors the spacecraft's propulsion system.

| Tool | Description |
|---|---|
| `check_thruster_status` | Returns current thrust level and engine health |
| `adjust_thrust_level` | Sets thrust output to a given percentage |
| `emergency_shutdown` | Immediately cuts all thruster power |

---

## Navigation

- **URL:** `http://navigation.local:3000`
- **Description:** Position tracking and course planning.

| Tool | Description |
|---|---|
| `get_current_position` | Returns current coordinates and velocity |
| `plot_course` | Calculates a course to a target destination |
| `check_eta` | Returns estimated time of arrival for current course |

---

## Life Support

- **URL:** `http://life-support.local:3000`
- **Description:** Monitors and controls cabin atmosphere and crew safety systems.

| Tool | Description |
|---|---|
| `get_life_support_status` | Returns O₂, CO₂, pressure, and temperature readings |
| `adjust_oxygen_level` | Adjusts oxygen output |
| `vent_co2` | Activates CO₂ scrubbing cycle |

---

## Communication

- **URL:** `http://communication.local:3000`
- **Description:** External communications and signal management.

| Tool | Description |
|---|---|
| `check_signal_strength` | Returns signal strength to Earth |
| `scan_frequencies` | Scans available communication frequencies |
| `send_distress_signal` | Broadcasts emergency distress signal |

---

## Damage Control

- **URL:** `http://damage-control.local:3000`
- **Description:** Hull integrity assessment and emergency repair systems.

| Tool | Description |
|---|---|
| `assess_hull_damage` | Scans hull for breaches and structural damage |
| `seal_hull_breach` | Activates emergency sealant on a specified section |
| `close_emergency_bulkhead` | Isolates a damaged section of the ship |

---

## Oxygen Scrubber

- **URL:** `http://oxygen-scrubber.local:3000`
- **Description:** Backup oxygen generation and CO₂ removal.

| Tool | Description |
|---|---|
| `get_scrubber_status` | Returns scrubber efficiency and filter status |
| `activate_backup_scrubbers` | Starts backup scrubbing units |
| `tap_oxygen_reserve` | Releases oxygen from emergency reserve tanks |

---

## Entertainment

- **URL:** `http://entertainment.local:3000`
- **Description:** Crew morale and cabin environment systems.

| Tool | Description |
|---|---|
| `play_music` | Plays music in the cabin |
| `stream_movie` | Streams a movie to the cabin display |
| `set_cabin_lighting` | Adjusts cabin lighting mood and intensity |
