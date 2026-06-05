import React, { useState, useEffect } from 'react';
import { Mail, Phone, Building2, Search, Trash2, Calendar, ShieldCheck, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { getLeads, deleteLead } from '../services/api';
import { formatDate } from '../utils/helpers';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const [deleteId, setDeleteId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await getLeads({
        page,
        limit: 10,
        status: 'Converted',
        sort: 'updated_at', // Converted customers sorted by when they were updated/won
      });
      setCustomers(data.leads || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load customers list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteLead(deleteId);
      toast.success('Customer record removed');
      loadCustomers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete customer');
    } finally {
      setDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" size={24} />
            <span>Converted Customers</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Accounts converted from leads that are successfully closed won
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
            {total} Active Customers
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-soft overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search customers by name, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
            />
          </div>
        </div>

        {/* List / Table */}
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-lg" />
              <div className="h-16 bg-gray-50 dark:bg-slate-900 rounded-lg" />
              <div className="h-16 bg-gray-50 dark:bg-slate-900 rounded-lg" />
            </div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-gray-400 mx-auto mb-4 border border-gray-100 dark:border-slate-700">
              <Building2 size={20} />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">No customers won yet</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 max-w-xs mx-auto">
              Go to the Leads Directory to qualify and convert leads to won deals.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-900/80 text-gray-500 dark:text-slate-400 font-semibold border-b border-gray-100 dark:border-slate-800">
                  <th className="px-6 py-3.5">Client & Company</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5">Conversion Date</th>
                  <th className="px-6 py-3.5">Notes Summary</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Name & Company */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30 text-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {customer.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 size={12} className="text-gray-400" />
                            <span>{customer.company}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Mail size={12} className="text-gray-400" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Phone size={12} className="text-gray-400" />
                          <span>{customer.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-gray-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar size={12} className="text-gray-400" />
                        <span>{formatDate(customer.updatedAt || customer.created_at)}</span>
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="px-6 py-4 max-w-xs truncate text-xs text-gray-500 dark:text-slate-400">
                      {customer.notes || <span className="italic text-gray-400">No client notes</span>}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setDeleteId(customer.id);
                            setDeleteOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                          title="Remove Customer"
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
          <div className="p-4 border-t border-gray-100 dark:border-slate-800">
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
