import {createContext} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';

export const Context = createContext(null)

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
    <Context.Provider>
        <App />
    </Context.Provider>
);
