const { create, all } = require('mathjs');
const math = create(all);
let scope = {};
math.evaluate("x=5", scope);
console.log(scope);
