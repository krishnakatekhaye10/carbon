/**
 * @fileoverview AI Climate Coach component — Climatora
 * A fully-featured smart chat interface with 30+ keyword-matched response patterns,
 * conversation history, dynamic quick-action chips, a radar chart, and a climate
 * score report panel. No external API dependencies.
 *
 * @module Coach
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Bot,
  User,
  Send,
  Zap,
  Target,
  Award,
  TrendingDown,
  MessageCircle,
  ChevronRight,
  Sparkles,
  Brain,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** @constant {number} Paris Agreement 1.5 °C per-capita target (kg CO₂e/yr) */
const PARIS_TARGET = 2300;

/** @constant {number} Milliseconds to wait before showing the bot reply */
const TYPING_DELAY_MS = 800;

/**
 * @typedef {'A+' | 'A' | 'B' | 'C' | 'D' | 'F'} LetterGrade
 * @typedef {{ label: string; color: string }} CategoryMeta
 */

/** @type {Record<string, CategoryMeta>} */
const CATEGORY_META = {
  transport: { label: 'Transport',   color: '#6366f1' },
  flights:   { label: 'Air Travel',  color: '#ec4899' },
  diet:      { label: 'Diet',        color: '#f59e0b' },
  energy:    { label: 'Home Energy', color: '#10b981' },
  lifestyle: { label: 'Lifestyle',   color: '#3b82f6' },
};

// ---------------------------------------------------------------------------
// Knowledge Base — 30+ response patterns
// ---------------------------------------------------------------------------

/**
 * @typedef {{ keywords: string[]; response: (fp: number, breakdown: object, data: object) => string }} KnowledgeEntry
 */

/** @type {KnowledgeEntry[]} */
const KNOWLEDGE_BASE = [
  {
    keywords: ['diet', 'food', 'eat', 'meat', 'vegan', 'vegetarian', 'beef', 'chicken', 'plant'],
    response: (fp, breakdown, data) => {
      const pct = ((breakdown.diet / fp) * 100).toFixed(0);
      const dietType = data?.diet?.dietType ?? 'lowMeat';
      const dietLabels = {
        heavyMeat: 'Heavy Meat Eater',
        lowMeat: 'Moderate Meat Eater',
        pescatarian: 'Pescatarian',
        vegetarian: 'Vegetarian',
        vegan: 'Vegan / Plant-Based',
      };
      const advice = {
        heavyMeat: 'Beef alone produces ~27 kg CO₂e per kg of food. Try "Meatless Mondays" — cutting one beef meal per week saves ~400 kg/yr.',
        lowMeat: 'Swapping two meat dinners per week for legumes or tofu cuts ~300 kg CO₂e annually with minimal lifestyle change.',
        pescatarian: 'Fish is much lower-impact than red meat. Focus next on reducing dairy and cutting food waste to shrink your diet footprint further.',
        vegetarian: 'Great choice! Dairy still contributes ~30% of a typical vegetarian footprint. Swapping dairy milk for oat milk saves ~70% in that category.',
        vegan: 'Excellent — a fully plant-based diet is the lowest-impact dietary pattern. Focus on seasonal, local produce and minimal packaging.',
      };
      return `Your diet accounts for **${pct}%** of your footprint (~**${(breakdown.diet / 1000).toFixed(2)} t CO₂e/yr**). You eat as a **${dietLabels[dietType] ?? 'mixed diet'}**.\n\n${advice[dietType] ?? 'Reducing animal products and food waste are the highest-leverage actions here.'}\n\nThe **"Zero Food Waste"** challenge in the Habit Tracker gives you an immediate win — wasted food that rots in landfills releases methane, a greenhouse gas **28× more potent** than CO₂.`;
    },
  },
  {
    keywords: ['transport', 'car', 'drive', 'driving', 'transit', 'bus', 'train', 'commute', 'vehicle'],
    response: (fp, breakdown, data) => {
      const pct = ((breakdown.transport / fp) * 100).toFixed(0);
      const carKm = data?.transport?.carKm ?? 0;
      const fuel = data?.transport?.fuelType ?? 'gas';
      const fuelTip = {
        gas: `Your gas vehicle emits ~0.21 kg CO₂/km. Transitioning to a hybrid saves ~40% instantly; a full EV saves ~80%.`,
        hybrid: `Your hybrid emits ~0.11 kg CO₂/km — solid progress. Consolidate trips and you could shave off another 20%.`,
        electric: `EVs emit ~0.04 kg CO₂/km (grid-dependent). Your transport is already near-optimal — focus on other categories.`,
      };
      return `Transport is **${pct}%** of your footprint (~**${(breakdown.transport / 1000).toFixed(2)} t CO₂e/yr**). You drive **${carKm} km/week**.\n\n${fuelTip[fuel] ?? fuelTip.gas}\n\nFor trips under 5 km, cycling or walking eliminates emissions entirely. Even replacing **one car trip per week** with a bike saves ~120 kg CO₂/yr. Try the **"Bike Under 3 km"** habit!`;
    },
  },
  {
    keywords: ['flight', 'fly', 'flying', 'plane', 'airplane', 'aviation', 'air travel', 'airline'],
    response: (fp, breakdown, data) => {
      const pct = ((breakdown.flights / fp) * 100).toFixed(0);
      const shortHaul = data?.flights?.shortHaul ?? 0;
      const longHaul = data?.flights?.longHaul ?? 0;
      if (shortHaul === 0 && longHaul === 0) {
        return `You have **zero flights** recorded — incredible! Aviation is one of the most carbon-intensive activities, so avoiding it puts your flight footprint at **0 kg CO₂e**. This is one of the biggest single lifestyle choices you can make for the climate. 🌍`;
      }
      return `Air travel is **${pct}%** of your footprint. You take **${shortHaul} short-haul** and **${longHaul} long-haul** flights per year — about **${(breakdown.flights / 1000).toFixed(2)} t CO₂e**.\n\nAircraft emit CO₂ at high altitude where it has ~2× the warming effect. Tips:\n• Replace domestic flights with trains where journey time < 4 hrs\n• Fly economy (business class = 2–3× higher footprint per passenger)\n• Choose direct routes (takeoff & landing use the most fuel)\n• Offset only as a last resort — always reduce first.`;
    },
  },
  {
    keywords: ['energy', 'electricity', 'heating', 'boiler', 'light', 'appliance', 'home', 'house', 'kwh'],
    response: (fp, breakdown, data) => {
      const pct = ((breakdown.energy / fp) * 100).toFixed(0);
      const elec = data?.energy?.electricity ?? 0;
      const heat = data?.energy?.heatingSource ?? 'gas';
      const heatLabel = { gas: 'natural gas', electric: 'electric/heat pump', oil: 'heating oil', solar: 'solar/renewables' };
      return `Home energy is **${pct}%** of your footprint (~**${(breakdown.energy / 1000).toFixed(2)} t CO₂e/yr**). You use **${elec} kWh/month** with **${heatLabel[heat] ?? heat}** heating.\n\nTop actions:\n• **Switch to a heat pump** — reduces heating emissions by up to 65% vs. gas\n• **Green tariff** — switch your electricity supplier to 100% renewables (often same price)\n• **LED bulbs** — use 75% less energy than incandescent; try the "LED Retrofit" habit\n• **Thermostat** — dropping 1°C in winter saves ~3% of your heating bill & emissions`;
    },
  },
  {
    keywords: ['lifestyle', 'shopping', 'stuff', 'product', 'consume', 'consumption', 'buy', 'purchase'],
    response: (fp, breakdown) => {
      const pct = ((breakdown.lifestyle / fp) * 100).toFixed(0);
      return `Lifestyle & goods account for **${pct}%** of your footprint (~**${(breakdown.lifestyle / 1000).toFixed(2)} t CO₂e/yr**).\n\nEmbedded carbon in manufactured goods is often invisible — a single smartphone emits ~70 kg CO₂e to produce. Strategies:\n• **Buy second-hand** — extends product life, zero manufacturing emissions\n• **Repair before replacing** — a right-to-repair mindset is powerful\n• **Minimise single-use plastics** — production + disposal both emit CO₂\n• **Quality over quantity** — fewer, longer-lasting items win every time`;
    },
  },
  {
    keywords: ['paris', 'agreement', 'target', '1.5', '2 degree', 'net zero', 'climate goal', '2.3'],
    response: (fp) => {
      const diff = fp - PARIS_TARGET;
      if (diff <= 0) {
        return `🎉 Congratulations! Your footprint is **${(fp / 1000).toFixed(2)} t/yr** — already **below** the Paris Agreement 1.5°C-compatible target of **2.3 t per person**. You are in the top ~5% of global citizens by climate impact. Maintain these habits and consider advocating for systemic change!`;
      }
      return `Your footprint is **${(fp / 1000).toFixed(2)} t/yr**. The Paris Agreement 1.5°C pathway requires global per-capita emissions to reach **2.3 t by 2030**.\n\nYou need to cut **${(diff / 1000).toFixed(2)} t** (~${Math.round((diff / fp) * 100)}% reduction) to align with that target. Use the **dashboard sliders** to model how lifestyle changes close that gap — it's closer than you think!`;
    },
  },
  {
    keywords: ['offset', 'offsetting', 'carbon credit', 'tree', 'plant trees', 'reforestation'],
    response: (fp) => {
      const trees = Math.round(fp / 22);
      return `Carbon offsetting funds external projects (reforestation, methane capture, renewable energy) to balance your emissions.\n\nTo offset your **${(fp / 1000).toFixed(2)} t footprint** you'd need ~**${trees} mature trees** growing for a full year — or equivalent certified projects.\n\n⚠️ **Crucial caveat**: Offsets should be a *last resort* for unavoidable emissions. Many offset projects have been shown to be unreliable. Prioritise direct reduction first, then offset the residual. Look for **Gold Standard** or **VCS-verified** projects.`;
    },
  },
  {
    keywords: ['renewable', 'solar panel', 'wind', 'green energy', 'clean energy', 'photovoltaic', 'pv'],
    response: (fp) => {
      return `Renewable energy is one of the most impactful systemic changes you can make:\n\n**Solar Panels**: A typical 4 kWp home system generates ~3,800 kWh/yr, saving ~1.4 t CO₂e/yr (at UK grid intensity). Payback period is typically 6–8 years, then 25+ years of clean power.\n\n**Green Tariff**: If you rent or can't install panels, switching to a 100% renewable electricity tariff eliminates your home electricity emissions overnight — often at no extra cost.\n\n**Community Solar**: Many areas allow you to buy into shared solar projects. Your ${(fp / 1000).toFixed(1)} t footprint could be cut by up to 30% through home electrification + renewables.`;
    },
  },
  {
    keywords: ['electric vehicle', 'ev', 'tesla', 'plug in', 'charging', 'bev'],
    response: (fp, breakdown) => {
      return `**Electric Vehicles** are one of the highest-leverage transport choices:\n\n• Average EV lifecycle emissions: ~30 t CO₂e vs. ~55 t for a petrol car over 10 years\n• Emissions depend on your grid — a UK EV emits ~70% less than petrol; a coal-heavy grid reduces this to ~40%\n• Your transport currently accounts for **${(breakdown.transport / 1000).toFixed(2)} t/yr** — switching to an EV could cut this by 60–80%\n\nEven if you can't buy an EV now, car clubs & EV hire for occasional trips can reduce your personal emissions significantly.`;
    },
  },
  {
    keywords: ['heat pump', 'ground source', 'air source', 'ashp', 'gshp', 'hvac'],
    response: () => {
      return `**Heat Pumps** are the gold standard for low-carbon home heating:\n\n• Air-Source Heat Pumps (ASHP): 2.5–4× more efficient than gas boilers, reducing heating emissions by 50–65%\n• Ground-Source (GSHP): 3–5× efficiency, best for rural homes with garden space\n• Best paired with: good insulation (loft + walls), double glazing, and a green electricity tariff\n• Running costs: typically lower than gas when on a green tariff\n• Government grants (UK: Boiler Upgrade Scheme gives £7,500) reduce upfront costs significantly`;
    },
  },
  {
    keywords: ['solar', 'panels', 'photovoltaic', 'rooftop solar', 'solar power'],
    response: () => {
      return `**Rooftop Solar** is one of the best long-term investments for your home's carbon footprint:\n\n• A 4 kWp system (15–16 panels) generates ~3,500–4,200 kWh/yr depending on your location\n• Carbon payback: just **1.5–2 years** to offset the CO₂ used in manufacturing\n• Then 23+ years of virtually zero-carbon electricity\n• With battery storage (e.g., Tesla Powerwall), you can self-consume ~80% of generation\n• Export tariffs let you earn money selling surplus power back to the grid`;
    },
  },
  {
    keywords: ['compost', 'composting', 'food waste', 'organic', 'landfill'],
    response: () => {
      return `**Composting** tackles one of the most overlooked emission sources — food waste:\n\n• Food in landfill decomposes anaerobically, releasing **methane** (28× more potent than CO₂ over 100 years)\n• Composting at home diverts this to aerobic decomposition — producing CO₂ and nutrient-rich soil\n• UK households waste ~70 kg of food per person per year — roughly **0.25 t CO₂e**\n\nTips:\n• Wormery / vermicompost: compact, odourless, works in flats\n• Council green bin: most areas collect for industrial composting\n• **Freeze leftovers** before they go off — the easiest food waste fix`;
    },
  },
  {
    keywords: ['vegan', 'veganism', 'plant based', 'plant-based', 'no meat', 'no animal'],
    response: (fp) => {
      return `A **vegan diet** is the single highest-impact personal dietary choice for the climate:\n\n• Saves ~1.5 t CO₂e/yr vs. a heavy meat diet\n• Reduces land use by 75%, water use by ~55%\n• Oxford study: vegans have the lowest dietary carbon footprints globally\n\nYour current footprint is **${(fp / 1000).toFixed(2)} t/yr**. Going fully plant-based could represent a **15–25% total reduction** depending on your current diet. Even a **flexitarian** shift (reducing meat by 50%) saves ~0.7 t CO₂e/yr.`;
    },
  },
  {
    keywords: ['fast fashion', 'clothing', 'textile', 'clothes', 'fashion', 'fabric'],
    response: () => {
      return `**Fast Fashion** is a major hidden emitter — the industry produces ~10% of global CO₂ emissions:\n\n• A single cotton T-shirt: ~2.1 kg CO₂e to produce\n• A pair of jeans: ~33 kg CO₂e\n• Polyester fabrics shed **microplastics** into waterways with every wash\n\nActions:\n• Buy **second-hand** (Vinted, Depop, charity shops) — cuts manufacturing emissions to zero\n• Choose **natural fibres** (organic cotton, linen, hemp) over synthetics\n• Wash clothes at **30°C** — saves up to 40% of energy per wash vs. 60°C\n• **Repair & upcycle** rather than replace`;
    },
  },
  {
    keywords: ['plastic', 'single use', 'packaging', 'bottle', 'straw', 'bag', 'microplastic'],
    response: () => {
      return `**Plastic & Packaging** emissions are often underestimated:\n\n• Global plastic production emits ~1.8 billion tonnes of CO₂e/yr\n• Only **9%** of plastic ever produced has been recycled\n• Single-use plastics are typically made from fossil fuels (oil/gas)\n\nImpactful switches:\n• Reusable water bottle & coffee cup → saves ~0.03 t CO₂e/yr\n• Zero-waste refill stores for household products\n• Loose produce & package-free shopping\n• Refuse plastic bags — bring a tote always\n\nRecycling helps but **reducing consumption** is far more powerful.`;
    },
  },
  {
    keywords: ['water', 'shower', 'bath', 'hosepipe', 'tap', 'irrigation', 'freshwater'],
    response: () => {
      return `**Water use** has a carbon footprint often overlooked:\n\n• Heating water for showers, baths & washing accounts for ~5% of UK home energy use\n• Water treatment & distribution also uses significant electricity\n\nQuick wins:\n• Cut shower time from 10 min to 4 min → saves ~0.07 t CO₂e/yr\n• Install a **low-flow showerhead** — same experience, 40% less water & energy\n• Fix dripping taps — a slow drip wastes >10,000 litres/yr\n• **Cold-fill washing machines** where possible (pre-heats more efficiently)\n• Collect rainwater for garden irrigation`;
    },
  },
  {
    keywords: ['deforestation', 'forest', 'amazon', 'tree', 'woodland', 'biodiversity'],
    response: () => {
      return `**Deforestation** accounts for ~11% of global greenhouse gas emissions — more than all cars and trucks combined:\n\n• Forests are critical carbon sinks — the Amazon stores ~150–200 Gt of carbon\n• When cleared for agriculture (often beef & soy), this carbon is released\n• 4.7 million hectares of forest were lost in 2023 alone\n\nHow you can help:\n• Reduce beef & palm oil consumption (primary deforestation drivers)\n• Support certified sustainable products (FSC timber, RSPO palm oil)\n• Donate to verified reforestation projects (Trees for Life, Rainforest Trust)\n• Vote for and advocate for strong deforestation legislation`;
    },
  },
  {
    keywords: ['climate anxiety', 'anxious', 'worried', 'hopeless', 'scared', 'overwhelmed', 'depressed', 'doom'],
    response: (fp) => {
      return `It's completely natural to feel anxious about the climate — it shows you care deeply. Climate anxiety is one of the most common emotional responses to the ecological crisis, and it's valid.\n\nHere's some grounding perspective:\n• **Individual action matters** — your footprint of **${(fp / 1000).toFixed(2)} t** is data you can act on\n• Collective individual change shifts markets: when millions reduce beef, suppliers respond\n• **Community** is key: join local climate groups, repair cafes, or transition towns for shared purpose\n• Research shows that **taking action** — however small — is the most effective antidote to climate anxiety\n\nYou're already here, tracking and caring. That puts you ahead of most. 🌱`;
    },
  },
  {
    keywords: ['carbon tax', 'carbon price', 'ets', 'emissions trading', 'carbon market'],
    response: () => {
      return `**Carbon Pricing** is one of the most powerful policy tools to accelerate decarbonisation:\n\n• A **carbon tax** places a direct price on each tonne of CO₂ emitted, incentivising businesses and consumers to switch to cleaner alternatives\n• The **EU ETS** (Emissions Trading Scheme) covers ~40% of EU emissions; carbon prices reached €100/t in 2023\n• Countries with carbon pricing: Canada, UK, EU, New Zealand, Singapore & more\n\n**How it affects you**: Higher carbon prices flow through to fuel, heating, and flights — making low-carbon options more competitive. Dividend schemes (like Canada's carbon rebate) return revenue directly to households.`;
    },
  },
  {
    keywords: ['recycling', 'recycle', 'waste', 'bin', 'landfill', 'glass', 'aluminium', 'aluminum'],
    response: () => {
      return `**Recycling** is helpful but often over-relied upon as a climate solution:\n\n• Recycling aluminium saves **95%** of the energy needed to make it from raw ore\n• Glass recycling saves ~30% energy; paper ~40%\n• UK plastic recycling rate: only ~46% — much ends up in landfill or exported\n\nHierarchy (most to least impactful):\n1. **Refuse** — don't buy unnecessary items\n2. **Reduce** — consume less\n3. **Reuse** — extend product life\n4. **Repair** — fix before discarding\n5. **Recycle** — only then recycle what remains\n\nRecycling is the last resort in the hierarchy, not the first!`;
    },
  },
  {
    keywords: ['methane', 'ch4', 'natural gas', 'livestock', 'cow', 'cattle', 'enteric'],
    response: () => {
      return `**Methane (CH₄)** is the second most important greenhouse gas after CO₂:\n\n• **84× more potent** than CO₂ over 20 years (28× over 100 years)\n• Sources: livestock (enteric fermentation), natural gas leaks, landfills, rice paddies\n• Livestock produce ~14.5% of global GHG emissions, mostly as methane\n\nGood news: methane has a shorter atmospheric lifetime (~12 years vs. CO₂'s centuries), meaning **cutting methane now has fast climate benefits**.\n\nYour lever: reducing beef and dairy consumption directly cuts enteric methane. Each kg of beef produces ~60 kg CO₂e — the single highest-impact food choice.`;
    },
  },
  {
    keywords: ['tipping point', 'feedback loop', 'runaway', 'irreversible', 'collapse', 'permafrost'],
    response: () => {
      return `**Climate Tipping Points** are thresholds beyond which change becomes self-reinforcing and potentially irreversible:\n\n• **West Antarctic Ice Sheet** collapse: possible above 1.5°C → multi-metre sea level rise\n• **Amazon Dieback**: ~20% deforestation could tip the Amazon into savannah → releases 90 Gt CO₂\n• **Permafrost thaw**: Arctic permafrost holds ~1.5 trillion tonnes of carbon — if released, could add 0.3–0.5°C of warming\n• **Atlantic circulation (AMOC) slowdown**: could drastically shift European climate\n\nCurrent best science (IPCC AR6): we are likely to cross 1.5°C by the early 2030s without immediate, steep emission cuts. Every fraction of a degree matters.`;
    },
  },
  {
    keywords: ['ipcc', 'report', 'science', 'scientific consensus', 'ar6', 'ar5'],
    response: () => {
      return `The **IPCC (Intergovernmental Panel on Climate Change)** is the UN body that assesses climate science:\n\n**Key IPCC AR6 (2021–2023) findings:**\n• Warming of 1.1°C above pre-industrial levels is confirmed\n• Human influence is "unequivocal" cause of climate change\n• Without deep cuts by 2030, 1.5°C will be exceeded by ~2035\n• Limiting to 1.5°C requires ~45% emissions cut by 2030 and net zero by 2050\n• Extreme weather events (heatwaves, flooding, drought) are intensifying\n\n**IPCC does NOT recommend specific policies** — it only assesses science. Policy action is the responsibility of governments, businesses, and citizens like you.`;
    },
  },
  {
    keywords: ['scope 1', 'scope 2', 'scope 3', 'supply chain', 'indirect', 'value chain'],
    response: () => {
      return `**Scope 1, 2 & 3 emissions** are a framework for categorising greenhouse gas emissions (originally for businesses, but applies to individuals too):\n\n• **Scope 1** — Direct emissions you control: burning gas at home, petrol in your car\n• **Scope 2** — Indirect: electricity you buy (emissions happen at the power station)\n• **Scope 3** — All other indirect: manufacturing of goods you buy, food production, flights (travel in suppliers' vehicles)\n\nFor individuals, **Scope 3 is typically 50–70%** of total footprint — embedded in food, goods, and services. This is why what you *buy* matters as much as what you *directly* burn or use.`;
    },
  },
  {
    keywords: ['circular economy', 'circular', 'cradle to cradle', 'closed loop', 'sharing economy'],
    response: () => {
      return `The **Circular Economy** is a model where products and materials are kept in use for as long as possible:\n\n• Contrasts with the **linear economy**: make → use → dispose\n• Circular design: products built to be repaired, reused, remanufactured, or recycled\n• Estimated to reduce EU industrial emissions by **56% by 2050**\n\nHow to participate:\n• **Sharing platforms**: BorrowMyDoggy, Fat Llama, libraries of things\n• **Repair cafés**: fix electronics, clothing, bikes for free\n• **Refurbished electronics**: a refurb phone saves ~70% of manufacturing emissions\n• **Leasing models**: some companies now lease products (Mud Jeans, Fairphone)`;
    },
  },
  {
    keywords: ['regenerative', 'agriculture', 'farming', 'soil', 'carbon sequestration', 'rewilding'],
    response: () => {
      return `**Regenerative Agriculture** goes beyond "sustainable" — it actively restores soil health and sequesters carbon:\n\n• Healthy soils can sequester 1–3 t CO₂/hectare/yr through cover crops, no-till farming, compost\n• Rewilding releases land from intensive farming, allowing ecosystems to re-establish carbon stores\n• Biochar: adding charred organic matter to soil can lock carbon for centuries\n\nAs a consumer, you support regenerative agriculture by:\n• Buying from local farms using regenerative practices\n• Choosing grass-fed, regenerative meat (still less impactful than cutting consumption, but better)\n• Supporting policy advocacy for agricultural reform (CAP reform, ELMS in UK)`;
    },
  },
  {
    keywords: ['ocean', 'ocean acidification', 'sea', 'coral', 'reef', 'marine'],
    response: () => {
      return `**Ocean Acidification** is a direct result of CO₂ absorption by seawater:\n\n• Oceans absorb ~25% of all CO₂ emitted — crucial but not unlimited\n• Absorbed CO₂ forms carbonic acid, lowering ocean pH by ~0.1 units since industrialisation\n• Coral reefs face mass bleaching above 1.5°C — 70–90% of reefs could be lost at 2°C\n• Shell-forming organisms (oysters, lobsters, sea urchins) struggle in acidic water, disrupting food webs\n\n**Your lever**: The only real fix is cutting CO₂ at the source. Your ${''} personal footprint reduction contributes directly to slowing this process. Marine protected areas also help ecosystems cope.`;
    },
  },
  {
    keywords: ['biodiversity', 'wildlife', 'extinction', 'species', 'ecosystem', 'habitat'],
    response: () => {
      return `Climate change and biodiversity loss are **twin crises**, deeply interlinked:\n\n• Earth is in its **6th mass extinction** — 1 million species threatened (IPBES 2019)\n• 1°C of warming has already shifted species ranges, migration timings, and food web structures\n• Habitat destruction (for agriculture, logging, urban expansion) is the primary driver\n\nYour actions:\n• Diet shift away from beef & soy (primary drivers of habitat destruction)\n• Support rewilding projects and nature reserves\n• Choose **FSC-certified** wood and **Rainforest Alliance** products\n• Advocate for 30×30 (protect 30% of land and ocean by 2030 — international target)`;
    },
  },
  {
    keywords: ['net zero', 'carbon neutral', 'zero emissions', 'carbon negative', 'net negative'],
    response: (fp) => {
      return `**Net Zero** means balancing emissions produced with emissions removed from the atmosphere:\n\n• **Global net zero by 2050** is the target under the Paris Agreement to limit warming to 1.5°C\n• Individual net zero: reducing your footprint as close to zero as possible, then offsetting the residual\n• Your current footprint: **${(fp / 1000).toFixed(2)} t/yr**. Paris-aligned target: **2.3 t/yr**.\n\nNet zero for individuals typically involves:\n1. Eliminate fossil fuels: EV + heat pump + green electricity\n2. Transform diet: plant-rich, low-waste\n3. Cut aviation drastically\n4. Offset remaining ~0.5–1 t with verified, permanent projects (reforestation, DACCS)`;
    },
  },
  {
    keywords: ['insulation', 'draught', 'loft', 'wall insulation', 'cavity', 'double glazing'],
    response: () => {
      return `**Home Insulation** is one of the most cost-effective, permanent emission reductions:\n\n• **Loft insulation**: costs ~£300–500, saves ~£200+/yr on bills and ~0.6 t CO₂e/yr\n• **Cavity wall insulation**: costs ~£500–1,500, saves ~0.5 t CO₂e/yr\n• **Double/triple glazing**: reduces heat loss by 50% vs. single glazing\n• **Draught proofing**: costs under £100, saves ~0.3 t CO₂e/yr — often overlooked!\n\nUK grants: ECO4 scheme provides free insulation for low-income households. Great British Insulation Scheme covers many mid-income homes too. A well-insulated home reduces both your energy bills and your heating system's workload.`;
    },
  },
  {
    keywords: ['public transport', 'metro', 'underground', 'cycling', 'bike', 'bicycle', 'pedestrian', 'walking'],
    response: (fp, breakdown) => {
      return `**Active & Public Transport** can dramatically cut your transport footprint (~**${(breakdown.transport / 1000).toFixed(2)} t/yr** currently):\n\n• Train vs. car: trains emit ~6× less CO₂ per passenger km\n• Bus vs. car: buses emit ~3× less CO₂ per passenger km\n• Cycling: effectively **zero emissions** (just the food calories you burn!)\n• Walking: zero emissions + health co-benefits\n\nIf you replaced just **50% of your car journeys** with cycling/public transport, your transport footprint could fall by **40–50%**. That's one of the biggest levers available to you.`;
    },
  },
  {
    keywords: ['local', 'seasonal', 'food miles', 'import', 'air freight', 'local produce'],
    response: () => {
      return `**Local & Seasonal Food** reduces transport emissions and supports regional food systems:\n\n• **Food miles** account for only ~6% of food's total carbon footprint — so local isn't always lower\n• Exception: **air-freighted produce** (some berries, asparagus, fine beans from Kenya) has 50× higher transport emissions\n• **Seasonal eating** is more impactful: a heated UK greenhouse tomato in winter has 5× the footprint of a Spanish import!\n\nRule of thumb: **What you eat matters more than where it comes from**. A locally-raised beef burger still has far higher emissions than imported lentils. Season + source + species — all three count.`;
    },
  },
  {
    keywords: ['reduce', 'reduce emissions', 'cut', 'lower', 'shrink', 'decrease', 'improve'],
    response: (fp, breakdown) => {
      const sorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
      const top = sorted[0];
      const second = sorted[1];
      return `Based on your data, here's your personalised **reduction roadmap**:\n\n🥇 **Priority 1 — ${CATEGORY_META[top[0]]?.label}** (${((top[1] / fp) * 100).toFixed(0)}%): This is your biggest lever. Small changes here yield the largest absolute reduction.\n\n🥈 **Priority 2 — ${CATEGORY_META[second[0]]?.label}** (${((second[1] / fp) * 100).toFixed(0)}%): Once you've made progress on Priority 1, focus here.\n\n🌍 **Your goal**: Close the **${((fp - PARIS_TARGET) / 1000).toFixed(2)} t gap** to the Paris 2.3 t target.\n\nUse the **dashboard sliders** to model the exact reductions needed — it's visual, real-time, and motivating!`;
    },
  },
  {
    keywords: ['hello', 'hi', 'hey', 'greet', 'start', 'help', 'begin', 'what can you', 'how are you'],
    response: (fp) => {
      return `Hello! 👋 I'm **Aria**, your AI Climate Coach. I've analysed your footprint of **${(fp / 1000).toFixed(2)} t CO₂e/yr** and I'm ready to help.\n\nI can advise on:\n🌱 **Diet & food** • 🚗 **Transport & EVs** • ✈️ **Flights** • ⚡ **Home energy** • 🌿 **Renewables** • ♻️ **Circular economy** • 🌊 **Ocean & biodiversity** • 🧘 **Climate anxiety** • 📋 **Paris Agreement & IPCC** • and much more.\n\nJust ask me anything, or use the suggestion chips below to get started!`;
    },
  },
];

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

/**
 * Derives a letter grade from a total carbon footprint value.
 * @param {number} footprint - Annual footprint in kg CO₂e
 * @returns {{ grade: LetterGrade; color: string; description: string }}
 */
function getGrade(footprint) {
  if (footprint < 2300)  return { grade: 'A+', color: '#10b981', description: 'Climate Leader'     };
  if (footprint < 3500)  return { grade: 'A',  color: '#34d399', description: 'Excellent'           };
  if (footprint < 5000)  return { grade: 'B',  color: '#fbbf24', description: 'Good Progress'       };
  if (footprint < 7000)  return { grade: 'C',  color: '#f97316', description: 'Room to Improve'     };
  if (footprint < 10000) return { grade: 'D',  color: '#ef4444', description: 'High Impact'         };
  return                        { grade: 'F',  color: '#dc2626', description: 'Urgent Action Needed' };
}

/**
 * Normalises a breakdown value into a 0–1 score for the radar chart.
 * Higher is better (lower emissions = higher score).
 * @param {number} value - Category emission in kg
 * @param {number} maxVal - Worst-case reference value
 * @returns {number}
 */
function normScore(value, maxVal) {
  return Math.max(0, 1 - value / maxVal);
}

/**
 * Converts polar coordinates to SVG cartesian coordinates.
 * @param {number} cx - Centre X
 * @param {number} cy - Centre Y
 * @param {number} r  - Radius
 * @param {number} angleDeg - Angle in degrees (0 = top)
 * @returns {{ x: number; y: number }}
 */
function polar(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/**
 * Formats milliseconds into a human-readable timestamp string.
 * @param {number} ts - Timestamp (Date.now())
 * @returns {string}
 */
function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Runs the keyword-matching engine over user input.
 * @param {string} text - User message (raw)
 * @param {number} fp - Total footprint
 * @param {object} breakdown - Category breakdown
 * @param {object} data - Raw input data
 * @returns {string} Coach reply (may contain **bold** markdown)
 */
function matchResponse(text, fp, breakdown, data) {
  const lower = text.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    const score = entry.keywords.reduce((acc, kw) => {
      if (lower.includes(kw)) return acc + kw.length; // longer keyword = more specific match
      return acc;
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore > 0) {
    return bestMatch.response(fp, breakdown, data);
  }

  // Contextual fallback
  const sorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  const topCat = sorted[0][0];
  const topPct = ((sorted[0][1] / fp) * 100).toFixed(0);
  return `Great question! Your current footprint is **${(fp / 1000).toFixed(2)} t CO₂e/yr**. Your biggest category is **${CATEGORY_META[topCat]?.label}** at **${topPct}%** of your total.\n\nTry asking me about: diet, transport, flights, home energy, solar panels, heat pumps, carbon offsetting, the Paris Agreement, recycling, EV cars, or climate anxiety. I'm here to help!`;
}

/**
 * Generates 5 personalised quick-action chips based on the user's breakdown.
 * @param {object} breakdown - Category emissions { transport, flights, diet, energy, lifestyle }
 * @returns {string[]}
 */
function buildQuickChips(breakdown) {
  const sorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  const top = sorted[0][0];
  const second = sorted[1][0];

  const chipMap = {
    transport: 'How can I cut my transport emissions?',
    flights:   'What can I do about my flight footprint?',
    diet:      'How does my diet affect my footprint?',
    energy:    'What are the best home energy upgrades?',
    lifestyle: 'How does my lifestyle & shopping impact climate?',
  };

  const chips = [chipMap[top], chipMap[second]];
  const extras = [
    'How close am I to the Paris target?',
    'Tell me about solar panels and heat pumps.',
    'What is carbon offsetting?',
  ];

  return [...chips, ...extras].slice(0, 5);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Renders a single chat message bubble with formatted bold text.
 * @param {{ msg: object }} props
 */
function ChatBubble({ msg }) {
  const isBot = msg.sender === 'assistant';

  /** Splits **bold** tokens into <strong> elements */
  const renderText = (text) =>
    text.split('**').map((part, i) =>
      i % 2 === 1
        ? <strong key={i} style={{ color: isBot ? '#10b981' : '#fff' }}>{part}</strong>
        : part
    );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isBot ? 'flex-start' : 'flex-end',
        gap: 4,
        maxWidth: '88%',
        alignSelf: isBot ? 'flex-start' : 'flex-end',
      }}
    >
      {/* Avatar row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {isBot && (
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Bot size={13} color="#fff" />
          </div>
        )}
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{isBot ? 'Aria' : 'You'} · {msg.time}</span>
        {!isBot && (
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <User size={13} color="#fff" />
          </div>
        )}
      </div>

      {/* Bubble */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
          background: isBot
            ? 'rgba(255,255,255,0.05)'
            : 'linear-gradient(135deg, #6366f1, #10b981)',
          border: isBot ? '1px solid rgba(255,255,255,0.08)' : 'none',
          color: isBot ? 'var(--text-primary)' : '#ffffff',
          fontSize: 13.5,
          lineHeight: 1.65,
          whiteSpace: 'pre-line',
          backdropFilter: 'blur(8px)',
          boxShadow: isBot
            ? '0 2px 12px rgba(0,0,0,0.15)'
            : '0 4px 20px rgba(99,102,241,0.4)',
        }}
      >
        {renderText(msg.text)}
      </div>
    </div>
  );
}

/**
 * Animated typing indicator (three bouncing dots).
 */
function TypingIndicator() {
  const dotBase = {
    width: 7, height: 7, borderRadius: '50%',
    background: 'var(--color-accent)',
    display: 'inline-block',
    animation: 'coachDotBounce 1.1s ease-in-out infinite',
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        background: 'linear-gradient(135deg, #10b981, #6366f1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Bot size={13} color="#fff" />
      </div>
      <div style={{
        padding: '10px 16px', borderRadius: '4px 16px 16px 16px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        <span style={dotBase} />
        <span style={{ ...dotBase, animationDelay: '0.18s' }} />
        <span style={{ ...dotBase, animationDelay: '0.36s' }} />
      </div>
    </div>
  );
}

/**
 * Pentagon radar chart rendered as pure SVG.
 * @param {{ scores: number[]; labels: string[]; colors: string[] }} props
 */
function RadarChart({ scores, labels, colors }) {
  const CX = 130, CY = 130, R = 90, LEVELS = 4;
  const N = scores.length;
  const angles = Array.from({ length: N }, (_, i) => (360 / N) * i);

  /** Build polygon points string from score array */
  const polyPoints = (values, radius) =>
    values.map((v, i) => {
      const pt = polar(CX, CY, radius * v, angles[i]);
      return `${pt.x},${pt.y}`;
    }).join(' ');

  const dataPoints = polyPoints(scores, R);

  return (
    <svg viewBox="0 0 260 260" width="100%" height="100%" style={{ maxWidth: 220, margin: '0 auto', display: 'block' }}>
      {/* Grid rings */}
      {Array.from({ length: LEVELS }, (_, lvl) => {
        const fraction = (lvl + 1) / LEVELS;
        const pts = Array.from({ length: N }, (__, i) => {
          const p = polar(CX, CY, R * fraction, angles[i]);
          return `${p.x},${p.y}`;
        }).join(' ');
        return (
          <polygon
            key={lvl}
            points={pts}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        );
      })}

      {/* Axis spokes */}
      {angles.map((ang, i) => {
        const tip = polar(CX, CY, R, ang);
        return (
          <line
            key={i}
            x1={CX} y1={CY}
            x2={tip.x} y2={tip.y}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon — filled */}
      <polygon
        points={dataPoints}
        fill="rgba(16,185,129,0.18)"
        stroke="#10b981"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Data points */}
      {scores.map((v, i) => {
        const pt = polar(CX, CY, R * v, angles[i]);
        return (
          <circle key={i} cx={pt.x} cy={pt.y} r={4}
            fill={colors[i]} stroke="#0a0a0a" strokeWidth={1.5} />
        );
      })}

      {/* Axis labels */}
      {labels.map((lbl, i) => {
        const pt = polar(CX, CY, R + 22, angles[i]);
        const score = Math.round(scores[i] * 100);
        return (
          <g key={i}>
            <text
              x={pt.x} y={pt.y - 4}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9.5}
              fontWeight="600"
              fill="rgba(255,255,255,0.7)"
            >
              {lbl}
            </text>
            <text
              x={pt.x} y={pt.y + 9}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fill={colors[i]}
              fontWeight="700"
            >
              {score}
            </text>
          </g>
        );
      })}

      {/* Centre dot */}
      <circle cx={CX} cy={CY} r={3} fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}

/**
 * Circular progress ring SVG.
 * @param {{ value: number; max: number; grade: string; color: string }} props
 */
function ProgressRing({ value, max, grade, color }) {
  const SIZE = 110, STROKE = 9, R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(1, 1 - value / max));
  const dash = pct * CIRC;

  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={STROKE} />
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none" stroke={color} strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${CIRC}`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
      }}>
        <span style={{
          fontSize: 28, fontWeight: 900, lineHeight: 1,
          background: `linear-gradient(135deg, ${color}, #fff)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>{grade}</span>
      </div>
    </div>
  );
}

/**
 * Score report right-panel.
 * Shows letter grade, progress ring, radar chart, and a 3-item action roadmap.
 * @param {{ footprint: number; breakdown: object }} props
 */
function ScoreReport({ footprint, breakdown }) {
  const { grade, color, description } = useMemo(() => getGrade(footprint), [footprint]);

  /** Worst-case reference values per category (kg CO₂e/yr, very high consumer) */
  const REF = { transport: 6000, flights: 8000, diet: 4000, energy: 5000, lifestyle: 3000 };

  const categories = ['transport', 'flights', 'diet', 'energy', 'lifestyle'];
  const scores = useMemo(() =>
    categories.map(cat => normScore(breakdown[cat] ?? 0, REF[cat])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [breakdown]
  );
  const labels = categories.map(c => CATEGORY_META[c].label);
  const chartColors = categories.map(c => CATEGORY_META[c].color);

  /** Generate 3 personalised action items from the worst categories */
  const actionItems = useMemo(() => {
    const sorted = Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    const tips = {
      transport: 'Switch to an EV or increase public transit use by 50%',
      flights:   'Eliminate 1 long-haul flight (saves ~1.5–3 t CO₂e)',
      diet:      'Adopt a plant-rich diet — try Meatless 4 days/week',
      energy:    'Install a heat pump + switch to a green electricity tariff',
      lifestyle: 'Buy second-hand & repair before replacing',
    };
    return sorted.map(([cat, val]) => ({
      label: CATEGORY_META[cat].label,
      tip: tips[cat] ?? 'Reduce consumption in this category',
      saving: Math.round(val * 0.35),
      color: CATEGORY_META[cat].color,
    }));
  }, [breakdown]);

  const fp_t = (footprint / 1000).toFixed(2);
  const paris_t = (PARIS_TARGET / 1000).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, height: '100%', overflowY: 'auto' }}>
      {/* Grade card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 16,
        padding: '18px 20px',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <Award size={15} color={color} />
          <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1 }}>
            Climate Score Report
          </span>
        </div>

        <ProgressRing value={footprint} max={12000} grade={grade} color={color} />

        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{description}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
            {fp_t} t CO₂e/yr &nbsp;·&nbsp; Target: {paris_t} t
          </div>
        </div>

        {/* Mini bar */}
        <div style={{ width: '100%', background: 'rgba(255,255,255,0.07)', borderRadius: 99, height: 5, overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(100, (PARIS_TARGET / footprint) * 100)}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${color}, rgba(255,255,255,0.3))`,
            borderRadius: 99,
            transition: 'width 0.6s ease',
          }} />
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          {footprint <= PARIS_TARGET
            ? `✅ Paris-aligned!`
            : `${((footprint - PARIS_TARGET) / 1000).toFixed(2)} t above Paris target`}
        </div>
      </div>

      {/* Radar chart */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 16,
        padding: '16px 12px 8px',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Target size={13} color="#6366f1" />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Emission Profile
          </span>
        </div>
        <RadarChart scores={scores} labels={labels} colors={chartColors} />
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>
          Higher score = lower emissions. Aim for outer ring.
        </div>
      </div>

      {/* Action roadmap */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 16,
        padding: '16px 18px',
        backdropFilter: 'blur(12px)',
        flex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <TrendingDown size={13} color="#10b981" />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Reduction Roadmap
          </span>
        </div>
        {actionItems.map((item, idx) => (
          <ActionItem key={item.label} item={item} rank={idx + 1} />
        ))}
      </div>
    </div>
  );
}

/**
 * A single roadmap action item with a styled checkbox and savings badge.
 * @param {{ item: object; rank: number }} props
 */
function ActionItem({ item, rank }) {
  const [checked, setChecked] = useState(false);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        marginBottom: 12,
        opacity: checked ? 0.5 : 1,
        transition: 'opacity 0.3s',
      }}
    >
      <button
        onClick={() => setChecked(c => !c)}
        style={{
          width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
          border: `2px solid ${checked ? item.color : 'rgba(255,255,255,0.2)'}`,
          background: checked ? item.color : 'transparent',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        aria-label={`Mark "${item.tip}" as done`}
      >
        {checked && (
          <svg viewBox="0 0 10 10" width={10} height={10}>
            <polyline points="1.5,5.5 4,8 8.5,2" stroke="#fff" strokeWidth={1.8}
              fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{
            fontSize: 9, fontWeight: 800, color: item.color,
            background: `${item.color}20`, padding: '1px 6px', borderRadius: 99,
          }}>
            #{rank} {item.label}
          </span>
          <ChevronRight size={10} color={item.color} />
          <span style={{ fontSize: 9, color: '#10b981', fontWeight: 700 }}>
            −{(item.saving / 1000).toFixed(2)} t/yr
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45, textDecoration: checked ? 'line-through' : 'none' }}>
          {item.tip}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Coach component
// ---------------------------------------------------------------------------

/**
 * AI Climate Coach — split-panel chat + score report.
 *
 * @param {object} props
 * @param {number}  props.footprint  - Total annual footprint in kg CO₂e
 * @param {object}  props.breakdown  - Per-category emissions { transport, flights, diet, energy, lifestyle }
 * @param {object}  props.data       - Raw onboarding answers (used for contextual responses)
 * @param {object}  [props.user]     - User profile { name }
 * @returns {JSX.Element}
 */
export default function Coach({ footprint, breakdown, data, user }) {
  const userName = user?.name ?? 'there';

  /** @type {[Array, Function]} Conversation history */
  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      sender: 'assistant',
      text: `Hello ${userName}! 👋 I'm **Aria**, your personal AI Climate Coach. 🌿\n\nI've analysed your footprint of **${(footprint / 1000).toFixed(2)} t CO₂e/yr** and I'm ready to build your personalised reduction strategy.\n\nAsk me about diet, transport, flights, home energy, solar panels, heat pumps, the Paris Agreement, carbon offsetting, or anything else climate-related!`,
      time: fmtTime(Date.now()),
    },
  ]);

  const [inputText, setInputText]   = useState('');
  const [isTyping, setIsTyping]     = useState(false);

  const chatEndRef  = useRef(null);
  const inputRef    = useRef(null);

  /** Scroll to latest message */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /** Personalised quick-action chips based on breakdown */
  const quickChips = useMemo(() => buildQuickChips(breakdown), [breakdown]);

  /**
   * Sends a message: appends user bubble, triggers typing, then appends bot reply.
   * @param {string} [text] - Message text (defaults to inputText state)
   */
  const handleSend = useCallback((text) => {
    const msg = (text ?? inputText).trim();
    if (!msg || isTyping) return;

    const userMsg = {
      id:     Date.now(),
      sender: 'user',
      text:   msg,
      time:   fmtTime(Date.now()),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = matchResponse(msg, footprint, breakdown, data);
      const botMsg = {
        id:     Date.now() + 1,
        sender: 'assistant',
        text:   reply,
        time:   fmtTime(Date.now()),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, TYPING_DELAY_MS);
  }, [inputText, isTyping, footprint, breakdown, data]);

  /** Handle Enter key in input */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  /** Fill input box from chip click */
  const handleChipClick = useCallback((chip) => {
    setInputText(chip);
    inputRef.current?.focus();
  }, []);

  // ---------------------------------------------------------------------------
  // Styles (defined here to avoid repetition in JSX)
  // ---------------------------------------------------------------------------

  const panelBase = {
    background:    'rgba(255,255,255,0.03)',
    border:        '1px solid rgba(255,255,255,0.09)',
    borderRadius:  20,
    backdropFilter: 'blur(20px)',
    overflow:      'hidden',
  };

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes coachDotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 1; }
          30% { transform: translateY(-6px); opacity: 0.6; }
        }
        .coach-chip:hover {
          border-color: #10b981 !important;
          color: #10b981 !important;
          background: rgba(16,185,129,0.08) !important;
        }
        .coach-send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 20px rgba(16,185,129,0.5);
        }
        .coach-tab-btn { transition: all 0.2s; }
        .coach-tab-btn:hover { opacity: 1 !important; }
      `}</style>

      <div
        className="animate-fade-in"
        style={{
          display:      'grid',
          gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)',
          gap:          22,
          height:       'clamp(580px, calc(100vh - 120px), 780px)',
          minHeight:    580,
        }}
      >
        {/* ================================================================
            LEFT PANEL — Chat
        ================================================================ */}
        <div style={{ ...panelBase, display: 'flex', flexDirection: 'column' }}>

          {/* Chat header */}
          <div style={{
            padding:    '14px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 3px rgba(16,185,129,0.2)',
                flexShrink: 0,
              }}>
                <Brain size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Coach Aria
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: '#10b981',
                    background: 'rgba(16,185,129,0.12)',
                    padding: '2px 7px', borderRadius: 99, letterSpacing: 0.5,
                  }}>AI</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  Online · Personalised climate strategy
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageCircle size={15} color="var(--text-muted)" />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{messages.length} messages</span>
              <Sparkles size={15} color="#f59e0b" />
            </div>
          </div>

          {/* Message log */}
          <div style={{
            flex: 1, padding: '20px 18px',
            overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 14,
            scrollbarWidth: 'thin',
          }}>
            {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
            {isTyping && <TypingIndicator />}
            <div ref={chatEndRef} />
          </div>

          {/* Quick chip suggestions */}
          <div style={{
            padding: '10px 16px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', gap: 7, overflowX: 'auto',
            flexShrink: 0,
            scrollbarWidth: 'none',
          }}>
            <Zap size={14} color="#f59e0b" style={{ flexShrink: 0, alignSelf: 'center' }} />
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                className="coach-chip"
                onClick={() => handleChipClick(chip)}
                disabled={isTyping}
                style={{
                  padding: '5px 12px', borderRadius: 99, flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-secondary)',
                  fontSize: 11, fontWeight: 600,
                  cursor: isTyping ? 'default' : 'pointer',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', gap: 10, alignItems: 'center',
            flexShrink: 0,
            background: 'rgba(0,0,0,0.15)',
          }}>
            <input
              ref={inputRef}
              type="text"
              className="glass-input"
              placeholder="Ask Coach Aria anything about climate…"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              style={{ flex: 1, borderRadius: 12, fontSize: 13 }}
            />
            <button
              className="coach-send-btn"
              onClick={() => handleSend()}
              disabled={isTyping || !inputText.trim()}
              aria-label="Send message"
              style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: inputText.trim() && !isTyping
                  ? 'linear-gradient(135deg, #10b981, #6366f1)'
                  : 'rgba(255,255,255,0.08)',
                border: 'none', cursor: isTyping || !inputText.trim() ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: isTyping || !inputText.trim() ? 0.5 : 1,
                transition: 'all 0.2s',
                boxShadow: inputText.trim() && !isTyping ? '0 4px 16px rgba(16,185,129,0.3)' : 'none',
              }}
            >
              <Send size={16} color="#fff" />
            </button>
          </div>
        </div>

        {/* ================================================================
            RIGHT PANEL — Score Report
        ================================================================ */}
        <div style={{ ...panelBase, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Panel header */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', gap: 8,
            flexShrink: 0,
          }}>
            <Award size={15} color="#f59e0b" />
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
              Climate Score Report
            </span>
            <span style={{
              marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 99,
            }}>
              Live · {(footprint / 1000).toFixed(2)} t/yr
            </span>
          </div>

          {/* Scrollable report content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 20px', scrollbarWidth: 'thin' }}>
            <ScoreReport footprint={footprint} breakdown={breakdown} />
          </div>
        </div>
      </div>
    </>
  );
}
