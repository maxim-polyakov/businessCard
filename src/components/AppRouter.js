import { Route, Routes, Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import Visiteka from "../pages/Visiteka";

const AppRouter = observer(() => {
    return (
        <Routes>
            <Route path="/" element={<Visiteka />} />
            <Route path="/visiteka" element={<Visiteka />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
});

export default AppRouter;