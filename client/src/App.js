import React  from 'react';
import AppRouter from './components/AppRouter';
import { observer } from "mobx-react-lite";
import { BrowserRouter } from "react-router-dom";
import { LocaleProvider } from './i18n/LocaleContext';

const App = observer(() => {
    return (
        <BrowserRouter>
            <LocaleProvider>
                <AppRouter />
            </LocaleProvider>
        </BrowserRouter>
    );
});

export default App;