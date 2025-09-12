// Navegação entre abas
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');
navButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelector('.nav-btn.active').classList.remove('active');
    btn.classList.add('active');
    const target = btn.dataset.target;
    pages.forEach(p=>p.style.display = (p.id === target) ? 'block' : 'none');
    document.getElementById(target).focus();
  })
})

// Menu de perfil
const profileBtn = document.getElementById('profileBtn');
const profileMenu = document.getElementById('profileMenu');
profileBtn.addEventListener('click', ()=>{
  const isOpen = profileMenu.style.display === 'block';
  profileMenu.style.display = isOpen ? 'none' : 'block';
  profileBtn.setAttribute('aria-expanded', String(!isOpen));
})
document.addEventListener('click', (e)=>{
  if(!profileBtn.contains(e.target)) profileMenu.style.display = 'none';
})

// Cadastro: salvar localmente
const formCadastro = document.getElementById('formCadastro');
const limparBtn = document.getElementById('limparCadastro');
formCadastro.addEventListener('submit', (ev)=>{
  ev.preventDefault();
  const data = Object.fromEntries(new FormData(formCadastro).entries());
  localStorage.setItem('cadastro', JSON.stringify(data));
  alert('Cadastro salvo localmente. (Exemplo)');
})
limparBtn.addEventListener('click', ()=>{formCadastro.reset();localStorage.removeItem('cadastro')})

// Comentários rápidos
const sendComment = document.getElementById('sendComment');
const commentList = document.getElementById('commentList');
sendComment.addEventListener('click', ()=>{
  const txt = document.getElementById('quickComment').value.trim();
  if(!txt) return alert('Escreva algo antes de enviar');
  const div = document.createElement('div');
  div.className = 'comment';
  div.innerHTML = `<strong>Você</strong>: ${escapeHtml(txt)}<small> — agora</small>`;
  commentList.prepend(div);
  document.getElementById('quickComment').value = '';
})

// Postar na comunidade
const postarBtn = document.getElementById('postarComunidade');
postarBtn.addEventListener('click', ()=>{
  const txt = document.getElementById('postMaior').value.trim();
  if(!txt) return alert('Escreva sua mensagem antes de publicar.');
  alert('Post publicado (exemplo).');
  document.getElementById('postMaior').value = '';
})

// Escape para evitar XSS
function escapeHtml(unsafe){
  return unsafe.replace(/[&"'<>]/g, m=>({'&':'&amp;','"':'&quot;','\'':'&#39;','<':'&lt;','>':'&gt;'}[m]));
}

// Carregar cadastro salvo
window.addEventListener('DOMContentLoaded', ()=>{
  const raw = localStorage.getItem('cadastro');
  if(raw){
    try{
      const data = JSON.parse(raw);
      for(const k in data){
        const el = document.querySelector(`[name="${k}"]`);
        if(el) el.value = data[k];
      }
    }catch(err){console.warn('Erro ao carregar cadastro',err)}
  }
})