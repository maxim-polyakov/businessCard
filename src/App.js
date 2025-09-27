import React  from 'react';
import Visiteka from './components/Visiteka';
import { observer } from "mobx-react-lite";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Spinner, Container } from "react-bootstrap";

const App = observer(() => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Visiteka />} />
                <Route path="/visiteka" element={<Visiteka />} />
            </Routes>
        </BrowserRouter>
    );
});

export default App;