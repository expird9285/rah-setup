// app.js
document.addEventListener('DOMContentLoaded', async () => {
    let SITE_CONFIG, SOFTWARE_DATA, GEAR_DATA, PC_SPECS, SETUP_PHOTOS, GAMES_DATA;
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        SITE_CONFIG = data.SITE_CONFIG;
        SOFTWARE_DATA = data.SOFTWARE_DATA;
        GEAR_DATA = data.GEAR_DATA;
        PC_SPECS = data.PC_SPECS;
        SETUP_PHOTOS = data.SETUP_PHOTOS;
        GAMES_DATA = data.GAMES_DATA;
    } catch (error) {
        console.error("Failed to fetch data:", error);
    }

    // 1. 렌더링 로직
    // ============================================================
    function createGearCard(item) {
        let cardClass = 'card spotlight';
        if (item.size === 'wide') cardClass += ' wide';

        // [수정됨] 마크다운에 따옴표(")가 있어도 깨지지 않게 안전하게 처리
        const safeDesc = (item.desc || item.name).replace(/"/g, '&quot;');

        const isPinned = item.pinned ? 'true' : 'false';

        const dataAttrs = `
            data-action="modal"
            data-brand="${item.brand}"
            data-name="${item.name}"
            data-image="${item.image || ''}"
            data-link="${item.link || '#'}"
            data-desc="${safeDesc}" 
            data-pinned="${isPinned}"
        `;

        // Small 카드 (아이콘)
        if (item.size === 'small') {
            return `
            <div class="${cardClass} small-card" ${dataAttrs}>
                <div class="card-content simple">
                    <div class="text-group">
                        <span class="brand">${item.brand}</span>
                        <h3>${item.name}</h3>
                    </div>
                    <div class="icon-bg"><i class="${item.icon}"></i></div>
                </div>
            </div>`;
        }

        // Racing 카드 (이미지 둥둥)
        if (item.floatImage) {
            return `
            <div class="${cardClass}" ${dataAttrs}>
                <div class="card-content">
                    <span class="brand">${item.brand}</span>
                    <h3>${item.name}</h3>
                    <img src="${item.image}" class="float-img" alt="${item.name}">
                </div>
            </div>`;
        }

        // 일반/Wide 카드
        const isWide = item.size === 'wide';
        // 카드 목록에는 마크다운을 렌더링하지 않고 짧게 보여주거나 생략 (여기선 CSS로 처리됨)
        // 만약 목록에도 설명을 보여주고 싶다면 item.desc를 그대로 출력
        return `
        <div class="${cardClass}" ${dataAttrs}>
            <div class="card-content ${isWide ? 'row' : ''}">
                ${isWide ? `<div class="card-img-wrapper"><img src="${item.image}" alt="${item.name}"></div>` : ''}
                <div class="card-text">
                    <span class="brand">${item.brand}</span>
                    <h3>${item.name}</h3>
                    ${item.desc ? `<p class="desc">${item.desc}</p>` : ''} 
                </div>
                ${!isWide ? `<div class="card-img-wrapper"><img src="${item.image}" alt="${item.name}"></div>` : ''}
            </div>
        </div>`;
    }

    function renderAll() {
        // Gears 렌더링
        if (typeof GEAR_DATA !== 'undefined') {
            GEAR_DATA.forEach(item => {
                const container = document.getElementById(`container-${item.category}`);
                if (container) container.innerHTML += createGearCard(item);
            });
        }

        // Software 렌더링
        const swContainer = document.getElementById('container-software');
        if (swContainer && typeof SOFTWARE_DATA !== 'undefined') {
            SOFTWARE_DATA.forEach(sw => {
                if (sw.link) {
                    swContainer.innerHTML += `<a href="${sw.link}" target="_blank" class="tool-item" title="${sw.name}"><i class="${sw.icon}"></i></a>`;
                } else {
                    swContainer.innerHTML += `<div class="tool-item" title="${sw.name}"><i class="${sw.icon}"></i></div>`;
                }
            });
        }

        // PC Specs 렌더링
        const pcContainer = document.getElementById('container-pc');
        if (pcContainer && typeof PC_SPECS !== 'undefined') {
            const mainSpecs = PC_SPECS.filter(s => s.main);
            const listSpecs = PC_SPECS.filter(s => !s.main);

            // CPU, GPU 통합 카드 생성
            const cpuSpec = mainSpecs.find(s => s.label === 'CPU');
            const gpuSpec = mainSpecs.find(s => s.label === 'GPU');
            const otherMainSpecs = mainSpecs.filter(s => s.label !== 'CPU' && s.label !== 'GPU');

            if (cpuSpec && gpuSpec) {
                pcContainer.innerHTML += `
                <div class="pc-card main-spec spotlight">
                    <div class="spec-item">
                        <div class="spec-icon"><i class="${cpuSpec.icon}"></i></div>
                        <div class="spec-info">
                            <span class="label">${cpuSpec.label}</span>
                            <span class="value">${cpuSpec.value} ${cpuSpec.sub ? `<span class="sub">${cpuSpec.sub}</span>` : ''}</span>
                        </div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-icon"><i class="${gpuSpec.icon}"></i></div>
                        <div class="spec-info">
                            <span class="label">${gpuSpec.label}</span>
                            <span class="value">${gpuSpec.value} ${gpuSpec.sub ? `<span class="sub">${gpuSpec.sub}</span>` : ''}</span>
                        </div>
                    </div>
                </div>`;
            } else {
                // 한쪽이 없는 경우 기존처럼 렌더링 (폴백)
                mainSpecs.forEach(spec => {
                    pcContainer.innerHTML += `
                    <div class="pc-card main-spec spotlight">
                        <div class="spec-icon"><i class="${spec.icon}"></i></div>
                        <div class="spec-info">
                            <span class="label">${spec.label}</span>
                            <span class="value">${spec.value} ${spec.sub ? `<span class="sub">${spec.sub}</span>` : ''}</span>
                        </div>
                    </div>`;
                });
            }

            // 나머지 메인 스펙 (있을 경우)
            otherMainSpecs.forEach(spec => {
                pcContainer.innerHTML += `
                <div class="pc-card main-spec spotlight">
                    <div class="spec-icon"><i class="${spec.icon}"></i></div>
                    <div class="spec-info">
                        <span class="label">${spec.label}</span>
                        <span class="value">${spec.value} ${spec.sub ? `<span class="sub">${spec.sub}</span>` : ''}</span>
                    </div>
                </div>`;
            });

            let listHtml = '<div class="pc-card-group">';
            listSpecs.forEach(spec => {
                listHtml += `
                <div class="pc-list-item">
                    <span class="key">${spec.key}</span>
                    <span class="val">${spec.value}</span>
                </div>`;
            });
            listHtml += '</div>';
            pcContainer.innerHTML += listHtml;
        }

        // Games 렌더링
        const gamesContainer = document.getElementById('container-games');
        if (gamesContainer && typeof GAMES_DATA !== 'undefined') {
            GAMES_DATA.forEach(game => {
                let settingsHtml = '';
                game.settings.forEach(setting => {
                    settingsHtml += `
                    <div class="setting-item">
                        <span class="setting-label">${setting.label}</span>
                        <span class="setting-value">${setting.value}</span>
                    </div>`;
                });

                gamesContainer.innerHTML += `
                <div class="game-card spotlight">
                    <div class="game-header">
                        <div class="game-info">
                            <h3>${game.name}</h3>
                        </div>
                    </div>
                    <div class="game-settings-grid">
                        ${settingsHtml}
                    </div>
                </div>`;
            });
        }

        initSpotlight();
        initModal();
        renderGallery();

        // 5. 토글 로직 추가 (C안 : And More...)
        document.querySelectorAll('.section-header').forEach(header => {
            const content = header.nextElementSibling;
            if (!content || !content.classList.contains('bento-grid')) return; // bento-grid, software-grid 등에만 적용

            // 1) 기본 접힘(collapsed) 상태 적용 (Sim Rig 제외)
            if (content.id !== 'container-racing' && content.id !== 'discord-card' && content.id !== 'container-software') {
                content.classList.add('collapsed');
            }

            // 2) 아이콘 추가 및 초기 방향 설정
            if (!header.querySelector('.toggle-icon')) {
                const icon = document.createElement('i');
                icon.className = 'fa-solid fa-chevron-up toggle-icon';
                icon.style.marginLeft = 'auto';
                icon.style.transition = 'transform 0.4s ease';

                // 처음부터 접혀있다면 화살표도 180도 회전된 상태로 시작
                if (content.classList.contains('collapsed')) {
                    icon.style.transform = 'rotate(180deg)';
                }

                header.appendChild(icon);
            }

            // 2) More Wrapper 추가 (안개 효과 아래 깔릴 글자)
            let moreWrapper = content.querySelector('.more-wrapper');
            if (!moreWrapper) {
                // bento-grid 내부가 아니라 바로 바깥쪽이나 안쪽에 추가해야 하는데, flex/grid 구조상 grid 바깥 부분에 감싸는 div 추가
                moreWrapper = document.createElement('div');
                moreWrapper.className = 'more-wrapper';
                moreWrapper.innerHTML = '<span>+ And More...</span>';
                moreWrapper.style.cursor = 'pointer'; // 클릭 가능하게 설정
                content.appendChild(moreWrapper);

                // [추가됨] And More 영역 누르면 펼쳐지기
                moreWrapper.addEventListener('click', (e) => {
                    e.stopPropagation();
                    content.classList.remove('collapsed');
                    const icon = header.querySelector('.toggle-icon');
                    if (icon) icon.style.transform = 'rotate(0deg)';
                });
            }

            header.addEventListener('click', () => {
                content.classList.toggle('collapsed');
                const icon = header.querySelector('.toggle-icon');

                if (content.classList.contains('collapsed')) {
                    if (icon) icon.style.transform = 'rotate(180deg)';
                } else {
                    if (icon) icon.style.transform = 'rotate(0deg)';
                }
            });
        });
    }

    function renderGallery() {
        const track = document.getElementById('gallery-track');
        if (!track || typeof SETUP_PHOTOS === 'undefined' || SETUP_PHOTOS.length === 0) return;

        // 끊김 없는 스크롤을 위해 리스트를 복제해서 두 번 넣음
        const photos = [...SETUP_PHOTOS, ...SETUP_PHOTOS];

        photos.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.className = 'gallery-item';
            img.alt = 'Setup Photo';
            img.onclick = () => {
                const mImg = document.getElementById('modal-img');
                const mBrand = document.getElementById('modal-brand');
                const mTitle = document.getElementById('modal-title');
                const mDesc = document.getElementById('modal-desc');
                const mLink = document.getElementById('modal-link');
                const modalOverlay = document.getElementById('modal-overlay');

                mBrand.innerText = 'GALLERY';
                mTitle.innerText = 'Setup Photo';
                if (mLink) mLink.style.display = 'none';
                if (mDesc) mDesc.innerHTML = '';

                if (mImg) {
                    mImg.src = src;
                    mImg.style.display = 'block';
                }

                if (modalOverlay) {
                    modalOverlay.classList.add('gallery-mode');
                    modalOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            };
            track.appendChild(img);
        });

        // 갤러리 재생/일시정지 기능 추가
        const toggleBtn = document.getElementById('gallery-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                track.classList.toggle('paused');
                const icon = toggleBtn.querySelector('i');
                if (track.classList.contains('paused')) {
                    icon.className = 'fa-solid fa-play';
                } else {
                    icon.className = 'fa-solid fa-pause';
                }
            });
        }
    }

    // 2. 탭 & 스포트라이트 로직
    // ============================================================
    function initSpotlight() {
        document.querySelectorAll('.spotlight').forEach(card => {
            card.onmousemove = e => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            };
        });
    }

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(targetTab) {
        tabBtns.forEach(btn => {
            if (btn.dataset.tab === targetTab) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === targetTab) {
                setTimeout(() => {
                    content.classList.add('active');
                    initSpotlight();
                }, 150);
            }
        });
    }

    tabBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

    // 3. 모달 로직 (마크다운 적용)
    // ============================================================
    function initModal() {
        const modalOverlay = document.getElementById('modal-overlay');
        const modalCloseBtn = document.getElementById('modal-close');

        const mImg = document.getElementById('modal-img');
        const mBrand = document.getElementById('modal-brand');
        const mTitle = document.getElementById('modal-title');
        const mDesc = document.getElementById('modal-desc'); // 설명 엘리먼트
        const mLink = document.getElementById('modal-link');

        document.body.addEventListener('click', (e) => {
            const card = e.target.closest('.card[data-action="modal"]');
            if (card) {
                const d = card.dataset;

                mBrand.innerText = d.brand;
                mTitle.innerText = d.name;

                const linkVal = d.link ? d.link.trim() : '';
                const hasLink = linkVal !== '' && linkVal !== '#' && linkVal !== 'undefined';
                
                if (mLink) {
                    if (hasLink) {
                        mLink.href = linkVal;
                        mLink.target = '_blank';
                        mLink.style.display = 'inline-flex';
                        mLink.style.pointerEvents = 'auto';
                        mLink.style.opacity = '1';
                    } else {
                        mLink.removeAttribute('href');
                        mLink.removeAttribute('target');
                        mLink.style.display = 'inline-flex';
                        mLink.style.pointerEvents = 'none';
                        mLink.style.opacity = '0.3';
                    }
                }

                // [수정됨] 마크다운 변환 적용
                // marked.parse()가 마크다운 텍스트를 HTML로 바꿔줌
                mDesc.innerHTML = marked.parse(d.desc);

                if (d.image && d.image !== 'undefined') {
                    mImg.src = d.image;
                    mImg.style.display = 'block';
                } else {
                    mImg.style.display = 'none';
                }

                modalOverlay.classList.remove('gallery-mode');
                modalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });

        const closeModal = () => {
            modalOverlay.classList.remove('active');
            modalOverlay.classList.remove('gallery-mode');
            document.body.style.overflow = '';
        };

        modalCloseBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
        });
    }

    // 4. 디스코드 Lanyard API
    // ============================================================
    const DISCORD_ID = (typeof SITE_CONFIG !== 'undefined') ? SITE_CONFIG.discordId : '';
    const discordCard = document.getElementById('discord-card');
    
    if (discordCard && DISCORD_ID) {
        discordCard.style.cursor = 'pointer';
        discordCard.addEventListener('click', () => {
            window.open(`https://discord.com/users/${DISCORD_ID}`, '_blank');
        });
    }

    const discordImage = document.getElementById('discord-image');
    const statusIndicator = document.getElementById('status-indicator');
    const statusHeader = document.getElementById('status-header');
    const statusTitle = document.getElementById('status-title');
    const statusArtist = document.getElementById('status-artist');
    const spotifyProgress = document.getElementById('spotify-progress');
    const progressBarFill = document.querySelector('.progress-bar-fill');

    function connectLanyard() {
        if (!DISCORD_ID) return;
        const ws = new WebSocket('wss://api.lanyard.rest/socket');
        ws.onopen = () => ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_ID } }));
        ws.onmessage = (event) => {
            const { t, d } = JSON.parse(event.data);
            if (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE') updateStatus(d);
        };
        ws.onclose = () => setTimeout(connectLanyard, 5000);
    }

    function updateStatus(data) {
        const spotify = data.spotify;
        if (spotify) {
            discordCard.classList.add('listening');
            statusHeader.innerText = 'NOW LISTENING';
            statusHeader.style.color = '#1db954';
            statusTitle.innerText = spotify.song;
            statusArtist.innerText = spotify.artist + ' — ' + spotify.album;
            discordImage.src = spotify.album_art_url;
            statusIndicator.style.display = 'none';
            spotifyProgress.style.display = 'block';

            const total = spotify.timestamps.end - spotify.timestamps.start;
            const updateBar = () => {
                const current = Date.now() - spotify.timestamps.start;
                const percent = Math.min((current / total) * 100, 100);
                progressBarFill.style.width = `${percent}%`;
                if (percent < 100 && discordCard.classList.contains('listening')) requestAnimationFrame(updateBar);
            };
            updateBar();
        } else {
            discordCard.classList.remove('listening');
            const user = data.discord_user;
            const mainActivity = data.activities.find(a => a.type !== 4);
            const customStatus = data.activities.find(a => a.type === 4);

            if (mainActivity) {
                let headerText = 'PLAYING';
                if (mainActivity.type === 1) headerText = 'STREAMING';
                else if (mainActivity.type === 2) headerText = 'LISTENING TO';
                else if (mainActivity.type === 3) headerText = 'WATCHING';
                else if (mainActivity.type === 5) headerText = 'COMPETING IN';

                statusHeader.innerText = headerText;
                statusHeader.style.color = 'var(--text-main)'; // 강조할 색상 지정
                statusTitle.innerText = mainActivity.name;

                let details = [];
                if (mainActivity.details) details.push(mainActivity.details);
                if (mainActivity.state) details.push(mainActivity.state);
                statusArtist.innerText = details.join(' — ') || 'Active';

                // 활동 아이콘 이미지 처리 (application_id와 assets.large_image 사용)
                if (mainActivity.application_id && mainActivity.assets && mainActivity.assets.large_image) {
                    let imageId = mainActivity.assets.large_image;
                    // proxy 이미지인 경우의 예외 처리
                    if (imageId.startsWith('mp:external/')) {
                        discordImage.src = `https://media.discordapp.net/external/${imageId.replace('mp:external/', '')}`;
                    } else {
                        discordImage.src = `https://cdn.discordapp.com/app-assets/${mainActivity.application_id}/${imageId}.png`;
                    }
                } else {
                    // 아이콘이 없으면 기본 아바타
                    discordImage.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
                }
            } else {
                // 게임 등 메인 활동이 없는 경우 기본 상태
                statusHeader.innerText = 'CURRENT STATUS';
                statusHeader.style.color = 'var(--text-muted)';
                statusTitle.innerText = user.username;
                statusArtist.innerText = customStatus && customStatus.state ? customStatus.state : data.discord_status.toUpperCase();
                discordImage.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
            }

            statusIndicator.style.display = 'block';
            statusIndicator.className = `status-dot ${data.discord_status}`;
            spotifyProgress.style.display = 'none';
        }
    }

    renderAll();
    connectLanyard();
});