import { useEffect, useState, useMemo } from "react";
import { NavLink, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import { logoutUser } from "../authSlice";

function Homepage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [problems, setProblems] = useState([]);
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [filters, setFilters] = useState({
        difficulty: 'all',
        tags: 'all',
        status: 'all'
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [availableDifficulties, setAvailableDifficulties] = useState(['all']);
    const [availableTags, setAvailableTags] = useState(['all']);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const ITEMS_PER_PAGE = 12;

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const { data } = await axiosClient.get('/problem/getAllProblem');
                setProblems(data);
                setAvailableDifficulties(['all', ...new Set(data.map(p => p.difficulty))]);
                const allTags = data.flatMap(p => p.tags || []);
                setAvailableTags(['all', ...new Set(allTags)]);
            } catch (err) {
                console.error("Error fetching problems:", err);
            }
        };

        const fetchSolvedProblems = async () => {
            try {
                const { data } = await axiosClient.get('/problem/problemSolved');
                setSolvedProblems(data);
            } catch (err) {
                console.error("Error fetching solved problems:", err);
            }
        };

        fetchProblems();
        if (user) fetchSolvedProblems();
    }, [user]);

    const filteredProblems = useMemo(() => {
        return problems.filter((problem) => {
            const matchesDifficulty = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
            const matchesTags = filters.tags === 'all' || problem.tags?.includes(filters.tags);

            let matchesStatus = true;
            if (filters.status === 'solved') {
                matchesStatus = solvedProblems.some(solved => solved._id === problem._id);
            } else if (filters.status === 'unsolved') {
                matchesStatus = !solvedProblems.some(solved => solved._id === problem._id);
            }

            const matchesSearch = searchQuery === '' ||
                problem.title?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesDifficulty && matchesTags && matchesStatus && matchesSearch;
        });
    }, [problems, solvedProblems, filters, searchQuery]);

    const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProblems = filteredProblems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleLogout = () => {
        dispatch(logoutUser());
        setSolvedProblems([]);
        setShowProfileDropdown(false);
    };

    const handleRefresh = () => {
        setFilters({ difficulty: 'all', tags: 'all', status: 'all' });
        setSearchQuery('');
        setCurrentPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
        }
    };


    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-emerald-500/30">
            <header className="bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={handleRefresh} className="group flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            <code className="text-black font-black">{">"}</code>
                        </div>
                        <h1 className="text-base sm:text-xl font-bold tracking-tight">
                            Codeable<span className="text-emerald-500">Error</span>
                        </h1>
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Admin Panel Button - only visible for logged-in admin users */}
                        {/* Note: If button disappears after server restart, you need to login again.
                            This is normal - the session/token expires when server restarts.
                            Consider implementing refresh tokens or persistent sessions for production. */}
                        {user?.role === 'admin' ? (
                            <button
                                onClick={() => navigate('/admin')}
                                className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-sm text-rose-400 hover:bg-rose-500/20 transition-all flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="hidden sm:inline">Admin Panel</span>
                            </button>
                        ) : null}

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="flex items-center gap-2 sm:gap-3 p-1 pr-2 sm:pr-3 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all hover:bg-zinc-800/50"
                            >
                                <div className="w-8 h-8 bg-linear-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-black font-bold text-xs ring-2 ring-emerald-500/20">
                                    {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="hidden sm:block text-sm font-medium">{user?.firstName || 'User'}</span>
                                <svg className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                            </button>

                            {showProfileDropdown && (
                                <>
                                    {/* Mobile backdrop */}
                                    <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setShowProfileDropdown(false)} />

                                    <div className="absolute right-0 mt-3 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
                                        <div className="px-4 py-3 bg-zinc-800/30">
                                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Account</p>
                                            <p className="text-sm font-medium truncate mt-0.5">{user?.emailId || 'guest@codeable.com'}</p>
                                        </div>
                                        <div className="p-1">
                                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
                {/* Mobile Filter Toggle */}
                <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="lg:hidden w-full mb-6 px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center justify-between hover:bg-zinc-900 transition-all"
                >
                    <span className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                        {(filters.difficulty !== 'all' || filters.tags !== 'all' || filters.status !== 'all') && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        )}
                    </span>
                    <svg className={`w-5 h-5 text-zinc-500 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
                    {/* Sidebar Filters */}
                    <aside className={`lg:col-span-1 space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 sm:p-6 backdrop-blur-sm lg:sticky lg:top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-zinc-400">Refine Search</h2>
                                <button onClick={handleRefresh} className="text-[10px] text-emerald-500 hover:text-emerald-400 font-bold uppercase tracking-tighter">Reset</button>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-zinc-500 uppercase ml-1">Difficulty</label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableDifficulties.map(d => (
                                            <button
                                                key={d}
                                                onClick={() => { setFilters({ ...filters, difficulty: d }); setCurrentPage(1); }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filters.difficulty === d ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                            >
                                                {d.charAt(0).toUpperCase() + d.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-zinc-500 uppercase ml-1">Status</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['all', 'solved', 'unsolved'].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => { setFilters({ ...filters, status: s }); setCurrentPage(1); }}
                                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${filters.status === s ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'}`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${filters.status === s ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-zinc-500 uppercase ml-1">Topics</label>
                                    <select
                                        value={filters.tags}
                                        onChange={(e) => { setFilters({ ...filters, tags: e.target.value }); setCurrentPage(1); }}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-zinc-300 appearance-none cursor-pointer"
                                    >
                                        {availableTags.map(t => <option key={t} value={t}>{t === 'all' ? 'All Topics' : t}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Problem List */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search by title..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full bg-zinc-900/40 border border-zinc-800 rounded-2xl py-3.5 sm:py-4 pl-12 sm:pl-13 pr-4 text-sm sm:text-base text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none transition-all group-hover:bg-zinc-900/60 shadow-lg"
                            />
                            <svg className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                                        <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</th>
                                        <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Title</th>
                                        <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Difficulty</th>
                                        <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Tags</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/40">
                                    {paginatedProblems.map((problem) => (
                                        <tr
                                            key={problem._id}
                                            className="group hover:bg-zinc-800/20 transition-all cursor-pointer"
                                            onClick={() => navigate(`/problem/${problem._id}`)}
                                        >
                                            <td className="px-6 py-5">
                                                {solvedProblems.some(s => s._id === problem._id) ? (
                                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full border-2 border-zinc-800 group-hover:border-zinc-700 transition-colors" />
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-semibold text-zinc-200 group-hover:text-white group-hover:translate-x-1 transition-all inline-block truncate max-w-70">
                                                    {problem.title}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-black uppercase tracking-wider ${getDifficultyColor(problem.difficulty)}`}>
                                                    {problem.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex gap-2 flex-wrap">
                                                    {problem.tags?.slice(0, 2).map((tag, i) => (
                                                        <span key={i} className="text-[10px] px-2 py-1 rounded-md bg-zinc-800 text-zinc-500 border border-zinc-700/50 font-medium">{tag}</span>
                                                    ))}
                                                    {problem.tags?.length > 2 && <span className="text-[10px] text-zinc-700 font-bold self-center">+{problem.tags.length - 2}</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {paginatedProblems.length === 0 && (
                                <div className="py-24 text-center">
                                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <p className="text-zinc-500 text-sm font-medium">No results found for your search</p>
                                </div>
                            )}
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm divide-y divide-zinc-800/40">
                            {paginatedProblems.length > 0 ? (
                                paginatedProblems.map((problem) => (
                                    <NavLink
                                        key={problem._id}
                                        to={`/problem/${problem._id}`}
                                        className="block p-4 hover:bg-zinc-800/20 transition-all"
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Status */}
                                            <div className="pt-1">
                                                {solvedProblems.some(s => s._id === problem._id) ? (
                                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                        <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full border-2 border-zinc-800" />
                                                )}
                                            </div>

                                            {/* Problem Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-semibold mb-2 line-clamp-2">
                                                    {problem.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`text-[10px] px-2 py-1 rounded-lg border font-black uppercase tracking-wider ${getDifficultyColor(problem.difficulty)}`}>
                                                        {problem.difficulty}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {problem.tags?.slice(0, 2).map((tag, i) => (
                                                        <span key={i} className="text-[10px] px-2 py-1 rounded-md bg-zinc-800 text-zinc-500 border border-zinc-700/50 font-medium">{tag}</span>
                                                    ))}
                                                    {problem.tags?.length > 2 && <span className="text-[10px] text-zinc-600 font-bold self-center">+{problem.tags.length - 2}</span>}
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <svg className="w-5 h-5 text-zinc-600 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </NavLink>
                                ))
                            ) : (
                                <div className="py-24 text-center">
                                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <p className="text-zinc-500 text-sm font-medium">No results found for your search</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 sm:gap-4 pt-6">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    className="p-2 sm:p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 disabled:opacity-20 transition-all group"
                                >
                                    <svg className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <div className="px-4 sm:px-5 py-2 sm:py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest"><span className="text-emerald-500">{currentPage}</span> / {totalPages}</span>
                                </div>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    className="p-2 sm:p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 disabled:opacity-20 transition-all group"
                                >
                                    <svg className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Homepage;