import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate, NavLink } from 'react-router';
import { useState } from 'react';

// Zod schema matching the problem schema
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp', 'string', 'math']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminPanel() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await axiosClient.post('/problem/create', data);
      alert('Problem created successfully!');
      navigate('/');
    } catch (error) {
      const errorData = error.response?.data;
      const serverMsg = typeof errorData === 'string' ? errorData : errorData?.message;
      alert(`Error: ${serverMsg || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200/30 pb-12">
      <div className="navbar bg-base-100/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-base-300 px-4 lg:px-8">
        <NavLink to="/" className="btn btn-ghost text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          CodeKshetra AI
        </NavLink>
      </div>

      <div className="container mx-auto p-4 lg:p-8 max-w-5xl mt-6 lg:mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-base-content mb-3">Create New Problem</h1>
          <p className="text-base-content/60 text-lg max-w-2xl">Define problem details, test cases, and starter code templates.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* Basic Information */}
          <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            <div className="bg-base-200/50 px-8 py-5 border-b border-base-300">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">📝</div>
                Basic Information
              </h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Problem Title</span>
                </label>
                <input
                  {...register('title')}
                  placeholder="e.g. Two Sum"
                  className={`input input-bordered w-full bg-base-200/50 focus:bg-base-100 focus:ring-2 focus:ring-primary/50 transition-all ${errors.title ? 'input-error border-error' : ''}`}
                />
                {errors.title && (
                  <span className="text-error text-sm mt-1.5 flex items-center gap-1 font-medium"><svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.title.message}</span>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description (Markdown Supported)</span>
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Explain the problem here..."
                  className={`textarea textarea-bordered h-40 bg-base-200/50 focus:bg-base-100 focus:ring-2 focus:ring-primary/50 transition-all resize-y ${errors.description ? 'textarea-error border-error' : ''}`}
                />
                {errors.description && (
                  <span className="text-error text-sm mt-1.5 flex items-center gap-1 font-medium"><svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.description.message}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Difficulty Level</span>
                  </label>
                  <select
                    {...register('difficulty')}
                    className={`select select-bordered bg-base-200/50 focus:bg-base-100 focus:ring-2 focus:ring-primary/50 transition-all ${errors.difficulty ? 'select-error border-error' : ''}`}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Primary Tag</span>
                  </label>
                  <select
                    {...register('tags')}
                    className={`select select-bordered bg-base-200/50 focus:bg-base-100 focus:ring-2 focus:ring-primary/50 transition-all ${errors.tags ? 'select-error border-error' : ''}`}
                  >
                    <option value="array">Array</option>
                    <option value="linkedList">Linked List</option>
                    <option value="graph">Graph</option>
                    <option value="dp">Dynamic Programming</option>
                    <option value="string">String</option>
                    <option value="math">Math</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Test Cases */}
          <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            <div className="bg-base-200/50 px-8 py-5 border-b border-base-300">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">🧪</div>
                Test Cases
              </h2>
            </div>

            <div className="p-8 space-y-10">
              {/* Visible Test Cases */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-base-300 pb-3">
                  <h3 className="text-lg font-bold text-base-content/80">Visible Test Cases</h3>
                  <button
                    type="button"
                    onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                    className="btn btn-sm btn-outline hover:btn-secondary gap-2 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    Add Visible Case
                  </button>
                </div>

                <div className="space-y-6">
                  {visibleFields.map((field, index) => (
                    <div key={field.id} className="group relative bg-base-200/30 border border-base-300 p-6 rounded-2xl hover:border-secondary/50 transition-colors">
                      <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => removeVisible(index)}
                          className="btn btn-circle btn-sm btn-error shadow-lg shadow-error/30"
                          title="Remove Case"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="form-control">
                            <label className="label pb-1 pt-0"><span className="text-xs font-bold uppercase tracking-wider text-base-content/50">Input</span></label>
                            <input
                              {...register(`visibleTestCases.${index}.input`)}
                              placeholder="e.g. nums = [2,7,11,15], target = 9"
                              className="input input-bordered w-full font-mono text-sm bg-base-100 focus:border-secondary transition-all"
                            />
                          </div>
                          <div className="form-control">
                            <label className="label pb-1 pt-0"><span className="text-xs font-bold uppercase tracking-wider text-base-content/50">Output</span></label>
                            <input
                              {...register(`visibleTestCases.${index}.output`)}
                              placeholder="e.g. [0,1]"
                              className="input input-bordered w-full font-mono text-sm bg-base-100 focus:border-secondary transition-all"
                            />
                          </div>
                        </div>
                        <div className="form-control">
                          <label className="label pb-1 pt-0"><span className="text-xs font-bold uppercase tracking-wider text-base-content/50">Explanation</span></label>
                          <textarea
                            {...register(`visibleTestCases.${index}.explanation`)}
                            placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                            className="textarea textarea-bordered h-20 w-full bg-base-100 resize-none focus:border-secondary transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {visibleFields.length === 0 && (
                    <div className="text-center py-8 text-base-content/40 border-2 border-dashed border-base-300 rounded-2xl">
                      No visible test cases added yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Hidden Test Cases */}
              <div className="space-y-6 pt-6">
                <div className="flex justify-between items-center border-b border-base-300 pb-3">
                  <h3 className="text-lg font-bold text-base-content/80">Hidden Test Cases</h3>
                  <button
                    type="button"
                    onClick={() => appendHidden({ input: '', output: '' })}
                    className="btn btn-sm btn-outline hover:btn-accent gap-2 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    Add Hidden Case
                  </button>
                </div>

                <div className="space-y-6">
                  {hiddenFields.map((field, index) => (
                    <div key={field.id} className="group relative bg-base-200/30 border border-base-300 p-6 rounded-2xl hover:border-accent/50 transition-colors">
                      <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => removeHidden(index)}
                          className="btn btn-circle btn-sm btn-error shadow-lg shadow-error/30"
                          title="Remove Case"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                          <label className="label pb-1 pt-0"><span className="text-xs font-bold uppercase tracking-wider text-base-content/50">Input</span></label>
                          <input
                            {...register(`hiddenTestCases.${index}.input`)}
                            placeholder="Input"
                            className="input input-bordered w-full font-mono text-sm bg-base-100 focus:border-accent transition-all"
                          />
                        </div>
                        <div className="form-control">
                          <label className="label pb-1 pt-0"><span className="text-xs font-bold uppercase tracking-wider text-base-content/50">Expected Output</span></label>
                          <input
                            {...register(`hiddenTestCases.${index}.output`)}
                            placeholder="Output"
                            className="input input-bordered w-full font-mono text-sm bg-base-100 focus:border-accent transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {hiddenFields.length === 0 && (
                    <div className="text-center py-8 text-base-content/40 border-2 border-dashed border-base-300 rounded-2xl">
                      No hidden test cases added yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Code Templates */}
          <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            <div className="bg-base-200/50 px-8 py-5 border-b border-base-300">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">💻</div>
                Code Templates
              </h2>
            </div>

            <div className="p-8 space-y-10">
              {[0, 1, 2].map((index) => {
                const langMap = { 0: 'C++', 1: 'Java', 2: 'JavaScript' };
                const langColorMap = { 0: 'text-blue-500', 1: 'text-orange-500', 2: 'text-yellow-500' };
                return (
                  <div key={index} className="space-y-4 border border-base-300 bg-base-200/20 p-6 rounded-2xl">
                    <h3 className={`font-bold text-xl flex items-center gap-2 ${langColorMap[index]}`}>
                      <span className="w-2.5 h-2.5 rounded-full bg-current"></span>
                      {langMap[index]}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-control">
                        <label className="label pb-2 pt-0"><span className="text-sm font-semibold text-base-content/70">Starter Code</span></label>
                        <div className="rounded-xl overflow-hidden bg-[#1e1e1e] border border-neutral-800 shadow-inner group transition-all focus-within:ring-2 focus-within:ring-accent/50 focus-within:border-accent">
                          <div className="bg-[#2d2d2d] px-3 py-1.5 flex gap-1.5 border-b border-white/5 opacity-50 group-hover:opacity-100 transition-opacity">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                          </div>
                          <textarea
                            {...register(`startCode.${index}.initialCode`)}
                            className="w-full bg-transparent text-neutral-100 font-mono text-sm p-4 outline-none resize-y selection:bg-primary/30 min-h-[160px]"
                            rows={8}
                            spellCheck={false}
                            placeholder={`// Write ${langMap[index]} starter code here`}
                          />
                        </div>
                      </div>

                      <div className="form-control">
                        <label className="label pb-2 pt-0"><span className="text-sm font-semibold text-base-content/70">Reference Solution</span></label>
                        <div className="rounded-xl overflow-hidden bg-[#1e1e1e] border border-neutral-800 shadow-inner group transition-all focus-within:ring-2 focus-within:ring-accent/50 focus-within:border-accent">
                          <div className="bg-[#2d2d2d] px-3 py-1.5 flex gap-1.5 border-b border-white/5 opacity-50 group-hover:opacity-100 transition-opacity">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                          </div>
                          <textarea
                            {...register(`referenceSolution.${index}.completeCode`)}
                            className="w-full bg-transparent text-neutral-100 font-mono text-sm p-4 outline-none resize-y selection:bg-primary/30 min-h-[160px]"
                            rows={8}
                            spellCheck={false}
                            placeholder={`// Write ${langMap[index]} reference solution here`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 pb-8">
            <button
              type="submit"
              className="btn btn-primary btn-lg w-full text-lg shadow-lg shadow-primary/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner text-primary-content"></span>
                  Publishing Problem...
                </>
              ) : (
                'Publish Problem to Platform'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;