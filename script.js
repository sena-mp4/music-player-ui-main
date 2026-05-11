// Seleciona os elementos do HTML com os quais vamos interagir
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const coverEl = document.getElementById('cover');

// Lista de músicas de exemplo (funciona melhor com arquivos locais)
const songs = [
    {
        title: "Música Exemplo 1",
        artist: "Artista A",
        src: "caminho/para/sua/musica1.mp3",
        cover: "caminho/para/sua/capa1.jpg"
    },
    {
        title: "Música Exemplo 2",
        artist: "Artista B",
        src: "caminho/para/sua/musica2.mp3",
        cover: "caminho/para/sua/capa2.jpg"
    }
];

let currentSongIndex = 0;

// Função para carregar uma música da lista
function loadSong(song) {
    titleEl.textContent = song.title;
    artistEl.textContent = song.artist;
    audio.src = song.src;
    coverEl.src = song.cover;
}

// Carrega a primeira música ao iniciar
loadSong(songs[currentSongIndex]);

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