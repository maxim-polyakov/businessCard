import React  from 'react';
import AppRouter from './components/AppRouter';
import { observer } from "mobx-react-lite";
import { BrowserRouter } from "react-router-dom";

const App = observer(() => {
    return (
        <BrowserRouter>
            <AppRouter />
        </BrowserRouter>
    );
});

export default App;