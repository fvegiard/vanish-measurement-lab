// Cross-validation of the architecture ranking with established MCDA methods:
// 1. TOPSIS (topsis2) with rubric weights
// 2. TOPSIS with equal weights (sensitivity check)
// 3. Full AHP (ahp) with score-derived pairwise matrices, rubric weights
// 4. AHP with equal weights (sensitivity check)
const topsis = require('topsis2');
const AHP = require('ahp');

const alts = ['electron', 'hybrid', 'extension_dc'];
const critNames = ['capability', 'install_friction', 'reliability', 'ai_iteration', 'dev_effort', 'distribution', 'footprint', 'cost'];
const W = [25, 15, 15, 15, 10, 10, 5, 5];
const WEQ = critNames.map(() => 100 / critNames.length);
// rows = alternatives, cols = criteria (raw 0-100 scores from measurements.json)
const M = [
  [100, 90, 90, 90, 80, 75, 60, 100], // electron
  [100, 85, 85, 95, 60, 70, 60, 95],  // hybrid
  [95, 40, 45, 95, 50, 30, 85, 60],   // extension_dc
];
const criteria = (weights) => critNames.map((n, i) => ({ name: n, weight: weights[i], type: 'benefit' }));

console.log('=== METHOD 1: TOPSIS, rubric weights ===');
const t1 = topsis.rank(criteria(W), M, false);
console.log('ranking (best first):', t1.map((i) => alts[i]).join(' > '));

console.log('\n=== METHOD 2: TOPSIS, equal weights (sensitivity) ===');
const t2 = topsis.rank(criteria(WEQ), M, false);
console.log('ranking (best first):', t2.map((i) => alts[i]).join(' > '));

function runAHP(weights) {
  const a = new AHP();
  a.addItems(alts);
  a.addCriteria(critNames);
  a.setCriteriaRankByGivenScores(weights);
  for (let j = 0; j < critNames.length; j++) {
    a.setCriteriaItemRankByGivenScores(critNames[j], M.map((row) => row[j]));
  }
  const r = a.run();
  if (r.error) throw new Error(r.error);
  const scores = r.rankedScores || [];
  // rankedScores are in addItems order
  return scores.map((s, i) => `${alts[i]}=${typeof s === 'object' ? (s.score ?? JSON.stringify(s)) : s}`.slice(0, 40));
}

console.log('\n=== METHOD 3: AHP, rubric weights ===');
console.log('ranking (best first):', runAHP(W).join(' > '));

console.log('\n=== METHOD 4: AHP, equal weights (sensitivity) ===');
console.log('ranking (best first):', runAHP(WEQ).join(' > '));