// Elementos da UI
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');
const playerBar = document.getElementById('player-bar');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const playerCover = document.getElementById('player-cover');
const playBtn = document.getElementById('play-btn');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationTimeEl = document.getElementById('duration-time');
const volumeBar = document.getElementById('volume-bar');
const volumeBtn = document.getElementById('volume-btn');
const menuToggle = document.getElementById('menu-toggle');
const menuClose = document.getElementById('menu-close');
const sidebar = document.getElementById('sidebar');

// Estado
let player;
let currentVideoId = null;
let progressAnimationFrame = null;
let lastSearchResults = [];

// --- Menu Mobile ---
function openSidebar() {
    sidebar.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    sidebar.classList.remove('open');
    document.body.style.overflow = '';
}

menuToggle.addEventListener('click', openSidebar);
menuClose.addEventListener('click', closeSidebar);

// Fecha sidebar ao clicar fora (opcional, mas melhora UX)
document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && e.target !== menuToggle && sidebar.classList.contains('open')) {
        closeSidebar();
    }
});

// --- YouTube API ---
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-audio-player', {
        height: '0',
        width: '0',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady() {
    console.log('Player YouTube pronto');
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        startProgressUpdate();
    } else if (event.data === YT.PlayerState.PAUSED) {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        stopProgressUpdate();
    } else if (event.data === YT.PlayerState.ENDED) {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        stopProgressUpdate();
    }
}

// --- iTunes API ---
async function searchItunes(query) {
    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=12`);
        if (!response.ok) throw new Error('Falha na rede');
        const data = await response.json();
        return data.results.map(track => ({
            title: track.trackName,
            artist: track.artistName,
            cover: track.artworkUrl100.replace('100x100bb', '600x600bb'),
            previewUrl: track.previewUrl,
            artistId: track.artistId,
            collectionId: track.collectionId
        }));
    } catch (error) {
        console.error('Erro iTunes:', error);
        return [];
    }
}

// --- Busca de ID do YouTube (com fallback) ---
async function fetchYouTubeId(title, artist) {
    const query = `${artist} - ${title}`;
    // Primeira tentativa: Invidious
    try {
        const response = await fetch(`https://invidi.link/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const link = doc.querySelector('a[href^="/watch?v="]');
            if (link) return link.getAttribute('href').split('=')[1];
        }
    } catch (e) { /* ignora */ }
    // Fallback: API simples sem chave (yt.lemnoslife.com?q=...)
    try {
        const res = await fetch(`https://yt.lemnoslife.com/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.items && data.items.length > 0) {
            return data.items[0].id;
        }
    } catch (e) { /* ignora */ }
    return null;
}

// --- Reprodução ---
async function playTrack(track) {
    updatePlayerUI(track);
    const videoId = await fetchYouTubeId(track.title, track.artist);
    if (videoId && player && player.loadVideoById) {
        currentVideoId = videoId;
        player.loadVideoById(videoId);
    } else {
        alert('Não foi possível encontrar o vídeo para esta música.');
    }
}

function updatePlayerUI(track) {
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;
    playerCover.src = track.cover;
    playerBar.style.display = 'flex';
}

// --- Controles ---
playBtn.addEventListener('click', () => {
    if (player && currentVideoId) {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    } else {
        searchAndPlay('Billie Eilish');
    }
});

// Progresso com requestAnimationFrame (mais suave)
function startProgressUpdate() {
    function step() {
        if (player && player.getCurrentTime && player.getDuration) {
            const ct = player.getCurrentTime();
            const dur = player.getDuration();
            if (dur > 0) {
                progressBar.value = (ct / dur) * 100;
                currentTimeEl.textContent = formatTime(ct);
                durationTimeEl.textContent = formatTime(dur);
            }
        }
        progressAnimationFrame = requestAnimationFrame(step);
    }
    step();
}

function stopProgressUpdate() {
    if (progressAnimationFrame) {
        cancelAnimationFrame(progressAnimationFrame);
        progressAnimationFrame = null;
    }
}

progressBar.addEventListener('input', () => {
    if (player && player.getDuration) {
        const seek = (progressBar.value / 100) * player.getDuration();
        player.seekTo(seek, true);
    }
});

// Volume
volumeBar.addEventListener('input', () => {
    if (player) player.setVolume(volumeBar.value);
});

volumeBtn.addEventListener('click', () => {
    if (player) {
        if (player.isMuted()) {
            player.unMute();
            volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        } else {
            player.mute();
            volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    }
});

// --- Busca principal ---
async function searchAndPlay(query) {
    if (!query.trim()) return;
    const tracks = await searchItunes(query);
    lastSearchResults = tracks;
    if (tracks.length === 0) {
        alert('Nenhuma música encontrada.');
        return;
    }
    playTrack(tracks[0]);
    displaySearchResults(tracks);
}

function displaySearchResults(tracks) {
    if (!searchResults) return;
    searchResults.style.display = 'grid';
    searchResults.innerHTML = tracks.map((track, i) => `
        <div class="search-result-card" data-index="${i}">
            <img src="${track.cover}" alt="${track.title}">
            <h3>${track.title}</h3>
            <p>${track.artist}</p>
        </div>
    `).join('');

    document.querySelectorAll('.search-result-card').forEach(card => {
        card.addEventListener('click', function() {
            const idx = this.dataset.index;
            if (lastSearchResults[idx]) {
                playTrack(lastSearchResults[idx]);
            }
        });
    });
}

searchButton.addEventListener('click', () => searchAndPlay(searchInput.value));
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchAndPlay(searchInput.value);
});

// --- Conteúdo inicial (cards) ---
function renderInitialCards() {
    const artists = ['Billie Eilish', 'The Weeknd', 'Anitta', 'Coldplay', 'Dua Lipa', 'Post Malone', 'Ariana Grande', 'Drake'];
    const trendingGrid = document.getElementById('trending-grid');
    trendingGrid.innerHTML = artists.map(a => `
        <div class="card" data-query="${a}">
            <img src="https://via.placeholder.com/300/FF3366/FFFFFF?text=${encodeURIComponent(a)}" alt="${a}">
            <h3>${a}</h3>
            <p>Artista</p>
        </div>
    `).join('');
    trendingGrid.querySelectorAll('.card').forEach(c => {
        c.addEventListener('click', () => searchAndPlay(c.dataset.query));
    });

    // Playlists
    const playlists = ['Hits do Momento', 'Rock Clássico', 'Sertanejo', 'Eletrônica', 'MPB', 'Hip Hop', 'Jazz', 'Indie'];
    document.getElementById('playlists-grid').innerHTML = playlists.map(p => `
        <div class="card" data-query="${p}">
            <img src="https://via.placeholder.com/300/3366FF/FFFFFF?text=${encodeURIComponent(p)}" alt="${p}">
            <h3>${p}</h3>
            <p>Playlist</p>
        </div>
    `).join('');
    document.getElementById('playlists-grid').querySelectorAll('.card').forEach(c => {
        c.addEventListener('click', () => searchAndPlay(c.dataset.query));
    });

    // Categorias
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
    document.getElementById('categories-grid').innerHTML = categories.map(c => `
        <div class="category-item" style="background-color: ${c.color}" data-query="${c.genre}">
            <span>${c.name}</span>
        </div>
    `).join('');
    document.getElementById('categories-grid').querySelectorAll('.category-item').forEach(el => {
        el.addEventListener('click', () => searchAndPlay(el.dataset.query));
    });
}

// Utilitários
function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Inicialização
renderInitialCards();