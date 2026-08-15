(function(){
  const KEY='faa:creator-workspace:v2';
  const VERSION=2;
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null')||{version:VERSION,activeProject:null,projects:[]}}catch(e){return {version:VERSION,activeProject:null,projects:[]}}}
  function write(state){state.version=VERSION;localStorage.setItem(KEY,JSON.stringify(state));return state}
  function upsert(project){const s=read();const i=s.projects.findIndex(p=>p.id===project.id);project.updatedAt=new Date().toISOString();if(i>=0)s.projects[i]=Object.assign({},s.projects[i],project);else s.projects.push(project);s.activeProject=project.id;return write(s)}
  function create(type,name){return upsert({id:'project-'+type+'-'+Date.now(),type:type,name:name||('My '+type+' project'),status:'draft',qa:'not-run',preview:'not-ready',deployment:'not-configured',version:1,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})}
  function active(){const s=read();return s.projects.find(p=>p.id===s.activeProject)||null}
  function setStatus(patch){const a=active();if(!a)return null;return upsert(Object.assign({},a,patch))}
  window.CreatorWorkspaceStore={read,write,upsert,create,active,setStatus,KEY,VERSION};
})();