(function(){
  const KEY='faa:creator-projects:v1';
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{"projects":[]}')}catch(e){return {projects:[]}}}
  function write(state){localStorage.setItem(KEY,JSON.stringify(state));return state}
  function id(prefix){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
  function create(type){const state=read();const now=new Date().toISOString();const project={id:id(type==='website'?'web':'academy'),type,name:type==='website'?'New Website':'New Academy',version:1,status:'draft',qa:'not-run',preview:'not-ready',deployment:'not-connected',createdAt:now,updatedAt:now};state.projects.unshift(project);write(state);return project}
  function get(idValue){return read().projects.find(p=>p.id===idValue)||null}
  function update(idValue,patch){const state=read();const p=state.projects.find(x=>x.id===idValue);if(!p)return null;Object.assign(p,patch,{updatedAt:new Date().toISOString()});write(state);return p}
  window.CreatorProjectStore={read,create,get,update,key:KEY};
})();