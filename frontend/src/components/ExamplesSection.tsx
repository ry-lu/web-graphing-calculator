

interface ExamplesSectionProps {
    tab: string;
    setExpression: (expr: string) => void;
    setAssignments: (assgn: string) => void;
    setVariable: (val: string) => void;
    setVariable2: (val: string) => void;
    setLowerBound: (val: string) => void;
    setUpperBound: (val: string) => void;
    setLowerBound2: (val: string) => void;
    setUpperBound2: (val: string) => void;
    setYVar: (val: string) => void;
    setX0: (val: string) => void;
    setY0: (val: string) => void;
    setXTarget: (val: string) => void;
    setH: (val: string) => void;
}

export function ExamplesSection(props: ExamplesSectionProps) {
    const {
        tab, setExpression, setAssignments, setVariable, setVariable2,
        setLowerBound, setUpperBound, setLowerBound2, setUpperBound2,
        setYVar, setX0, setY0, setXTarget, setH
    } = props;

    return (
        <div className="flex gap-2 text-xs flex-wrap mb-2">
            <span className="text-slate-500 font-medium">Examples:</span>
            {tab === 'calc' && (
                <>
                    <button onClick={() => setExpression('sin(45 deg)')} className="text-blue-600 hover:underline">Trig</button>
                    <button onClick={() => setExpression('log(100, 10)')} className="text-blue-600 hover:underline">LogBase</button>
                    <button onClick={() => { setAssignments('x=5, y=10'); setExpression('x^2 + y * 2'); }} className="text-blue-600 hover:underline">Multivariable Evaluator</button>
                </>
            )}
            {tab === 'matrix' && (
                <>
                    <button onClick={() => setExpression('det([-1, 2; 3, 1])')} className="text-blue-600 hover:underline">Determinant</button>
                    <button onClick={() => setExpression('inv([1, 2; 3, 4])')} className="text-blue-600 hover:underline">Inverse</button>
                    <button onClick={() => setExpression('[1, 2] * [3; 4]')} className="text-blue-600 hover:underline">Dot Product</button>
                    <button onClick={() => { setAssignments('A=[1,2;3,4], B=[5,6;7,8]'); setExpression('A * B'); }} className="text-blue-600 hover:underline">Matrix Algebra</button>
                </>
            )}
            {tab === 'derivative' && (
                <>
                    <button onClick={() => { setVariable('x'); setExpression('sin(x) * e^x'); }} className="text-blue-600 hover:underline">Product Rule</button>
                    <button onClick={() => { setVariable('x'); setExpression('log(x, e)'); }} className="text-blue-600 hover:underline">Logarithm</button>
                    <button onClick={() => { setVariable('y'); setExpression('x^2 * y^3 - 3*y'); }} className="text-blue-600 hover:underline">Multivariable Partial (dy)</button>
                    <button onClick={() => { setVariable('x'); setExpression('x^2 * y^3 - 3*y'); }} className="text-blue-600 hover:underline">Multivariable Partial (dx)</button>
                </>
            )}
            {tab === 'integral' && (
                <>
                    <button onClick={() => { setVariable('x'); setExpression('x^2'); setLowerBound('-1'); setUpperBound('1'); setVariable2(''); }} className="text-blue-600 hover:underline">Polynomial</button>
                    <button onClick={() => { setVariable('x'); setExpression('sin(x)'); setLowerBound('0'); setUpperBound('3.14159'); setVariable2(''); }} className="text-blue-600 hover:underline">Trig Bound</button>
                    <button onClick={() => { setVariable('x'); setVariable2('y'); setExpression('x^2 * y'); setLowerBound('0'); setUpperBound('2'); setLowerBound2('1'); setUpperBound2('3'); }} className="text-blue-600 hover:underline">Double Integral</button>
                    <button onClick={() => { setVariable('x'); setVariable2('y'); setExpression('e^(-(x^2 + y^2))'); setLowerBound('-3'); setUpperBound('3'); setLowerBound2('-3'); setUpperBound2('3'); }} className="text-blue-600 hover:underline">Gaussian Double Integral</button>
                </>
            )}

            {tab === 'diffeq' && (
                <>
                    <button onClick={() => { setExpression('x * y'); setVariable('x'); setYVar('y'); setX0('0'); setY0('1'); setXTarget('5'); setH('0.1'); }} className="text-blue-600 hover:underline">y' = x * y</button>
                    <button onClick={() => { setExpression('y - x^2 + 1'); setVariable('x'); setYVar('y'); setX0('0'); setY0('0.5'); setXTarget('3'); setH('0.05'); }} className="text-blue-600 hover:underline">y' = y - x^2 + 1</button>
                    <button onClick={() => { setExpression('y * (1 - y/10)'); setVariable('x'); setYVar('y'); setX0('0'); setY0('1'); setXTarget('10'); setH('0.1'); }} className="text-blue-600 hover:underline">Logistic Growth</button>
                </>
            )}
            {tab === 'graph' && (
                <>
                    <button onClick={() => setExpression('sin(x), cos(x)')} className="text-blue-600 hover:underline">Trig Intersection</button>
                    <button onClick={() => setExpression('x^2, x+2')} className="text-blue-600 hover:underline">Polynomial Intersection</button>
                </>
            )}
        </div>
    );
}
