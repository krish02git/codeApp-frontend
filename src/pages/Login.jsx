import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
// zod ->  npm i @hookform/resolvers + npm i zod
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// slice 
import { loginUser } from "../authSlice";
import { useDispatch, useSelector } from "react-redux";

// Schema Validation 
const signupSchema = z.object({
    emailId: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters")
})

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // No Routing so use this navigate NOT navigate to={}
    const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
    
    const { register, handleSubmit, formState: { errors, isSubmitted } } = useForm({ resolver: zodResolver(signupSchema) });
    const [screen, setScreen] = useState(window.innerWidth);
    const [showError, setShowError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setScreen(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isSubmitted && Object.keys(errors).length > 0) {
            setShowError(true);
            const timer = setTimeout(() => setShowError(false), 500);
            return () => clearTimeout(timer);
        }
    }, [errors, isSubmitted]);

    useEffect(() => {
        if (isAuthenticated) { // if authed then take to home page!
            navigate('/');
        }
    }, [isAuthenticated, navigate]); // navigate don't change s

    const onSubmit = (data) => {
        dispatch(loginUser(data));
    };
    
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-zinc-900/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-zinc-700/30 overflow-hidden">
                <div className="grid md:grid-cols-2 min-h-150">
                    {/* Left Side - Branding */}
                    {screen >= 768 && (
                        <div className="bg-linear-to-br from-zinc-900/30 to-black/20 p-12 flex flex-col justify-center border-r border-zinc-700/20">
                            <div className="space-y-4">
                                <h1 className="text-5xl font-bold text-white tracking-tight animate-fade-in">
                                    Codeable<br />
                                    <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-500 animate-gradient">
                                        Error
                                    </span>
                                </h1>
                                <p className="text-zinc-400 text-lg leading-relaxed animate-slide-up">
                                    "Where bugs become features<br />
                                    and errors become experience."
                                </p>
                                <div className="w-20 h-1 bg-linear-to-r from-emerald-500 to-teal-500 rounded-full animate-expand"></div>
                            </div>
                        </div>
                    )}

                    {/* Right Side - Form */}
                    <div className="p-12 flex flex-col justify-center">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                            <p className="text-zinc-400">Login to your account</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                            <div>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    {...register("emailId")}
                                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                                />
                                {errors.emailId && (
                                    <p className="text-red-400 text-sm mt-1 ml-1">{errors.emailId.message}</p>
                                )}
                            </div>

                            <div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        {...register("password")}
                                        className="w-full px-4 py-3 pr-12 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-400 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-400 text-sm mt-1 ml-1">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Error Summary - Only shows on submit attempt with errors */}
                            {isSubmitted && Object.keys(errors).length > 0 && (
                                <div className={showError ? 'animate-shake' : ''}>
                                    <p className="text-red-400 text-sm font-medium">
                                        * Incorrect credentials
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-linear-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-emerald-500/50 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                               {loading? 'Loging in...':'Login'}
                            </button>
                        </form>

                        <p className="text-zinc-500 text-sm text-center mt-6">
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 transition-colors hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                input:-webkit-autofill,
                input:-webkit-autofill:hover,
                input:-webkit-autofill:focus,
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px rgb(39 39 42 / 0.5) inset !important;
                    -webkit-text-fill-color: white !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes expand {
                    from {
                        width: 0;
                    }
                    to {
                        width: 5rem;
                    }
                }

                @keyframes gradient {
                    0%, 100% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                }

                @keyframes shake {
                    0%, 100% {
                        transform: translateX(0);
                    }
                    10%, 30%, 50%, 70%, 90% {
                        transform: translateX(-5px);
                    }
                    20%, 40%, 60%, 80% {
                        transform: translateX(5px);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }

                .animate-slide-up {
                    animation: slide-up 1s ease-out 0.3s both;
                }

                .animate-expand {
                    animation: expand 1s ease-out 0.6s both;
                }

                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }

                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
}

export default Login;