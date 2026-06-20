import './App.css'
import { Routes, Route, Navigate } from "react-router"

import Homepage from './pages/Homepage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminPage from './pages/AdminPage'
import ProblemPage from './pages/ProblemPage'
import ThemeToggle from './components/ThemeToggle'

import {checkAuth} from './authSlice';
import { useDispatch, useSelector } from 'react-redux'
import { useEffect ,useState} from 'react'

function App() {
    const { isAuthenticated, loading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    
    // 1. Add local state to track minimum time
    const [minTimeMet, setMinTimeMet] = useState(false);

    useEffect(() => {
        dispatch(checkAuth());
        
        // 2. Start a timer for exactly 0.75s
        const timer = setTimeout(() => {
            setMinTimeMet(true);
        }, 750);

        return () => clearTimeout(timer);
    }, [dispatch]);

    // 3. Only stop loading when BOTH the API is done AND 0.75s has passed
    if (loading || !minTimeMet) {
        return (
            <div className="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500">
                {/* Decorative background glow */}
                <div className="absolute w-64 h-64 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
                
                <div className="relative z-10 text-center space-y-10">
                    <div className="space-y-2">
                        <h1 className="text-7xl font-black text-white tracking-tighter animate-fade-in-up">
                            Codeable
                        </h1>
                        <div className="h-1.5 w-full bg-linear-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
                        <h2 className="text-3xl font-light text-emerald-400 tracking-[0.3em] uppercase opacity-80">
                            Error
                        </h2>
                    </div>

                    {/* Minimalist Loader */}
                    <div className="flex justify-center items-center gap-3">
                        {[0, 0.1, 0.2].map((delay, i) => (
                            <div 
                                key={i}
                                className="w-2 h-2 bg-emerald-500 rounded-full"
                                style={{
                                    animation: `modern-bounce 1s infinite ease-in-out`,
                                    animationDelay: `${delay}s`
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                <style>{`
                    @keyframes modern-bounce {
                        0%, 100% { transform: scale(1); opacity: 0.3; }
                        50% { transform: scale(1.5); opacity: 1; filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.8)); }
                    }
                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-up {
                        animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                `}</style>
            </div>
        );
    }

    return (
        <>
            <Routes>
                <Route path='/' element={isAuthenticated ? <Homepage /> : <Navigate to="/signup" />} />
                <Route path='/login' element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
                <Route path='/signup' element={isAuthenticated ? <Navigate to="/" /> : <Signup />} />
                <Route path='/admin' element={ <AdminPage></AdminPage> } />
                <Route path='/problem/:problemId' element={<ProblemPage></ProblemPage>}></Route>
            </Routes>
            <ThemeToggle />
        </>
    );
}
export default App
