import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard, Wallet, LogOut, Plus, TrendingUp, ArrowUpRight, ArrowDownLeft, FileText, Trash2, Edit3, XCircle, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../api/Supabase';
import { exportTransactionsToPDF } from '../utils/ExportPdf';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', amount: '' });
  const [editingId, setEditingId] = useState(null);

  const { data: txs = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload) => {
      const { data: { user } } = await supabase.auth.getUser();
      const amountValue = parseFloat(payload.amount);
      if (editingId) {
        return await supabase.from('transactions').update({ name: payload.name, amount: amountValue }).eq('id', editingId);
      }
      return await supabase.from('transactions').insert([{ ...payload, amount: amountValue, user_id: user.id }]);
    },
    onSuccess: () => {
      qc.invalidateQueries(['transactions']);
      setForm({ name: '', amount: '' });
      setEditingId(null);
      toast.success(editingId ? 'Entry Updated!' : 'Entry Added Successfully!')
    },
    onError: (error) => {
    toast.error('Something went wrong: ' + error.message);
  }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await supabase.from('transactions').delete().eq('id', id),
    onSuccess: () => qc.invalidateQueries(['transactions'])
  });

  const total = txs.reduce((acc, curr) => acc + curr.amount, 0);

  // Helper to handle export with basic validation
  const handleExport = () => {
    if (txs.length === 0) return alert("No transactions to export!");
    exportTransactionsToPDF(txs);
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa] font-sans">
      {/* Sidebar */}
      <aside className="w-20 lg:w-72 bg-[#0a0a0a] m-4 rounded-[2.5rem] p-6 lg:p-8 flex flex-col items-center lg:items-start shadow-2xl">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20"><TrendingUp size={24}/></div>
          <span className="text-2xl font-black text-white hidden lg:block tracking-tighter">ZENITH.</span>
        </div>
        
        <nav className="flex-1 w-full space-y-2">
          <div className="flex items-center gap-3 p-4 bg-white/10 text-white rounded-2xl font-bold">
            <LayoutDashboard size={20}/> 
            <span className="hidden lg:block">Dashboard</span>
          </div>
          
          {/* Sidebar Export Button */}
          <button 
            onClick={handleExport}
            className="w-full flex items-center gap-3 p-4 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
          >
            <FileText size={20}/> 
            <span className="hidden lg:block">Export PDF</span>
          </button>
        </nav>

        <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-3 p-4 text-slate-500 hover:text-rose-500 font-bold transition-colors">
          <LogOut size={20}/> 
          <span className="hidden lg:block">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Portfolio Overview</h1>
            <p className="text-slate-500 font-medium italic">Empower your finances.</p>
          </div>

          {/* New Header Export Button - Always visible on tablets/desktops */}
          <button 
            onClick={handleExport}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <FileText size={18} className="text-blue-600" />
            <span>Download PDF</span>
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
            {/* Net Wealth Card */}
            <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
              <div className="relative z-10">
                <p className="text-blue-100 font-bold uppercase tracking-widest text-[10px] mb-1">Net Wealth</p>
                <h2 className="text-5xl font-black tracking-tighter">${total.toLocaleString()}</h2>
              </div>
              <Wallet size={150} className="absolute -right-10 -bottom-10 opacity-10" />
            </div>

            {/* Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
               <h3 className="font-black text-xl mb-6">Asset Growth</h3>
               <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[...txs].reverse()}>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transaction List */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="font-black text-xl mb-6">Recent Ledger</h3>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600"/></div>
                ) : txs.length === 0 ? (
                  <p className="text-center text-slate-400 py-10">No records found. Add an entry below.</p>
                ) : (
                  txs.map(t => (
                    <div key={t.id} className="group flex justify-between items-center p-4 bg-slate-50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${t.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {t.amount > 0 ? <ArrowUpRight size={18}/> : <ArrowDownLeft size={18}/>}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{t.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{new Date(t.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-black ${t.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {t.amount > 0 ? '+' : ''}{t.amount}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => {setEditingId(t.id); setForm({name: t.name, amount: t.amount})}} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 size={16}/></button>
                          <button onClick={() => deleteMutation.mutate(t.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Add Form */}
          <div className="xl:col-span-4">
            <div className="bg-[#111] p-8 rounded-[2.5rem] shadow-2xl sticky top-10">
              <h3 className="text-white text-xl font-black mb-6 flex items-center gap-2">
                {editingId ? <Edit3 className="text-blue-500" /> : <Plus className="text-blue-500" />}
                {editingId ? 'Edit Entry' : 'Quick Add'}
              </h3>
              <form onSubmit={(e) => { e.preventDefault(); upsertMutation.mutate(form); }} className="space-y-4">
                <input 
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 ring-blue-600 transition-all" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  placeholder="Label (e.g. Salary)" 
                  required 
                />
                <input 
                  type="number" 
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 ring-blue-600 transition-all" 
                  value={form.amount} 
                  onChange={e => setForm({...form, amount: e.target.value})} 
                  placeholder="Amount ($)" 
                  required 
                />
                <button 
                  disabled={upsertMutation.isPending}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-black transition-all shadow-lg shadow-blue-500/20"
                >
                  {upsertMutation.isPending ? <Loader2 className="animate-spin mx-auto"/> : (editingId ? 'Update Entry' : 'Add Entry')}
                </button>
                {editingId && (
                  <button 
                    type="button"
                    onClick={() => {setEditingId(null); setForm({name:'', amount:''})}} 
                    className="w-full text-slate-500 text-sm font-bold flex items-center justify-center gap-1 hover:text-white mt-2"
                  >
                    <XCircle size={14}/> Cancel Edit
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;