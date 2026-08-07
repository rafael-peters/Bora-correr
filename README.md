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

Se quiser oferecer os avisos por Telegram, acrescente também estas duas — mas leia antes a nota de privacidade do Passo 4, porque elas guardam dado pessoal:

| Pergunta | Tipo | Obrigatória? |
|---|---|---|
| Avisos pelo Telegram (marque as opções) | Caixas de seleção | Não |
| Meu número do Telegram | Resposta curta | Não |

A página **ignora** essas duas colunas de propósito: número de telefone nunca vai pra tela. Elas existem só pra alimentar o bot de avisos (veja o fim deste arquivo).

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

> 🔒 **LEIA ISTO — privacidade.** "Publicar na web" deixa **a aba inteira** legível pra qualquer pessoa com o link, e o link fica visível no código-fonte da página. Se o seu formulário coleta e-mail ou número de Telegram, **esses dados ficam públicos** — não adianta a página não exibi-los.
>
> A página só *lê* as colunas da corrida (veja `&range=C:I` no `CONFIG`), mas isso é conveniência, **não proteção**: basta tirar o `range` da URL pra ver tudo.
>
> **A proteção de verdade** é nunca publicar a aba que tem dados pessoais. Crie uma aba nova na planilha, ponha isto em `A1`:
>
> ```
> =QUERY('Respostas ao formulário 1'!A:I; "select C,D,E,F,G,H,I"; 1)
> ```
>
> Publique **essa** aba (e só ela) e use o link dela no `CONFIG`. Se a sua planilha usar vírgula como separador de fórmula, troque os `;` por `,`.
>
> ⚠️ **O passo que quase todo mundo esquece:** publicar a aba nova **não** despublica a antiga. As duas ficam no ar ao mesmo tempo, sob o mesmo endereço-base — muda só o `gid`. Enquanto a aba de respostas continuar publicada, os e-mails e telefones seguem acessíveis.
>
> Pra fechar de verdade: *Arquivo → Compartilhar → Publicar na web* → aba **Conteúdo publicado e configurações** → localize a aba de respostas na lista e **desmarque** ela (ou clique em *Parar de publicar* e publique de novo só a aba nova).
>
> Pra conferir se funcionou, abra o link do CSV **sem** o `&gid=...` no navegador. Se ainda aparecerem e-mails, a aba antiga continua publicada.

## ✅ Passo 5 — Colar os dois links no CONFIG

Dá pra editar direto no navegador, sem instalar nada:

1. No repositório, clique no arquivo **`index.html`**
2. Clique no ícone de **lápis** ✏️ (*Edit this file*), no canto superior direito
3. Aperte `Ctrl+F` e procure por **`CONFIG`**
4. Cole os links **entre as aspas**, sem apagar as vírgulas do fim das linhas:

   ```js
   URL_PLANILHA_CSV: 'https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=1901872318&single=true&output=csv',
   URL_FORMULARIO: 'https://forms.gle/xxxxxxxx'
   ```

   > 💡 **Se o link que o Google te deu tem `pubhtml`**, ele é a versão em página web, não CSV — a página não consegue ler. Converta assim: troque `pubhtml?` por `pub?` e acrescente `&output=csv` no fim.
   >
   > | | |
   > |---|---|
   > | Veio assim | `.../pubhtml?gid=1901872318&single=true` |
   > | Use assim | `.../pub?gid=1901872318&single=true&output=csv` |

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
- **Botão "Entrar no grupo" do Telegram:** em `CONFIG`, campo `URL_GRUPO_TELEGRAM`. Enquanto estiver vazio, o bloco inteiro não aparece na página — nada de botão quebrado
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

## 📲 Avisos no Telegram

O bot já está pronto (`bot/avisos.mjs` + `.github/workflows/avisos-telegram.yml`). Ele roda **de graça** pelo GitHub Actions uma vez por dia, lê a mesma planilha que a página lê, e posta **no grupo do Telegram** quando:

- entra corrida nova no calendário
- faltam 3 dias, 1 dia, e no último dia de inscrição
- é véspera da prova

> ⚠️ **Por que no grupo e não no privado de cada um?** Bots do Telegram **não conseguem** mandar mensagem pra alguém pelo número de telefone, nem iniciar conversa — a pessoa teria que abrir o bot e mandar `/start` antes. O campo "meu número do Telegram" do formulário, portanto, não serve pra enviar nada. Postando no grupo, todo mundo recebe e não é preciso guardar dado pessoal nenhum. Se quiser, pode até remover essa pergunta do Form.

### Passo 1 — Criar o bot

No Telegram, converse com o [@BotFather](https://t.me/BotFather): mande `/newbot`, escolha um nome e um usuário terminado em `bot`. Ele devolve um **token** parecido com `8123456789:AAH...`. Guarde.

### Passo 2 — Colocar o bot no grupo e descobrir o `chat_id`

1. Adicione o bot ao grupo da turma
2. Mande no grupo a mensagem `/start@seu_bot` (com o `@` do bot — em grupo, o bot só enxerga mensagens dirigidas a ele)
3. Abra no navegador, trocando `SEU_TOKEN`:

   ```
   https://api.telegram.org/botSEU_TOKEN/getUpdates
   ```

4. Procure por `"chat":{"id":-1001234567890`. Esse número **com o sinal de menos** é o `chat_id` do grupo

> O valor do secret é **só o número**, nada mais: `-1001234567890`. Sem aspas, sem prefixo, sem `id=`. Supergrupo começa com `-100`; grupo comum é um negativo mais curto. Se ficar positivo, você pegou o id da *sua* conta em vez do grupo.

### Passo 3 — Guardar os dois valores como *secrets*

No repositório: **Settings → Secrets and variables → Actions → New repository secret**. Crie dois:

| Nome | Valor |
|---|---|
| `TELEGRAM_BOT_TOKEN` | o token do BotFather |
| `TELEGRAM_CHAT_ID` | o número do grupo (com o `-`) |

> 🔒 Nunca coloque o token no código. Quem tiver o token controla o bot.

### Passo 4 — Testar

Na aba **Actions** do repositório, escolha **Avisos no Telegram → Run workflow**. Há três modos:

| Modo | O que faz | Quando usar |
|---|---|---|
| `teste` *(padrão)* | Manda **uma** mensagem no grupo dizendo que o bot conectou | Primeiro de todos: é o único que prova que token e `chat_id` estão certos |
| `dry-run` | Mostra no log o que **seria** postado, sem postar | Pra conferir o texto dos avisos antes de soltar no grupo |
| `valendo` | Comportamento normal, igual ao agendamento diário | Quando quiser adiantar a execução do dia |

Comece pelo `teste`. Se a mensagem chegar no grupo, está tudo certo. Se o log disser `FALHOU`, o erro do Telegram aparece logo acima — `chat not found` é `chat_id` errado, `Unauthorized` é token errado.

A **primeira execução de verdade** não envia nada de propósito: ela marca as corridas que já estão na planilha como "conhecidas" e cria o `bot/estado.json`. Sem isso, o grupo levaria uma enxurrada anunciando o calendário inteiro de uma vez. Dali em diante, só o que for novidade vira mensagem.

### Passo 5 — Botar o convite do grupo na página

Pra galera achar o grupo, a página mostra um bloco "📲 Avisos no Telegram" com um botão **Entrar no grupo**. Ele só aparece depois que você preencher o link:

1. No Telegram, toque no **nome do grupo** → **Convidar via link** → copiar
2. Cole em `URL_GRUPO_TELEGRAM`, no `CONFIG` do `index.html`

Fica parecido com `https://t.me/+AbCdEf123` (grupo privado) ou `https://t.me/nomedogrupo` (grupo público).

### Como funciona por dentro

O `bot/estado.json` guarda o que já foi avisado e é commitado de volta pelo próprio Actions — é ele que impede o bot de repetir a mesma mensagem todo dia. **Não apague esse arquivo**, ou o bot vai reanunciar tudo.

O horário está em `.github/workflows/avisos-telegram.yml`, na linha `cron: '0 12 * * *'` — 12:00 UTC, ou 09:00 em Brasília. O cron do GitHub sempre usa UTC.

O bot lê o link da planilha do próprio `index.html`, então nunca acontece de a página apontar pra uma planilha e o bot pra outra.

Pra testar na sua máquina, sem enviar nada: `node bot/avisos.mjs --dry-run`

---

*Feito pela turma, pra turma. Bora correr! 🏃💨*
