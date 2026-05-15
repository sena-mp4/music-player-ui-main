// Elementos do Player
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationTimeEl = document.getElementById('duration-time');
const volumeBar = document.getElementById('volume-bar');
const volumeBtn = document.getElementById('volume-btn');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const playerCover = document.getElementById('player-cover');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// API gratuita para buscar músicas
const API_URL = 'https://bhindi1.ddns.net/music/api';

// Função para buscar música na API
async function searchAndPlayMusic(query) {
    if (!query) return;
    
    try {
        const prepareResponse = await fetch(`${API_URL}/prepare/${encodeURIComponent(query)}`);
        const prepareData = await prepareResponse.json();
        
        if (prepareData.status !== 'success') {
            alert('Música não encontrada! Tente outro nome.');
            return;
        }
        
        const fetchResponse = await fetch(`${API_URL}/fetch/${prepareData.song_id}`);
        const songData = await fetchResponse.json();
        
        if (songData.status === 'success') {
            updatePlayerUI(songData.result);
            audio.src = songData.result.audio_url;
            audio.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
    } catch (error) {
        console.error('Erro ao buscar música:', error);
        alert('Erro ao buscar a música. Tente novamente.');
    }
}

// Atualizar interface do player
function updatePlayerUI(result) {
    playerTitle.textContent = result.title || 'Título';
    playerArtist.textContent = result.artist || 'Artista';
    playerCover.src = result.thumbnail || 'https://via.placeholder.com/50';
}

// Controles de reprodução
playBtn.addEventListener('click', () => {
    if (audio.paused && audio.src) {
        audio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else if (!audio.paused) {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        // Se não houver música selecionada, busca uma padrão
        searchAndPlayMusic('pop hits 2024');
    }
});

prevBtn.addEventListener('click', () => {});
nextBtn.addEventListener('click', () => {});

// Barra de progresso
audio.addEventListener('timeupdate', () => {
    const { currentTime, duration } = audio;
    if (duration) {
        progressBar.value = (currentTime / duration) * 100;
        currentTimeEl.textContent = formatTime(currentTime);
        durationTimeEl.textContent = formatTime(duration);
    }
});

progressBar.addEventListener('input', () => {
    const seekTime = (progressBar.value / 100) * audio.duration;
    audio.currentTime = seekTime;
});

// Volume
volumeBar.addEventListener('input', () => {
    audio.volume = volumeBar.value / 100;
    updateVolumeIcon();
});

volumeBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    updateVolumeIcon();
});

function updateVolumeIcon() {
    if (audio.muted || audio.volume === 0) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (audio.volume < 0.5) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
        volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

// Funções auxiliares
function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Busca
searchButton.addEventListener('click', () => {
    searchAndPlayMusic(searchInput.value);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchAndPlayMusic(searchInput.value);
    }
});

// ===== CONTEÚDO DA PÁGINA INICIAL =====
const trendingArtists = [
    { name: 'Billie Eilish', query: 'Billie Eilish', cover: 'https://via.placeholder.com/160/FF3366/FFFFFF?text=Billie' },
    { name: 'The Weeknd', query: 'The Weeknd', cover: 'https://via.placeholder.com/160/3366FF/FFFFFF?text=Weeknd' },
    { name: 'Anitta', query: 'Anitta', cover: 'https://via.placeholder.com/160/33FF66/FFFFFF?text=Anitta' },
    { name: 'Coldplay', query: 'Coldplay', cover: 'https://via.placeholder.com/160/FFCC00/FFFFFF?text=Coldplay' },
    { name: 'Dua Lipa', query: 'Dua Lipa', cover: 'https://via.placeholder.com/160/FF6600/FFFFFF?text=Dua+Lipa' },
    { name: 'Post Malone', query: 'Post Malone', cover: 'https://via.placeholder.com/160/9933FF/FFFFFF?text=Post' },
    { name: 'Ariana Grande', query: 'Ariana Grande', cover: 'https://via.placeholder.com/160/FF3399/FFFFFF?text=Ariana' },
    { name: 'Drake', query: 'Drake', cover: 'https://via.placeholder.com/160/3399FF/FFFFFF?text=Drake' }
];

const playlists = [
    { name: 'Hits do Momento', query: 'pop hits 2024', cover: 'https://via.placeholder.com/160/FF4444/FFFFFF?text=Hits' },
    { name: 'Clássicos do Rock', query: 'classic rock', cover: 'https://via.placeholder.com/160/4444FF/FFFFFF?text=Rock' },
    { name: 'Sertanejo Top', query: 'sertanejo', cover: 'https://via.placeholder.com/160/44FF44/FFFFFF?text=Sertanejo' },
    { name: 'Eletrônica', query: 'electronic music', cover: 'https://via.placeholder.com/160/FFFF44/FFFFFF?text=Eletro' },
    { name: 'MPB Essencial', query: 'mpb brasileira', cover: 'https://via.placeholder.com/160/FF44FF/FFFFFF?text=MPB' },
    { name: 'Hip Hop', query: 'hip hop', cover: 'https://via.placeholder.com/160/44FFFF/FFFFFF?text=HipHop' },
    { name: 'Jazz Relax', query: 'jazz', cover: 'https://via.placeholder.com/160/FF8844/FFFFFF?text=Jazz' },
    { name: 'Indie', query: 'indie music', cover: 'https://via.placeholder.com/160/8844FF/FFFFFF?text=Indie' }
];

const categories = [
    { name: '🎤 Pop', genre: 'pop', color: '#FF3366' },
    { name: '🎸 Rock', genre: 'rock', color: '#E91E63' },
    { name: '🎧 Eletrônica', genre: 'electronic', color: '#9C27B0' },
    { name: '🎹 MPB', genre: 'mpb', color: '#673AB7' },
    { name: '🤠 Sertanejo', genre: 'sertanejo', color: '#3F51B5' },
    { name: '🎵 Funk', genre: 'funk', color: '#2196F3' },
    { name: '🎷 Jazz', genre: 'jazz', color: '#009688' },
    { name: '🎼 Clássica', genre: 'classical', color: '#4CAF50' },
    { name: '🎙️ Hip Hop', genre: 'hip hop', color: '#FF9800' },
    { name: '🌍 Reggae', genre: 'reggae', color: '#FF5722' }
];

// Preencher grade "Em Alta"
function renderTrending() {
    const grid = document.getElementById('trending-grid');
    grid.innerHTML = trendingArtists.map(artist => `
        <div class="card" onclick="searchAndPlayMusic('${artist.query}')">
            <img src="${artist.cover}" alt="${artist.name}">
            <h3>${artist.name}</h3>
            <p>Artista</p>
        </div>
    `).join('');
}

// Preencher grade "Playlists"
function renderPlaylists() {
    const grid = document.getElementById('playlists-grid');
    grid.innerHTML = playlists.map(playlist => `
        <div class="card" onclick="searchAndPlayMusic('${playlist.query}')">
            <img src="${playlist.cover}" alt="${playlist.name}">
            <h3>${playlist.name}</h3>
            <p>Playlist</p>
        </div>
    `).join('');
}

// Preencher grade "Categorias"
function renderCategories() {
    const grid = document.getElementById('categories-grid');
    grid.innerHTML = categories.map(cat => `
        <div class="category-item" style="background-color: ${cat.color}" onclick="searchAndPlayMusic('${cat.genre}')">
            <span>${cat.name}</span>
        </div>
    `).join('');
}

// Inicializar página
renderTrending();
renderPlaylists();
renderCategories();