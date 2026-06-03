const fs = require('fs');
const path = '/Users/leiwencheng/Coding/indiedev/fire-journey/apps/oracle/src/data/typeProfiles.ts';
let content = fs.readFileSync(path, 'utf-8');

// Find lines with idealEndgameDesc that have leaked tables
const lines = content.split('\n');
const cleaned = [];
for (const line of lines) {
  // The JSON strings use \n (literal backslash-n) for newlines
  // Find "idealEndgameDesc" fields with leaked faction summary tables
  const marker = '\\n\\n## \\u2726';
  const idx = line.indexOf(marker);
  if (idx !== -1) {
    // Strip everything from the marker onwards, then close the JSON string
    const before = line.slice(0, idx);
    cleaned.push(before + '",');
    continue;
  }
  // Also clean follow-on faction sections that leaked (e.g., "\n\n# FO ...")
  const marker2 = '\\n\\n# ';
  const idx2 = line.indexOf(marker2);
  if (idx2 !== -1) {
    const before2 = line.slice(0, idx2);
    cleaned.push(before2 + '",');
    continue;
  }
  cleaned.push(line);
}

fs.writeFileSync(path, cleaned.join('\n'), 'utf-8');
console.log('Cleaned leaked tables from idealEndgameDesc');
