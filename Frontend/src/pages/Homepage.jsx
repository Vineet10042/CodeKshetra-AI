import { useEffect, useState, useMemo } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import { Search, Filter, CheckCircle2, Trophy, Code2, Flame, ArrowRight, BookOpen } from 'lucide-react';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]); // Clear solved problems on logout
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' ||
      solvedProblems.some(sp => sp._id === problem._id);
    return difficultyMatch && tagMatch && statusMatch;
  });

  // Calculate stats for hero section
  const stats = useMemo(() => {
    return {
      total: problems.length,
      solved: solvedProblems.length,
      easy: problems.filter(p => p.difficulty.toLowerCase() === 'easy').length,
      medium: problems.filter(p => p.difficulty.toLowerCase() === 'medium').length,
      hard: problems.filter(p => p.difficulty.toLowerCase() === 'hard').length,
    };
  }, [problems, solvedProblems]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);
  const paginatedProblems = filteredProblems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-base-300 font-sans pb-12">
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-lg border-b border-base-content/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-bold text-xl shadow-lg shadow-primary/20">
                C
              </div>
              <NavLink to="/" className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-base-content to-base-content/70">
                CodeKshetra <span className="text-primary">AI</span>
              </NavLink>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-sm sm:btn-md gap-2 rounded-full border border-base-content/10 shadow-sm hover:shadow-md transition-all">

                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-yellow-600 dark:text-yellow-400 font-bold text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-500">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                      {user.score || 0}
                    </div>

                    <div className="avatar placeholder ml-1">
                      <div className="bg-primary text-primary-content rounded-full w-6 h-6 sm:w-8 sm:h-8">
                        <span className="text-xs sm:text-sm font-bold">{user.firstName?.charAt(0) || 'U'}</span>
                      </div>
                    </div>
                    <span className="hidden sm:inline font-medium">{user.firstName}</span>
                  </div>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-2xl shadow-base-300 bg-base-100 rounded-box w-52 border border-base-content/10 mt-4 rounded-xl">
                    <li className="menu-title px-4 py-2 text-xs opacity-50 font-bold uppercase tracking-wider">Account</li>
                    {user.role === 'admin' && (
                      <li><NavLink to='/admin' className="font-medium hover:text-primary"><BookOpen size={16} /> Admin Dashboard</NavLink></li>
                    )}
                    <li><button onClick={handleLogout} className="text-error font-medium md:hover:bg-error/10">Logout</button></li>
                  </ul>
                </div>
              ) : (
                <div className="flex gap-2">
                  <NavLink to="/login" className="btn btn-ghost btn-sm sm:btn-md font-bold">Sign In</NavLink>
                  <NavLink to="/signup" className="btn btn-primary btn-sm sm:btn-md shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/40 transition-all">Get Started</NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-base-100 border-b border-base-content/5 pt-16 pb-20">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-primary/10 blur-[100px] rounded-full point-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] bg-secondary/10 blur-[80px] rounded-full point-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-base-200/50 border border-base-300 text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Flame size={16} className="text-orange-500" />
            <span>Master coding interviews</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            Level up your <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">coding skills</span> today.
          </h1>

          <p className="text-lg md:text-xl text-base-content/60 max-w-2xl mx-auto font-medium mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Practice algorithmic problems, prepare for technical interviews, and track your progress with our intelligent AI-powered platform.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
            <div className="bg-base-100/50 backdrop-blur-sm border border-base-300 p-4 rounded-2xl shadow-sm flex flex-col items-center">
              <span className="text-3xl font-black text-base-content">{stats.total}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/50 mt-1">Total Problems</span>
            </div>
            {user && (
              <div className="bg-success/5 backdrop-blur-sm border border-success/20 p-4 rounded-2xl shadow-sm flex flex-col items-center">
                <span className="text-3xl font-black text-success">{stats.solved}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-success/70 mt-1">Solved</span>
              </div>
            )}
            <div className="bg-orange-500/5 backdrop-blur-sm border border-orange-500/20 p-4 rounded-2xl shadow-sm flex flex-col items-center hidden md:flex">
              <span className="text-3xl font-black text-orange-500">{stats.medium}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-500/70 mt-1">Medium Curated</span>
            </div>
            <div className="bg-primary/5 backdrop-blur-sm border border-primary/20 p-4 rounded-2xl shadow-sm flex items-center justify-center col-span-2 md:col-span-1 border-dashed">
              <div className="text-center">
                <Trophy className="mx-auto mb-1 text-primary opacity-80" size={24} />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Start Grinding</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Filters Section */}
        <div className="bg-base-100 p-4 rounded-2xl shadow-sm border border-base-300 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-20 z-40 backdrop-blur-xl supports-[backdrop-filter]:bg-base-100/80">
          <div className="flex items-center gap-2 w-full sm:w-auto text-base-content/70 font-bold ml-2">
            <Filter size={18} />
            <span>Problem Library</span>
          </div>

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-sm btn-outline gap-2 rounded-xl">
              <Filter size={14} />
              Filters
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-4 shadow-2xl shadow-base-300 bg-base-100 rounded-box w-72 border border-base-content/10 mt-2 gap-4">

              {user && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-base-content/50 px-1 mb-2 block">Status</label>
                  <select
                    className="select select-sm select-bordered bg-base-200/50 hover:bg-base-200 transition-colors w-full focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={filters.status}
                    onChange={(e) => {
                      setFilters({ ...filters, status: e.target.value });
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="solved">Solved Only</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-base-content/50 px-1 mb-2 block">Difficulty</label>
                <select
                  className="select select-sm select-bordered bg-base-200/50 hover:bg-base-200 transition-colors w-full focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={filters.difficulty}
                  onChange={(e) => {
                    setFilters({ ...filters, difficulty: e.target.value });
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">Any Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-base-content/50 px-1 mb-2 block">Topics</label>
                <select
                  className="select select-sm select-bordered bg-base-200/50 hover:bg-base-200 transition-colors w-full focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={filters.tag}
                  onChange={(e) => {
                    setFilters({ ...filters, tag: e.target.value });
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Topics</option>
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">Dynamic Programming</option>
                  <option value="math">Math</option>
                  <option value="string">String</option>
                </select>
              </div>
            </ul>
          </div>
        </div>

        {/* Problems Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedProblems.length > 0 ? (
            paginatedProblems.map((problem, idx) => {
              const isSolved = solvedProblems.some(sp => sp._id === problem._id);
              return (
                <NavLink
                  to={`/problem/${problem._id}`}
                  key={problem._id}
                  className="group relative bg-base-100 rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-base-200/50 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  style={{ animationFillMode: 'both', animationDelay: `${idx * 50}ms` }}
                >
                  {/* Subtle hover gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${getDifficultyBadgeClass(problem.difficulty)}`}>
                        {problem.difficulty}
                      </div>

                      {isSolved && (
                        <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success shadow-sm" title="Solved">
                          <CheckCircle2 size={18} />
                        </div>
                      )}
                    </div>

                    <h2 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {problem.title}
                    </h2>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="px-2.5 py-1 bg-base-200 text-base-content/70 rounded border border-base-300 text-xs font-semibold uppercase tracking-wider group-hover:bg-primary/5 group-hover:text-primary/80 group-hover:border-primary/20 transition-colors">
                        {problem.tags || 'Topic'}
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 mt-6 flex items-center justify-between text-sm font-bold text-base-content/40 group-hover:text-primary transition-colors">
                    <span className="flex items-center gap-1.5"><Code2 size={16} /> Solve Problem</span>
                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </NavLink>
              );
            })
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-base-300">
                <Search className="text-base-content/30 w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-base-content/80 mb-2">No problems found</h3>
              <p className="text-base-content/50 max-w-sm">Try tweaking your filters or selecting a different difficulty level to find what you're looking for.</p>
              <button
                onClick={() => setFilters({ difficulty: 'all', tag: 'all', status: 'all' })}
                className="btn btn-outline btn-sm mt-6 font-bold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-2">
            <button
              className="btn btn-sm btn-outline border-base-300"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              className="btn btn-sm btn-outline border-base-300"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const getDifficultyBadgeClass = (difficulty) => {
  if (!difficulty) return 'bg-base-200 text-base-content/60 border-base-300';
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'bg-green-500/10 text-green-600 border border-green-500/20';
    case 'medium': return 'bg-orange-500/10 text-orange-600 border border-orange-500/20';
    case 'hard': return 'bg-red-500/10 text-red-600 border border-red-500/20';
    default: return 'bg-base-200 text-base-content/60 border border-base-300';
  }
};

export default Homepage;