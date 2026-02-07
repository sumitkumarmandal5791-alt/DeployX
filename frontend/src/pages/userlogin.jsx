import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axiosClinet from '../api/axios.js';
import toast, { Toaster } from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';

function UserLoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();//prevent the page from loading
        setLoading(true);

        try {
            const response = await axiosClinet.post('/user/login', { email, password });


            // Store user data in localStorage for persistence
            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.data));
                localStorage.setItem('token', response.data.data.token);

                // Success toast
                toast.success(`Welcome back, ${response.data.data.name || 'User'}!`);
            }

            setEmail('');
            setPassword('');

            // Delay navigation to show toast
            setTimeout(() => {
                navigate('/home');
            }, 800);
        }
        catch (error) {
            console.log('Login error:', error.response?.data?.message || error.message);

            // Error toast
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(errorMessage);
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-brand-dark transition-colors duration-300">
            <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

            <div className="w-full max-w-[440px] space-y-8">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-brand-green rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(197,255,65,0.3)]">
                        <div className="w-8 h-8 bg-brand-dark rounded-sm transform rotate-45"></div>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-2 italic">ECOVAULT</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Sustainable Future, Real-time.</p>
                </div>

                <div className="glass-effect p-8 rounded-4xl shadow-xl">
                    <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold ml-1">Email</label>
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold ml-1">Password</label>
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green outline-none transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-brand-green text-brand-dark font-black text-lg rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-brand-green/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-500">
                    New to EcoVault?{' '}
                    <Link to="/usersignup" className="text-brand-dark dark:text-white font-bold hover:underline decoration-brand-green decoration-2 underline-offset-4">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default UserLoginPage;