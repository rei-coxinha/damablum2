const V='damablo-v3';
const SHELL=['./index.html','./admin.html','./manifest.webmanifest','./manifest-admin.webmanifest','./icon-192.png','./icon-512.png','./icon-180.png','./icon-admin-192.png','./icon-admin-512.png','./icon-admin-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(u=>fetch(u,{cache:'reload'}).then(r=>r.ok&&c.put(u,r)).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;
 if(r.method!=='GET')return;
 const u=new URL(r.url);
 if(u.origin!==location.origin)return; // Supabase e outros: sempre direto na rede
 // PWA antigo do admin abria adm.html: se esse arquivo não existe mais, manda para admin.html
 if(r.mode==='navigate'&&/\/adm\.html$/i.test(u.pathname)){
  e.respondWith(fetch(r,{cache:'no-store'}).then(res=>res.ok?res:Response.redirect(new URL('admin.html',self.registration.scope).href,302)).catch(()=>caches.match('./admin.html')));
  return;
 }
 if(r.mode==='navigate'||u.pathname.endsWith('.html')){
  // páginas: sempre busca a versão nova na internet (ignora o cache do navegador); sem internet, usa a guardada
  e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match(u.pathname.includes('adm')?'./admin.html':'./index.html'))));
  return;
 }
 // ícones e manifestos: usa o guardado e atualiza em segundo plano
 e.respondWith(caches.match(r).then(m=>{const n=fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res}).catch(()=>m);return m||n}));
});
