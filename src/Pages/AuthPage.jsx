import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '../api/Supabase';

const AuthPage = ({ type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = type === 'signup' 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) {
    toast.error(error.message); // Purana alert hata kar toast lagaya
  } else {
    toast.success(type === 'signup' ? 'Account Created! Please check email' : 'Welcome Back!');
  }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 font-sans">
      <div className="max-w-md w-full bg-[#111] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="p-4 bg-blue-600 rounded-2xl shadow-xl mb-4"><TrendingUp className="text-white" size={32}/></div>
          <h2 className="text-3xl font-black text-white">{type === 'signup' ? 'Create Account' : 'Welcome Back'}</h2>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="email" placeholder="Email" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 ring-blue-600" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 ring-blue-600" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all">
            {loading ? <Loader2 className="animate-spin mx-auto"/> : type === 'signup' ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-slate-500 mt-6 text-sm">
          <Link to={type === 'signup' ? '/login' : '/signup'} className="text-blue-500 font-bold hover:underline">
            {type === 'signup' ? 'Already have an account? Login' : "New here? Create account"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;