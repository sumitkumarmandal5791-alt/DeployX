import axiosClinet from '../utils/axois';
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';

function UserSignupPage() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();//prevent the page from loading

        // Create userData directly instead of using stale state
        const newUserData = {
            email,
            password,
            name
        };

        try {
            const response = await axiosClinet.post('/user/register', newUserData);


            // Store user data in localStorage for persistence
            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.data));
                localStorage.setItem('token', response.data.data.token);
            }

            // Clear form
            setEmail('');
            setPassword('');
            setName('');

            navigate('/enter');
        }
        catch (error) {
            console.log('Registration error:', error.response?.data?.message || error.message);
            alert(error.response?.data?.message || 'Registration failed. Please try again.');
        }
    }

    return (
        <div className="min-h-screen bg-[url('/ewaste-bg.png')] bg-cover bg-center bg-no-repeat bg-fixed flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/20">
                <div className="flex flex-col items-center mb-6">
                    <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-emerald-900 tracking-tight">EcoVault</h1>
                    <p className="text-emerald-600 font-medium">Sustainable E-Waste Managment</p>
                </div>

                <h2 className="text-xl font-bold text-center text-gray-800 mb-6">Create your account</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='John Doe'
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white/50'
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='email@example.com'
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white/50'
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='••••••••'
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white/50'
                        />
                    </div>

                    <button
                        type="submit"
                        className='w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg transform hover:-translate-y-0.5'
                    >
                        Sign Up
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">Already a member? <Link to='/userlogin' className='text-emerald-700 hover:text-emerald-900 font-bold hover:underline'>Login here</Link></p>
                </div>
            </div>
        </div>
    )
}

export default UserSignupPage