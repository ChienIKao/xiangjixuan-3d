// All coordinates are CSS pixels relative to the canvas.
export function stageRect(container) {
  const c=container.getBoundingClientRect(),w=c.width,h=c.height;
  const shown=el=>el&&!el.hidden&&getComputedStyle(el).display!=='none';
  let top=12,right=w-12,bottom=h-12;
  for(const el of document.querySelectorAll('.masthead,#toolbar,#menu-toggle,#explore-bar'))if(shown(el))top=Math.max(top,el.getBoundingClientRect().bottom-c.top+12);
  const panel=document.getElementById('text-panel'),reading=document.getElementById('reading');
  if(w>=760&&shown(panel)&&!document.body.classList.contains('panel-collapsed'))right=Math.min(right,panel.offsetLeft-c.left-40);
  if(shown(reading))bottom=Math.min(bottom,reading.getBoundingClientRect().top-c.top-12);
  if(w<760&&shown(panel)&&!document.body.classList.contains('panel-collapsed'))bottom=Math.min(bottom,panel.getBoundingClientRect().top-c.top-12);
  return {left:12,top,right:Math.max(92,right),bottom:Math.max(top+80,bottom),width:Math.max(80,right-12),height:Math.max(80,bottom-top)};
}
