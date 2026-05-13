

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const welcomeSection = document.getElementById('welcomeSection');
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const profileSection = document.getElementById('Github-Profile-Section');
const topReposSection = document.getElementById('TopReposSection');
const reposList = document.getElementById('reposList');
const bookmarkCount = document.getElementById('bookmarkCount');

let lastFetchedUser = null; 

async function fetchUser(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}`, {
            headers: {
                'Authorization': `token ${env.Token}` 
            }
        });
        
        if (response.status === 404) {
            throw new Error(`Utilisateur "@${username}" non trouvé`);
        } else if (response.status === 403) {
            throw new Error('Limite API atteinte. Réessayez plus tard.');
        } else if (!response.ok) {
            throw new Error('Une erreur inattendue est survenue');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

async function fetchUserRepos(username) {
    try {

        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=5`, {
             headers: {
                'Authorization': `token ${env.Token}` 
            }
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Erreur Repos:", error);
        return [];
    }
}

function displayUser(user) {
    profileSection.querySelector('.profile-pic').src = user.avatar_url;
    profileSection.querySelector('.username').textContent = user.name || user.login;
    profileSection.querySelector('.bio').textContent = user.bio || "Pas de bio disponible";
    
    const stats = profileSection.querySelectorAll('.stat-value');
    stats[0].textContent = user.public_repos;
    stats[1].textContent = user.followers;
    stats[2].textContent = user.following;

    profileSection.querySelector('.btn-visit').href = user.html_url;

    profileSection.classList.remove('hidden');
}

function displayRepos(repos) {
    reposList.innerHTML = ''; 
    
    if (repos.length === 0) {
        reposList.innerHTML = '<p>Aucun repository public.</p>';
    } else {
        repos.forEach(repo => {
            const repoCard = `
                <div class="repo-card">
                    <div class="repo-header">
                        <a href="${repo.html_url}" target="_blank" class="repo-name">${repo.name}</a>
                        <span class="repo-stars">⭐ ${repo.stargazers_count}</span>
                    </div>
                    <p class="repo-desc">${repo.description || 'No description'}</p>
                    <div class="repo-footer">
                        <span>📄 ${repo.language || 'Mixed'}</span>
                        <span>🍴 ${repo.forks_count}</span>
                    </div>
                </div>
            `;
            reposList.insertAdjacentHTML('beforeend', repoCard);
        });
    }
    topReposSection.classList.remove('hidden');
}

function showState(state) {
    [welcomeSection, loadingSection, errorSection, profileSection, topReposSection].forEach(s => s.classList.add('hidden'));

    if (state === 'loading') loadingSection.classList.remove('hidden');
    if (state === 'error') errorSection.classList.remove('hidden');
    if (state === 'welcome') welcomeSection.classList.remove('hidden');
}

async function handleSearch() {
    const username = searchInput.value.trim();
    if (!username) return;

    showState('loading');

    try {
        const [user, repos] = await Promise.all([
            fetchUser(username),
            fetchUserRepos(username)
        ]);

        lastFetchedUser = user;
        
        showState('none'); 
        displayUser(user);
        displayRepos(repos);

    } catch (error) {
        showState('error');
        errorSection.querySelector('.error-text').textContent = `❌ ${error.message}`;
    }
}

searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});


let bookmarks = JSON.parse(localStorage.getItem('github-bookmarks')) || [];
updateBookmarkCount();

const toggleBookmarksBtn = document.getElementById('toggleBookmarks');
const bookmarksSection = document.getElementById('bookmarksSection');

toggleBookmarksBtn.addEventListener('click', () => {
    bookmarksSection.classList.toggle('hidden');
    if (!bookmarksSection.classList.contains('hidden')) renderBookmarks();
});

function addBookmark(user) {
    if (!user) return;
    const isExist = bookmarks.some(b => b.login === user.login);
    
    if (isExist) {
        alert('Cet utilisateur est déjà dans vos favoris !');
        return;
    }

    bookmarks.push({
        login: user.login,
        name: user.name || user.login,
        avatar_url: user.avatar_url
    });

    saveAndRefresh();
}

function removeBookmark(username) {
    bookmarks = bookmarks.filter(b => b.login !== username);
    saveAndRefresh();
}

function saveAndRefresh() {
    localStorage.setItem('github-bookmarks', JSON.stringify(bookmarks));
    updateBookmarkCount();
    renderBookmarks();
}

function updateBookmarkCount() {
    bookmarkCount.textContent = bookmarks.length;
}

function renderBookmarks() {
    const bookmarksList = document.getElementById('bookmarksList');
    bookmarksList.innerHTML = '';

    if (bookmarks.length === 0) {
        bookmarksList.innerHTML = '<p style="text-align:center; padding:20px;">Aucun favori pour le moment.</p>';
        return;
    }

    bookmarks.forEach(user => {
        const bookmarkRow = `
            <div class="user-bookmark-row">
                <div class="user-meta">
                    <img src="${user.avatar_url}" alt="${user.login}" class="avatar-sm">
                    <div class="user-names">
                        <span class="full-name">${user.name}</span>
                        <span class="user-handle">@${user.login}</span>
                    </div>
                </div>
                <div class="row-actions">
                    <button class="btn btn-view" onclick="searchSpecificUser('${user.login}')">View</button>
                    <button class="btn btn-remove" onclick="removeBookmark('${user.login}')">Remove</button>
                </div>
            </div>
        `;
        bookmarksList.insertAdjacentHTML('beforeend', bookmarkRow);
    });
}

window.searchSpecificUser = function(username) {
    searchInput.value = username;
    handleSearch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

document.querySelector('.btn-bookmark').addEventListener('click', () => {
    addBookmark(lastFetchedUser);
});