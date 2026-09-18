import {Bell,Plus,Search,LogOut} from 'lucide-react'; import {Button} from '../common/Button'; import {supabase} from '../../lib/supabase'; import {useEffect, useState} from 'react'; export function Topbar({onAdd}:{onAdd:()=>void}){
  const [initials, setInitials] = useState('MC');
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        const parts = user.user_metadata.full_name.split(' ');
        setInitials(parts.map((p:string) => p[0]).join('').substring(0, 2).toUpperCase());
      } else if (user?.email) {
        setInitials(user.email.substring(0, 2).toUpperCase());
      }
    });
  }, []);
  return <header className="topbar"><div style={{position:'relative'}}><Search size={17} style={{position:'absolute',left:14,top:13,color:'#747a72'}}/><input className="search" style={{paddingLeft:42}} placeholder="Search recipes, ingredients..."/></div><div className="top-actions"><Button className="primary" onClick={onAdd}><Plus size={17}/> Add recipe</Button><Bell size={19} color="#747a72"/><span className="avatar">{initials}</span><button className="btn ghost icon" onClick={()=>supabase.auth.signOut()} title="Log out"><LogOut size={17} color="#747a72"/></button></div></header>}
