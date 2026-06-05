import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

const Navbar = ({ title, toggleSidebar, searchValue, onSearchChange }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-4">
        {/* Toggle mobile sidebar */}
        <button 
          onClick={toggleSidebar}
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700 md:hidden focus:outline-none focus:ring-2 focus:ring-slate-650"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-100">{title || 'Dashboard'}</h1>
      </div>

      {/* Conditional search bar inside navbar (hidden on small devices) */}
      <div className="flex-1 max-w-md mx-8 hidden lg:block">
        {onSearchChange !== undefined && (
          <SearchBar value={searchValue} onChange={onSearchChange} />
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/add-lead')}
          className="bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all duration-200 shadow-md shadow-indigo-650/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Plus size={16} />
          <span className="hidden xs:inline">Add Lead</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
