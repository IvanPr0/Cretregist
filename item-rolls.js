import {normalizeLegendary} from './model.js?v=legendary-rules-1';
import {presets} from './presets.js?v=gem-catalog-2';
/* Пресеты задают только проценты: свойства остаются теми, что выбрал игрок.
   Всё, что выше 100%, считается древним свойством и включается отдельной кнопкой. */
export const ancientPercent=150;
export const nonAncientPercents=[50,60,70,80,90,100];
export const propertyPresets={'bad':[90,50,50],'mid':[90,90,50],'good':[90,90,90],'100%':[100,90,80]};
export const ancientPresets={'150%':[150,90,90],'150%+':[150,100,100],'150%++':[150,150,100]};
/* Единый набор опций процента: обычные значения, «древка» и значение из старого сохранения. */
export const percentSelectOptions=(list,{ancient=false,current}={})=>[...new Set([...list,...(ancient?[ancientPercent]:[]),...(Number.isFinite(+current)?[+current]:[])])].sort((a,b)=>a-b);
export const percentLabel=v=>`${v}%${+v===ancientPercent?' · древка':''}`;
/* Пересобирает селект процента: 150% появляется в списке только вместе с древним свойством. */
export function applyPercentSelect(select,list,{ancient=false,current=null}={}){
 if(!select)return null;
 const options=percentSelectOptions(list,{ancient,current}),target=ancient?ancientPercent:(Number.isFinite(+current)?+current:options[0]);
 select.innerHTML=options.map(v=>`<option value="${v}">${percentLabel(v)}</option>`).join('');
 const index=options.indexOf(target);
 select.value=String(target);
 if(select.value!==String(target)&&index>=0)select.selectedIndex=index;
 return select.value===String(target)?target:Number(select.value);
}
export function rollItemProperties(state,item,label,random=Math.random){
 const chosen=presets[state.buildPreset];
 const preset=chosen?.classId===state.classId?chosen:Object.values(presets).find(p=>p.classId===state.classId);
 const priorities=[...new Set([...(preset?.priority||[]),...(preset?.balance?['defense','resistance','evasion','health']:[])])];
 const available=Object.keys(item.property_value_ranges),used=new Set(),result=[];
 for(const percent of propertyPresets[label]||ancientPresets[label]||[]){
  const candidates=percent===50?available.filter(k=>!priorities.includes(k)&&!['activationTime','physicalAttackInterval','criticalHitRate'].includes(k)&&!used.has(k)):priorities.filter(k=>available.includes(k)&&!used.has(k));
  const key=percent===50?candidates[Math.floor(random()*candidates.length)]:candidates[0];
  if(key){used.add(key);result.push({key,percent})}
 }
 return item.blueprint_quality==='legendary'?normalizeLegendary(item,{quality:'legendary',props:result}).props:result;
}
