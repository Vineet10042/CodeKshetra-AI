import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { History, CheckCircle2, XCircle, Clock, Database, AlertCircle, Code2, X } from 'lucide-react';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        setSubmissions(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'badge-success';
      case 'wrong': return 'badge-error';
      case 'error': return 'badge-warning';
      case 'pending': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  const formatMemory = (memory) => {
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/5 border border-error/20 p-4 rounded-xl flex items-center gap-3 text-error/90 max-w-md mx-auto my-8">
        <AlertCircle size={20} className="shrink-0" />
        <span className="text-sm font-medium">{error}</span>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col h-full overflow-hidden text-base-content relative bg-base-100/50">

      {/* Background Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-3xl rounded-full pointer-events-none"></div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar z-10">
        {!Array.isArray(submissions) || submissions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-12">
            <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center">
              <History size={32} className="text-base-content/30" />
            </div>
            <div>
              <h3 className="text-lg font-bold">No Submissions Yet</h3>
              <p className="text-base-content/60 max-w-sm mt-1">When you submit code for this problem, your history will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub, index) => {
              const safeStatus = sub.status || 'pending';
              const isAccepted = safeStatus.toLowerCase() === 'accepted';

              return (
                <div key={sub._id || index} className="group bg-base-100 rounded-xl border border-base-300 shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">

                    {/* Status & Date */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isAccepted ? (
                          <CheckCircle2 size={18} className="text-success" />
                        ) : (
                          <XCircle size={18} className="text-error" />
                        )}
                        <span className={`font-bold text-lg tracking-tight ${isAccepted ? 'text-success' : 'text-error'}`}>
                          {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-base-content/50">
                        Submitted {formatDate(sub.createdAt)}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex flex-wrap items-center gap-4 md:gap-6 bg-base-200/50 px-4 py-3 rounded-lg border border-base-300">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/50 mb-0.5">Language</span>
                        <span className="text-sm font-mono font-bold">{sub.language}</span>
                      </div>
                      <div className="w-px h-8 bg-base-300 hidden md:block"></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/50 mb-0.5">Runtime</span>
                        <div className="flex items-center gap-1.5 text-sm font-mono font-medium">
                          <Clock size={14} className="text-base-content/50" /> {sub.runtime}s
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/50 mb-0.5">Memory</span>
                        <div className="flex items-center gap-1.5 text-sm font-mono font-medium">
                          <Database size={14} className="text-base-content/50" /> {formatMemory(sub.memory)}
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="shrink-0 flex items-center md:pl-2">
                      <button
                        className="btn btn-sm btn-ghost hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        <Code2 size={16} /> View Code
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}

            <p className="text-center mt-6 text-sm font-bold text-base-content/40 tracking-wider uppercase">
              Showing {submissions.length} submissions
            </p>
          </div>
        )}
      </div>

      {/* Code View Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-base-100 w-full max-w-4xl rounded-2xl shadow-2xl border border-base-content/10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-base-content/10 bg-base-200/50">
              <div className="flex items-center gap-3">
                <Code2 className="text-primary" size={24} />
                <h3 className="font-bold text-xl tracking-tight">
                  Submission Code
                </h3>
                <span className="px-2.5 py-1 bg-base-300 text-base-content/80 rounded-md text-xs font-black uppercase tracking-wider ml-2">
                  {selectedSubmission.language}
                </span>
              </div>
              <button
                className="btn btn-circle btn-ghost btn-sm"
                onClick={() => setSelectedSubmission(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-base-100 flex flex-col gap-6">

              <div className="flex flex-wrap gap-3">
                <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 font-bold text-sm ${selectedSubmission.status?.toLowerCase() === 'accepted' ? 'bg-success/10 border-success/30 text-success' : 'bg-error/10 border-error/30 text-error'}`}>
                  {selectedSubmission.status?.toLowerCase() === 'accepted' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {selectedSubmission.status}
                </div>
                <div className="flex items-center gap-2 bg-base-200/50 px-3 py-1.5 rounded-lg border border-base-300 text-sm font-medium">
                  <Clock size={16} className="text-base-content/60" /> {selectedSubmission.runtime}s
                </div>
                <div className="flex items-center gap-2 bg-base-200/50 px-3 py-1.5 rounded-lg border border-base-300 text-sm font-medium">
                  <Database size={16} className="text-base-content/60" /> {formatMemory(selectedSubmission.memory)}
                </div>
              </div>

              {selectedSubmission.errorMessage && (
                <div className="bg-error/5 border border-error/20 p-4 rounded-xl flex items-start gap-3 text-error/90 font-mono text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span className="whitespace-pre-wrap">{selectedSubmission.errorMessage}</span>
                </div>
              )}

              <div className="flex-1 rounded-xl border border-base-content/10 overflow-hidden bg-[#1e1e1e]">
                <div className="bg-base-300/50 px-4 py-2 border-b border-base-content/10 flex items-center">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-error/50"></div>
                    <div className="w-3 h-3 rounded-full bg-warning/50"></div>
                    <div className="w-3 h-3 rounded-full bg-success/50"></div>
                  </div>
                </div>
                <pre className="p-4 text-sm font-mono text-[#d4d4d4] overflow-x-auto custom-scrollbar m-0">
                  <code>{selectedSubmission.code}</code>
                </pre>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;