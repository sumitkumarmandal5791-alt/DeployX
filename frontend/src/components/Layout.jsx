import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Map, Trophy, User, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Home', path: '/home' },
        { icon: Map, label: 'Map', path: '/map' },
        { icon: Trophy, label: 'Rewards', path: '/rewards' },
        { icon: User, label: 'Badges', path: '/badges' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
    };

    // Don't show layout on login/signup
    const isAuthPage = location.pathname === '/' || location.pathname === '/usersignup' || location.pathname === '/analysis';
    if (isAuthPage) return <>{children}</>;

    return (
        <div className="min-h-screen bg-white dark:bg-brand-dark transition-colors duration-300">
            {/* Top Navigation Bar */}
            <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 position-sticky">
                <nav className="pill-nav flex items-center gap-2 md:gap-8 max-w-2xl w-full justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
                        <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-brand-dark rounded-sm transform rotate-45"></div>
                        </div>
                        <span className="font-bold text-lg tracking-tight hidden sm:block">EcoVault</span>
                    </div>

                    <div className="flex items-center gap-1 md:gap-4">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${location.pathname === item.path
                                    ? 'bg-brand-green text-brand-dark font-medium'
                                    : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                <item.icon size={18} />
                                <span className="text-sm hidden md:block">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <main className="pt-28 pb-12 px-6">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
