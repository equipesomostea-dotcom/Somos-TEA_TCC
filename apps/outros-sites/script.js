/* ======================== */
/* 1. Funções utilitárias */
/* ======================== */

/**
 * Persiste dados no localStorage, com tratamento de erros.
 * @param {string} key A chave a ser usada no localStorage.
 * @param {object} data O objeto de dados a ser armazenado.
 */
function saveDataToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Dados salvos em localStorage com a chave: ${key}`);
    } catch (err) {
      console.error('Erro ao salvar dados no localStorage:', err);
    }
  }
  
  /* ======================== */
  /* 2. Navegação entre abas */
  /* ======================== */
  
  /**
   * Configura a navegação entre as diferentes seções da aplicação.
   */
  function setupTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
  
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove a classe 'active' do botão que estava ativo
        document.querySelector('.nav-btn.active')?.classList.remove('active');
        // Adiciona a classe 'active' ao botão clicado
        btn.classList.add('active');
  
        const targetId = btn.dataset.target;
  
        // Esconde todas as páginas e mostra apenas a página de destino
        pages.forEach(p => p.style.display = 'none');
        const targetPage = document.getElementById(targetId);
        if (targetPage) {
          targetPage.style.display = 'block';
          targetPage.focus(); // Foca na página para melhorar a acessibilidade
        }
      });
    });
  }
  
  /* ======================== */
  /* 3. Menu de perfil e interação com cadastro */
  /* ======================== */
  
  /**
   * Configura a interação do menu de perfil.
   */
  function setupProfileMenu() {
    const profileBtn = document.getElementById('profileBtn');
    const profileMenu = document.getElementById('profileMenu');
  
    if (!profileBtn || !profileMenu) return;
  
    // Lógica para abrir/fechar o menu de perfil ao clicar no botão
    profileBtn.addEventListener('click', (e) => {
      const isExpanded = profileBtn.getAttribute('aria-expanded') === 'true';
      profileMenu.style.display = isExpanded ? 'none' : 'block';
      profileBtn.setAttribute('aria-expanded', String(!isExpanded));
      e.stopPropagation(); // Evita que o evento de clique se propague e feche o menu
    });
  
    // Esconde o menu de perfil se o usuário clicar fora dele
    document.addEventListener('click', (e) => {
      if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.style.display = 'none';
        profileBtn.setAttribute('aria-expanded', 'false');
      }
    });
  
    // Adiciona a lógica para os itens do menu
    profileMenu.addEventListener('click', (e) => {
      // Verifica se o item clicado é o de cadastro
      if (e.target.dataset.action === 'conta') {
        showCadastroForm(); // Chama a função para mostrar o formulário de cadastro
      }
      // Esconde o menu após a seleção
      profileMenu.style.display = 'none';
      profileBtn.setAttribute('aria-expanded', 'false');
    });
  }
  
  /* ======================== */
  /* 4. Formulário de Cadastro */
  /* ======================== */
  
  /**
   * Configura o formulário de cadastro, salvando os dados localmente.
   */
  function setupCadastroForm() {
    const formCadastro = document.getElementById('formCadastro');
    const limparBtn = document.getElementById('limparCadastro');
    const perfilImageInput = document.getElementById('perfilImage');
  
    if (formCadastro) {
      formCadastro.addEventListener('submit', (ev) => {
        ev.preventDefault();
        
        const formData = new FormData(formCadastro);
        const data = Object.fromEntries(formData.entries());
  
        // Captura o arquivo de imagem selecionado
        const imageFile = perfilImageInput.files[0];
        if (imageFile) {
          const reader = new FileReader();
          reader.onload = (e) => {
            // Salva a imagem como uma URL de dados (base64)
            data.perfilImage = e.target.result;
            saveDataToLocalStorage('cadastro', data);
            alert('Cadastro salvo localmente.');
            loadProfileData(); // Atualiza o perfil após salvar
          };
          reader.readAsDataURL(imageFile);
        } else {
          // Se nenhuma imagem foi selecionada, salva sem a imagem
          data.perfilImage = null;
          saveDataToLocalStorage('cadastro', data);
          alert('Cadastro salvo localmente.');
          loadProfileData(); // Atualiza o perfil após salvar
        }
      });
    }
  
    if (limparBtn) {
      limparBtn.addEventListener('click', () => {
        formCadastro?.reset();
        localStorage.removeItem('cadastro');
        loadProfileData(); // Atualiza o perfil para o estado padrão
      });
    }
  }
  
  /* ======================== */
  /* 5. Comentários rápidos */
  /* ======================== */
  
  /**
   * Lida com o envio de comentários rápidos.
   */
  function setupQuickComments() {
    const sendCommentBtn = document.getElementById('sendComment');
    const quickCommentInput = document.getElementById('quickComment');
    const commentList = document.getElementById('commentList');
  
    if (sendCommentBtn) {
      sendCommentBtn.addEventListener('click', () => {
        const text = quickCommentInput.value.trim();
        if (!text) {
          alert('Escreva algo antes de enviar');
          return;
        }
        // Obtém o nome do usuário para o comentário
        const rawData = localStorage.getItem('cadastro');
        const userData = rawData ? JSON.parse(rawData) : null;
        const userName = userData?.nome?.split(' ')[0] || 'Você';
  
        const newComment = document.createElement('div');
        newComment.className = 'comment';
        newComment.innerHTML = `<strong>${userName}</strong>: ${escapeHtml(text)}<small> — agora</small>`;
  
        if (commentList) {
          commentList.prepend(newComment);
        }
        quickCommentInput.value = '';
      });
    }
  }
  
  /* ======================== */
  /* 6. Postagem na comunidade (FeedBack) */
  /* ======================== */
  
  /**
   * Lida com a postagem de feedback na comunidade.
   */
  function setupCommunityPosts() {
    const postarBtn = document.getElementById('postarFeedBack');
    const postInput = document.getElementById('postMaior');
  
    if (postarBtn) {
      postarBtn.addEventListener('click', () => {
        const text = postInput.value.trim();
        if (!text) {
          alert('Escreva sua mensagem antes de publicar.');
          return;
        }
        alert('Post publicado (exemplo).');
        postInput.value = '';
      });
    }
  }
  
  /* ======================== */
  /* 7. Funções de navegação customizadas */
  /* ======================== */
  
  /**
   * Exibe a página de cadastro e esconde todas as outras.
   */
  function showCadastroForm() {
    const pages = document.querySelectorAll('.page');
    const cadastroPage = document.getElementById('cadastro');
  
    // Esconde todas as páginas visíveis
    pages.forEach(p => p.style.display = 'none');
  
    // Mostra a página de cadastro
    if (cadastroPage) {
      cadastroPage.style.display = 'block';
      cadastroPage.focus(); // Foca no elemento para acessibilidade
    }
  
    // Remove o estado "ativo" de todos os botões de navegação
    document.querySelector('.nav-btn.active')?.classList.remove('active');
  }
  
  /* ======================== */
  /* 8. Inicialização da aplicação e carregamento de dados */
  /* ======================== */
  
  /**
   * Escapa caracteres HTML para prevenir ataques XSS.
   * @param {string} unsafe A string a ser escapada.
   * @returns {string} A string segura.
   */
  function escapeHtml(unsafe) {
    return unsafe.replace(/[&"'<>]/g, m => ({
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#39;',
      '<': '&lt;',
      '>': '&gt;'
    }[m]));
  }
  
  /**
   * Carrega os dados do perfil salvos no localStorage, se existirem.
   * Atualiza o nome e a imagem do perfil.
   */
  function loadProfileData() {
    const rawData = localStorage.getItem('cadastro');
    const profileImage = document.querySelector('.profile img');
    const profileName = document.querySelector('.profile .name');
  
    if (rawData) {
      try {
        const data = JSON.parse(rawData);
        if (data.nome) {
          const firstName = data.nome.split(' ')[0] || 'Usuário';
          profileName.textContent = firstName;
          if (data.perfilImage) {
            profileImage.src = data.perfilImage; // Usa a imagem salva em base64
          } else {
            profileImage.src = 'default-avatar.png'; // Usa avatar padrão
          }
        } else {
          profileName.textContent = 'Usuário';
          profileImage.src = 'default-avatar.png';
        }
      } catch (error) {
        console.warn('Erro ao carregar dados de cadastro do localStorage:', error);
        profileName.textContent = 'Usuário';
        profileImage.src = 'default-avatar.png';
      }
    } else {
      profileName.textContent = 'Usuário';
      profileImage.src = 'default-avatar.png';
    }
  }
  
  /**
   * Carrega os dados do formulário salvos no localStorage, se existirem.
   */
  function loadFormData() {
    const rawData = localStorage.getItem('cadastro');
    if (rawData) {
      try {
        const data = JSON.parse(rawData);
        for (const key in data) {
          const element = document.querySelector(`#formCadastro [name="${key}"]`);
          if (element && key !== 'perfilImage') {
            element.value = data[key];
          }
        }
      } catch (error) {
        console.warn('Erro ao carregar dados do formulário do localStorage:', error);
      }
    }
  }
  
  // Executa as funções de inicialização quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', () => {
    setupTabNavigation();
    setupProfileMenu();
    setupCadastroForm();
    setupQuickComments();
    setupCommunityPosts();
    loadProfileData(); // Carrega os dados do perfil
    loadFormData(); // Carrega os dados do formulário
  });
  