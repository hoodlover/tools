import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/data/seed.json';
const seed = JSON.parse(readFileSync(path, 'utf8'));

// Highest existing id across the whole seed, so new ids never collide.
const maxId = Math.max(
  ...Object.values(seed).flatMap(arr => Array.isArray(arr) ? arr.map(x => x.id || 0) : [0])
);
let nextId = Math.max(maxId, 699) + 1;

// Standard / Casual / De-escalation factory. Pass the three bodies in.
const card = (title, tags, std, casual, deesc) => ({
  id: nextId++,
  title,
  category: 'rail',
  fav: false,
  tags: ['rail', 'import', ...tags],
  body: std,
  variants: [
    { label: 'Casual',       body: casual },
    { label: 'Standard',     body: std    },
    { label: 'De-escalation', body: deesc },
  ],
  teams: ['import'],
});

const SIGN = '\n\nBest regards,\nAgent';
const FN   = '{{{Recipient.FirstName}}}';
const BN   = '{{{Case.ShipmentNumber__c}}}';

const cards = [
  // ── PDX1 ────────────────────────────────────────────────────────────
  card(
    'Container available — release sent (no PU#)',
    ['lfd', 'pickup', 'no-pu'],
    `Hi ${FN},\n\nPlease note that container ___ is currently available in ___ with the LFD of ___. Your customer release was sent through a separate email, without a PU number. Do not be alarmed — this area does not require the PU number and you should be able to pick up without any issues.${SIGN}`,
    `Hi ${FN},\n\nQuick heads up — container ___ is available in ___ with LFD ___. The customer release went out separately. Just a note: no PU number on that one — this terminal doesn't need it, so you're cleared to pick up as-is.${SIGN}`,
    `Hi ${FN},\n\nI know the missing PU number can be a flag — I want to confirm everything is in order. Container ___ is available in ___ with LFD ___. Your customer release was sent separately. This terminal does not require a PU number for pickup, so nothing is missing on our end. You should be cleared to pick up without issues.${SIGN}`
  ),

  // ── PDX2 ────────────────────────────────────────────────────────────
  card(
    'Container available — pending OBL & freight release',
    ['obl', 'freight-release', 'hold'],
    `Hi ${FN},\n\nPlease note that containers ___ are currently available in ___. Your customer release cannot be sent due to missing OBL and freight release. Once we have the listed docs, we will be able to release the containers.${SIGN}`,
    `Hi ${FN},\n\nContainers ___ are available in ___. Customer release is on hold pending OBL and freight release on our end — once those land, we'll get the release out to you.${SIGN}`,
    `Hi ${FN},\n\nI understand the importance of getting these containers picked up. Containers ___ are currently available in ___. To release them, we are awaiting the OBL and freight release. Once those documents are submitted, we will issue the customer release immediately.${SIGN}`
  ),

  // ── PDX3 ────────────────────────────────────────────────────────────
  card(
    'Container available — pending customs release',
    ['customs', 'hold'],
    `Hi ${FN},\n\nPlease note that container ___ is currently available in ___. Your customer release cannot be sent due to missing customs release. Once we have the listed docs, we will be able to release the container.${SIGN}`,
    `Hi ${FN},\n\nHeads up — container ___ is available in ___, but customer release is on hold pending customs release. As soon as that clears, we'll send the release.${SIGN}`,
    `Hi ${FN},\n\nI understand the timing matters. Container ___ is available in ___ — we are only waiting on the customs release before we can issue your customer release. Please follow up with your broker if needed; once customs clears, we will release the container without delay.${SIGN}`
  ),

  // ── NEWA ────────────────────────────────────────────────────────────
  card(
    'Container arrived — rail billing 72-hour notice',
    ['arrived', 'rail-billing', '72-hours'],
    `Hi ${FN},\n\nWe would like to advise that booking ${BN} has arrived at the port of destination, ___, on ___. Please note that it takes at least 72 hours for rail billing to fully process and the port to establish a rail list for recently discharged containers.${SIGN}`,
    `Hi ${FN},\n\nGood news — booking ${BN} arrived at ___ on ___. Just a heads up: rail billing typically takes about 72 hours after discharge to show on the port's rail list, so please allow that window before checking again.${SIGN}`,
    `Hi ${FN},\n\nI understand waiting on rail billing updates can be frustrating. Booking ${BN} has arrived at ___ on ___. Per the port's process, rail billing requires at least 72 hours after discharge to fully process and appear on their rail list. We will be tracking it on our end and will follow up with any updates.${SIGN}`
  ),

  // ── CONNA ───────────────────────────────────────────────────────────
  card(
    'Container arrived — port congestion notice',
    ['arrived', 'congestion', 'dwell'],
    `Hi ${FN},\n\nWe would like to advise that booking ${BN} has arrived at the port of destination, ___, on ___. Please be advised that due to unforeseen circumstances, the area is heavily congested with an average dwell time of ___. We want to assure you that we are working with the port daily for updates and updated dwell times.${SIGN}`,
    `Hi ${FN},\n\nBooking ${BN} arrived at ___ on ___. Quick heads up — the area is dealing with heavy congestion right now, with average dwell running around ___. We're in daily contact with the port and will keep you posted on any movement.${SIGN}`,
    `Hi ${FN},\n\nI understand congestion delays are difficult, especially when you have downstream commitments. Booking ${BN} has arrived at ___ on ___, but the area is currently dealing with significant congestion and dwell times of approximately ___. Please know that we are escalating with the port daily and will pass along any improvements as soon as we have them.${SIGN}`
  ),

  // ── CONNA5 ──────────────────────────────────────────────────────────
  card(
    'Port congestion — dwell time follow-up',
    ['congestion', 'dwell', 'follow-up'],
    `Hi ${FN},\n\nAs you are fully aware, booking ${BN} arrived at the port of destination, ___, on ___ and has been dwelling for a number of days. To address some questions you may have — ___ is heavily congested due to the volume coming in on a daily basis. This has prolonged the dwell time from the usual 3-5 days to ___. We want to assure you that we are working with the port daily for updates and updated dwell times.${SIGN}`,
    `Hi ${FN},\n\nQuick follow-up on booking ${BN} — it arrived at ___ on ___ and has been sitting longer than usual. The short version: ___ is overwhelmed with incoming volume, pushing the normal 3-5 day dwell out to about ___. We're staying on top of it with the port and will share any movement as soon as we get it.${SIGN}`,
    `Hi ${FN},\n\nI know the extended dwell on booking ${BN} has been a real frustration, and I want to be transparent about what is driving it. The container arrived at ___ on ___. The port is currently absorbing higher-than-normal volume, which has stretched dwell from the typical 3-5 days to roughly ___. We are pressing the port daily and will alert you the moment we see movement on your container specifically.${SIGN}`
  ),

  // ── IT1 ─────────────────────────────────────────────────────────────
  card(
    'Container arrived — IT cut needed',
    ['arrived', 'it-cut', 'customs', 'broker'],
    `Hi ${FN},\n\nWe would like to advise that booking ${BN} has arrived at the port of destination, ___, on ___. We noticed that this shipment does not have an IT cut. Please advise if Hapag should cut an IT for this shipment. If not, we encourage you to contact your broker to file for customs or the container will continue to dwell until the entry is submitted.${SIGN}`,
    `Hi ${FN},\n\nBooking ${BN} arrived at ___ on ___. One thing to flag — no IT cut has been filed yet. Let us know if you'd like Hapag to cut the IT; otherwise, looping in your broker to file customs is the fastest way to keep things moving.${SIGN}`,
    `Hi ${FN},\n\nI want to make sure we keep booking ${BN} moving — it arrived at ___ on ___. We have noticed no IT cut has been filed yet, and without one the container will continue to dwell. Please advise whether you would like Hapag to cut the IT on your behalf, or coordinate with your broker to file customs directly. Either way, we are ready to act as soon as you give us direction.${SIGN}`
  ),
];

seed.INITIAL_COMMS.push(...cards);

writeFileSync(path, JSON.stringify(seed, null, 2) + '\n', 'utf8');

console.log(`Added ${cards.length} cards (ids ${cards[0].id}–${cards.at(-1).id}) to INITIAL_COMMS.`);
console.log(`INITIAL_COMMS now has ${seed.INITIAL_COMMS.length} items.`);
console.log('Titles added:');
for (const c of cards) console.log(`  ${c.id}  ${c.title}`);
