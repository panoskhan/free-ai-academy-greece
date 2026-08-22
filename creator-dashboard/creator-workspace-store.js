(function(){
  'use strict';
  const KEY='faa:creator-projects:v1';
  const ACTIVE_KEY='faa:creator-active:v1';
  function read(){try{const value=JSON.parse(localStorage.getItem(KEY)||'{"projects":[]}');return value&&Array.isArray(value.projects)?value:{projects:[]}}catch(e){return {projects:[]}}}
  function write(state){localStorage.setItem(KEY,JSON.stringify(state));return state}
  function id(prefix){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
  function normalize(p){return Object.assign({version:1,status:'draft',qa:'not-run',preview:'not-ready',deployment:'not-configured'},p||{})}
  function create(type,name){const state=read();const now=new Date().toISOString();const project=normalize({id:id(type==='website'?'web':'academy'),type:type==='website'?'website':'academy',name:name|| (type==='website'?'New Website':'New Academy'),createdAt:now,updatedAt:now});state.projects.unshift(project);write(state);localStorage.setItem(ACTIVE_KEY,project.id);return project}
  function get(idValue){return read().projects.find(p=>p.id===idValue)||null}
  function update(idValue,patch){const state=read();const p=state.projects.find(x=>x.id===idValue);if(!p)return null;Object.assign(p,patch,{updatedAt:new Date().toISOString()});write(state);return p}
  function active(){const idValue=localStorage.getItem(ACTIVE_KEY);return idValue?get(idValue):null}
  function setActive(idValue){if(get(idValue))localStorage.setItem(ACTIVE_KEY,idValue);return active()}
  function clearActive(){localStorage.removeItem(ACTIVE_KEY)}
  const api={read,write,create,get,update,active,setActive,clearActive,KEY,ACTIVE_KEY,key:KEY};
  window.CreatorProjectStore=api;
  window.CreatorWorkspaceStore=api;
})();