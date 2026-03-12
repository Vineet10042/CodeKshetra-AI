import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserScore } from '../authSlice';
import axiosClient from "../utils/axiosClient"
import SubmissionHistory from "../components/SubmissionHistory"
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CheckCircle2, XCircle, Clock, Database, Terminal, PlayCircle, BookOpen, Lightbulb, History, Sparkles, FileText, Code2 } from 'lucide-react';




const langMap = {
  cpp: 'C++',           //capital letter m iss liye kyuki backend se ye 1st letter capital aa rha h 
  java: 'Java',
  javascript: 'JavaScript'
};


const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const { user } = useSelector((state) => state.auth);
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let { problemId } = useParams();

  // Unused icons destructuring removed: ChevronRight, AlertCircle

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);

        // Let the second useEffect handle setting the initial code.
        setProblem(response.data);
        setLoading(false);

      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Update code when language changes or problem loads
  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode?.find(sc => sc.language === langMap[selectedLanguage])?.initialCode || '';
      setCode(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);

    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');

    } catch (error) {
      console.error('Error running code:', error);

      // If the backend sent a structured response with error details (e.g. compilation error)
      if (error.response && error.response.data) {
        setRunResult(error.response.data);
      } else {
        // Fallback for network issues or complete server failures
        setRunResult({
          success: false,
          error: 'Network error or internal server error while reaching judge API.'
        });
      }

      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);

    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });

      if (response.data?.newScore !== undefined) {
        dispatch(updateUserScore({ newScore: response.data.newScore }));
      }

      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab('result');

    } catch (error) {
      console.error('Error submitting code:', error);

      if (error.response && error.response.data) {
        setSubmitResult(error.response.data);
      } else {
        setSubmitResult({
          accepted: false,
          error: 'Network error or internal server error while reaching judge API.'
        });
      }

      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-base-300 font-sans overflow-hidden">
      {/* Premium Navbar */}
      <nav className="h-14 bg-base-100/90 backdrop-blur-md border-b border-base-content/10 flex items-center justify-between px-6 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-bold shadow-sm cursor-pointer" onClick={() => navigate('/')}>
            C
          </div>
          <h1 className="font-bold text-lg tracking-tight truncate max-w-[200px] md:max-w-md">
            {problem?.title || 'Loading Problem...'}
          </h1>
          {problem && (
            <div className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${problem.difficulty?.toLowerCase() === 'easy' ? 'bg-success/10 text-success border border-success/20' :
              problem.difficulty?.toLowerCase() === 'medium' ? 'bg-warning/10 text-warning border border-warning/20' :
                'bg-error/10 text-error border border-error/20'
              }`}>
              {problem.difficulty}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            className="select select-sm select-bordered bg-base-200/50 hover:bg-base-200 transition-colors focus:ring-2 focus:ring-primary/20 rounded-lg text-sm font-medium"
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>
      </nav>

      {/* Main Split Interface */}
      <div className="flex flex-1 overflow-hidden p-2 gap-2">
        {/* Left Panel - Context */}
        <div className="w-1/2 flex flex-col bg-base-100 rounded-xl shadow-sm border border-base-content/10 overflow-hidden relative">

          {/* Subtle abstract background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none"></div>

          {/* Left Tabs */}
          <div className="flex border-b border-base-content/10 bg-base-100/50 backdrop-blur-sm z-10 shrink-0">
            {[
              { id: 'description', label: 'Description', icon: FileText },
              { id: 'editorial', label: 'Editorial', icon: BookOpen },
              { id: 'solutions', label: 'Solutions', icon: Lightbulb },
              { id: 'submissions', label: 'Submissions', icon: History },
              { id: 'chatAI', label: 'AI Tutor', icon: Sparkles, color: 'text-primary' }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeLeftTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all relative outline-none ${isActive ? 'text-base-content bg-base-200/50' : 'text-base-content/50 hover:text-base-content hover:bg-base-200/30'}`}
                  onClick={() => setActiveLeftTab(tab.id)}
                >
                  <Icon size={16} className={tab.color || (isActive ? 'text-base-content' : 'opacity-70')} />
                  {tab.label}
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(6,81,237,0.5)]"></div>}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar z-10 relative">
            {problem && (
              <div className="h-full min-h-full">
                {activeLeftTab === 'description' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 prose max-w-none text-base-content">
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-3xl font-black tracking-tight m-0">{problem.title}</h2>
                    </div>

                    <div className="flex gap-2 mb-8 border-b border-base-content/10 pb-6">
                      <div className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${problem.difficulty?.toLowerCase() === 'easy' ? 'bg-success/10 text-success' :
                        problem.difficulty?.toLowerCase() === 'medium' ? 'bg-warning/10 text-warning' :
                          'bg-error/10 text-error'
                        }`}>
                        {problem.difficulty}
                      </div>
                      <div className="px-2.5 py-1 rounded bg-base-200 text-base-content/70 text-xs font-bold uppercase tracking-wider">
                        {problem.tags || 'Topic'}
                      </div>
                    </div>

                    <div className="text-[15px] leading-relaxed text-base-content/90 mb-10">
                      <div className="whitespace-pre-wrap font-medium">
                        {problem.description}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xl font-bold border-b border-base-content/10 pb-2 mb-4 flex items-center gap-2">
                        <Code2 size={20} className="text-primary" /> Test Examples
                      </h3>
                      <div className="space-y-6">
                        {problem.visibleTestCases.map((example, index) => (
                          <div key={index} className="bg-base-200/50 rounded-xl border border-base-300 overflow-hidden shadow-sm">
                            <div className="bg-base-300/50 px-4 py-2 border-b border-base-300 font-bold text-sm tracking-wide text-base-content/80">
                              Example {index + 1}
                            </div>
                            <div className="p-4 space-y-3 font-mono text-sm">
                              <div>
                                <span className="font-bold text-base-content/50 uppercase tracking-widest text-xs block mb-1">Input</span>
                                <div className="text-base-content bg-base-100 p-2.5 rounded-lg border border-base-300/50 whitespace-pre-wrap">{example.input}</div>
                              </div>
                              <div>
                                <span className="font-bold text-base-content/50 uppercase tracking-widest text-xs block mb-1">Output</span>
                                <div className="text-base-content font-bold bg-base-100 p-2.5 rounded-lg border border-base-300/50 whitespace-pre-wrap">{example.output}</div>
                              </div>
                              {example.explanation && (
                                <div>
                                  <span className="font-bold text-base-content/50 uppercase tracking-widest text-xs block mb-1">Explanation</span>
                                  <div className="text-base-content/80 font-sans italic bg-base-100/50 p-2.5 rounded-lg border border-base-300/50">{example.explanation}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeLeftTab === 'editorial' && (
                  <div className="animate-in fade-in duration-500 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-6 border-b border-base-content/10 pb-4">
                      <BookOpen className="text-primary" size={24} />
                      <h2 className="text-2xl font-black tracking-tight">Editorial & Video Solution</h2>
                    </div>
                    <div className="flex-1 bg-base-200/30 rounded-2xl border border-base-300 p-4 shadow-inner">
                      <Editorial title={problem.title} secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration} />
                    </div>
                  </div>
                )}

                {activeLeftTab === 'solutions' && (
                  <div className="animate-in fade-in duration-500">
                    <div className="flex items-center gap-2 mb-6 border-b border-base-content/10 pb-4">
                      <Lightbulb className="text-warning" size={24} />
                      <h2 className="text-2xl font-black tracking-tight">Community Solutions</h2>
                    </div>

                    <div className="space-y-8">
                      {problem.referenceSolution && problem.referenceSolution.length > 0 ? problem.referenceSolution.map((solution, index) => (
                        <div key={index} className="bg-base-100 rounded-xl border border-base-300 shadow-md overflow-hidden transition-shadow hover:shadow-lg">
                          <div className="bg-base-200/80 px-5 py-3 border-b border-base-300 flex justify-between items-center">
                            <span className="font-bold tracking-tight">{problem?.title} Solution</span>
                            <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-black uppercase tracking-wider border border-primary/20">
                              {solution?.language || 'Code'}
                            </span>
                          </div>
                          <div className="p-0 bg-[#0d0d0d]">
                            <SyntaxHighlighter
                              language={solution?.language?.toLowerCase() === 'c++' ? 'cpp' : solution?.language?.toLowerCase() || 'javascript'}
                              style={vscDarkPlus}
                              customStyle={{ background: 'transparent', margin: 0, padding: '1.25rem', fontSize: '14px' }}
                            >
                              {solution?.completeCode}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                      )) : (
                        <div className="bg-base-200/50 border border-base-300 border-dashed rounded-2xl p-10 text-center flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center">
                            <Lock size={24} className="text-base-content/40" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold mb-1">Solutions Locked</h3>
                            <p className="text-base-content/60 max-w-sm">Detailed reference solutions will become available once you successfully solve this problem.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeLeftTab === 'submissions' && (
                  <div className="animate-in fade-in duration-500 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-6 border-b border-base-content/10 pb-4">
                      <History className="text-secondary" size={24} />
                      <h2 className="text-2xl font-black tracking-tight">Submission History</h2>
                    </div>
                    <div className="flex-1 bg-base-100 rounded-xl border border-base-300 shadow-sm overflow-hidden">
                      <SubmissionHistory problemId={problemId} />
                    </div>
                  </div>
                )}

                {activeLeftTab === 'chatAI' && (
                  <div className="animate-in fade-in duration-500 h-full flex flex-col">
                    <div className="flex-1">
                      <ChatAi problem={problem}></ChatAi>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Workspace */}
        <div className="w-1/2 flex flex-col bg-base-100 rounded-xl shadow-sm border border-base-content/10 overflow-hidden">

          {/* Right Tabs */}
          <div className="flex border-b border-base-content/10 bg-base-100/50 backdrop-blur-sm z-10 shrink-0">
            <button
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all relative outline-none ${activeRightTab === 'code' ? 'text-primary bg-primary/5' : 'text-base-content/50 hover:text-base-content hover:bg-base-200/30'}`}
              onClick={() => setActiveRightTab('code')}
            >
              <Code2 size={16} /> Code Editor
              {activeRightTab === 'code' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(6,81,237,0.5)]"></div>}
            </button>
            <button
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all relative outline-none ${activeRightTab === 'testcase' ? 'text-secondary bg-secondary/5' : 'text-base-content/50 hover:text-base-content hover:bg-base-200/30'}`}
              onClick={() => setActiveRightTab('testcase')}
            >
              <Terminal size={16} /> Test Console
              {activeRightTab === 'testcase' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-t-full shadow-[0_-2px_8px_rgba(236,72,153,0.5)]"></div>}
            </button>
            <button
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all relative outline-none ${activeRightTab === 'result' ? 'text-success bg-success/5' : 'text-base-content/50 hover:text-base-content hover:bg-base-200/30'}`}
              onClick={() => setActiveRightTab('result')}
            >
              <PlayCircle size={16} /> Result
              {activeRightTab === 'result' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-success rounded-t-full shadow-[0_-2px_8px_rgba(34,197,94,0.5)]"></div>}
            </button>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e]">
            <div className="flex-1 flex flex-col min-h-0">
              {activeRightTab === 'code' && (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Language Selector */}
                  <div className="flex justify-between items-center p-4 border-b border-base-300">
                    <div className="flex gap-2">
                      {['javascript', 'java', 'cpp'].map((lang) => (
                        <button
                          key={lang}
                          className={`btn btn-sm ${selectedLanguage === lang ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => handleLanguageChange(lang)}
                        >
                          {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Monaco Editor */}
                  <div className="flex-1 min-h-0">
                    <Editor
                      height="100%"
                      language={getLanguageForMonaco(selectedLanguage)}
                      value={code}
                      onChange={handleEditorChange}
                      onMount={handleEditorDidMount}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        glyphMargin: false,
                        folding: true,
                        lineDecorationsWidth: 10,
                        lineNumbersMinChars: 3,
                        renderLineHighlight: 'line',
                        selectOnLineNumbers: true,
                        roundedSelection: false,
                        readOnly: false,
                        cursorStyle: 'line',
                        mouseWheelZoom: true,
                      }}
                    />
                  </div>
                </div>
              )}

              {activeRightTab === 'testcase' && (
                <div className="flex-1 p-6 overflow-y-auto bg-base-100 custom-scrollbar">
                  <div className="flex items-center gap-2 mb-6 text-base-content/80">
                    <Terminal size={20} className="text-primary" />
                    <h3 className="font-bold text-lg tracking-tight">Console Outputs</h3>
                  </div>

                  {runResult ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {/* Status Header Card */}
                      <div className={`p-4 rounded-2xl border ${runResult.success ? 'bg-success/5 border-success/20' : 'bg-error/5 border-error/20'} mb-6 flex items-center justify-between shadow-sm`}>
                        <div className="flex items-center gap-3">
                          {runResult.success ? (
                            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success shrink-0">
                              <CheckCircle2 size={24} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center text-error shrink-0">
                              <XCircle size={24} />
                            </div>
                          )}
                          <div>
                            <h4 className={`font-bold text-lg ${runResult.success ? 'text-success' : 'text-error'}`}>
                              {runResult.success ? 'Accepted' : 'Wrong Answer'}
                            </h4>
                            <p className="text-xs text-base-content/60 mt-0.5 font-medium">All example test cases completed</p>
                          </div>
                        </div>

                        {runResult.success && (
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 bg-base-100 px-3 py-1.5 rounded-lg border border-base-300 shadow-sm">
                              <Clock size={14} className="text-base-content/50" />
                              <span className="text-sm font-mono font-medium">{runResult.runtime}s</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-base-100 px-3 py-1.5 rounded-lg border border-base-300 shadow-sm">
                              <Database size={14} className="text-base-content/50" />
                              <span className="text-sm font-mono font-medium">{runResult.memory} KB</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Test Cases List */}
                      <div className="space-y-4">
                        {runResult.testCases && runResult.testCases.length > 0 ? (
                          runResult.testCases.map((tc, i) => {
                            const isSuccess = tc.status_id === 3;
                            return (
                              <div key={i} className={`bg-base-100 border rounded-xl overflow-hidden transition-all ${isSuccess ? 'border-base-300 hover:border-success/30' : 'border-error/30 bg-error/5 hover:border-error/50'}`}>
                                <div className={`px-4 py-2 border-b text-sm font-bold flex justify-between items-center ${isSuccess ? 'border-base-300 bg-base-200/50' : 'border-error/20 bg-error/10 text-error'}`}>
                                  <span>Case {i + 1}</span>
                                  <div className={`px-2 py-0.5 rounded text-xs uppercase tracking-wider ${isSuccess ? 'bg-success/10 text-success' : 'bg-error/20 text-error'}`}>
                                    {isSuccess ? 'Passed' : 'Failed'}
                                  </div>
                                </div>
                                <div className="p-4 space-y-4 text-sm">
                                  <div>
                                    <div className="text-xs text-base-content/50 font-bold uppercase tracking-widest mb-1.5">Input</div>
                                    <div className="bg-base-200/50 p-2.5 rounded-lg font-mono text-base-content whitespace-pre-wrap text-[13px] border border-base-300/50">
                                      {tc.stdin}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-xs text-base-content/50 font-bold uppercase tracking-widest mb-1.5">Output</div>
                                      <div className={`bg-base-200/50 p-2.5 rounded-lg font-mono whitespace-pre-wrap text-[13px] border ${!isSuccess ? 'border-error/30 text-error/90 bg-error/5' : 'border-base-300/50 text-base-content'}`}>
                                        {tc.stdout || ' '}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-base-content/50 font-bold uppercase tracking-widest mb-1.5">Expected</div>
                                      <div className="bg-base-200/50 p-2.5 rounded-lg font-mono text-base-content/80 whitespace-pre-wrap text-[13px] border border-base-300/50">
                                        {tc.expected_output}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="bg-error/5 border border-error/20 p-4 rounded-xl font-mono text-sm text-error/90 whitespace-pre-wrap">
                            {typeof runResult.error === 'object' ? JSON.stringify(runResult.error, null, 2) : (runResult.error || "Execution failed or timed out.")}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[60%] text-base-content/40 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center">
                        <Terminal size={32} className="opacity-50" />
                      </div>
                      <p className="font-medium text-center max-w-xs">Click "Run" to test your code with the example test cases.</p>
                    </div>
                  )}
                </div>
              )}

              {activeRightTab === 'result' && (
                <div className="flex-1 p-6 overflow-y-auto bg-base-100 custom-scrollbar">
                  <div className="flex items-center gap-2 mb-6 text-base-content/80">
                    <PlayCircle size={20} className="text-primary" />
                    <h3 className="font-bold text-lg tracking-tight">Submission Result</h3>
                  </div>

                  {submitResult ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className={`p-6 rounded-2xl border ${submitResult.accepted ? 'bg-success/5 border-success/30 shadow-success/10' : 'bg-error/5 border-error/30 shadow-error/10'} shadow-lg mb-6`}>
                        <div className="flex items-start gap-4">
                          {submitResult.accepted ? (
                            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center text-success shrink-0 mt-1">
                              <CheckCircle2 size={28} />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center text-error shrink-0 mt-1">
                              <XCircle size={28} />
                            </div>
                          )}

                          <div className="flex-1">
                            <h4 className={`font-black text-2xl tracking-tight ${submitResult.accepted ? 'text-success' : 'text-error'}`}>
                              {submitResult.accepted ? 'Accepted!' : (typeof submitResult.error === 'object' ? JSON.stringify(submitResult.error) : (submitResult.error || 'Wrong Answer'))}
                            </h4>

                            {submitResult.error && !submitResult.accepted && typeof submitResult.error === 'string' && submitResult.error.length > 30 && (
                              <div className="mt-4 bg-error/5 border border-error/20 p-4 rounded-xl font-mono text-sm text-error/90 whitespace-pre-wrap">
                                {submitResult.error}
                              </div>
                            )}

                            {submitResult.pointsAwarded !== undefined && submitResult.pointsAwarded > 0 && (
                              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-xl text-yellow-600 dark:text-yellow-400 font-bold">
                                <Sparkles size={18} className="text-yellow-500" />
                                <span>You earned +{submitResult.pointsAwarded} points for solving this problem!</span>
                              </div>
                            )}

                            {submitResult.passedTestCases !== undefined && (
                              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-base-100 p-4 rounded-xl border border-base-300 shadow-sm flex flex-col justify-center items-center">
                                  <span className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1">Test Cases</span>
                                  <div className="flex items-baseline gap-1">
                                    <span className={`text-xl font-bold ${submitResult.passedTestCases === submitResult.totalTestCases ? 'text-success' : 'text-error'}`}>
                                      {submitResult.passedTestCases}
                                    </span>
                                    <span className="text-sm font-medium text-base-content/50">/ {submitResult.totalTestCases}</span>
                                  </div>
                                </div>

                                {submitResult.runtime !== undefined && (
                                  <div className="bg-base-100 p-4 rounded-xl border border-base-300 shadow-sm flex flex-col justify-center items-center">
                                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1">Runtime</span>
                                    <div className="flex items-center gap-2">
                                      <Clock size={16} className="text-primary/70" />
                                      <span className="text-lg font-bold font-mono text-base-content/90">{submitResult.runtime}s</span>
                                    </div>
                                  </div>
                                )}

                                {submitResult.memory !== undefined && (
                                  <div className="bg-base-100 p-4 rounded-xl border border-base-300 shadow-sm flex flex-col justify-center items-center">
                                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1">Memory</span>
                                    <div className="flex items-center gap-2">
                                      <Database size={16} className="text-secondary/70" />
                                      <span className="text-lg font-bold font-mono text-base-content/90">{submitResult.memory} KB</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[60%] text-base-content/40 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center">
                        <PlayCircle size={32} className="opacity-50" />
                      </div>
                      <p className="font-medium text-center max-w-xs">Submit your code to see the final evaluation metrics.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-base-300 flex justify-between shrink-0">
              <div className="flex gap-2">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setActiveRightTab('testcase')}
                >
                  Console
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  className={`btn btn-outline btn-sm ${loading ? 'loading' : ''}`}
                  onClick={handleRun}
                  disabled={loading}
                >
                  Run
                </button>
                <button
                  className={`btn btn-primary btn-sm ${loading ? 'loading' : ''}`}
                  onClick={handleSubmitCode}
                  disabled={loading}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;