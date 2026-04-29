


// 1. اختيار العناصر من الـ HTML (DOM Elements)
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// الأقسام (Sections)
const welcomeSection = document.getElementById('welcomeSection');
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const profileSection = document.getElementById('Github-Profile-Section');
const topReposSection = document.getElementById('TopReposSection');

// عناصر داخل الكارطة (Card Details)
const reposList = document.getElementById('reposList');
const bookmarkCount = document.getElementById('bookmarkCount');

// 2. دالة لجلب بيانات المستخدم (Fetch User)
async function fetchUser(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        
        // التعامل مع أخطاء الـ API
        if (response.status === 404) {
            throw new Error(`Utilisateur "@${username}" non trouvé`);
        } else if (response.status === 403) {
            throw new Error('Limite API atteinte. Réessayez plus tard.');
        } else if (!response.ok) {
            throw new Error('Une erreur inattendue est survenue');
        }

        const data = await response.json();
        return data; // كترجع لينا Object فيه معلومات البروفايل
    } catch (error) {
        throw error; // كتمشي لـ catch اللي غتكون فـ Event Listener
    }
}

// 3. دالة لجلب أفضل الريبوزيتوريز (Fetch Top Repos)
async function fetchUserRepos(username) {
    try {
        // كنطلبوا 5 ديال الريبوزيتوريز مرتبين حسب النجوم (Stars)
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=5`);
        if (!response.ok) return []; // إلا وقع مشكل نرجعو قائمة خاوية
        return await response.json();
    } catch (error) {
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

    // تحديث رابط GitHub
    profileSection.querySelector('.btn-visit').href = user.html_url;

    // إظهار القسم
    profileSection.classList.remove('hidden');
}

// 5. دالة لعرض الريبوزيتوريز (Render Repos)
function displayRepos(repos) {
    reposList.innerHTML = ''; // مسح القديم
    
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

// 6. التحكم في الحالات (State Management)
function showState(state) {
    // إخفاء كلشي
    [welcomeSection, loadingSection, errorSection, profileSection, topReposSection].forEach(s => s.classList.add('hidden'));

    // إظهار الحالة المطلوبة
    if (state === 'loading') loadingSection.classList.remove('hidden');
    if (state === 'error') errorSection.classList.remove('hidden');
    if (state === 'welcome') welcomeSection.classList.remove('hidden');
}

// 7. المنطق الرئيسي للبحث (Search Logic)
async function handleSearch() {
    const username = searchInput.value.trim();
    if (!username) return;

    showState('loading');

    try {
        // جلب البيانات فدقة وحدة
        const [user, repos] = await Promise.all([
            fetchUser(username),
            fetchUserRepos(username)
        ]);

        showState('none'); // إخفاء Loading
        displayUser(user);
        displayRepos(repos);

    } catch (error) {
        showState('error');
        errorSection.querySelector('.error-text').textContent = `❌ ${error.message}`;
    }
}

// 8. الـ Event Listeners
searchBtn.addEventListener('click', handleSearch);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});