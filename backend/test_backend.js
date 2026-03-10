const { create, all } = require('mathjs');
const math = create(all);
function parseScope(assignments) {
    let scope = {};
    if (!assignments) return scope;
    const parts = assignments.split(/[,;]\s*(?=[a-zA-Z_]\w*\s*=)/);
    for (let part of parts) {
        try {
            math.evaluate(part.trim(), scope);
        } catch(e) {}
    }
    return scope;
}
let req = { body: { expression: "A * B", assignments: "A=[1,2;3,4], B=[5,6;7,8]" } };
try {
        const { expression, assignments = "" } = req.body;
        const scope = parseScope(assignments);
        console.log("Scope is", scope);
        let result = math.evaluate(expression, scope);

        if (result && result.isResultSet) {
            result = result.entries.map(e => e.toString());
        } else if (result && result.isMatrix) {
            result = result.toArray();
        } else if (typeof result !== 'string' && typeof result !== 'number') {
            result = result.toString();
        }

        console.log({ result: JSON.stringify(result), latex: math.parse(expression).toTex() });
    } catch (err) {
        console.error("ERROR", err.message);
    }
