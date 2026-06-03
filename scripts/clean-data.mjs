import fs from 'fs';

const p = '/Users/leiwencheng/Coding/indiedev/fire-journey/apps/oracle/src/data/typeProfiles.ts';
let c = fs.readFileSync(p, 'utf-8');

// Remove leaked faction summary tables from idealEndgameDesc JSON strings
// The pattern in the raw file is: \n\n## ✦ ...table... through to closing quote
// In the file, \n is literal backslash+n (2 chars), not a newline
c = c.replace(/\\n\\n## ✦[^"]*?(?=",\n)/g, '');

// Also remove leaked follow-on faction headers (e.g. \n\n# FO ...)
c = c.replace(/\\n\\n# (FE|FO|VE|VO)[^"]*?(?=",\n)/g, '');

fs.writeFileSync(p, c);
console.log('Done');
