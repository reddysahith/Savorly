import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../common/Button';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 400, marginTop: '8vh' }}>
      <div className="card">
        <h1 className="title" style={{ fontSize: 24, marginBottom: 8 }}>
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="subtitle" style={{ marginBottom: 24 }}>
          {isLogin ? 'Sign in to access your household plan.' : 'Join your household today.'}
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group" style={{ margin: '16px 0' }}>
              <label>Full Name</label>
              <input 
                type="text" 
                className="search" 
                style={{ width: '100%', minWidth: 'auto', paddingLeft: 16 }}
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group" style={{ margin: '16px 0' }}>
            <label>Email</label>
            <input 
              type="email" 
              className="search" 
              style={{ width: '100%', minWidth: 'auto', paddingLeft: 16 }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ margin: '16px 0' }}>
            <label>Password</label>
            <input 
              type="password" 
              className="search" 
              style={{ width: '100%', minWidth: 'auto', paddingLeft: 16 }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <Button className="primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button 
            className="filter" 
            onClick={() => setIsLogin(!isLogin)}
            style={{ margin: 0, padding: 8 }}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
