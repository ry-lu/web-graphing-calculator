import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

vi.mock('react-chartjs-2', () => ({
    Line: () => <div data-testid="chart-mock" />
}));

describe('App Component', () => {
    it('Should render calculator title', () => {
        render(<App />);
        expect(screen.getByText('Advanced Calculator')).toBeInTheDocument();
    });

    it('Should switch tabs properly', () => {
        render(<App />);
        const matrixTab = screen.getByText('Matrix');
        fireEvent.click(matrixTab);

        expect(screen.getByText('Determinant')).toBeInTheDocument();

        const derivTab = screen.getByText('Derivatives');
        fireEvent.click(derivTab);
        expect(screen.getByText('Product Rule')).toBeInTheDocument();
    });
});
