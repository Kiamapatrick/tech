const fs = require('fs');
const content = fs.readFileSync('js/phones-data.js', 'utf8');
const ids = [];
const regex = /id:\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(content)) !== null) {
    ids.push(match[1]);
}
console.log(ids.sort().join('\n'));