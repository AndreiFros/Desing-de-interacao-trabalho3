// ============================================================
// Web Component: <minha-prova>
// Prova online de múltipla escolha encapsulada em Shadow DOM.
// As questões são carregadas via fetch do arquivo perguntas.json.
// ============================================================

class MinhaProva extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._questoes = [];
  }

  connectedCallback() {
    this._mostrarCarregando();
    this._carregarQuestoes();
  }

  // Exibe indicador de carregamento enquanto o fetch ocorre
  _mostrarCarregando() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: Arial, Helvetica, sans-serif; }
        .carregando {
          text-align: center;
          padding: 2rem;
          color: #2f5d91;
          font-size: 1rem;
        }
        .erro {
          background: #f8d7da;
          border: 1px solid #dc3545;
          border-radius: 4px;
          padding: 1rem;
          color: #8b0000;
          font-weight: 700;
        }
      </style>
      <p class="carregando" role="status" aria-live="polite">⏳ Carregando questões...</p>
    `;
  }

  // Carrega as questões do arquivo JSON via fetch com tratamento de erros
  async _carregarQuestoes() {
    try {
      const resposta = await fetch('perguntas.json');

      if (!resposta.ok) {
        throw new Error(`Erro ao carregar questões: HTTP ${resposta.status}`);
      }

      const dados = await resposta.json();

      if (!Array.isArray(dados) || dados.length === 0) {
        throw new Error('O arquivo de questões está vazio ou com formato inválido.');
      }

      this._questoes = dados;
      this._renderizarProva();

    } catch (erro) {
      this.shadowRoot.innerHTML = `
        <style>
          :host { display: block; font-family: Arial, Helvetica, sans-serif; }
          .erro {
            background: #f8d7da;
            border: 2px solid #dc3545;
            border-radius: 4px;
            padding: 1.2rem;
            color: #8b0000;
            font-weight: 700;
          }
        </style>
        <div class="erro" role="alert">
          ❌ Não foi possível carregar as questões.<br>
          <small>${erro.message}</small>
        </div>
      `;
    }
  }

  // Monta toda a estrutura HTML + CSS da prova dentro do Shadow DOM
  _renderizarProva() {
    const questoesHTML = this._questoes.map((q, qi) => `
      <fieldset class="questao" id="questao-${qi}">
        <legend class="enunciado">${qi + 1}. ${q.enunciado}</legend>
        <div class="alternativas">
          ${q.alternativas.map((alt, ai) => `
            <label class="alternativa" id="label-${qi}-${ai}">
              <input
                type="radio"
                name="questao-${qi}"
                value="${ai}"
                id="q${qi}a${ai}"
                required
              >
              <span class="texto-alternativa">${alt}</span>
            </label>
          `).join('')}
        </div>
        <p class="feedback" id="feedback-${qi}" aria-live="polite"></p>
      </fieldset>
    `).join('');

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host {
          display: block;
          font-family: Arial, Helvetica, sans-serif;
          color: #222;
        }

        .prova-container {
          background: #fff;
          border: 2px solid #c7c7c7;
          border-radius: 6px;
          padding: 1.5rem;
          max-width: 780px;
          margin: 0 auto;
        }

        .prova-titulo {
          font-size: 1.4rem;
          margin: 0 0 0.3rem;
          color: #2f5d91;
        }

        .prova-descricao {
          font-size: 0.9rem;
          color: #555;
          margin: 0 0 1.5rem;
        }

        .questao {
          border: 1px dashed #8b8b8b;
          border-radius: 4px;
          padding: 1rem;
          margin-bottom: 1.2rem;
        }

        .enunciado {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.6rem;
          line-height: 1.4;
        }

        .alternativas {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .alternativa {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.5rem 0.8rem;
          border: 2px solid #d0d0d0;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }

        .alternativa:hover {
          background: #eef4ff;
          border-color: #2f5d91;
        }

        .alternativa:has(input:checked) {
          background: #ddeaff;
          border-color: #2f5d91;
        }

        input[type="radio"] {
          accent-color: #2f5d91;
          width: 1.1rem;
          height: 1.1rem;
          flex-shrink: 0;
        }

        .texto-alternativa { font-size: 0.95rem; line-height: 1.4; }

        .feedback {
          margin: 0.6rem 0 0;
          font-size: 0.9rem;
          font-weight: 700;
          min-height: 1.2rem;
        }

        .alternativa.correta-selecionada {
          background: #d4edda;
          border-color: #28a745;
        }
        .alternativa.errada-selecionada {
          background: #f8d7da;
          border-color: #dc3545;
        }
        .alternativa.correta-indicar {
          background: #d4edda;
          border-color: #28a745;
        }
        .feedback.acerto { color: #1a6b32; }
        .feedback.erro   { color: #8b0000; }

        .botoes {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        button {
          padding: 0.6rem 1.4rem;
          font-size: 1rem;
          font-weight: 700;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .btn-corrigir {
          background: #2b8f54;
          color: #fff;
          border: 1px solid #1d663c;
        }
        .btn-corrigir:hover { background: #237445; }

        .btn-reiniciar {
          background: #d75f22;
          color: #fff;
          border: 1px solid #a84516;
        }
        .btn-reiniciar:hover { background: #b84f1a; }

        .resultado {
          background: #eef4ff;
          border: 2px solid #2f5d91;
          border-radius: 4px;
          padding: 1rem;
          margin-top: 1.2rem;
          font-size: 1rem;
          display: none;
        }
        .resultado.visivel { display: block; }
        .resultado strong  { color: #2f5d91; font-size: 1.2rem; }

        .aviso {
          color: #8b0000;
          font-size: 0.9rem;
          font-weight: 700;
          min-height: 1.2rem;
          margin-top: 0.5rem;
        }

        @media (max-width: 600px) {
          .prova-container { padding: 1rem; }
          .prova-titulo    { font-size: 1.1rem; }
          button           { width: 100%; }
        }
      </style>

      <div class="prova-container" role="form" aria-label="Prova online">
        <h2 class="prova-titulo">&#x1F4DD; Prova Online &#x2014; Interface Web</h2>
        <p class="prova-descricao">Responda todas as questões e clique em <strong>Corrigir</strong>.</p>

        <div class="questoes">${questoesHTML}</div>

        <div class="botoes">
          <button class="btn-corrigir" id="btn-corrigir" type="button">Corrigir</button>
          <button class="btn-reiniciar" id="btn-reiniciar" type="button" hidden>Responder novamente</button>
        </div>
        <p class="aviso" id="aviso" aria-live="assertive"></p>
        <div class="resultado" id="resultado" role="status"></div>
      </div>
    `;

    this.shadowRoot.getElementById('btn-corrigir').addEventListener('click', () => this._corrigir());
    this.shadowRoot.getElementById('btn-reiniciar').addEventListener('click', () => this._reiniciar());
  }

  _corrigir() {
    const total = this._questoes.length;
    let acertos = 0;
    let todasRespondidas = true;
    const aviso = this.shadowRoot.getElementById('aviso');
    aviso.textContent = '';

    for (let qi = 0; qi < total; qi++) {
      const selecionado = this.shadowRoot.querySelector(`input[name="questao-${qi}"]:checked`);
      if (!selecionado) {
        todasRespondidas = false;
        this.shadowRoot.getElementById(`questao-${qi}`).style.borderColor = '#dc3545';
      } else {
        this.shadowRoot.getElementById(`questao-${qi}`).style.borderColor = '';
      }
    }

    if (!todasRespondidas) {
      aviso.textContent = '⚠️ Responda todas as questões antes de corrigir.';
      return;
    }

    for (let qi = 0; qi < total; qi++) {
      const q = this._questoes[qi];
      const selecionado = this.shadowRoot.querySelector(`input[name="questao-${qi}"]:checked`);
      const respostaIndex = parseInt(selecionado.value, 10);
      const feedback = this.shadowRoot.getElementById(`feedback-${qi}`);

      const inputs = this.shadowRoot.querySelectorAll(`input[name="questao-${qi}"]`);
      inputs.forEach(i => { i.disabled = true; });

      q.alternativas.forEach((_, ai) => {
        const label = this.shadowRoot.getElementById(`label-${qi}-${ai}`);
        label.classList.remove('correta-selecionada', 'errada-selecionada', 'correta-indicar');
        if (ai === q.correta && ai === respostaIndex) {
          label.classList.add('correta-selecionada');
        } else if (ai === respostaIndex && ai !== q.correta) {
          label.classList.add('errada-selecionada');
        } else if (ai === q.correta) {
          label.classList.add('correta-indicar');
        }
      });

      if (respostaIndex === q.correta) {
        acertos++;
        feedback.textContent = '✅ Correto!';
        feedback.className = 'feedback acerto';
      } else {
        const nomeCorreta = q.alternativas[q.correta];
        feedback.textContent = `❌ Errado. Resposta correta: "${nomeCorreta}"`;
        feedback.className = 'feedback erro';
      }
    }

    const nota = ((acertos / total) * 10).toFixed(1);
    const resultado = this.shadowRoot.getElementById('resultado');
    resultado.innerHTML = `
      <strong>Resultado: ${acertos}/${total} &mdash; Nota: ${nota}</strong><br>
      ${acertos === total
        ? '&#x1F3C6; Parabéns, você acertou tudo!'
        : acertos === 0
          ? '&#x1F615; Nenhum acerto. Tente novamente!'
          : `Você acertou ${acertos} de ${total} questões. Continue estudando!`
      }
    `;
    resultado.classList.add('visivel');

    this.shadowRoot.getElementById('btn-corrigir').hidden = true;
    this.shadowRoot.getElementById('btn-reiniciar').hidden = false;
  }

  _reiniciar() {
    this._renderizarProva();
  }
}

customElements.define('minha-prova', MinhaProva);
