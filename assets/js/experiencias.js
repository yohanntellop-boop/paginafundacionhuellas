(()=>{'use strict';
const body=document.body,videoDialog=document.getElementById('videoDialog'),galleryDialog=document.getElementById('galleryDialog');
const video=document.getElementById('institutionalVideo');let previousFocus=null,activeDialog=null;
function openDialog(el){previousFocus=document.activeElement;activeDialog=el;el.classList.add('is-open');el.setAttribute('aria-hidden','false');body.classList.add('media-modal-open');el.querySelector('.media-close').focus()}
function closeDialog(el){if(!el)return;el.classList.remove('is-open');el.setAttribute('aria-hidden','true');if(el===videoDialog){video.pause();video.currentTime=0}activeDialog=null;body.classList.remove('media-modal-open');if(previousFocus&&previousFocus.isConnected)previousFocus.focus()}
document.getElementById('openVideo')?.addEventListener('click',()=>{openDialog(videoDialog);video.play().catch(()=>{})});
document.getElementById('closeVideo')?.addEventListener('click',()=>closeDialog(videoDialog));
videoDialog?.querySelector('[data-close-video]')?.addEventListener('click',()=>closeDialog(videoDialog));
const pictures=[{src:'assets/img/galeria/Junta directiva.jpg',title:'Junta directiva'},{src:'assets/img/galeria/Lorena Palacio.jpg',title:'Lorena Palacio'},{src:'assets/img/galeria/Laura Hernandez.jpg',title:'Laura Hernández'},{src:'assets/img/galeria/Daniela Montoya.jpg',title:'Daniela Montoya'}];let index=0;
const large=document.getElementById('galleryLargeImage'),caption=document.getElementById('galleryCaption'),counter=document.getElementById('galleryCounter');
function show(i){index=(i+pictures.length)%pictures.length;const p=pictures[index];large.src=encodeURI(p.src);large.alt=p.title;caption.textContent=p.title;counter.textContent=(index+1)+' / '+pictures.length}
document.querySelectorAll('[data-gallery-index]').forEach(b=>b.addEventListener('click',()=>{show(Number(b.dataset.galleryIndex));openDialog(galleryDialog)}));
document.getElementById('galleryPrev')?.addEventListener('click',()=>show(index-1));document.getElementById('galleryNext')?.addEventListener('click',()=>show(index+1));
document.getElementById('closeGallery')?.addEventListener('click',()=>closeDialog(galleryDialog));galleryDialog?.querySelector('[data-close-gallery]')?.addEventListener('click',()=>closeDialog(galleryDialog));
document.addEventListener('keydown',e=>{if(!activeDialog)return;if(e.key==='Escape'){e.preventDefault();closeDialog(activeDialog)}else if(activeDialog===galleryDialog&&e.key==='ArrowLeft')show(index-1);else if(activeDialog===galleryDialog&&e.key==='ArrowRight')show(index+1);else if(e.key==='Tab'){const nodes=[...activeDialog.querySelectorAll('button,[controls]')].filter(x=>x.offsetParent!==null);if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
})();