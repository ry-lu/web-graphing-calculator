

interface KeypadProps {
    tab: string;
    addToExpression: (val: string) => void;
}

export function Keypad({ tab, addToExpression }: KeypadProps) {
    if (tab === 'calc') {
        return (
            <div className="grid grid-cols-4 gap-3 mb-6">
                {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '^', '+', '(', ')', 'sin', 'cos', 'tan', 'log', 'e', 'pi', 'sqrt', 'x', 'y'].map(btn => (
                    <button
                        key={btn}
                        onClick={() => addToExpression(btn)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-4 rounded-xl text-lg font-medium transition-colors"
                    >
                        {btn}
                    </button>
                ))}
            </div>
        );
    }

    if (tab === 'matrix') {
        return (
            <div className="grid grid-cols-4 gap-3 mb-6">
                {['[', ']', ';', ',', 'det(', 'inv(', 'trace(', 'transpose(', '*', '+', '-', '^', 'eye(', 'ones(', 'zeros(', 'concat('].map(btn => (
                    <button
                        key={btn}
                        onClick={() => addToExpression(btn)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-4 rounded-xl text-lg font-medium transition-colors"
                    >
                        {btn}
                    </button>
                ))}
            </div>
        );
    }

    return null;
}
