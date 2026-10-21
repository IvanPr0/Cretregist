/* Иконки предметов берутся из локальной папки assets/item-images/.
   Внешний сервер ligmar.io отдаёт HTML-заглушку вместо картинок предметов и умений,
   поэтому удалённые адреса здесь больше не используются. */
const placeholderImage="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='8' fill='%23241c33'/%3E%3Crect x='1' y='1' width='62' height='62' rx='7' fill='none' stroke='%234b3a63'/%3E%3Ctext x='32' y='43' font-family='Georgia,serif' font-size='30' fill='%237e6a99' text-anchor='middle'%3E%3F%3C/text%3E%3C/svg%3E";
const known=new Set();
const byStandard=new Map(),byLegendary=new Map();
let indexPromise=null;
function loadIndex(){
 if(!indexPromise)indexPromise=(typeof fetch==='function'?fetch('assets/item-images/index.json?v=item-images-2'):Promise.resolve(null)).then(r=>r.ok?r.json():null).then(index=>{
  for(const entry of index?.images||[]){
   known.add(entry.file);
   for(const b of entry.blueprints||[])(b.blueprint_quality==='legendary'?byLegendary:byStandard).set(b.template_id,entry.file);
  }
 }).catch(()=>{});
 return indexPromise;
}
loadIndex();
const local=file=>known.has(file)?`assets/item-images/${file}`:placeholderImage;
export function itemImage(item,quality){
 if(!item)return placeholderImage;
 if(item.preset?.image)return item.preset.image;
 const variant=quality==='legendary'?byLegendary:byStandard;
 if(item.template_id&&variant.has(item.template_id))return local(variant.get(item.template_id));
 if(item.image_path)return local(String(item.image_path).replace(/^item-images\//,''));
 if(item.item_type&&item.item_subtype)return local(`gear/${item.item_type}-${item.item_subtype}-${quality==='legendary'?'epic':'common'}.webp`);
 return placeholderImage;
}
export const itemImagePlaceholder=placeholderImage;
