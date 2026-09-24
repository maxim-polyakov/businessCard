import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Visiteka from './Visiteka';

global.IS_REACT_ACT_ENVIRONMENT = true;

describe('Visiteka', () => {
    let container;
    let root;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });

    it('renders profile name and contact email', () => {
        act(() => root.render(<Visiteka />));

        expect(container.textContent).toContain('Поляков Максим');
        expect(container.textContent).toContain('maxim7012@gmail.com');
    });

    it('renders the contact form', () => {
        act(() => root.render(<Visiteka />));

        expect(container.querySelector('form')).not.toBeNull();
    });
});
