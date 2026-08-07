#!/usr/bin/env node
/* ============================================================================
   BORA CORRER — bot de avisos no Telegram
   ----------------------------------------------------------------------------
   Roda uma vez por dia pelo GitHub Actions, lê a MESMA planilha que a página
   lê, e posta no grupo do Telegram quando:

     • entra corrida nova no calendário
     • faltam 3 dias / 1 dia pro fim das inscrições, e no último dia
     • é véspera da prova

   Pra não repetir aviso, guarda em bot/estado.json o que já mandou. Esse
   arquivo é commitado de volta pelo próprio Actions.

   Uso local:  node bot/avisos.mjs --dry-run     (mostra, não envia)
   ==========================================================================*/

import fs from 'node:fs';

const ARQ_PAGINA  = 'index.html';
const ARQ_ESTADO  = 'bot/estado.json';

const TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const PAGINA  = process.env.PAGINA_URL || '';
const SECO    = process.argv.includes('--dry-run');
const TESTE   = process.argv.includes('--teste');

/* ---------------------------------------------------------------------------
   1. DE ONDE VEM A PLANILHA
   O link não é repetido aqui: a gente lê do CONFIG do index.html, pra nunca
   acontecer de a página apontar pra uma planilha e o bot pra outra.
   ------------------------------------------------------------------------ */
function urlDaPlanilha(){
  const html = fs.readFileSync(ARQ_PAGINA, 'utf8');
  const m = html.match(/URL_PLANILHA_CSV:\s*'([^']*)'/);
  if(!m || !m[1]) throw new Error('URL_PLANILHA_CSV vazio ou não encontrado em ' + ARQ_PAGINA);
  return m[1];
}

/* ---------------------------------------------------------------------------
   2. LEITURA DA PLANILHA
   Estas três funções são gêmeas das que estão no index.html. A duplicação é
   proposital: a página precisa continuar sendo UM arquivo solto, que funciona
   sem build e sem dependência. Se mexer no formato da planilha, mexa nos dois.
   ------------------------------------------------------------------------ */
function lerCSV(texto){
  const linhas = []; let campo = '', linha = [], dentroAspas = false;
  for(let i = 0; i < texto.length; i++){
    const c = texto[i];
    if(dentroAspas){
      if(c === '"' && texto[i+1] === '"'){ campo += '"'; i++; }
      else if(c === '"'){ dentroAspas = false; }
      else campo += c;
    } else {
      if(c === '"') dentroAspas = true;
      else if(c === ','){ linha.push(campo); campo = ''; }
      else if(c === '\n' || c === '\r'){
        if(c === '\r' && texto[i+1] === '\n') i++;
        linha.push(campo); linhas.push(linha); campo = ''; linha = [];
      }
      else campo += c;
    }
  }
  if(campo !== '' || linha.length){ linha.push(campo); linhas.push(linha); }
  return linhas.filter(l => l.some(cel => cel.trim() !== ''));
}

function normalizar(txt){
  return (txt || '').toString().toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
}

function mapearColunas(cabecalhos){
  const idx = { nome:-1, data:-1, cidade:-1, distancias:-1, link:-1, obs:-1, prazo:-1 };
  cabecalhos.forEach((h, i) => {
    const n = normalizar(h);
    if(n.includes('carimbo') || n.includes('timestamp')) return;
    if(n.includes('e-mail') || n.includes('email')) return;
    if(/telegram|whatsapp|telefone|celular|contato/.test(n)) return;
    if(idx.prazo < 0 && /limite|prazo|encerr|fecham|\bate\b/.test(n)) idx.prazo = i;
    else if(idx.nome  < 0 && (n.includes('nome') || n.includes('prova') || n.includes('corrida'))) idx.nome = i;
    else if(idx.data  < 0 && n.includes('data')) idx.data = i;
    else if(idx.cidade< 0 && (n.includes('cidade') || n.includes('local'))) idx.cidade = i;
    else if(idx.distancias < 0 && (n.includes('dist') || n.includes('percurso'))) idx.distancias = i;
    else if(idx.link  < 0 && (n.includes('inscri') || n.includes('link') || n.includes('site'))) idx.link = i;
    else if(idx.obs   < 0 && n.includes('obs')) idx.obs = i;
  });
  return idx;
}

// Datas em UTC de propósito: o Actions roda em UTC e a gente compara só o dia.
function parseData(txt){
  if(!txt) return null;
  txt = txt.toString().trim().split(' ')[0];
  let m = txt.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if(m) return new Date(Date.UTC(+m[3], +m[2]-1, +m[1]));
  m = txt.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if(m) return new Date(Date.UTC(+m[1], +m[2]-1, +m[3]));
  return null;
}

function extrairDistancias(txt){
  if(!txt) return [];
  const achados = txt.toString().toLowerCase().match(/\d+[.,]?\d*\s*k(m)?/g) || [];
  return [...new Set(achados.map(t => t.replace(/\s/g,'').replace(/km$/,'k').replace(',','.')))];
}

function linkSeguro(txt){
  const url = (txt || '').toString().trim();
  if(!url) return '';
  if(/^https?:\/\//i.test(url)) return url;
  if(url.includes(':') || /\s/.test(url)) return '';
  if(!/^[\w-]+(\.[\w-]+)+/.test(url)) return '';
  return 'https://' + url;
}

/* ---------------------------------------------------------------------------
   3. DATAS
   O Actions roda em UTC; o grupo vive no Brasil. Brasil não tem mais horário
   de verão desde 2019, então UTC-3 fixo dá o dia certo o ano inteiro.
   ------------------------------------------------------------------------ */
function hojeBR(){
  const agora = new Date(Date.now() - 3*60*60*1000);
  return new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()));
}
const HOJE = hojeBR();
const dias = (a, b) => Math.round((a - b) / 86400000);
const ddmm = d => String(d.getUTCDate()).padStart(2,'0') + '/' + String(d.getUTCMonth()+1).padStart(2,'0');

/* ---------------------------------------------------------------------------
   4. ENVIO
   ------------------------------------------------------------------------ */
const escHTML = t => (t || '').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

async function enviar(texto){
  if(SECO){ console.log('\n--- [dry-run] mandaria ---\n' + texto + '\n'); return true; }
  const resp = await fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID, text: texto,
      parse_mode: 'HTML', disable_web_page_preview: true
    })
  });
  const corpo = await resp.json().catch(() => ({}));
  if(!resp.ok || !corpo.ok){
    console.error('ERRO do Telegram: ' + resp.status + ' ' + JSON.stringify(corpo));
    return false;
  }
  return true;
}

/* ---------------------------------------------------------------------------
   5. AS MENSAGENS
   ------------------------------------------------------------------------ */
function ficha(p){
  const partes = ['📅 ' + ddmm(p.data) + (p.cidade ? ' · 📍 ' + escHTML(p.cidade) : '')];
  if(p.dists.length) partes.push('🏃 ' + p.dists.join(' / '));
  // Prazo vencido não entra na ficha: no aviso de véspera ficaria a bobagem
  // de anunciar "inscrições até" uma data que já passou.
  if(p.prazo && dias(p.prazo, HOJE) >= 0) partes.push('⏰ inscrições até ' + ddmm(p.prazo));
  if(p.link)         partes.push('🔗 ' + escHTML(p.link));
  return partes.join('\n');
}
const rodape = () => PAGINA ? '\n\nCalendário completo: ' + PAGINA : '';

const MENSAGENS = {
  nova:    p => '🆕 <b>Corrida nova no calendário</b>\n\n<b>' + escHTML(p.nome) + '</b>\n' + ficha(p) + rodape(),
  prazo3:  p => '⏳ <b>Inscrições fechando</b>\n\n<b>' + escHTML(p.nome) + '</b> encerra as inscrições em <b>3 dias</b> (' + ddmm(p.prazo) + ').\n' + ficha(p) + rodape(),
  prazo1:  p => '⏳ <b>Inscrições fecham amanhã</b>\n\n<b>' + escHTML(p.nome) + '</b> — último dia é ' + ddmm(p.prazo) + '.\n' + ficha(p) + rodape(),
  prazo0:  p => '🚨 <b>HOJE é o último dia de inscrição</b>\n\n<b>' + escHTML(p.nome) + '</b>\n' + ficha(p) + rodape(),
  vespera: p => '🏁 <b>É amanhã!</b>\n\n<b>' + escHTML(p.nome) + '</b>\n' + ficha(p) +
                (p.obs ? '\n\n📝 ' + escHTML(p.obs) : '') + '\n\nBora correr! 🏃💨'
};

/* ---------------------------------------------------------------------------
   6. PROGRAMA
   ------------------------------------------------------------------------ */
async function principal(){
  if(!SECO && (!TOKEN || !CHAT_ID)){
    console.error('Faltam os secrets TELEGRAM_BOT_TOKEN e/ou TELEGRAM_CHAT_ID.');
    process.exit(1);
  }

  // Modo teste: manda UMA mensagem no grupo e para. É o único jeito de saber
  // se token e chat_id estão certos de verdade — o --dry-run nem chega a
  // conversar com o Telegram, então não prova nada sobre a conexão.
  if(TESTE){
    console.log('Testando envio para o chat ' + (CHAT_ID || '(vazio!)') + '…');
    const ok = await enviar(
      '✅ <b>Bot do Bora Correr conectado</b>\n\n' +
      'Se esta mensagem chegou no grupo, o token e o chat_id estão certos.\n' +
      'A partir de agora eu aviso quando entrar corrida nova, quando as ' +
      'inscrições estiverem fechando e na véspera da prova. 🏃'
    );
    console.log(ok
      ? 'Enviado. Confira o grupo no Telegram.'
      : 'FALHOU — veja o erro do Telegram acima.');
    process.exit(ok ? 0 : 1);
  }

  const resp = await fetch(urlDaPlanilha(), { cache:'no-store' });
  if(!resp.ok) throw new Error('planilha respondeu HTTP ' + resp.status);
  const linhas = lerCSV(await resp.text());
  if(linhas.length < 2){ console.log('Planilha sem provas. Nada a fazer.'); return; }

  const col = mapearColunas(linhas[0]);
  const hoje = HOJE;
  const provas = linhas.slice(1).map(l => {
    const nome = (col.nome >= 0 ? l[col.nome] : '').trim();
    const data = parseData(col.data >= 0 ? l[col.data] : '');
    if(!nome || !data) return null;
    return {
      id: normalizar(nome).replace(/\s+/g,'-') + '@' + data.toISOString().slice(0,10),
      nome, data,
      prazo:  parseData(col.prazo >= 0 ? l[col.prazo] : ''),
      cidade: (col.cidade >= 0 ? l[col.cidade] : '').trim(),
      obs:    (col.obs    >= 0 ? l[col.obs]    : '').trim(),
      dists:  extrairDistancias(col.distancias >= 0 ? l[col.distancias] : ''),
      link:   linkSeguro(col.link >= 0 ? l[col.link] : '')
    };
  }).filter(Boolean).sort((a,b) => a.data - b.data);

  // Primeira execução: marca tudo como já visto e não posta nada. Sem isso, o
  // grupo levaria uma enxurrada anunciando o calendário inteiro de uma vez.
  const primeiraVez = !fs.existsSync(ARQ_ESTADO);
  const estado = primeiraVez ? {} : JSON.parse(fs.readFileSync(ARQ_ESTADO, 'utf8'));

  if(primeiraVez){
    for(const p of provas) estado['nova:' + p.id] = true;
    if(!SECO) fs.writeFileSync(ARQ_ESTADO, JSON.stringify(estado, null, 2) + '\n');
    console.log('Primeira execução: ' + provas.length + ' prova(s) marcadas como já conhecidas, nada enviado.');
    return;
  }

  // Monta a fila de avisos do dia
  const fila = [];
  for(const p of provas){
    const faltam = dias(p.data, hoje);
    if(faltam < 0) continue;                                   // prova já passou
    if(!estado['nova:' + p.id])   fila.push(['nova:' + p.id, MENSAGENS.nova(p)]);
    if(faltam === 1 && !estado['vespera:' + p.id]) fila.push(['vespera:' + p.id, MENSAGENS.vespera(p)]);
    if(p.prazo){
      const dp = dias(p.prazo, hoje);
      const tipo = dp === 3 ? 'prazo3' : dp === 1 ? 'prazo1' : dp === 0 ? 'prazo0' : null;
      if(tipo && !estado[tipo + ':' + p.id]) fila.push([tipo + ':' + p.id, MENSAGENS[tipo](p)]);
    }
  }

  if(!fila.length){ console.log('Nada pra avisar hoje (' + provas.length + ' prova(s) no calendário).'); return; }

  let enviados = 0;
  for(const [chave, texto] of fila){
    if(await enviar(texto)){ estado[chave] = true; enviados++; }
    await new Promise(r => setTimeout(r, 1000));               // folga pro rate limit
  }
  if(!SECO) fs.writeFileSync(ARQ_ESTADO, JSON.stringify(estado, null, 2) + '\n');
  console.log(SECO
    ? '[dry-run] ' + fila.length + ' aviso(s) SERIAM enviados. Nada foi enviado de verdade.'
    : enviados + ' de ' + fila.length + ' aviso(s) enviados.');
}

principal().catch(e => { console.error(e); process.exit(1); });
