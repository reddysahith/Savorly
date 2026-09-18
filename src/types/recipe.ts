export interface IngredientLine { id:string; rawText:string; quantity:number; unit:string; ingredientName:string; aisle:string; optional?:boolean }
export interface InstructionStep { position:number; body:string; durationSeconds?:number }
export interface Recipe { id:string; title:string; description:string; yieldValue:number; prepSeconds:number; cookSeconds:number; visibility:'private'|'household'|'public'; ingredients:IngredientLine[]; instructions:InstructionStep[]; tags:string[]; author:string; coverColor:string }
