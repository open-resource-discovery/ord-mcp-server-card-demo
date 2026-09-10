# MCPCon Europe 2026 — Story Script

**Talk:** From API Catalogs To Agent Catalogs: Solving MCP Server Discovery With Open Resource Discovery
**Speakers:** Vyshnavi Gadamsetti (astronaut / mission specialist) + Sebastian Wennemers (Mission Control)
**Copilot AI name:** MITHRA
**Format:** First-person storytelling. Vyshnavi IS the stranded mission specialist. The live demo is the main vehicle; slides fill the gaps between demo stages.

**Premise (Option A):** You are the mission *scientist/specialist* — not a systems engineer (Mark Watney / botanist parallel). You know your domain, not the ship's guts. So you depend on MITHRA to *act*. MITHRA is only as powerful as the systems she knows she can reach — that is the tool-discovery spine of the talk.

---

## Beat 1 — Cold Open

> Ninety-four million kilometers from Earth. Two hours ago my ship took a hit I still don't know what's broken. Comms to mission control are down. Life support is running on what is left in the tanks.
>
> Here is the thing: I am a scientist. That is why I am on this mission. But I was never trained to hand-fly thrusters or rebalance oxygen I know my experiments, not the ship's guts.
>
> So alone, I am in trouble. Except I am not alone. I have MITHRA my onboard AI copilot I have never had to trust with my life before. MITHRA can act: fire thrusters, reroute air, scan for a signal. If I can tell it what is wrong, it can do something about it.
>
> So I ask it the only question that matters:
>
> 'MITHRA — what can you actually do right now?'

---

## Beat 2 — Stage 1: An AI with no tools 

**Demo stage:** 1 — No MCP (plain LLM, no tools). Step panel stays empty.

**Spoken narration:**

> So I ask MITHRA to help me. I tell it everything — the hit, the tanks, the silence on comms. And MITHRA answers.
>
> It's calm. It's clear. It tells me thruster fires can be caused by a coolant breach, that I should check the temperature before doing anything drastic, that venting CO2 too fast could cost me oxygen I can't spare.
>
> It's good advice. It's exactly what I'd want a co-pilot to say.
>
> And then I realize — that's all it is. Advice. MITHRA can tell me what to do. It can't do any of it. It can't touch the thrusters. It can't see the temperature. It can't reach a single system on this ship.
>
> I'm sitting inside a spacecraft, talking to an AI that knows everything about spaceflight — and can't turn a single dial.

**[Demo cue — run Stage 1 live: type the emergency, MITHRA responds with reasoning only, zero tool calls. The step panel stays empty.]**

**Technical reveal:**

> This is an AI with no tools. It can reason, but it can't act. To act, it needs to be connected to the ship's systems. And that connection has a name: MCP.

---

## Beat 3 — Stage 2: Connected by hand

**Demo stage:** 2 — Config + tools/list. Server list from hand-written config; MITHRA connects to each and calls tools/list. Step panel fills with connection + tools/list steps.

**Spoken narration:**

> So I do the only thing I can. I find the ship's manual and I start typing — telling MITHRA where each system lives. Thruster control is here. Life support is there. Comms is on this address. One by one, by hand.

**[ON STAGE — open the config file and type live:]** Open `mcp-servers.json`, show three systems already listed, then type the fourth (comms relay) by hand and save. This is the "one by one, by hand" moment the audience watches happen.

> DEMO CHANGE DONE: Stage 2 now reads a dedicated `demo/mcp-servers.json` (bind-mounted into the container at `/app/mcp-servers.json`, env `MCP_SERVERS_FILE`). The file is re-read on every Stage 2 run, so editing it live and re-running picks up the new server immediately. Falls back to `SPACESHIP_URLS` when the file is absent (tests). Staging tip: delete the `comms.local` line before the talk so the on-stage moment is genuinely "type the fourth server by hand" — Stage 2 discovers 3 until you add it.
>
> And it works. MITHRA connects. It asks each system what it can do, and suddenly — it can act. It reads the thruster temperature. Real numbers. It can fire them, vent CO2, reach for a signal. For the first time since the hit, I'm not just talking to my copilot — we're doing something.
>
> But then it hits me. MITHRA can only reach the systems I typed in. If I missed one — if there's a backup oxygen scrubber I don't know about — it doesn't exist as far as MITHRA is concerned. I'm a scientist, not the engineer who built this ship. I don't have the full list. Nobody handed me one.
>
> Out here, what I don't know can kill me.

**[Demo cue — run Stage 2 live: server list comes from hand-written config; MITHRA connects to each and calls tools/list. Step panel now fills with connection + tools/list steps. Tools work.]**

**Technical reveal:**

> This is how MCP is used today. You hand-write a config listing every server, MITHRA connects to each one and asks "what can you do?" — that's tools/list. It works for a handful. But someone has to know every server in advance and type it in. Three servers, fine. Three hundred, across a fleet? That list is out of date the moment you write it.

---

## Beat 4 — Stage 3: The ship describes itself (ORD)

**Demo stage:** 3 — ORD + tools/list. MITHRA reads one ORD document to get the server list, then still connects + tools/list on each. Step panel: one ORD read → N connections.

**Spoken narration:**

> Then I find something I didn't know was there. The ship can describe itself.
>
> There's one document — a single manifest at a known address — and it lists every system aboard. Not just the ones I knew about. The backup oxygen scrubber I'd never have found in time? It's right there on the list. I didn't have to know it existed. The ship told me.
>
> MITHRA reads that one document and instantly knows the whole ship — every system, nothing missed, and it can never be out of date, because the ship maintains its own list, not me.
>
> But there's still a catch. MITHRA knows what's aboard — it doesn't yet know what each system can do. So it still has to knock on every door, one by one, and ask: "what can you do?" It has the map now. It just doesn't have the manual yet.

**[Demo cue — run Stage 3: MITHRA fetches the ORD document (one request), finds all systems, then still connects + tools/list on each. Step panel shows: one ORD read → then N connections. Contrast with Stage 2: no hand-config, but the same per-server tools/list still happens.]**

**Technical reveal:**

> This is ORD — Open Resource Discovery. Instead of me typing the list, the ship publishes one machine-readable document that says "here is every system I have." MITHRA reads it and has the complete, always-current list — no hand-config, nothing missed. Finding the servers: solved. But knowing what each one does still needs a live connection to every single one — that's tools/list, all over again.

---

## Beat 5 — Stage 4: The card carries the manual (ORD + Server Card)

**Demo stage:** 4 — ORD + Server Card tools[]. MITHRA builds the full tool catalog from the cards — zero live connections. Step panel: ORD read → cards read → done.

**Spoken narration:**

> And then everything changes.
>
> It turns out each system doesn't just announce that it exists — it carries a card. And that card already lists everything the system can do — every tool, described, ready to read. No connecting required. Thruster control: check temperature, adjust power, emergency shutdown. Comms relay: scan frequencies, send a distress signal.
>
> MITHRA reads those cards and — instantly — knows the entire ship. Not just what's aboard. What every system can do. No knocking on doors. No asking one by one. It has the manual for the whole ship before it touches a single dial.
>
> And here's the part that saves my life. The comms relay is damaged — I can't even connect to it. But its card told MITHRA it can send a distress signal. So MITHRA already knows the plan before it ever reaches that system. It knew what was possible — even for the thing that was broken.

**[Demo cue — run Stage 4: MITHRA reads the ORD document + Server Cards, builds the full tool catalog with zero live connections. Step panel: ORD read → cards read → done. No per-server tools/list. Contrast sharply with Stage 3's N connections. Optionally: take one server offline before this run to prove the card still describes it.]**

> DEMO CHANGE DONE (the offline proof now works): the ORD document embeds each Server Card inline (`resourceDefinitions[].card`, with `tools[]`), sourced from a best-effort crawl that caches the last-known card. Stage 4 builds the whole catalog from that one ORD read — zero live connections. To stage the "works even when offline" moment: run Stages 1–3 first (so every card is cached), THEN stop one spaceship container (e.g. `docker compose stop comms`), then run Stage 4 — the card still describes the downed server and MITHRA still knows its distress-signal tool. Caveat: a server that has NEVER been reachable since agent startup has no cached card, so cache it once before killing it.

**Technical reveal:**

> This is the Server Card carrying its tools. The card doesn't just say "I'm the comms relay" — it says "here's what I can do." MITHRA knows every capability of every system before connecting to any of them. It's instant, it scales to any number of servers, and — this is the key — it works even when a system is offline, because the description travels with the card, not with a live session. Know before you connect.

**ACCURACY NOTE:** tools inside the Server Card are the PROPOSED addition (issue #30 / SEP-2127), NOT in today's spec. Stage 4 is a working preview of the proposal, not current behavior. The honest reveal ("this isn't in the spec yet") is deliberately held until Beat 6 so the demo lands first, then the ask.

---

## Beat 6 — The Turn: take away the spaceship (enterprise reveal, hands to Sebastian)

**Speaker handoff:** The distress signal MITHRA sends in Stage 4 is what reaches Earth. The voice that answers is Mission Control — Sebastian's entrance, delivered by the story.

**Slide cues:** Reuse PDF Slide 6 (scale: 500 servers / 3 tenants / 50 agents) → Slide 7 (UDDI → OpenAPI → MCP) → Slide 11 (SAP ORD production stats).

**Transition (astronaut lands the line, new voice answers):**

> **[YOU]** So MITHRA sends the distress signal. And for the first time in two hours... something answers back.
>
> **[SEBASTIAN — Mission Control]** Spaceship, this is Mission Control. We have you.

**Sebastian — pull back to the real world:**

> What you just watched was one astronaut, one AI, four systems on a single ship. Now take away the spaceship.
>
> Because this isn't science fiction. This is every enterprise right now. Replace "ship systems" with MCP servers — and instead of four, you have five hundred. Across dozens of teams. Feeding fifty different agents. And not one of them can tell you what it does until you connect to it, one by one, and ask.
>
> That astronaut's problem is your architecture problem.

**The historical parallel (Slide 7 — UDDI → OpenAPI → MCP):**

> We've been here before. Twenty-five years ago, APIs hit exactly this wall. The first answer was UDDI — a giant central registry everyone had to connect to. It failed. What actually won was OpenAPI: the description travels with the service. You read it before you call it.
>
> MCP today is where APIs were before OpenAPI. The Server Card is that same idea, arriving for agents. And the aggregation layer — the ship's self-describing manifest — already has a name: ORD.

**ORD + Server Card — the proven foundation and the new piece (Slide 11):**

> And here's why this matters far beyond one ship. Two pieces make it work — and they're at very different stages.
>
> ORD is the proven half. It's the layer that turns hundreds of servers into one catalog you discover in a single read — and it has run at real scale for years, thousands of services discoverable without a single live connection. Battle-tested.
>
> The Server Card is the newer half. Today it tells you a server exists and where to reach it — but not what it can do. That last part, the tools, is exactly what we're proposing to add: optional metadata, there when you want it. And that one addition is what made everything you just watched possible — a registry can catalog the server, a gateway can reason about it, a security team can flag a destructive tool, all before anyone connects.
>
> It isn't in the spec yet. It's an open proposal — issue #30, SEP-2127. That's what we're here to ask for.
