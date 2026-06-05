import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Building2, Search, Trash2, Calendar, ShieldCheck, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLeadsQuery, useDeleteLeadMutation } from '../hooks/useLeads';
import { formatDate, getAvatarUrl } from '../utils/helpers';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Load Converted leads only
  const { data, isLoading } = useLeadsQuery({
    page,
    limit: 10,
    status: 'Converted',
    sort: 'updated_at',
  });

  const deleteMutation = useDeleteLeadMutation();

  const leads = data?.leads || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success('Customer record removed');
        setDeleteOpen(false);
        setDeleteId(null);
      },
      onError: () => {
        toast.error('Failed to delete customer record');
        setDeleteOpen(false);
      }
    });
  };

  const filteredCustomers = leads.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" size={24} />
            <span>Converted Customers</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Accounts converted from qualified leads that are successfully won
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
            {total} Won Customers
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl shadow-soft overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-150 dark:border-slate-800 flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search customers by name, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
            />
          </div>
        </div>

        {/* List / Table */}
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-lg" />
              <div className="h-16 bg-gray-50 dark:bg-slate-900 rounded-lg" />
              <div className="h-16 bg-gray-50 dark:bg-slate-900 rounded-lg" />
            </div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-gray-400 mx-auto mb-4 border border-gray-100 dark:border-slate-750">
              <Building2 size={20} />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">No customers converted yet</h3>
            <p className="text-xs text-gray-500 dark:text-slate-455 max-w-xs mx-auto">
              Go to the Leads Directory to qualify and convert leads to won deals.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-900/80 text-gray-500 dark:text-slate-400 font-semibold border-b border-gray-150 dark:border-slate-800">
                  <th className="px-6 py-3.5">Client & Company</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5 font-semibold">Lead Source</th>
                  <th className="px-6 py-3.5">Close Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-855">
                {filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Name & Company */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={getAvatarUrl(customer.name)} alt="" className="w-9 h-9 rounded-full border border-gray-150 shadow-sm flex-shrink-0" />
                        <div>
                          <div 
                            className="font-bold text-gray-900 dark:text-gray-100 hover:underline cursor-pointer"
                            onClick={() => navigate(`/leads/${customer.id}`)}
                          >
                            {customer.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-450 flex items-center gap-1 mt-0.5">
                            <Building2 size={12} className="text-gray-400" />
                            <span>{customer.company}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-750 dark:text-slate-300 flex items-center gap-1.5">
                          <Mail size={12} className="text-gray-400" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="text-xs text-gray-550 dark:text-slate-400 flex items-center gap-1.5">
                          <Phone size={12} className="text-gray-400" />
                          <span>{customer.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-gray-650 dark:text-slate-355 font-medium">
                        {customer.source || 'Web'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-gray-705 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar size={12} className="text-gray-450" />
                        <span>{formatDate(customer.createdAt)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/leads/${customer.id}`)}
                          className="p-1.5 text-gray-400 hover:text-indigo-650 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <ExternalLink size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(customer.id);
                            setDeleteOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                          title="Remove Record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-150 dark:border-slate-800">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleDelete}
        title="Remove Customer Record"
        message="Are you sure you want to delete this customer record? This action will completely erase their details from the database."
      />
    </div>
  );
};

export default Customers;
