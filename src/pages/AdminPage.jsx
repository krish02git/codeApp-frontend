import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import { logoutUser } from "../authSlice";

function AdminPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('problems');
    const [problems, setProblems] = useState([]);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [editingProblem, setEditingProblem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeLanguageTab, setActiveLanguageTab] = useState('cpp');
    const [activeSolutionTab, setActiveSolutionTab] = useState('cpp');
    const [validationResults, setValidationResults] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Easy',
        tags: [],
        visibleTestCases: [{ input: '', output: '', explanation: '' }],
        hiddenTestCases: [{ input: '', output: '' }],
        startCode: [
            { language: 'cpp', initialCode: '' },
            { language: 'javascript', initialCode: '' },
            { language: 'python', initialCode: '' }
        ],
        referenceSolution: [
            { language: 'cpp', initialCode: '' },
            { language: 'javascript', initialCode: '' },
            { language: 'python', initialCode: '' }
        ]
    });

    const AVAILABLE_TAGS = [
        "Array", "String", "Linked List", "Matrix", "Hash Table", "Stack", "Queue",
        "Heap", "Priority Queue", "Tree", "Binary Tree", "Binary Search Tree", "Graph",
        "Trie", "Dynamic Programming", "Greedy", "Backtracking", "Recursion",
        "Sorting", "Searching", "Binary Search", "Two Pointers", "Sliding Window",
        "Breadth First Search", "Depth First Search", "Topological Sort",
        "Shortest Path", "Minimum Spanning Tree", "Union Find", "Bit Manipulation",
        "Math", "Database", "Design", "Concurrency"
    ];

    const LANGUAGES = ['cpp', 'javascript', 'python'];

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (activeTab === 'problems') fetchProblems();
    }, [activeTab]);

    const fetchProblems = async () => {
        try {
            const { data } = await axiosClient.get('/problem/getAllProblem');
            setProblems(data);
        } catch (err) {
            console.error("Error fetching problems:", err);
        }
    };

   
    const handleLogout = () => {
        dispatch(logoutUser());
        setShowProfileDropdown(false);
    };

   

    const handleCreateProblem = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (formData.visibleTestCases.length === 0) {
            alert('Please add at least one visible test case');
            return;
        }

        if (!formData.tags.length) {
            alert('Please select at least one tag');
            return;
        }

        // Debug: Log the data being sent
        console.log('Creating problem with data:', JSON.stringify(formData, null, 2));

        try {
            // Create problem first (backend already validates reference solutions)
            const response = await axiosClient.post('/problem/create', formData);
            
            console.log('Problem created successfully:', response.data);
            
            alert('Problem created and validated successfully!');
            setActiveTab('problems');
            resetForm();
            fetchProblems();
        } catch (err) {
            console.error("Error creating problem:", err);
            console.error("Error response:", err.response);
            
            // Better error message handling
            let errorMessage = 'Unknown error';
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response.data.language) {
                    // Validation error from backend
                    errorMessage = `${err.response.data.message} (${err.response.data.language})`;
                } else {
                    errorMessage = JSON.stringify(err.response.data);
                }
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            alert('Failed to create problem: ' + errorMessage);
            
            // Also log to console for debugging
            console.log('Full error details:', JSON.stringify(err.response?.data, null, 2));
        }
    };

    const handleUpdateProblem = async (e) => {
        e.preventDefault();

        try {
            // Update problem (backend validates reference solutions)
            await axiosClient.put(`/problem/update/${editingProblem._id}`, formData);

            alert('Problem updated and validated successfully!');
            setEditingProblem(null);
            setActiveTab('problems');
            resetForm();
            fetchProblems();
        } catch (err) {
            console.error("Error updating problem:", err);
            
            // Better error message handling
            let errorMessage = 'Unknown error';
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response.data.language) {
                    errorMessage = `${err.response.data.message} (${err.response.data.language})`;
                } else {
                    errorMessage = JSON.stringify(err.response.data);
                }
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            alert('Failed to update problem: ' + errorMessage);
            
            // Also log to console for debugging
            console.log('Full error details:', JSON.stringify(err.response?.data, null, 2));
        }
    };

    const handleDeleteProblem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this problem?')) return;
        try {
            await axiosClient.delete(`/problem/delete/${id}`);
            alert('Problem deleted successfully!');
            fetchProblems();
        } catch (err) {
            console.error("Error deleting problem:", err);
            alert('Failed to delete problem');
        }
    };

    const startEditProblem = (problem) => {
        setEditingProblem(problem);
        
        // Ensure all 3 languages are present
        const ensureLanguages = (codeArray) => {
            const result = [];
            LANGUAGES.forEach(lang => {
                const existing = codeArray?.find(c => c.language === lang);
                result.push(existing || { language: lang, initialCode: '' });
            });
            return result;
        };

        setFormData({
            title: problem.title,
            description: problem.description,
            difficulty: problem.difficulty,
            tags: problem.tags,
            visibleTestCases: problem.visibleTestCases || [{ input: '', output: '', explanation: '' }],
            hiddenTestCases: problem.hiddenTestCases || [{ input: '', output: '' }],
            startCode: ensureLanguages(problem.startCode),
            referenceSolution: ensureLanguages(problem.referenceSolution)
        });
        setActiveTab('create');
        setValidationResults(null);
        setValidationError(null);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            difficulty: 'Easy',
            tags: [],
            visibleTestCases: [{ input: '', output: '', explanation: '' }],
            hiddenTestCases: [{ input: '', output: '' }],
            startCode: [
                { language: 'cpp', initialCode: '' },
                { language: 'javascript', initialCode: '' },
                { language: 'python', initialCode: '' }
            ],
            referenceSolution: [
                { language: 'cpp', initialCode: '' },
                { language: 'javascript', initialCode: '' },
                { language: 'python', initialCode: '' }
            ]
        });
        setEditingProblem(null);
        setValidationResults(null);
        setValidationError(null);
        setActiveLanguageTab('cpp');
        setActiveSolutionTab('cpp');
    };

    const toggleTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag) 
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    const addVisibleTestCase = () => {
        setFormData(prev => ({
            ...prev,
            visibleTestCases: [...prev.visibleTestCases, { input: '', output: '', explanation: '' }]
        }));
    };

    const removeVisibleTestCase = (index) => {
        if (formData.visibleTestCases.length === 1) {
            alert('At least one visible test case is required');
            return;
        }
        setFormData(prev => ({
            ...prev,
            visibleTestCases: prev.visibleTestCases.filter((_, i) => i !== index)
        }));
    };

    const updateVisibleTestCase = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            visibleTestCases: prev.visibleTestCases.map((tc, i) => 
                i === index ? { ...tc, [field]: value } : tc
            )
        }));
    };

    const addHiddenTestCase = () => {
        setFormData(prev => ({
            ...prev,
            hiddenTestCases: [...prev.hiddenTestCases, { input: '', output: '' }]
        }));
    };

    const removeHiddenTestCase = (index) => {
        setFormData(prev => ({
            ...prev,
            hiddenTestCases: prev.hiddenTestCases.filter((_, i) => i !== index)
        }));
    };

    const updateHiddenTestCase = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            hiddenTestCases: prev.hiddenTestCases.map((tc, i) => 
                i === index ? { ...tc, [field]: value } : tc
            )
        }));
    };

    const updateStartCode = (language, code) => {
        setFormData(prev => ({
            ...prev,
            startCode: prev.startCode.map(sc => 
                sc.language === language ? { ...sc, initialCode: code } : sc
            )
        }));
    };

    const updateReferenceSolution = (language, code) => {
        setFormData(prev => ({
            ...prev,
            referenceSolution: prev.referenceSolution.map(rs => 
                rs.language === language ? { ...rs, initialCode: code } : rs
            )
        }));
    };

    const filteredProblems = problems.filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
        }
    };

    const getLanguageLabel = (lang) => {
        const labels = {
            'cpp': 'C++',
            'javascript': 'JavaScript',
            'python': 'Python'
        };
        return labels[lang] || lang;
    };

    const getValidationStatusColor = (status) => {
        switch (status) {
            case 'passed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'failed': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            case 'error': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'skipped': return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
            default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100">
            {/* Header */}
            <header className="bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="group flex items-center gap-2">
                        <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                            <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            </svg>
                        </div>
                        <h1 className="text-base sm:text-xl font-bold tracking-tight">
                            Admin <span className="text-rose-500">Panel</span>
                        </h1>
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-400 hover:bg-emerald-500/20 transition-all"
                        >
                            <span className="hidden sm:inline">Back to </span>Home
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="flex items-center gap-2 sm:gap-3 p-1 pr-2 sm:pr-3 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all hover:bg-zinc-800/50"
                            >
                                <div className="w-8 h-8 bg-linear-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ring-rose-500/20">
                                    {user?.firstName?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <span className="hidden sm:block text-sm font-medium">{user?.firstName || 'Admin'}</span>
                                <svg className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>

                            {showProfileDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)} />
                                    <div className="absolute right-0 mt-3 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
                                        <div className="px-4 py-3 bg-zinc-800/30">
                                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Admin Account</p>
                                            <p className="text-sm font-medium truncate mt-0.5">{user?.emailId || 'admin@codeable.com'}</p>
                                        </div>
                                        <div className="p-1">
                                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
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

            {/* Tabs */}
            <div className="bg-zinc-950/50 border-b border-zinc-800/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-1 overflow-x-auto">
                        {[
                            { id: 'problems', label: 'Manage Problems', icon: '📝' },
                            { id: 'create', label: editingProblem ? 'Edit Problem' : 'Create Problem', icon: editingProblem ? '✏️' : '➕' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    if (tab.id !== 'create') resetForm();
                                }}
                                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                                    activeTab === tab.id
                                        ? 'text-rose-400 border-b-2 border-rose-500 bg-rose-500/5'
                                        : 'text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Problems Tab */}
                {activeTab === 'problems' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <h2 className="text-2xl font-bold">All Problems ({problems.length})</h2>
                            <button
                                onClick={() => setActiveTab('create')}
                                className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-all flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Problem
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search problems..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/40 outline-none"
                            />
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-zinc-900/50 border-b border-zinc-800">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap">Title</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap">Difficulty</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap">Tags</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/40">
                                    {filteredProblems.map(problem => (
                                        <tr key={problem._id} className="hover:bg-zinc-800/20 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-zinc-200">{problem.title}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-black uppercase whitespace-nowrap ${getDifficultyColor(problem.difficulty)}`}>
                                                    {problem.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1 flex-wrap">
                                                    {problem.tags?.slice(0, 2).map((tag, i) => (
                                                        <span key={i} className="text-[10px] px-2 py-1 rounded-md bg-zinc-800 text-zinc-500 border border-zinc-700/50 whitespace-nowrap">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {problem.tags?.length > 2 && (
                                                        <span className="text-[10px] text-zinc-600">+{problem.tags.length - 2}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => startEditProblem(problem)}
                                                        className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProblem(problem._id)}
                                                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredProblems.length === 0 && (
                                <div className="py-12 text-center text-zinc-500">
                                    No problems found
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Create/Edit Tab */}
                {activeTab === 'create' && (
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 sm:p-6">
                            <h2 className="text-2xl font-bold mb-6">
                                {editingProblem ? 'Edit Problem' : 'Create New Problem'}
                            </h2>

                            <form onSubmit={editingProblem ? handleUpdateProblem : handleCreateProblem} className="space-y-6">
                                {/* Basic Info */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-rose-500/20 outline-none"
                                        placeholder="Two Sum"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Description *</label>
                                    <textarea
                                        required
                                        rows={6}
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-rose-500/20 outline-none resize-none font-mono text-sm"
                                        placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.&#10;&#10;Input Format:&#10;Line 1: Array in JSON format [num1, num2, ...]&#10;Line 2: Target integer&#10;&#10;Output Format:&#10;Array of two indices in JSON format [index1, index2]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">Difficulty *</label>
                                        <select
                                            value={formData.difficulty}
                                            onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-rose-500/20 outline-none"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                                        Tags * (Selected: {formData.tags.length})
                                    </label>
                                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 max-h-48 overflow-y-auto">
                                        <div className="flex flex-wrap gap-2">
                                            {AVAILABLE_TAGS.map(tag => (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    onClick={() => toggleTag(tag)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                        formData.tags.includes(tag)
                                                            ? 'bg-rose-500/20 border border-rose-500/50 text-rose-400'
                                                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                                    }`}
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Visible Test Cases */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-medium text-zinc-400">
                                            Visible Test Cases * ({formData.visibleTestCases.length})
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addVisibleTestCase}
                                            className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                        >
                                            + Add Test Case
                                        </button>
                                    </div>
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
                                        <p className="text-xs text-blue-400 font-medium mb-1">💡 Input Format Guide:</p>
                                        <ul className="text-xs text-blue-300 space-y-1 ml-4">
                                            <li>• <strong>Press Enter</strong> for multi-line input - it auto-converts to proper format</li>
                                            <li>• Example (2 lines): Type array, press Enter, type number</li>
                                            <li>• Example:
                                                <div className="bg-blue-500/10 rounded px-2 py-1 mt-1 font-mono text-[11px]">
                                                    [2,7,11,15]<br/>9
                                                </div>
                                            </li>
                                            <li>• Single line: Just type the value (no Enter needed)</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.visibleTestCases.map((tc, index) => (
                                            <div key={index} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-xs font-bold text-zinc-500">Test Case {index + 1}</span>
                                                    {formData.visibleTestCases.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVisibleTestCase(index)}
                                                            className="text-rose-400 hover:text-rose-300 text-xs"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <textarea
                                                        required
                                                        rows={2}
                                                        placeholder="Input (use actual line breaks for multi-line input)"
                                                        value={tc.input}
                                                        onChange={(e) => updateVisibleTestCase(index, 'input', e.target.value)}
                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:ring-1 focus:ring-rose-500/20 outline-none font-mono"
                                                    />
                                                    <textarea
                                                        required
                                                        rows={1}
                                                        placeholder="Output (e.g., [0,1])"
                                                        value={tc.output}
                                                        onChange={(e) => updateVisibleTestCase(index, 'output', e.target.value)}
                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:ring-1 focus:ring-rose-500/20 outline-none font-mono"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Explanation (optional)"
                                                        value={tc.explanation}
                                                        onChange={(e) => updateVisibleTestCase(index, 'explanation', e.target.value)}
                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:ring-1 focus:ring-rose-500/20 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Hidden Test Cases */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-medium text-zinc-400">
                                            Hidden Test Cases ({formData.hiddenTestCases.length})
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addHiddenTestCase}
                                            className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400 hover:bg-amber-500/20 transition-all"
                                        >
                                            + Add Hidden Test
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.hiddenTestCases.map((tc, index) => (
                                            <div key={index} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-xs font-bold text-zinc-500">Hidden Test {index + 1}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeHiddenTestCase(index)}
                                                        className="text-rose-400 hover:text-rose-300 text-xs"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    <textarea
                                                        rows={2}
                                                        placeholder="Input (use actual line breaks)"
                                                        value={tc.input}
                                                        onChange={(e) => updateHiddenTestCase(index, 'input', e.target.value)}
                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:ring-1 focus:ring-rose-500/20 outline-none font-mono"
                                                    />
                                                    <textarea
                                                        rows={1}
                                                        placeholder="Output"
                                                        value={tc.output}
                                                        onChange={(e) => updateHiddenTestCase(index, 'output', e.target.value)}
                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:ring-1 focus:ring-rose-500/20 outline-none font-mono"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Starter Code */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-3">Starter Code (for users)</label>
                                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
                                        <div className="flex border-b border-zinc-800">
                                            {LANGUAGES.map(lang => (
                                                <button
                                                    key={lang}
                                                    type="button"
                                                    onClick={() => setActiveLanguageTab(lang)}
                                                    className={`px-4 py-2 text-sm font-medium transition-all ${
                                                        activeLanguageTab === lang
                                                            ? 'bg-zinc-900 text-rose-400 border-b-2 border-rose-500'
                                                            : 'text-zinc-500 hover:text-zinc-300'
                                                    }`}
                                                >
                                                    {getLanguageLabel(lang)}
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            rows={10}
                                            value={formData.startCode.find(sc => sc.language === activeLanguageTab)?.initialCode || ''}
                                            onChange={(e) => updateStartCode(activeLanguageTab, e.target.value)}
                                            className="w-full bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none font-mono resize-none"
                                            placeholder={`Enter starter code for ${getLanguageLabel(activeLanguageTab)}...`}
                                        />
                                    </div>
                                </div>

                                {/* Reference Solution */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-3">Reference Solution * (will be validated)</label>
                                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
                                        <div className="flex border-b border-zinc-800">
                                            {LANGUAGES.map(lang => (
                                                <button
                                                    key={lang}
                                                    type="button"
                                                    onClick={() => setActiveSolutionTab(lang)}
                                                    className={`px-4 py-2 text-sm font-medium transition-all ${
                                                        activeSolutionTab === lang
                                                            ? 'bg-zinc-900 text-rose-400 border-b-2 border-rose-500'
                                                            : 'text-zinc-500 hover:text-zinc-300'
                                                    }`}
                                                >
                                                    {getLanguageLabel(lang)}
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            rows={12}
                                            value={formData.referenceSolution.find(rs => rs.language === activeSolutionTab)?.initialCode || ''}
                                            onChange={(e) => updateReferenceSolution(activeSolutionTab, e.target.value)}
                                            className="w-full bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none font-mono resize-none"
                                            placeholder={`Enter reference solution for ${getLanguageLabel(activeSolutionTab)}...`}
                                        />
                                    </div>
                                </div>

                                {/* Validation Results */}
                                {validationResults && (
                                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                                        <h3 className="text-sm font-bold text-zinc-400 mb-3">Validation Results</h3>
                                        <div className="space-y-2">
                                            {Object.entries(validationResults).map(([lang, result]) => (
                                                <div key={lang} className="flex items-center justify-between bg-zinc-900 rounded-lg p-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-medium text-zinc-300">{getLanguageLabel(lang)}</span>
                                                        <span className={`text-xs px-2 py-1 rounded border font-bold uppercase ${getValidationStatusColor(result.status)}`}>
                                                            {result.status}
                                                        </span>
                                                    </div>
                                                    {result.passedTests !== undefined && (
                                                        <span className="text-xs text-zinc-500">
                                                            {result.passedTests}/{result.totalTests} tests passed
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {validationError && (
                                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4">
                                        <p className="text-sm text-rose-400">{validationError}</p>
                                    </div>
                                )}

                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                                    <p className="text-sm text-amber-400">
                                        <strong>Note:</strong> After creating/updating, reference solutions will be automatically validated against visible test cases using the Piston API.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="submit"
                                        disabled={isValidating}
                                        className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isValidating ? 'Validating...' : editingProblem ? 'Update & Validate' : 'Create & Validate'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetForm();
                                            setActiveTab('problems');
                                        }}
                                        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

               
            </main>
        </div>
    );
}

export default AdminPage;