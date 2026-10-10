// Weighted rubric scoring: reads rubric.json + measurements.json, emits scored results.
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const rubric = JSON.parse(fs.readFileSync(path.join(dir, 'rubric.json'), 'utf8'));
const data = JSON.parse(fs.readFileSync(path.join(dir, 'measurements.json'), 'utf8'));

const out = { rubric_version: rubric.rubric_version, product: rubric.product, measurements: data.measurements, results: [] };
for (const arch of rubric.architectures) {
  const s = data.scores[arch];
  if (!s) throw new Error(`no scores for ${arch}`);
  let total = 0, detail = [];
  for (const c of rubric.criteria) {
    const v = s[c.id];
    if (typeof v !== 'number' || v < 0 || v > 100) throw new Error(`${arch}.${c.id} invalid: ${v}`);
    const weighted = (v * c.weight) / 100;
    total += weighted;
    detail.push({ criterion: c.id, weight: c.weight, raw: v, weighted: Math.round(weighted * 100) / 100, evidence: s.evidence[c.id] || '' });
  }
  out.results.push({ architecture: arch, total: Math.round(total * 100) / 100, detail });
}
out.results.sort((a, b) => b.total - a.total);
fs.writeFileSync(path.join(dir, 'scores.json'), JSON.stringify(out, null, 2));
for (const r of out.results) {
  console.log(`\n${r.architecture}: ${r.total}/100`);
  for (const d of r.detail) console.log(`  ${d.criterion.padEnd(16)} w${String(d.weight).padStart(2)} raw=${String(d.raw).padStart(3)} -> ${d.weighted}`);
}