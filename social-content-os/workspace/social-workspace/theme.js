/* Brand inputs stay exact. Interface roles use a restrained OKLCH scale. */
(function(root){
 'use strict';
 const palettes={demo:['#4c0099','#b1eb1e'],brand_jml:['#4c0099','#b1eb1e'],brand_b4k:['#007cc6','#f7c332'],brand_nn:['#303133','#fcc23b'],brand_mlb:['#002451','#db121a'],brand_jay:['#3b0764','#a81070'],brand_zees:['#030303','#f8c521'],brand_northstar:['#623c2c','#d8b17c']};
 const valid=x=>/^#[0-9a-f]{6}$/i.test(x||'');
 const rgb=hex=>hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255);
 const linear=x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4;
 const srgb=x=>x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055;
 const luminance=hex=>rgb(hex).map(linear).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
 const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
 function oklch(hex){
  const [r,g,b]=rgb(hex).map(linear),l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  const L=.2104542553*l+.793617785*m-.0040720468*s,A=1.9779984951*l-2.428592205*m+.4505937099*s,B=.0259040371*l+.7827717662*m-.808675766*s;
  return {l:L,c:Math.hypot(A,B),h:(Math.atan2(B,A)*180/Math.PI+360)%360};
 }
 function fromLch(L,C,H){
  const raw=c=>{const a=c*Math.cos(H*Math.PI/180),b=c*Math.sin(H*Math.PI/180),l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.291485548*b)**3;return [4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s];};
  let values=raw(C);for(let n=0;n<32&&values.some(x=>x<-.000001||x>1.000001);n++){C*=.86;values=raw(C);}
  return '#'+values.map(x=>Math.round(Math.max(0,Math.min(1,srgb(x)))*255).toString(16).padStart(2,'0')).join('');
 }
 function readable(color,background,ratio=4.5,direction='dark'){
  if(contrast(color,background)>=ratio)return color;
  const {l,c,h}=oklch(color);
  for(let i=1;i<=100;i++){const candidate=fromLch(direction==='light'?l+(1-l)*i/100:l*(1-i/100),c,h);if(contrast(candidate,background)>=ratio)return candidate;}
  return direction==='light'?'#ffffff':'#000000';
 }
 const on=color=>contrast('#ffffff',color)>=4.5?'#ffffff':contrast('#111318',color)>=4.5?'#111318':'#000000';
 function tokens(brand={}){
  const input=palettes[brand.id]||palettes.brand_jml,primary=valid(brand.primary)?brand.primary.toLowerCase():input[0],accent=valid(brand.accent)?brand.accent.toLowerCase():input[1];
  const source=oklch(primary),h=source.c>.006?source.h:oklch(accent).h,n=(l,c)=>fromLch(l,Math.min(c,Math.max(.004,source.c)),h);
  const canvas=n(.978,.007),surface=n(.997,.002),tint=n(.951,.014),chrome=n(.185,.022),chromeRaised=n(.265,.027);
  const ink=n(.25,.018),muted=readable(n(.48,.018),tint),link=readable(primary,tint,4.7),control=readable(n(.66,.019),surface,3.1);
  return {primary,accent,canvas,surface,elevated:'#ffffff',tint,line:n(.877,.014),control,ink,muted,subtle:readable(n(.54,.014),tint),link,icon:muted,focus:readable(primary,surface,3.5),chrome,chromeRaised,chromeLine:n(.37,.025),chromeText:n(.968,.008),chromeMuted:n(.79,.012),chromeAccent:readable(accent,chromeRaised,3.3,'light'),onPrimary:on(primary),onAccent:on(accent),primaryHover:fromLch(Math.max(.05,Math.min(.99,source.l+(on(primary)==='#ffffff'?-.035:.035))),source.c,source.h),success:'#286044',successBg:'#edf5ef',warning:'#784511',warningBg:'#fbf2e4',error:'#a13040',errorBg:'#fbf0f1',info:'#315b7b',infoBg:'#edf3f8'};
 }
 function css(brand){
  const t=tokens(brand),keys={primary:'brand-primary',accent:'brand-accent',canvas:'mist',surface:'paper',tint:'soft',line:'line',control:'control-border',ink:'ink',muted:'muted',subtle:'subtle',link:'purple',icon:'icon',focus:'focus',chrome:'rail',chromeRaised:'rail-raised',chromeLine:'rail-line',chromeText:'rail-text',chromeMuted:'rail-muted',chromeAccent:'rail-accent',onPrimary:'on-primary',onAccent:'on-accent',primaryHover:'primary-hover',success:'green',successBg:'green-bg',warning:'warn',warningBg:'warn-bg',error:'error',errorBg:'error-bg',info:'info',infoBg:'info-bg'};
  return {...Object.fromEntries(Object.entries(keys).map(([key,value])=>['--'+value,t[key]])),'--lime':t.accent,'--brand':t.primary,'--accent':t.accent,'--chrome':t.chrome,'--chrome-raised':t.chromeRaised,'--canvas':t.canvas,'--surface':t.surface,'--surface-raised':t.elevated,'--border':t.line,'--text':t.ink,'--text-secondary':t.muted,'--text-tertiary':t.subtle};
 }
 function apply(brand,doc=root.document){
  if(!doc)return tokens(brand);doc.documentElement.dataset.brandTheme=brand.id||'brand_jml';
  for(const [name,value]of Object.entries(css(brand)))doc.documentElement.style.setProperty(name,value);return tokens(brand);
 }
 function audit(brand){
  const t=tokens(brand),pairs=[['Body / surface','ink','surface',4.5],['Secondary / tint','muted','tint',4.5],['Metadata / tint','subtle','tint',4.5],['Link / tint','link','tint',4.5],['Primary label','onPrimary','primary',4.5],['Accent label','onAccent','accent',4.5],['Navigation label','chromeText','chromeRaised',4.5],['Navigation secondary','chromeMuted','chromeRaised',4.5],['Active marker','chromeAccent','chromeRaised',3],['Essential control border','control','surface',3],['Icon / surface','icon','surface',3],['Focus / surface','focus','surface',3],['Success','success','successBg',4.5],['Warning','warning','warningBg',4.5],['Error','error','errorBg',4.5],['Information','info','infoBg',4.5]];
  return pairs.map(([label,foreground,background,minimum])=>({label,foreground:t[foreground],background:t[background],contrast:Number(contrast(t[foreground],t[background]).toFixed(2)),minimum,pass:contrast(t[foreground],t[background])>=minimum}));
 }
 const api={tokens,apply,css,audit,palettes,oklch,fromLch,contrast};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.JMLTheme=api;
})(typeof window==='undefined'?globalThis:window);
