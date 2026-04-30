


const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

const welcomeSection = document.getElementById('welcomeSection');
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const profileSection = document.getElementById('Github-Profile-Section');
const topReposSection = document.getElementById('TopReposSection');

const reposList = document.getElementById('reposList');
const bookmarkCount = document.getElementById('bookmarkCount');


async function fetchUser(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}` ,{headers: {
                'Authorization': `token ${env.Token}`
            }});
        
        if (response.status === 404) {
            throw new Error(`Utilisateur "@${username}" non trouvé`);
        } else if (response.status === 403) {
            throw new Error('Limite API atteinte. Réessayez plus tard.');
        } else if (!response.ok) {
            throw new Error('Une erreur inattendue est survenue');
        }

        const data = await response.json();
        return data; 
    } catch (error) {
        throw error;
    }
}

async function fetchUserRepos(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=5`);
        if (!response.ok) return [];

        return await response.json();
    } 
    
    catch (error) {
        console.error("Erreur Repos:", error);
        return [];
    }
}

// 4. دالة لتحديث واجهة المستخدم (Update UI)
function displayUser(user) {
    // تحديث الصورة والسمية والبيو فوسط الكارطة
    profileSection.querySelector('.profile-pic').src = user.avatar_url;
    profileSection.querySelector('.username').textContent = user.name || user.login;
    profileSection.querySelector('.bio').textContent = user.bio || "Pas de bio disponible";
    
    // تحديث الأرقام (Stats)
    const stats = profileSection.querySelectorAll('.stat-value');
    stats[0].textContent = user.public_repos;
    stats[1].textContent = user.followers;
    stats[2].textContent = user.following;

    profileSection.querySelector('.btn-visit').href = user.html_url;

    // Show Section
    profileSection.classList.remove('hidden');
}

// 5. دالة لعرض الريبوزيتوريز (Render Repos)
function displayRepos(repos) {
    reposList.innerHTML = ''; // مسح القديم
    
    if (repos.length === 0) {
        reposList.innerHTML = '<p>Aucun repository public.</p>';
    } 
    else {
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

        showState('none'); 
        displayUser(user);
        displayRepos(repos);

    } 
    catch (error) {
        showState('error');
        errorSection.querySelector('.error-text').textContent = `❌ ${error.message}`;
    }
}

searchBtn.addEventListener('click', handleSearch);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

console.log(env)