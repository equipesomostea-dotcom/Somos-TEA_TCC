/* ======================== */
/* 1. Funções utilitárias */
/* ======================== */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function saveEmailToLocalStorage(email) {
  localStorage.setItem("usuarioEmail", email);
}

function getEmailFromLocalStorage() {
  return localStorage.getItem("usuarioEmail");
}

/* ======================== */
/* 2. Navegação entre abas */
/* ======================== */
function setupTabNavigation() {
  const navButtons = document.querySelectorAll(".nav-btn");
  const pages = document.querySelectorAll(".page");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".nav-btn.active")?.classList.remove("active");
      btn.classList.add("active");

      const targetId = btn.dataset.target;
      pages.forEach((p) => (p.style.display = "none"));
      const targetPage = document.getElementById(targetId);
      if (targetPage) {
        targetPage.style.display = "block";
        targetPage.focus();
      }
    });
  });
}

/* ======================== */
/* 3. Perfil / Menu */
/* ======================== */
function setupProfileMenu() {
  const profileBtn = document.getElementById("profileBtn");
  const profileMenu = document.getElementById("profileMenu");

  if (!profileBtn || !profileMenu) return;

  profileBtn.addEventListener("click", (e) => {
    const isExpanded = profileBtn.getAttribute("aria-expanded") === "true";
    profileMenu.style.display = isExpanded ? "none" : "block";
    profileBtn.setAttribute("aria-expanded", String(!isExpanded));
    e.stopPropagation();
  });

  document.addEventListener("click", (e) => {
    if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
      profileMenu.style.display = "none";
      profileBtn.setAttribute("aria-expanded", "false");
    }
  });

  profileMenu.addEventListener("click", (e) => {
    if (e.target.dataset.action === "conta") {
      showCadastroForm();
    }
    profileMenu.style.display = "none";
    profileBtn.setAttribute("aria-expanded", "false");
  });
}

/* ======================== */
/* 4. Cadastro */
/* ======================== */
function setupCadastroForm() {
  const formCadastro = document.getElementById("formCadastro");
  const limparBtn = document.getElementById("limparCadastro");
  const perfilImageInput = document.getElementById("perfilImage");

  async function enviarCadastro(data) {
    try {
      const response = await fetch("http://localhost:3000/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Erro ao enviar cadastro");

      saveEmailToLocalStorage(data.email);
      alert("Cadastro salvo com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Falha ao enviar o cadastro");
    }
  }

  formCadastro?.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const formData = new FormData(formCadastro);
    const data = Object.fromEntries(formData.entries());

    const imageFile = perfilImageInput.files[0];
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        data.perfilImage = reader.result;
        enviarCadastro(data);
      };
      reader.readAsDataURL(imageFile);
    } else {
      data.perfilImage = null;
      enviarCadastro(data);
    }
  });

  limparBtn?.addEventListener("click", () => {
    formCadastro.reset();
    localStorage.removeItem("usuarioEmail");
  });
}

/* ======================== */
/* 5. Carregar cadastro salvo */
/* ======================== */
async function loadUserData() {
  const email = getEmailFromLocalStorage();
  if (!email) return;

  try {
    const res = await fetch(`http://localhost:3000/api/usuarios/${email}`);
    if (!res.ok) return;

    const user = await res.json();
    const formCadastro = document.getElementById("formCadastro");

    formCadastro.nome.value = user.nome || "";
    formCadastro.email.value = user.email || "";
    formCadastro.perfil.value = user.perfil || "pai";
    formCadastro.notas.value = user.notas || "";
    // Se quiser mostrar a imagem no formulário, pode criar um <img> dinâmico
  } catch (err) {
    console.error("Erro ao carregar usuário:", err);
  }
}

/* ======================== */
/* 6. Comentários rápidos */
/* ======================== */
async function setupQuickComments() {
  const sendCommentBtn = document.getElementById("sendComment");
  const quickCommentInput = document.getElementById("quickComment");
  const commentList = document.getElementById("commentList");

  if (!sendCommentBtn || !quickCommentInput || !commentList) return;

  function tempoRelativo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins} min atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} h atrás`;
    const dias = Math.floor(hrs / 24);
    return `${dias} d atrás`;
  }

  async function carregarComentarios() {
    try {
      const res = await fetch("http://localhost:3000/api/comentarios");
      const comments = await res.json();
      commentList.innerHTML = "";
      comments.forEach((c) => {
        const div = document.createElement("div");
        div.className = "comment";
        div.innerHTML = `<strong>${escapeHtml(c.nome)}</strong>: ${escapeHtml(c.texto)} <small>— ${tempoRelativo(c.data)}</small>`;
        commentList.appendChild(div);
      });
    } catch (err) {
      console.error("Erro ao carregar comentários:", err);
    }
  }

  carregarComentarios();

  sendCommentBtn.addEventListener("click", async () => {
    const text = quickCommentInput.value.trim();
    if (!text) return alert("Escreva algo antes de enviar");

    const email = getEmailFromLocalStorage();
    let userName = "Você";

    if (email) {
      try {
        const res = await fetch(`http://localhost:3000/api/usuarios/${email}`);
        if (res.ok) {
          const user = await res.json();
          userName = user.nome.split(" ")[0] || "Você";
        }
      } catch (err) {
        console.error(err);
      }
    }

    try {
      const response = await fetch("http://localhost:3000/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: userName, texto: text }),
      });

      if (!response.ok) throw new Error("Erro ao enviar comentário");

      quickCommentInput.value = "";
      carregarComentarios();
    } catch (err) {
      console.error(err);
      alert("Falha ao enviar comentário");
    }
  });
}

/* ======================== */
/* 7. Mostrar cadastro */
/* ======================== */
function showCadastroForm() {
  const pages = document.querySelectorAll(".page");
  const cadastroPage = document.getElementById("cadastro");

  pages.forEach((p) => (p.style.display = "none"));
  if (cadastroPage) {
    cadastroPage.style.display = "block";
    cadastroPage.focus();
  }

  document.querySelector(".nav-btn.active")?.classList.remove("active");
}

/* ======================== */
/* 8. Inicialização */
/* ======================== */
document.addEventListener("DOMContentLoaded", () => {
  setupTabNavigation();
  setupProfileMenu();
  setupCadastroForm();
  setupQuickComments();
  loadUserData(); // Carrega dados do usuário salvo
});
