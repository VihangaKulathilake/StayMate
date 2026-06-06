import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Footer from './components/common/Footer';
import './index.css';

function AppContent() {
    const location = useLocation();
    const hideFooterPaths = ['/login', '/signup', '/register'];
    const shouldHideFooter = hideFooterPaths.includes(location.pathname);

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1">
                <AppRoutes />
            </main>
            {!shouldHideFooter && <Footer />}
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
