// Pega os elementos do HTML que já existem no seu player
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next'); // Vamos transformar em botão de buscar
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const coverEl = document.getElementById('cover');
const prevBtn = document.getElementById('prev'); // Vamos transformar em campo de busca

// --- INÍCIO DA MÁGICA ---
// A URL base da API gratuita que busca as músicas
const API_URL = 'https://bhindi1.ddns.net/music/api';

// Essa função é a grande novidade! Ela busca a música na API.
async function searchAndPlayMusic(query) {
    if (!query) return; // Não faz nada se o campo estiver vazio

    try {
        // 1. Primeiro, pedimos o 'song_id' usando o termo de busca
        const prepareResponse = await fetch(`${API_URL}/prepare/${query}`);
        const prepareData = await prepareResponse.json();

        if (prepareData.status !== 'success') {
            alert('Música não encontrada! Tente outro nome.');
            return;
        }

        // 2. Com o 'song_id' em mãos, pedimos os detalhes completos (inclusive a audio_url!)
        const fetchResponse = await fetch(`${API_URL}/fetch/${prepareData.song_id}`);
        const songData = await fetchResponse.json();

        // 3. Atualiza a interface do player com as informações da música
        titleEl.textContent = songData.result.title;
        artistEl.textContent = songData.result.artist;
        coverEl.src = songData.result.thumbnail;
        
        // 4. Define o src do elemento <audio> com o link direto do MP3!
        audio.src = songData.result.audio_url;

        // 5. Começa a tocar a música automaticamente
        audio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';

    } catch (error) {
        console.error("Erro ao buscar música:", error);
        alert("Erro ao buscar a música. Tente novamente.");
    }
}

// Função para tocar ou pausar a música
function playPauseSong() {
    if (audio.paused) {
        audio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Avança para a próxima música
function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(songs[currentSongIndex]);
    audio.play(); // Começa a tocar automaticamente
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

// Volta para a música anterior
function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(songs[currentSongIndex]);
    audio.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

// Atualiza a barra de progresso e os tempos
audio.addEventListener('timeupdate', () => {
    const { currentTime, duration } = audio;
    const progressPercent = (currentTime / duration) * 100;
    progress.value = progressPercent;

    // Exibe os tempos formatados
    currentTimeEl.textContent = formatTime(currentTime);
    durationEl.textContent = formatTime(duration);
});

// Permite ao usuário clicar na barra para avançar/retroceder
progress.addEventListener('input', () => {
    const seekTime = (progress.value / 100) * audio.duration;
    audio.currentTime = seekTime;
});

// Formata segundos para "minutos:segundos"
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Conecta os botões às funções
playBtn.addEventListener('click', playPauseSong);
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);