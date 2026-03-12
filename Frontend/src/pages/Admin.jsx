import React, { useState } from 'react';
import { Plus, Edit, Trash2, Home, RefreshCw, Zap, Video } from 'lucide-react';
import { NavLink } from 'react-router';

function Admin() {
  const [selectedOption, setSelectedOption] = useState(null);

  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem with test cases and template to the platform',
      icon: Plus,
      color: 'from-success/80 to-success',
      shadowColor: 'shadow-success/20',
      bgColor: 'bg-success/10',
      textColor: 'text-success',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems, tweak test cases, or modify difficulties',
      icon: Edit,
      color: 'from-warning/80 to-warning',
      shadowColor: 'shadow-warning/20',
      bgColor: 'bg-warning/10',
      textColor: 'text-warning',
      route: '/admin/update'
    },
    {
      id: 'video',
      title: 'Manage Videos',
      description: 'Upload, delete, and link solution walkthrough videos',
      icon: Video,
      color: 'from-info/80 to-info',
      shadowColor: 'shadow-info/20',
      bgColor: 'bg-info/10',
      textColor: 'text-info',
      route: '/admin/video'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Permanently remove problems from the platform database',
      icon: Trash2,
      color: 'from-error/80 to-error',
      shadowColor: 'shadow-error/20',
      bgColor: 'bg-error/10',
      textColor: 'text-error',
      route: '/admin/delete'
    }
  ];

  return (
    <div className="min-h-screen bg-base-300 font-sans pb-12 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Premium Navbar */}
      <nav className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-lg border-b border-base-content/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-bold text-xl shadow-lg shadow-primary/20">
                A
              </div>
              <NavLink to="/" className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-base-content to-base-content/70">
                Admin <span className="text-primary">Dashboard</span>
              </NavLink>
            </div>

            <div className="flex items-center gap-4">
              <NavLink to="/" className="btn btn-ghost btn-sm sm:btn-md gap-2 font-bold">
                <Home size={18} />
                Back to Main Site
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-base-100/60 backdrop-blur-xl p-8 rounded-3xl border border-base-200/50 shadow-sm mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-4">
              <Zap size={16} />
              <span>Platform Control Center</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2">
              Manage CodeKshetra
            </h1>
            <p className="text-base-content/60 text-lg font-medium max-w-xl">
              Select an action below to modify the platform's coding problems, test cases, and video resources.
            </p>
          </div>

          <div className="hidden md:flex bg-base-200 p-4 rounded-full border border-base-300">
            <RefreshCw size={24} className="text-base-content/40 hover:text-primary transition-colors cursor-pointer" />
          </div>
        </div>

        {/* Action Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {adminOptions.map((option, idx) => {
            const IconComponent = option.icon;
            return (
              <NavLink
                to={option.route}
                key={option.id}
                className="group relative bg-base-100/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-base-200/50 hover:border-base-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col items-start text-left animate-in fade-in slide-in-from-bottom-8"
                style={{ animationFillMode: 'both', animationDelay: `${idx * 100}ms` }}
              >
                {/* Hover Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                <div className="relative z-10 flex items-start gap-6 w-full">
                  <div className={`w-16 h-16 rounded-2xl ${option.bgColor} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <IconComponent size={32} className={option.textColor} />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight mb-2 group-hover:text-base-content transition-colors">
                      {option.title}
                    </h2>
                    <p className="text-base-content/60 font-medium mb-6 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-auto ml-[88px] flex items-center gap-2 font-bold text-sm tracking-wide uppercase">
                  <span className={`${option.textColor}`}>Access Module</span>
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${option.color} ${option.shadowColor} shadow-md flex items-center justify-center text-white transform group-hover:translate-x-2 transition-transform duration-300`}>
                    <Plus size={14} className={option.id === 'delete' ? 'rotate-45' : ''} />
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Admin;