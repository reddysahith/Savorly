import {ArrowRight,Clock} from 'lucide-react'; import {Button} from '../common/Button'; import {Recipe} from '../../types/recipe'; export function HeroTodayCard({onCook, recipe}:{onCook:(r:Recipe)=>void, recipe?:Recipe}){
  if (!recipe) {
    return <section className="card hero"><div className="eyebrow" style={{color:'#d7edda'}}>Tonight</div><h2>Let's plan something</h2><p>Add some recipes to your library to get started.</p></section>
  }
  const totalMinutes = Math.round(((recipe.prepSeconds || 0) + (recipe.cookSeconds || 0)) / 60);
  return <section className="card hero" style={{background: recipe.coverColor !== '#ffffff' ? recipe.coverColor : undefined}}>
    <div className="eyebrow" style={{color:'#d7edda', mixBlendMode: 'difference'}}>Tonight</div>
    <h2 style={{mixBlendMode: 'difference'}}>{recipe.title}</h2>
    <p style={{mixBlendMode: 'difference'}}>{recipe.description}</p>
    <div style={{display:'flex',gap:10,marginTop:22}}>
      <Button onClick={()=>onCook(recipe)}><span>Start cooking</span><ArrowRight size={16}/></Button>
      {totalMinutes > 0 && <span style={{display:'flex',alignItems:'center',gap:5,fontSize:13}}><Clock size={15}/> {totalMinutes} min</span>}
    </div>
    <div className="stat-row">
      <div className="stat"><strong style={{mixBlendMode: 'difference'}}>{recipe.yieldValue || 2}</strong><span style={{mixBlendMode: 'difference'}}>servings</span></div>
      <div className="stat"><strong style={{mixBlendMode: 'difference'}}>{recipe.ingredients?.length || 0}</strong><span style={{mixBlendMode: 'difference'}}>ingredients</span></div>
    </div>
  </section>}
