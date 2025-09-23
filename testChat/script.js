
const mensagemInput = document.getElementById("mensagem");

async function enviarMensagem() {
    const mensagem = mensagemInput.value.trim();
    if (!mensagem) return;

    adicionarMensagem("Você", mensagem);
    mensagemInput.value = "";

    try {
        const resposta = await fetch("/enviar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensagem }),
        });

        if (!resposta.ok) throw new Error("Erro ao conectar ao servidor.");

        const data = await resposta.json();

        adicionarMensagem("Dra. Clara", data.resposta, true);
    } catch (err) {
        adicionarMensagem("Sistema", "Desculpe, houve um problema ao enviar sua mensagem.", true);
        console.error(err);
    }
}

mensagemInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        enviarMensagem();
    }
});

function adicionarMensagem(remetente, texto, assistente = false) {
    const chatBox = document.getElementById("chat-box");
    const mensagemDiv = document.createElement("div");
    mensagemDiv.classList.add(assistente ? "mensagem-assistente" : "mensagem-usuario");

    if (assistente) {
        // Mensagem da psicóloga com foto e balão
        mensagemDiv.innerHTML = `
      <img src="static/images/clara.jpg" alt="Foto da psicóloga" />
      <div class="bolha">
        <strong>${remetente}</strong><br>${texto}
      </div>`;
    } else {
        // Mensagem do usuário simples à direita
        mensagemDiv.innerHTML = `
      <div class="bolha-usuario">${texto}</div>`;
    }

    chatBox.appendChild(mensagemDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
