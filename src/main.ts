import './style.css';
if(new URLSearchParams(location.search).has('lab')) import('./lab');
else import('./game').then(module=>module.startGame()).catch(error=>{document.querySelector('#app')!.textContent=`Avvio non riuscito: ${String(error)}`;console.error(error);});
