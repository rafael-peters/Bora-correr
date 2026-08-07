# 🏃 Bora Correr — calendário de corridas do grupo

Página que mostra as próximas corridas da turma, alimentada por uma **Planilha Google** (preenchida via **Google Forms**). Sem servidor, sem custo, sem manutenção: alguém cadastra a prova no formulário e a página se atualiza sozinha.

**Como funciona:**

```
Amigo preenche o Form  →  resposta cai na Planilha  →  a página lê a planilha  →  todo mundo consulta pelo link
```

---

## ✅ Passo 1 — Subir a página neste repositório

1. Na página inicial do repositório, clique em **Add file → Upload files**
2. Arraste o arquivo **`index.html`** (precisa ser exatamente esse nome — é ele que o GitHub Pages abre como página inicial)
3. Clique em **Commit changes**

> ⚠️ **Importante:** o repositório precisa ser **público** (Public). No plano gratuito do GitHub, o Pages não funciona em repositório privado. Se criou como privado: **Settings → General → Danger Zone → Change visibility**.

## ✅ Passo 2 — Ativar o GitHub Pages (a hospedagem)

1. No repositório, vá em **Settings → Pages** (menu lateral esquerdo)
2. Em *Build and deployment*, **Source:** `Deploy from a branch`
3. **Branch:** `main` — pasta `/ (root)` → **Save**
4. Aguarde 1 a 2 minutos e recarregue a tela: o endereço aparece no topo, no formato:

   ```
   https://SEU-USUARIO.github.io/NOME-DO-REPO/
   ```

5. Abra o endereço: a página deve aparecer com **dados de exemplo** e um aviso — é o esperado por enquanto. Esse é o link que vai fixado no grupo. ✔️

## ✅ Passo 3 — Criar o Google Form (o "cadastrar corrida")

Crie um formulário em [forms.google.com](https://forms.google.com) com estas perguntas:

| Pergunta | Tipo | Obrigatória? |
|---|---|---|
| Nome da prova | Resposta curta | Sim |
| Data | **Data** | Sim |
| Cidade | Resposta curta | Sim |
| Distâncias | Resposta curta *(ex.: "5k e 10k")* | Sim |
| Data limite para inscrições | **Data** | Não |
| Link de inscrição | Resposta curta | Não |
| Observações | Parágrafo | Não |

Depois:

1. Na aba **Respostas**, clique no ícone verde do Planilhas (**Vincular ao app Planilhas**) → *Criar nova planilha*
2. Copie o link do formulário: botão **Enviar** → ícone de corrente 🔗 → marque **Encurtar URL** → **Copiar**. Guarde esse link (é o `URL_FORMULARIO`).

> 💡 Os nomes das perguntas não precisam ser idênticos aos da tabela — a página reconhece variações como "Prova", "nome da corrida", "Local" etc. Mas manter esses nomes evita surpresa.

## ✅ Passo 4 — Publicar a planilha como CSV

Na **planilha de respostas** criada no passo anterior:

1. Menu **Arquivo → Compartilhar → Publicar na web**
2. No primeiro seletor, escolha a **aba de respostas** (algo como *"Respostas ao formulário 1"*) — **não** "Documento inteiro"
3. No segundo seletor, escolha **Valores separados por vírgula (.csv)**
4. Clique em **Publicar** e **copie o link** gerado. Ele tem esta cara (e termina em `output=csv`):

   ```
   https://docs.google.com/spreadsheets/d/e/2PACX-xxxxxxxx/pub?gid=xxxxxxx&single=true&output=csv
   ```

Guarde esse link (é o `URL_PLANILHA_CSV`).

> 🔒 **Nota de privacidade:** "Publicar na web" deixa o conteúdo *dessa aba* visível pra quem tiver o link. Como aqui só tem agenda de corridas (nada pessoal), sem problema — mas não use essa planilha pra outras coisas do grupo.

## ✅ Passo 5 — Colar os dois links no CONFIG

Dá pra editar direto no navegador, sem instalar nada:

1. No repositório, clique no arquivo **`index.html`**
2. Clique no ícone de **lápis** ✏️ (*Edit this file*), no canto superior direito
3. Aperte `Ctrl+F` e procure por **`CONFIG`**
4. Cole os links **entre as aspas**, sem apagar as vírgulas do fim das linhas:

   ```js
   URL_PLANILHA_CSV: 'https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv',
   URL_FORMULARIO: 'https://forms.gle/xxxxxxxx'
   ```

5. **Commit changes** → aguarde ~1 minuto → recarregue a página com `Ctrl+Shift+R` (recarga forçada, ignorando o cache)

Se tudo deu certo: o aviso de "dados de exemplo" some, as provas reais aparecem, e o botão **+ Adicionar corrida** passa a abrir o formulário. 🎉

## ✅ Passo 6 — Espalhar pro grupo

- Fixe o link da página no grupo do WhatsApp (e o link do Form como mensagem fixada também, se quiserem)
- Coloque na bio do Instagram
- Teste: cadastre uma prova pelo Form e recarregue a página — ela deve aparecer no card do mês certo

---

## ⏰ Como aparece a data limite de inscrição

Quem cadastra a prova pode informar até quando dá pra se inscrever. A página muda o tom conforme o prazo aperta:

| Situação | O que aparece no card |
|---|---|
| Falta mais de uma semana | Etiqueta discreta cinza: `🗓 inscrições até 30/out` |
| Falta uma semana ou menos | Etiqueta **laranja**: `⏰ inscrições até 10/ago · faltam 3 dias` |
| É o último dia | Etiqueta **laranja**: `⏰ último dia pra se inscrever!` |
| Já passou | Etiqueta riscada `🔒 inscrições encerradas` — e o link "Inscrições →" some, pra ninguém perder tempo clicando |
| Campo em branco | Nada aparece (nem toda prova tem prazo definido) |

O prazo também aparece no destaque da próxima largada, no topo da página.

## 🎨 Personalização

- **Nome e subtítulo da página:** em `CONFIG`, campos `TITULO` e `SUBTITULO`
- **Cores:** no topo do CSS, na seção `:root` — mude `--sinal` (laranja dos destaques), `--chip` (amarelo do selo "neste fim de semana") etc. e a página inteira acompanha
- **Dados de exemplo:** ficam em `DADOS_EXEMPLO`; são ignorados assim que a planilha é configurada

## 🔧 Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| Endereço dá **404** | Pages ainda processando, ou branch/pasta errada | Aguarde 2 min; confira Passo 2 (branch `main`, pasta `/root`) e se o arquivo se chama `index.html` |
| Continua nos **dados de exemplo** | Link do CSV errado ou planilha não publicada | O link precisa terminar em `output=csv` e ser o do **Publicar na web** (não o link normal de compartilhar) |
| **Prova não aparece** na página | Data em branco / formato estranho, ou nome vazio | A página entende `dd/mm/aaaa` e `aaaa-mm-dd`; confira a linha na planilha |
| Cadastrei e **não atualizou** | O Google demora alguns minutos pra republicar o CSV + cache do navegador | Espere ~5 min e recarregue com `Ctrl+Shift+R` |
| Distância **sem etiqueta** no card | Texto sem número + "k/km" (ex.: só "corrida leve") | Escreva como `5k`, `10 km`, `21k`… |
| **Data limite** não aparece | Campo em branco na planilha, ou o CSV ainda não foi republicado com a coluna nova | Confira a linha na planilha; se acabou de acrescentar a pergunta no Form, espere ~5 min e recarregue com `Ctrl+Shift+R` |

## 📲 Próxima etapa (opcional): avisos no Telegram

Dá pra criar um bot **gratuito** que avisa no grupo, tipo toda quinta: *"📢 Corridas deste fim de semana: …"*, lendo esta mesma planilha e rodando de graça pelo GitHub Actions, **neste mesmo repositório** — sem servidor. Quando a página estiver rodando redonda, é a evolução natural.

---

*Feito pela turma, pra turma. Bora correr! 🏃💨*
