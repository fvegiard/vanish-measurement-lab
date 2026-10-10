// Generates one markdown page per graph.json node, with [[links]] from edges.
// Rerun after editing graph.json: node tools/gen-wiki.js
const fs = require('fs');
const path = require('path');
const g = require(path.join(__dirname, '..', 'graph.json'));
const wikiDir = path.join(__dirname, '..', 'wiki');

for (const n of g.nodes) {
  const out = g.edges.filter(e => e.from === n.id);
  const inc = g.edges.filter(e => e.to === n.id);
  let md = `# ${n.label}\n\n- **type:** ${n.type}\n- **status:** ${n.status}\n`;
  if (n.data) {
    md += `\n## Data\n\n`;
    for (const [k, v] of Object.entries(n.data)) {
      md += `- **${k}:** ${typeof v === 'object' ? JSON.stringify(v) : v}\n`;
    }
  }
  if (out.length) {
    md += `\n## Links out\n\n`;
    for (const e of out) md += `- [[${e.to}]] (${e.type})\n`;
  }
  if (inc.length) {
    md += `\n## Links in\n\n`;
    for (const e of inc) md += `- [[${e.from}]] (${e.type})\n`;
  }
  fs.writeFileSync(path.join(wikiDir, `${n.id}.md`), md);
}
console.log(`WROTE ${g.nodes.length} pages to wiki/`);