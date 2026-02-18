// Football League Simulation System - Main JavaScript
// Data Models and Storage System

class FootballSimulation {
    constructor() {
        this.teams = JSON.parse(localStorage.getItem('teams')) || [];
        this.seasons = JSON.parse(localStorage.getItem('seasons')) || [];
        this.matches = JSON.parse(localStorage.getItem('matches')) || [];
        this.europeanResults = JSON.parse(localStorage.getItem('europeanResults')) || [];
        this.countryCoefficients = JSON.parse(localStorage.getItem('countryCoefficients')) || [];
        this.settings = JSON.parse(localStorage.getItem('settings')) || this.getDefaultSettings();
        this.currentSeason = this.getCurrentSeason();
        
        // Tek katsayı listesi (kullanıcı verisi) - sıra: 1-24
        this.coefficientRanking = [
            { country: 'Spain', countryTr: 'İspanya', coefficient: 23.4, flag: '🇪🇸' },
            { country: 'Germany', countryTr: 'Almanya', coefficient: 19.2, flag: '🇩🇪' },
            { country: 'England', countryTr: 'İngiltere', coefficient: 19.1, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
            { country: 'Italy', countryTr: 'İtalya', coefficient: 18.3, flag: '🇮🇹' },
            { country: 'Turkey', countryTr: 'Türkiye', coefficient: 18.0, flag: '🇹🇷' },
            { country: 'France', countryTr: 'Fransa', coefficient: 15.3, flag: '🇫🇷' },
            { country: 'Portugal', countryTr: 'Portekiz', coefficient: 15.2, flag: '🇵🇹' },
            { country: 'Scotland', countryTr: 'İskoçya', coefficient: 12.0, flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
            { country: 'Czech Republic', countryTr: 'Çekya', coefficient: 11.6, flag: '🇨🇿' },
            { country: 'Belgium', countryTr: 'Belçika', coefficient: 11.2, flag: '🇧🇪' },
            { country: 'Greece', countryTr: 'Yunanistan', coefficient: 10.5, flag: '🇬🇷' },
            { country: 'Austria', countryTr: 'Avusturya', coefficient: 10.0, flag: '🇦🇹' },
            { country: 'Denmark', countryTr: 'Danimarka', coefficient: 8.7, flag: '🇩🇰' },
            { country: 'Ukraine', countryTr: 'Ukrayna', coefficient: 8.5, flag: '🇺🇦' },
            { country: 'Switzerland', countryTr: 'İsviçre', coefficient: 8.3, flag: '🇨🇭' },
            { country: 'Sweden', countryTr: 'İsveç', coefficient: 8.3, flag: '🇸🇪' },
            { country: 'Netherlands', countryTr: 'Hollanda', coefficient: 7.5, flag: '🇳🇱' },
            { country: 'Cyprus', countryTr: 'Kıbrıs', coefficient: 6.7, flag: '🇨🇾' },
            { country: 'Poland', countryTr: 'Polonya', coefficient: 6.0, flag: '🇵🇱' },
            { country: 'Norway', countryTr: 'Norveç', coefficient: 6.0, flag: '🇳🇴' },
            { country: 'Hungary', countryTr: 'Macaristan', coefficient: 5.3, flag: '🇭🇺' },
            { country: 'Croatia', countryTr: 'Hırvatistan', coefficient: 4.3, flag: '🇭🇷' },
            { country: 'Romania', countryTr: 'Romanya', coefficient: 4.3, flag: '🇷🇴' },
            { country: 'Serbia', countryTr: 'Sırbistan', coefficient: 3.5, flag: '🇷🇸' }
        ];

        // Lig -> ülke eşlemesi (katsayı listesindeki ülke adı)
        this.leagueToCountry = {
            'La Liga': 'Spain', 'Bundesliga': 'Germany', 'Premier League': 'England', 'Serie A': 'Italy',
            'Süper Lig': 'Turkey', 'Ligue 1': 'France', 'Liga Portugal': 'Portugal', 'Scottish Premiership': 'Scotland',
            'Czech First League': 'Czech Republic', 'Belgium Pro League': 'Belgium', 'Super League Greece': 'Greece',
            'Austrian Bundesliga': 'Austria', 'Danish Superliga': 'Denmark', 'Ukrainian Premier League': 'Ukraine',
            'Swiss Super League': 'Switzerland', 'Allsvenskan': 'Sweden', 'Eredivisie': 'Netherlands',
            'Cypriot First Division': 'Cyprus', 'Ekstraklasa': 'Poland', 'Eliteserien': 'Norway', 'NB I': 'Hungary',
            'HNL': 'Croatia', 'Liga 1': 'Romania', 'SuperLiga': 'Serbia'
        };

        // Büyük 6 lig: 20/18 takım; diğer tüm ligler: 8 takım
        this.leagues = {};
        const big6 = ['La Liga', 'Premier League', 'Serie A', 'Bundesliga', 'Süper Lig', 'Ligue 1'];
        const big6Teams = [20, 20, 20, 18, 18, 18];
        const big6Matches = [38, 38, 38, 34, 34, 34];
        Object.keys(this.leagueToCountry).forEach(leagueName => {
            const country = this.leagueToCountry[leagueName];
            const row = this.coefficientRanking.find(r => r.country === country);
            if (row) {
                const i = big6.indexOf(leagueName);
                const isBig6 = i >= 0;
                this.leagues[leagueName] = {
                    country: row.country,
                    teams: isBig6 ? big6Teams[i] : 8,
                    matches: isBig6 ? big6Matches[i] : 14,
                    coefficient: row.coefficient,
                    flag: row.flag
                };
            }
        });

        this.europeanCompetitions = {
            'UCL': { name: 'Champions League', stages: ['Group', 'R16', 'QF', 'SF', 'Final', 'Winner'] },
            'UEL': { name: 'Europa League', stages: ['Group', 'R16', 'QF', 'SF', 'Final', 'Winner'] },
            'UECL': { name: 'Conference League', stages: ['Group', 'R16', 'QF', 'SF', 'Final', 'Winner'] }
        };

        // Avrupa puanları: aşama -> puan (Son 16(D)=direkt, Son 16(S)=playoff geçen, Son 24=playoff elenen)
        this.europeanPoints = {
            'UCL': {
                'Winner': 34, 'Final': 31, 'SF': 28, 'QF': 25,
                'R16_Direct': 22, 'R16_Playoff': 20, 'R24': 17,
                'Group_25_26': 10, 'Group_27_28': 9, 'Group_29_30': 8, 'Group_31_33': 7, 'Group_34_36': 6
            },
            'UEL': {
                'Winner': 30, 'Final': 27, 'SF': 24, 'QF': 21,
                'R16_Direct': 18, 'R16_Playoff': 16, 'R24': 13,
                'Group_25_28': 6, 'Group_29_32': 5, 'Group_33_36': 4
            },
            'UECL': {
                'Winner': 27, 'Final': 24, 'SF': 21, 'QF': 18,
                'R16_Direct': 15, 'R16_Playoff': 13, 'R24': 10,
                'Group_25_28': 4, 'Group_29_32': 3, 'Group_33_36': 2
            }
        };
        this.europeanStageLabels = {
            'Winner': 'Şampiyon', 'Final': 'Final', 'SF': 'Yarı Final', 'QF': 'Çeyrek Final',
            'R16_Direct': 'Son 16(D)', 'R16_Playoff': 'Son 16(S)', 'R24': 'Son 24',
            'Group_25_26': 'Lig 25-26', 'Group_27_28': 'Lig 27-28', 'Group_29_30': 'Lig 29-30',
            'Group_31_33': 'Lig 31-33', 'Group_34_36': 'Lig 34-36',
            'Group_25_28': 'Lig 25-28', 'Group_29_32': 'Lig 29-32', 'Group_33_36': 'Lig 33-36'
        };

        // Kontenjanlar: UCL 1-2: 5er, 3-4: 4er, 5-6: 3er, 7-10: 2şer, 11-14: 1er | UEL 1-12: 2şer, 13-24: 1er | UECL 1-10: 1er, 11: 2, 12: 1, 13-14: 2şer, 15: 3, 16-22: 2şer, 23-24: 1er
        this.europeanAllocation = {
            'UCL': { 1: 5, 2: 5, 3: 4, 4: 4, 5: 3, 6: 3, 7: 2, 8: 2, 9: 2, 10: 2, 11: 1, 12: 1, 13: 1, 14: 1, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0, 24: 0 },
            'UEL': { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 1, 19: 1, 20: 1, 21: 1, 22: 1, 23: 1, 24: 1 },
            'UECL': { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 2, 12: 1, 13: 2, 14: 2, 15: 3, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2, 23: 1, 24: 1 }
        };

        // 2028-29 Avrupa katılımcıları (lig sıralamasına göre doldurulacak)
        this.europeanSeason2028_29 = JSON.parse(localStorage.getItem('europeanSeason2028_29')) || { UCL: [], UEL: [], UECL: [] };

        // Oynanabilir Avrupa kupası: grup (4 torba, 8 maç), playoff kura, Son 16 kura, eleme
        this.europeanPlayable = JSON.parse(localStorage.getItem('europeanPlayable')) || {};
        // Örnek yapı: { UCL: { participants: [], pots: {1:[],2:[],3:[],4:[]}, groupMatches: [], groupStandings: [], phase: 'group'|'playoff_draw'|'playoff'|'r16_draw'|'r16'|'qf'|'sf'|'final'|'done', playoffPairs: [], playoffResults: [], r16Pairs: [], knockoutResults: {} } }

        // Initialize fixture viewing state
        this.currentFixtureWeek = 1;
        this.currentFixtureLeague = '';
        
        this.init();
    }

    getDefaultSettings() {
        return {
            homeAdvantage: 10,
            ratingEffect: 70,
            ratingUpdatePeriod: 3,
            currentSeason: '2028-29'
        };
    }

    getCurrentSeason() {
        return this.settings.currentSeason || '2028-29';
    }

    init() {
        this.setupEventListeners();
        this.initDragAndDrop(); // Drag and drop'i burada başlat
        this.populateLeagueDropdowns();
        this.updateStats();
        this.loadDefaultTeams();
        this.renderTeams();
        this.renderDashboard();
    }

    populateLeagueDropdowns() {
        const names = Object.keys(this.leagues);
        if (names.length === 0) return;
        const makeOpt = (val, label) => `<option value="${val}">${this.leagues[val]?.flag || ''} ${label || val}</option>`;
        const selects = [
            { id: 'league-filter', first: '<option value="">Tüm Ligler</option>' },
            { id: 'fixture-league', first: '<option value="">Lig Seçin</option>' },
            { id: 'team-league', first: '<option value="">Lig Seçin</option>' },
            { id: 'edit-team-league', first: '<option value="">Lig Seçin</option>' },
            { id: 'team-points-league', first: '<option value="">Tüm Ligler</option>' }
        ];
        selects.forEach(({ id, first }) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = first + names.map(l => makeOpt(l)).join('');
        });
    }

    renderLeagueTabs() {
        const container = document.getElementById('league-tabs-container');
        if (!container) return;
        const names = Object.keys(this.leagues);
        container.innerHTML = names.map((leagueName, i) =>
            `<button class="league-tab ${i === 0 ? 'active' : ''}" data-league="${leagueName}">${this.leagues[leagueName]?.flag || ''} ${leagueName}</button>`
        ).join('');
        container.querySelectorAll('.league-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const league = e.target.closest('.league-tab').dataset.league;
                this.showLeagueTable(league);
            });
        });
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('.nav-link').dataset.section;
                this.showSection(section);
            });
        });

        // League tabs
        document.querySelectorAll('.league-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const league = e.target.dataset.league;
                this.showLeagueTable(league);
            });
        });

        // European tabs
        document.querySelectorAll('.european-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const competition = e.target.dataset.competition;
                this.showEuropeanCompetition(competition);
            });
        });

        // Coefficient tabs
        document.querySelectorAll('.coefficient-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.showCoefficientTab(tabName);
            });
        });

        // Add team form
        document.getElementById('add-team-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTeam();
        });

        // Edit team form
        document.getElementById('edit-team-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditedTeam();
        });

        // Settings
        document.getElementById('home-advantage').addEventListener('input', (e) => {
            this.settings.homeAdvantage = parseInt(e.target.value);
            document.getElementById('home-advantage-value').textContent = e.target.value + '%';
            this.saveSettings();
        });

        document.getElementById('rating-effect').addEventListener('input', (e) => {
            this.settings.ratingEffect = parseInt(e.target.value);
            document.getElementById('rating-effect-value').textContent = e.target.value + '%';
            this.saveSettings();
        });

        document.getElementById('rating-update-period').addEventListener('change', (e) => {
            this.settings.ratingUpdatePeriod = parseInt(e.target.value);
            this.saveSettings();
        });

        // Modal close events
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    // Section Navigation
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        document.getElementById(sectionName).classList.add('active');

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Load section-specific data
        switch (sectionName) {
            case 'teams':
                this.populateLeagueDropdowns();
                this.renderTeams();
                break;
            case 'leagues':
                this.renderLeagueTabs();
                this.showLeagueTable(Object.keys(this.leagues)[0] || 'La Liga');
                break;
            case 'seasons':
                this.renderSeasonProgress();
                this.renderRecentMatches();
                break;
            case 'european':
                this.showEuropeanCompetition('ucl');
                break;
            case 'coefficients':
                this.showCoefficientTab('league-rankings');
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    // Data Management
    saveData() {
        localStorage.setItem('teams', JSON.stringify(this.teams));
        localStorage.setItem('seasons', JSON.stringify(this.seasons));
        localStorage.setItem('matches', JSON.stringify(this.matches));
        localStorage.setItem('europeanResults', JSON.stringify(this.europeanResults));
        localStorage.setItem('countryCoefficients', JSON.stringify(this.countryCoefficients));
        localStorage.setItem('europeanSeason2028_29', JSON.stringify(this.europeanSeason2028_29));
        localStorage.setItem('europeanPlayable', JSON.stringify(this.europeanPlayable));
    }

    // Reyting 0.5-9.9 dışındaki eski değerleri dönüştür
    normalizeRating(r) {
        if (r == null || r === undefined) return 7.0;
        const n = typeof r === 'string' ? parseFloat(String(r).replace(',', '.')) : Number(r);
        if (isNaN(n)) return 7.0;
        if (n >= 0.5 && n <= 9.9) return Math.round(n * 10) / 10;
        if (n > 20) return Math.min(9.9, Math.max(0.5, (n - 1500) / 1500 * 4.9 + 5)); // Eski 1500-3000 ölçeği
        return Math.max(0.5, Math.min(9.9, n));
    }

    saveSettings() {
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }

    loadSettings() {
        document.getElementById('home-advantage').value = this.settings.homeAdvantage;
        document.getElementById('home-advantage-value').textContent = this.settings.homeAdvantage + '%';
        document.getElementById('rating-effect').value = this.settings.ratingEffect;
        document.getElementById('rating-effect-value').textContent = this.settings.ratingEffect + '%';
        document.getElementById('rating-update-period').value = this.settings.ratingUpdatePeriod;
    }

    // Team Management
    loadDefaultTeams() {
        if (this.teams.length === 0) {
            this.initializeDefaultTeams();
        }
    }

    // 8 takımlı lig için 0.5-9.9 reytingli takım listesi üretir
    makeLeague8(leagueName, country, teamNames, baseRating = 7.0) {
        const step = 0.4;
        return teamNames.slice(0, 8).map((name, i) => ({
            name,
            league: leagueName,
            country,
            rating: Math.max(0.5, Math.min(9.9, baseRating - i * step + (Math.random() * 0.2 - 0.1)))
        })).map(t => ({ ...t, rating: Math.round(t.rating * 10) / 10 }));
    }

    initializeDefaultTeams() {
        const defaultTeams = [
            // Premier League - 20 takım, 0.5-9.9
            { name: 'Manchester City', league: 'Premier League', country: 'England', rating: 9.5 },
            { name: 'Arsenal', league: 'Premier League', country: 'England', rating: 9.2 },
            { name: 'Liverpool', league: 'Premier League', country: 'England', rating: 9.0 },
            { name: 'Chelsea', league: 'Premier League', country: 'England', rating: 8.8 },
            { name: 'Manchester United', league: 'Premier League', country: 'England', rating: 8.6 },
            { name: 'Tottenham', league: 'Premier League', country: 'England', rating: 8.4 },
            { name: 'Newcastle', league: 'Premier League', country: 'England', rating: 8.2 },
            { name: 'Brighton', league: 'Premier League', country: 'England', rating: 8.0 },
            { name: 'Aston Villa', league: 'Premier League', country: 'England', rating: 7.8 },
            { name: 'West Ham', league: 'Premier League', country: 'England', rating: 7.6 },
            { name: 'Crystal Palace', league: 'Premier League', country: 'England', rating: 7.4 },
            { name: 'Fulham', league: 'Premier League', country: 'England', rating: 7.2 },
            { name: 'Brentford', league: 'Premier League', country: 'England', rating: 7.0 },
            { name: 'Wolves', league: 'Premier League', country: 'England', rating: 6.8 },
            { name: 'Everton', league: 'Premier League', country: 'England', rating: 6.6 },
            { name: 'Nottingham Forest', league: 'Premier League', country: 'England', rating: 6.4 },
            { name: 'Bournemouth', league: 'Premier League', country: 'England', rating: 6.2 },
            { name: 'Luton Town', league: 'Premier League', country: 'England', rating: 6.0 },
            { name: 'Burnley', league: 'Premier League', country: 'England', rating: 5.8 },
            { name: 'Sheffield United', league: 'Premier League', country: 'England', rating: 5.6 },

            // La Liga
            { name: 'Real Madrid', league: 'La Liga', country: 'Spain', rating: 9.9 },
            { name: 'Barcelona', league: 'La Liga', country: 'Spain', rating: 9.3 },
            { name: 'Atletico Madrid', league: 'La Liga', country: 'Spain', rating: 9.0 },
            { name: 'Real Sociedad', league: 'La Liga', country: 'Spain', rating: 8.4 },
            { name: 'Real Betis', league: 'La Liga', country: 'Spain', rating: 8.2 },
            { name: 'Villarreal', league: 'La Liga', country: 'Spain', rating: 8.0 },
            { name: 'Athletic Bilbao', league: 'La Liga', country: 'Spain', rating: 7.8 },
            { name: 'Valencia', league: 'La Liga', country: 'Spain', rating: 7.6 },
            { name: 'Sevilla', league: 'La Liga', country: 'Spain', rating: 7.4 },
            { name: 'Osasuna', league: 'La Liga', country: 'Spain', rating: 7.2 },
            { name: 'Las Palmas', league: 'La Liga', country: 'Spain', rating: 7.0 },
            { name: 'Getafe', league: 'La Liga', country: 'Spain', rating: 6.8 },
            { name: 'Girona', league: 'La Liga', country: 'Spain', rating: 6.6 },
            { name: 'Cadiz', league: 'La Liga', country: 'Spain', rating: 6.4 },
            { name: 'Rayo Vallecano', league: 'La Liga', country: 'Spain', rating: 6.2 },
            { name: 'Mallorca', league: 'La Liga', country: 'Spain', rating: 6.0 },
            { name: 'Celta Vigo', league: 'La Liga', country: 'Spain', rating: 5.8 },
            { name: 'Alaves', league: 'La Liga', country: 'Spain', rating: 5.6 },
            { name: 'Granada', league: 'La Liga', country: 'Spain', rating: 5.4 },
            { name: 'Almeria', league: 'La Liga', country: 'Spain', rating: 5.2 },

            // Serie A - 20 takım, 0.5-9.9
            { name: 'Inter Milan', league: 'Serie A', country: 'Italy', rating: 9.3 },
            { name: 'Juventus', league: 'Serie A', country: 'Italy', rating: 9.2 },
            { name: 'AC Milan', league: 'Serie A', country: 'Italy', rating: 8.9 },
            { name: 'Napoli', league: 'Serie A', country: 'Italy', rating: 8.8 },
            { name: 'AS Roma', league: 'Serie A', country: 'Italy', rating: 8.6 },
            { name: 'Lazio', league: 'Serie A', country: 'Italy', rating: 8.4 },
            { name: 'Atalanta', league: 'Serie A', country: 'Italy', rating: 8.2 },
            { name: 'Fiorentina', league: 'Serie A', country: 'Italy', rating: 8.0 },
            { name: 'Bologna', league: 'Serie A', country: 'Italy', rating: 7.8 },
            { name: 'Torino', league: 'Serie A', country: 'Italy', rating: 7.6 },
            { name: 'Monza', league: 'Serie A', country: 'Italy', rating: 7.4 },
            { name: 'Genoa', league: 'Serie A', country: 'Italy', rating: 7.2 },
            { name: 'Lecce', league: 'Serie A', country: 'Italy', rating: 7.0 },
            { name: 'Verona', league: 'Serie A', country: 'Italy', rating: 6.8 },
            { name: 'Udinese', league: 'Serie A', country: 'Italy', rating: 6.6 },
            { name: 'Cagliari', league: 'Serie A', country: 'Italy', rating: 6.4 },
            { name: 'Empoli', league: 'Serie A', country: 'Italy', rating: 6.2 },
            { name: 'Frosinone', league: 'Serie A', country: 'Italy', rating: 6.0 },
            { name: 'Sassuolo', league: 'Serie A', country: 'Italy', rating: 5.8 },
            { name: 'Salernitana', league: 'Serie A', country: 'Italy', rating: 5.6 },

            // Bundesliga - 18 takım, 0.5-9.9
            { name: 'Bayern Munich', league: 'Bundesliga', country: 'Germany', rating: 9.5 },
            { name: 'Borussia Dortmund', league: 'Bundesliga', country: 'Germany', rating: 9.2 },
            { name: 'RB Leipzig', league: 'Bundesliga', country: 'Germany', rating: 8.8 },
            { name: 'Bayer Leverkusen', league: 'Bundesliga', country: 'Germany', rating: 8.6 },
            { name: 'Eintracht Frankfurt', league: 'Bundesliga', country: 'Germany', rating: 8.4 },
            { name: 'VfB Stuttgart', league: 'Bundesliga', country: 'Germany', rating: 8.2 },
            { name: 'Union Berlin', league: 'Bundesliga', country: 'Germany', rating: 8.0 },
            { name: 'SC Freiburg', league: 'Bundesliga', country: 'Germany', rating: 7.8 },
            { name: '1. FC Koln', league: 'Bundesliga', country: 'Germany', rating: 7.6 },
            { name: 'VfL Wolfsburg', league: 'Bundesliga', country: 'Germany', rating: 7.4 },
            { name: 'Werder Bremen', league: 'Bundesliga', country: 'Germany', rating: 7.2 },
            { name: 'FC Augsburg', league: 'Bundesliga', country: 'Germany', rating: 7.0 },
            { name: 'Mainz 05', league: 'Bundesliga', country: 'Germany', rating: 6.8 },
            { name: 'Hoffenheim', league: 'Bundesliga', country: 'Germany', rating: 6.6 },
            { name: 'VfL Bochum', league: 'Bundesliga', country: 'Germany', rating: 6.4 },
            { name: 'FC Heidenheim', league: 'Bundesliga', country: 'Germany', rating: 6.2 },
            { name: 'SV Darmstadt', league: 'Bundesliga', country: 'Germany', rating: 6.0 },

            // Ligue 1 - 18 takım, 0.5-9.9
            { name: 'Paris Saint-Germain', league: 'Ligue 1', country: 'France', rating: 9.4 },
            { name: 'AS Monaco', league: 'Ligue 1', country: 'France', rating: 8.8 },
            { name: 'Marseille', league: 'Ligue 1', country: 'France', rating: 8.6 },
            { name: 'Lyon', league: 'Ligue 1', country: 'France', rating: 8.4 },
            { name: 'Nice', league: 'Ligue 1', country: 'France', rating: 8.2 },
            { name: 'Lille', league: 'Ligue 1', country: 'France', rating: 8.0 },
            { name: 'Rennes', league: 'Ligue 1', country: 'France', rating: 7.8 },
            { name: 'Lens', league: 'Ligue 1', country: 'France', rating: 7.6 },
            { name: 'Montpellier', league: 'Ligue 1', country: 'France', rating: 7.4 },
            { name: 'Reims', league: 'Ligue 1', country: 'France', rating: 7.2 },
            { name: 'Strasbourg', league: 'Ligue 1', country: 'France', rating: 7.0 },
            { name: 'Nantes', league: 'Ligue 1', country: 'France', rating: 6.8 },
            { name: 'Brest', league: 'Ligue 1', country: 'France', rating: 6.6 },
            { name: 'Le Havre', league: 'Ligue 1', country: 'France', rating: 6.4 },
            { name: 'Toulouse', league: 'Ligue 1', country: 'France', rating: 6.2 },
            { name: 'Metz', league: 'Ligue 1', country: 'France', rating: 6.0 },
            { name: 'Lorient', league: 'Ligue 1', country: 'France', rating: 5.8 },
            { name: 'Clermont', league: 'Ligue 1', country: 'France', rating: 5.6 }
        ];

        const portugalTeams = [
            { name: 'Benfica', league: 'Liga Portugal', country: 'Portugal', rating: 9.0 },
            { name: 'FC Porto', league: 'Liga Portugal', country: 'Portugal', rating: 8.8 },
            { name: 'Sporting CP', league: 'Liga Portugal', country: 'Portugal', rating: 8.6 },
            { name: 'SC Braga', league: 'Liga Portugal', country: 'Portugal', rating: 8.0 },
            { name: 'Vitoria Guimaraes', league: 'Liga Portugal', country: 'Portugal', rating: 7.4 },
            { name: 'Rio Ave', league: 'Liga Portugal', country: 'Portugal', rating: 6.8 },
            { name: 'Boavista', league: 'Liga Portugal', country: 'Portugal', rating: 6.4 },
            { name: 'Maritimo', league: 'Liga Portugal', country: 'Portugal', rating: 6.0 }
        ];

        const eredivisieTeams = [
            { name: 'PSV Eindhoven', league: 'Eredivisie', country: 'Netherlands', rating: 8.8 },
            { name: 'Ajax', league: 'Eredivisie', country: 'Netherlands', rating: 8.6 },
            { name: 'Feyenoord', league: 'Eredivisie', country: 'Netherlands', rating: 8.4 },
            { name: 'AZ Alkmaar', league: 'Eredivisie', country: 'Netherlands', rating: 7.8 },
            { name: 'FC Twente', league: 'Eredivisie', country: 'Netherlands', rating: 7.4 },
            { name: 'Utrecht', league: 'Eredivisie', country: 'Netherlands', rating: 7.0 },
            { name: 'Vitesse', league: 'Eredivisie', country: 'Netherlands', rating: 6.6 },
            { name: 'Go Ahead Eagles', league: 'Eredivisie', country: 'Netherlands', rating: 6.2 }
        ];

        const superLigTeams = [
            { name: 'Galatasaray', league: 'Süper Lig', country: 'Turkey', rating: 8.6 },
            { name: 'Fenerbahce', league: 'Süper Lig', country: 'Turkey', rating: 8.4 },
            { name: 'Besiktas', league: 'Süper Lig', country: 'Turkey', rating: 8.2 },
            { name: 'Trabzonspor', league: 'Süper Lig', country: 'Turkey', rating: 7.8 },
            { name: 'Basaksehir', league: 'Süper Lig', country: 'Turkey', rating: 7.4 },
            { name: 'Sivasspor', league: 'Süper Lig', country: 'Turkey', rating: 7.0 },
            { name: 'Adana Demirspor', league: 'Süper Lig', country: 'Turkey', rating: 6.6 },
            { name: 'Antalyaspor', league: 'Süper Lig', country: 'Turkey', rating: 6.4 },
            { name: 'Alanyaspor', league: 'Süper Lig', country: 'Turkey', rating: 6.2 },
            { name: 'Kasimpasa', league: 'Süper Lig', country: 'Turkey', rating: 6.0 },
            { name: 'Konyaspor', league: 'Süper Lig', country: 'Turkey', rating: 5.8 },
            { name: 'Gaziantep FK', league: 'Süper Lig', country: 'Turkey', rating: 5.6 },
            { name: 'Kayserispor', league: 'Süper Lig', country: 'Turkey', rating: 5.4 },
            { name: 'Rizespor', league: 'Süper Lig', country: 'Turkey', rating: 5.2 },
            { name: 'Hatayspor', league: 'Süper Lig', country: 'Turkey', rating: 5.0 },
            { name: 'Fatih Karagumruk', league: 'Süper Lig', country: 'Turkey', rating: 4.8 },
            { name: 'Pendikspor', league: 'Süper Lig', country: 'Turkey', rating: 4.6 },
            { name: 'Istanbulspor', league: 'Süper Lig', country: 'Turkey', rating: 4.4 }
        ];

        const belgiumTeams = [
            { name: 'Club Brugge', league: 'Belgium Pro League', country: 'Belgium', rating: 8.2 },
            { name: 'Anderlecht', league: 'Belgium Pro League', country: 'Belgium', rating: 8.0 },
            { name: 'Royal Antwerp', league: 'Belgium Pro League', country: 'Belgium', rating: 7.6 },
            { name: 'Genk', league: 'Belgium Pro League', country: 'Belgium', rating: 7.4 },
            { name: 'Standard Liege', league: 'Belgium Pro League', country: 'Belgium', rating: 7.0 },
            { name: 'Gent', league: 'Belgium Pro League', country: 'Belgium', rating: 6.8 },
            { name: 'Union Saint-Gilloise', league: 'Belgium Pro League', country: 'Belgium', rating: 7.2 },
            { name: 'Charleroi', league: 'Belgium Pro League', country: 'Belgium', rating: 6.4 }
        ];

        // Scottish Premiership Teams
        const scottishTeams = [
            { name: 'Celtic', league: 'Scottish Premiership', country: 'Scotland', rating: 7.8 },
            { name: 'Rangers', league: 'Scottish Premiership', country: 'Scotland', rating: 7.6 },
            { name: 'Hearts', league: 'Scottish Premiership', country: 'Scotland', rating: 6.8 },
            { name: 'Aberdeen', league: 'Scottish Premiership', country: 'Scotland', rating: 6.6 },
            { name: 'Hibernian', league: 'Scottish Premiership', country: 'Scotland', rating: 6.4 },
            { name: 'Motherwell', league: 'Scottish Premiership', country: 'Scotland', rating: 6.2 },
            { name: 'St Mirren', league: 'Scottish Premiership', country: 'Scotland', rating: 6.0 },
            { name: 'Dundee United', league: 'Scottish Premiership', country: 'Scotland', rating: 5.8 }
        ];

        // Czech First League - 8 takım
        const czechTeams = [
            { name: 'Slavia Prague', league: 'Czech First League', country: 'Czech Republic', rating: 7.5 },
            { name: 'Sparta Prague', league: 'Czech First League', country: 'Czech Republic', rating: 7.3 },
            { name: 'Viktoria Plzen', league: 'Czech First League', country: 'Czech Republic', rating: 7.0 },
            { name: 'Banik Ostrava', league: 'Czech First League', country: 'Czech Republic', rating: 6.5 },
            { name: 'Jablonec', league: 'Czech First League', country: 'Czech Republic', rating: 6.3 },
            { name: 'Sigma Olomouc', league: 'Czech First League', country: 'Czech Republic', rating: 6.1 },
            { name: 'Slovan Liberec', league: 'Czech First League', country: 'Czech Republic', rating: 5.9 },
            { name: 'Hradec Kralove', league: 'Czech First League', country: 'Czech Republic', rating: 5.7 }
        ];

        // Greek Super League - 8 takım
        const greekTeams = [
            { name: 'Olympiacos', league: 'Super League Greece', country: 'Greece', rating: 7.4 },
            { name: 'Panathinaikos', league: 'Super League Greece', country: 'Greece', rating: 7.2 },
            { name: 'AEK Athens', league: 'Super League Greece', country: 'Greece', rating: 7.0 },
            { name: 'PAOK', league: 'Super League Greece', country: 'Greece', rating: 6.8 },
            { name: 'Aris', league: 'Super League Greece', country: 'Greece', rating: 6.3 },
            { name: 'Atromitos', league: 'Super League Greece', country: 'Greece', rating: 6.1 },
            { name: 'Volos', league: 'Super League Greece', country: 'Greece', rating: 5.9 },
            { name: 'OFI', league: 'Super League Greece', country: 'Greece', rating: 5.7 }
        ];

        // Austrian Bundesliga - 8 takım
        const austrianTeams = [
            { name: 'Red Bull Salzburg', league: 'Austrian Bundesliga', country: 'Austria', rating: 7.0 },
            { name: 'Sturm Graz', league: 'Austrian Bundesliga', country: 'Austria', rating: 6.5 },
            { name: 'Austria Wien', league: 'Austrian Bundesliga', country: 'Austria', rating: 6.3 },
            { name: 'LASK Linz', league: 'Austrian Bundesliga', country: 'Austria', rating: 6.1 },
            { name: 'Rapid Wien', league: 'Austrian Bundesliga', country: 'Austria', rating: 5.9 },
            { name: 'Wolfsberger AC', league: 'Austrian Bundesliga', country: 'Austria', rating: 5.7 },
            { name: 'TSV Hartberg', league: 'Austrian Bundesliga', country: 'Austria', rating: 5.5 },
            { name: 'WSG Tirol', league: 'Austrian Bundesliga', country: 'Austria', rating: 5.3 }
        ];

        const danishTeams = [
            { name: 'FC Copenhagen', league: 'Danish Superliga', country: 'Denmark', rating: 6.8 },
            { name: 'FC Midtjylland', league: 'Danish Superliga', country: 'Denmark', rating: 6.6 },
            { name: 'Brondby IF', league: 'Danish Superliga', country: 'Denmark', rating: 6.4 },
            { name: 'AGF Aarhus', league: 'Danish Superliga', country: 'Denmark', rating: 6.2 },
            { name: 'Silkeborg IF', league: 'Danish Superliga', country: 'Denmark', rating: 6.0 },
            { name: 'FC Nordsjaelland', league: 'Danish Superliga', country: 'Denmark', rating: 5.8 },
            { name: 'Randers FC', league: 'Danish Superliga', country: 'Denmark', rating: 5.6 },
            { name: 'Viborg FF', league: 'Danish Superliga', country: 'Denmark', rating: 5.4 }
        ];
        const ukraineTeams = [
            { name: 'Shakhtar Donetsk', league: 'Ukrainian Premier League', country: 'Ukraine', rating: 7.2 },
            { name: 'Dynamo Kyiv', league: 'Ukrainian Premier League', country: 'Ukraine', rating: 7.0 },
            { name: 'Dnipro-1', league: 'Ukrainian Premier League', country: 'Ukraine', rating: 6.4 },
            { name: 'Zorya', league: 'Ukrainian Premier League', country: 'Ukraine', rating: 6.0 },
            { name: 'Vorskla', league: 'Ukrainian Premier League', country: 'Ukraine', rating: 5.6 },
            { name: 'Oleksandriya', league: 'Ukrainian Premier League', country: 'Ukraine', rating: 5.2 },
            { name: 'Kolos Kovalivka', league: 'Ukrainian Premier League', country: 'Ukraine', rating: 4.8 },
            { name: 'Rukh Lviv', league: 'Ukrainian Premier League', country: 'Ukraine', rating: 4.4 }
        ];
        const swissTeams = [
            { name: 'Young Boys', league: 'Swiss Super League', country: 'Switzerland', rating: 7.0 },
            { name: 'FC Basel', league: 'Swiss Super League', country: 'Switzerland', rating: 6.8 },
            { name: 'FC Zurich', league: 'Swiss Super League', country: 'Switzerland', rating: 6.4 },
            { name: 'Lugano', league: 'Swiss Super League', country: 'Switzerland', rating: 6.0 },
            { name: 'St. Gallen', league: 'Swiss Super League', country: 'Switzerland', rating: 5.6 },
            { name: 'Lucerne', league: 'Swiss Super League', country: 'Switzerland', rating: 5.2 },
            { name: 'Servette', league: 'Swiss Super League', country: 'Switzerland', rating: 4.8 },
            { name: 'Grasshopper', league: 'Swiss Super League', country: 'Switzerland', rating: 4.4 }
        ];
        const swedenTeams = [
            { name: 'Malmo FF', league: 'Allsvenskan', country: 'Sweden', rating: 6.8 },
            { name: 'AIK', league: 'Allsvenskan', country: 'Sweden', rating: 6.4 },
            { name: 'Hacken', league: 'Allsvenskan', country: 'Sweden', rating: 6.0 },
            { name: 'Djurgarden', league: 'Allsvenskan', country: 'Sweden', rating: 5.6 },
            { name: 'IFK Goteborg', league: 'Allsvenskan', country: 'Sweden', rating: 5.2 },
            { name: 'Elfsborg', league: 'Allsvenskan', country: 'Sweden', rating: 4.8 },
            { name: 'Norrkoping', league: 'Allsvenskan', country: 'Sweden', rating: 4.4 },
            { name: 'Hammarby', league: 'Allsvenskan', country: 'Sweden', rating: 4.0 }
        ];
        const cyprusTeams = [
            { name: 'APOEL', league: 'Cypriot First Division', country: 'Cyprus', rating: 6.4 },
            { name: 'Omonia', league: 'Cypriot First Division', country: 'Cyprus', rating: 6.0 },
            { name: 'AEK Larnaca', league: 'Cypriot First Division', country: 'Cyprus', rating: 5.6 },
            { name: 'Apollon', league: 'Cypriot First Division', country: 'Cyprus', rating: 5.2 },
            { name: 'Paphos FC', league: 'Cypriot First Division', country: 'Cyprus', rating: 4.8 },
            { name: 'Aris Limassol', league: 'Cypriot First Division', country: 'Cyprus', rating: 4.4 },
            { name: 'Anorthosis', league: 'Cypriot First Division', country: 'Cyprus', rating: 4.0 },
            { name: 'Ethnikos Achna', league: 'Cypriot First Division', country: 'Cyprus', rating: 3.6 }
        ];
        const polandTeams = [
            { name: 'Legia Warsaw', league: 'Ekstraklasa', country: 'Poland', rating: 6.6 },
            { name: 'Lech Poznan', league: 'Ekstraklasa', country: 'Poland', rating: 6.2 },
            { name: 'Pogon Szczecin', league: 'Ekstraklasa', country: 'Poland', rating: 5.8 },
            { name: 'Rakow Czestochowa', league: 'Ekstraklasa', country: 'Poland', rating: 5.4 },
            { name: 'Wisła Krakow', league: 'Ekstraklasa', country: 'Poland', rating: 5.0 },
            { name: 'Gornik Zabrze', league: 'Ekstraklasa', country: 'Poland', rating: 4.6 },
            { name: 'Slask Wroclaw', league: 'Ekstraklasa', country: 'Poland', rating: 4.2 },
            { name: 'Jagiellonia', league: 'Ekstraklasa', country: 'Poland', rating: 3.8 }
        ];
        const norwayTeams = [
            { name: 'Bodo/Glimt', league: 'Eliteserien', country: 'Norway', rating: 6.6 },
            { name: 'Molde', league: 'Eliteserien', country: 'Norway', rating: 6.2 },
            { name: 'Rosenborg', league: 'Eliteserien', country: 'Norway', rating: 5.8 },
            { name: 'Viking', league: 'Eliteserien', country: 'Norway', rating: 5.4 },
            { name: 'Brann', league: 'Eliteserien', country: 'Norway', rating: 5.0 },
            { name: 'Lillestrom', league: 'Eliteserien', country: 'Norway', rating: 4.6 },
            { name: 'Tromso', league: 'Eliteserien', country: 'Norway', rating: 4.2 },
            { name: 'Odd', league: 'Eliteserien', country: 'Norway', rating: 3.8 }
        ];
        const hungaryTeams = [
            { name: 'Ferencvaros', league: 'NB I', country: 'Hungary', rating: 6.4 },
            { name: 'Puskas Akademia', league: 'NB I', country: 'Hungary', rating: 6.0 },
            { name: 'Videoton', league: 'NB I', country: 'Hungary', rating: 5.6 },
            { name: 'Debrecen', league: 'NB I', country: 'Hungary', rating: 5.2 },
            { name: 'Kisvarda', league: 'NB I', country: 'Hungary', rating: 4.8 },
            { name: 'Paks', league: 'NB I', country: 'Hungary', rating: 4.4 },
            { name: 'Honved', league: 'NB I', country: 'Hungary', rating: 4.0 },
            { name: 'Ujpest', league: 'NB I', country: 'Hungary', rating: 3.6 }
        ];
        const croatiaTeams = [
            { name: 'Dinamo Zagreb', league: 'HNL', country: 'Croatia', rating: 6.6 },
            { name: 'Hajduk Split', league: 'HNL', country: 'Croatia', rating: 6.2 },
            { name: 'Rijeka', league: 'HNL', country: 'Croatia', rating: 5.8 },
            { name: 'Osijek', league: 'HNL', country: 'Croatia', rating: 5.4 },
            { name: 'Gorica', league: 'HNL', country: 'Croatia', rating: 5.0 },
            { name: 'Lokomotiva', league: 'HNL', country: 'Croatia', rating: 4.6 },
            { name: 'Slaven Belupo', league: 'HNL', country: 'Croatia', rating: 4.2 },
            { name: 'Istra 1961', league: 'HNL', country: 'Croatia', rating: 3.8 }
        ];
        const romaniaTeams = [
            { name: 'FCSB', league: 'Liga 1', country: 'Romania', rating: 6.4 },
            { name: 'CFR Cluj', league: 'Liga 1', country: 'Romania', rating: 6.0 },
            { name: 'Universitatea Craiova', league: 'Liga 1', country: 'Romania', rating: 5.6 },
            { name: 'Rapid Bucharest', league: 'Liga 1', country: 'Romania', rating: 5.2 },
            { name: 'Dinamo Bucharest', league: 'Liga 1', country: 'Romania', rating: 4.8 },
            { name: 'Petrolul', league: 'Liga 1', country: 'Romania', rating: 4.4 },
            { name: 'Sepsi', league: 'Liga 1', country: 'Romania', rating: 4.0 },
            { name: 'UTA Arad', league: 'Liga 1', country: 'Romania', rating: 3.6 }
        ];
        const serbiaTeams = [
            { name: 'Red Star Belgrade', league: 'SuperLiga', country: 'Serbia', rating: 6.4 },
            { name: 'Partizan Belgrade', league: 'SuperLiga', country: 'Serbia', rating: 6.0 },
            { name: 'Vojvodina', league: 'SuperLiga', country: 'Serbia', rating: 5.6 },
            { name: 'Cukaricki', league: 'SuperLiga', country: 'Serbia', rating: 5.2 },
            { name: 'TSC Backa Topola', league: 'SuperLiga', country: 'Serbia', rating: 4.8 },
            { name: 'Radnicki Nis', league: 'SuperLiga', country: 'Serbia', rating: 4.4 },
            { name: 'Spartak Subotica', league: 'SuperLiga', country: 'Serbia', rating: 4.0 },
            { name: 'Mladost', league: 'SuperLiga', country: 'Serbia', rating: 3.6 }
        ];

        this.teams = [
            ...defaultTeams, ...portugalTeams, ...eredivisieTeams, ...superLigTeams, 
            ...belgiumTeams, ...scottishTeams, ...czechTeams, ...greekTeams,
            ...austrianTeams, ...danishTeams, ...ukraineTeams, ...swissTeams, ...swedenTeams,
            ...cyprusTeams, ...polandTeams, ...norwayTeams, ...hungaryTeams, ...croatiaTeams,
            ...romaniaTeams, ...serbiaTeams
        ].map((t, i) => ({ ...t, id: t.id || Date.now() + i, rating: this.normalizeRating(t.rating) }));
        this.saveData();
        this.updateStats();
        this.renderTeams();
    }

    addTeam() {
        const name = document.getElementById('team-name').value.trim();
        const league = document.getElementById('team-league').value;
        const ratingRaw = document.getElementById('team-rating').value;
        const rating = this.normalizeRating(ratingRaw);
        const country = this.leagueToCountry[league] || this.leagues[league]?.country || '';

        if (name && league && country && rating >= 0.5 && rating <= 9.9) {
            const newTeam = {
                id: Date.now(),
                name,
                league,
                country,
                rating,
                initialRating: rating,
                ratingHistory: [{ season: this.currentSeason, rating }]
            };

            this.teams.push(newTeam);
            this.saveData();
            this.updateStats();
            this.renderTeams();
            this.closeModal('add-team-modal');
            this.clearForm('add-team-form');
            this.addActivity(`${name} takımı eklendi`);
        }
    }

    editTeam(teamId) {
        const team = this.teams.find(t => t.id === teamId);
        if (!team) {
            alert('Takım bulunamadı!');
            return;
        }

        // Clear form first
        document.getElementById('edit-team-form').reset();
        
        // Populate form with current team's values (reyting her zaman 0.5-9.9 göster)
        document.getElementById('edit-team-name').value = team.name;
        document.getElementById('edit-team-league').value = team.league;
        document.getElementById('edit-team-rating').value = this.normalizeRating(team.rating);
        
        // Store the team ID for saving
        this.editingTeamId = teamId;
        
        // Show modal
        document.getElementById('edit-team-modal').classList.add('show');
        
        console.log('Editing team:', team);
    }

    saveEditedTeam() {
        const name = document.getElementById('edit-team-name').value.trim();
        const league = document.getElementById('edit-team-league').value;
        const ratingInput = document.getElementById('edit-team-rating').value;
        const rating = this.normalizeRating(ratingInput);

        if (!name || !league || !this.editingTeamId) {
            alert('Lütfen takım adı ve lig seçin.');
            return;
        }
        if (rating < 0.5 || rating > 9.9) {
            alert('Reyting 0.5 ile 9.9 arasında olmalıdır (virgül veya nokta kullanabilirsiniz).');
            return;
        }

        const teamIndex = this.teams.findIndex(t => t.id === this.editingTeamId);
        if (teamIndex !== -1) {
            const oldName = this.teams[teamIndex].name;
            
            // Update team data while preserving ID, country and other properties
            this.teams[teamIndex] = {
                ...this.teams[teamIndex],
                name,
                league,
                country: this.leagueToCountry[league] || this.leagues[league]?.country || this.teams[teamIndex].country,
                rating: Math.round(rating * 10) / 10
            };
            
            // Force save and update
            this.saveData();
            this.updateStats();
            this.renderTeams();
            
            // Close modal and reset
            this.closeModal('edit-team-modal');
            this.clearForm('edit-team-form');
            this.addActivity(`${oldName} takım bilgileri güncellendi`);
            delete this.editingTeamId;
            
            console.log('Team updated successfully:', this.teams[teamIndex]);
        } else {
            alert('Takım bulunamadı!');
        }
    }

    deleteTeam(teamId) {
        if (confirm('Bu takımı silmek istediğinizden emin misiniz?')) {
            const teamIndex = this.teams.findIndex(t => t.id === teamId);
            if (teamIndex !== -1) {
                const teamName = this.teams[teamIndex].name;
                this.teams.splice(teamIndex, 1);
                
                // Also remove related matches
                this.matches = this.matches.filter(m => 
                    m.homeTeam !== teamName && m.awayTeam !== teamName
                );
                
                this.saveData();
                this.renderTeams();
                this.updateStats();
                this.addActivity(`${teamName} takımı silindi`);
            }
        }
    }

    // Season Management
    deleteLeagueSeason(leagueName) {
        if (confirm(`${leagueName} liginin ${this.currentSeason} sezonunu silmek istediğinizden emin misiniz?`)) {
            this.matches = this.matches.filter(m => 
                !(m.league === leagueName && m.season === this.currentSeason)
            );
            this.saveData();
            this.renderSeasonProgress();
            this.renderRecentMatches();
            this.addActivity(`${leagueName} ${this.currentSeason} sezonu silindi`);
        }
    }

    deleteCompleteSeason(seasonName) {
        if (confirm(`${seasonName} sezonunu komple silmek istediğinizden emin misiniz?`)) {
            this.matches = this.matches.filter(m => m.season !== seasonName);
            this.europeanResults = this.europeanResults.filter(r => r.season !== seasonName);
            this.saveData();
            this.renderSeasonProgress();
            this.renderRecentMatches();
            this.addActivity(`${seasonName} sezonu komple silindi`);
        }
    }

    resetMatchResult(matchIndex) {
        if (confirm('Bu maç sonucunu silmek istediğinizden emin misiniz?')) {
            this.matches.splice(matchIndex, 1);
            this.saveData();
            this.renderRecentMatches();
            this.renderSeasonProgress();
            this.addActivity('Maç sonucu silindi');
        }
    }

    // Fixture Generation
    generateLeagueFixtures(leagueName) {
        const leagueTeams = this.teams.filter(team => team.league === leagueName);
        const fixtures = [];
        
        if (leagueTeams.length < 2) return fixtures;
        
        // Double round-robin algorithm
        const teamCount = leagueTeams.length;
        const isOdd = teamCount % 2 === 1;
        const teams = [...leagueTeams];
        
        if (isOdd) {
            teams.push({ name: 'BYE', id: -1 }); // Dummy team for odd numbers
        }
        
        const totalRounds = (teams.length - 1) * 2; // Double round-robin
        
        for (let round = 0; round < totalRounds; round++) {
            const weekMatches = [];
            const isSecondLeg = round >= teams.length - 1;
            
            for (let i = 0; i < teams.length / 2; i++) {
                const team1Index = i;
                const team2Index = teams.length - 1 - i;
                
                if (teams[team1Index].name !== 'BYE' && teams[team2Index].name !== 'BYE') {
                    let homeTeam, awayTeam;
                    
                    if (isSecondLeg) {
                        // Second leg - reverse home/away
                        homeTeam = teams[team2Index];
                        awayTeam = teams[team1Index];
                    } else {
                        // First leg
                        homeTeam = teams[team1Index];
                        awayTeam = teams[team2Index];
                    }
                    
                    weekMatches.push({
                        homeTeam,
                        awayTeam,
                        week: Math.floor(round / 1) + 1,
                        round: round + 1,
                        played: false
                    });
                }
            }
            
            if (weekMatches.length > 0) {
                fixtures.push(...weekMatches);
            }
            
            // Rotate teams (keep first team fixed, rotate others)
            if (teams.length > 2) {
                const temp = teams[1];
                for (let i = 1; i < teams.length - 1; i++) {
                    teams[i] = teams[i + 1];
                }
                teams[teams.length - 1] = temp;
            }
        }
        
        return fixtures;
    }

    simulateWeekFixtures(leagueName, week) {
        const fixtures = this.generateLeagueFixtures(leagueName);
        const weekFixtures = fixtures.filter(f => f.week === week);
        const simulatedMatches = [];
        
        weekFixtures.forEach(fixture => {
            // Check if match already exists
            const existingMatch = this.matches.find(m => 
                m.league === leagueName &&
                m.season === this.currentSeason &&
                m.homeTeam === fixture.homeTeam.name &&
                m.awayTeam === fixture.awayTeam.name
            );
            
            if (!existingMatch) {
                const match = this.simulateMatch(fixture.homeTeam, fixture.awayTeam);
                match.league = leagueName;
                match.week = week;
                simulatedMatches.push(match);
            }
        });
        
        this.matches.push(...simulatedMatches);
        this.saveData();
        this.renderSeasonProgress();
        this.renderRecentMatches();
        this.addActivity(`${leagueName} ${week}. hafta simüle edildi`);
        
        return simulatedMatches;
    }

    // ==================== OYUNCU & KADRO SİSTEMİ ====================

    // Oyuncu rol tipleri
    getPlayerRoles() {
        return [
            { id: 'ilk11', label: 'İlk 11 (Çoğu maçta oynar)', priority: 1 },
            { id: 'rotasyon', label: 'Rotasyon (Kolay maçlarda oynar)', priority: 3 },
            { id: 'yedek', label: 'Yedek (Çoğunlukla yedekten girer)', priority: 4 },
            { id: 'kararliYedek', label: 'Yarı yedek (Bazen oynar, bazen yedek)', priority: 2 },
            { id: 'gencYedek', label: 'Genç/Yedek (Nadiren oynar)', priority: 5 }
        ];
    }

    // Mevkiler
    getPositions() {
        return [
            'Kaleci', 'Stoper', 'Sol Bek', 'Sağ Bek',
            'Ön Libero', 'Merkez Orta Saha', 'Ofansif Orta Saha',
            'Forvet Arkası', 'Sol Kanat', 'Sağ Kanat', 'Santrafor'
        ];
    }

    // Takımın oyuncularını getir
    getTeamPlayers(teamName) {
        const team = this.teams.find(t => t.name === teamName);
        return (team && team.players) ? team.players : [];
    }

    // Oyuncu ekle
    addPlayerToTeam(teamName, player) {
        const teamIdx = this.teams.findIndex(t => t.name === teamName);
        if (teamIdx === -1) return false;
        if (!this.teams[teamIdx].players) this.teams[teamIdx].players = [];
        const newPlayer = {
            id: Date.now() + Math.random(),
            ...player,
            yellowCards: 0,        // toplam sarı kart (sezon geneli)
            redCards: 0,
            suspendedMatches: 0,   // cezalı kaldığı maç sayısı
            matchStats: {},        // matchId -> stats
            cardsHistory: []       // { matchId, type, week }
        };
        this.teams[teamIdx].players.push(newPlayer);
        this.saveData();
        return true;
    }

    // Oyuncu sil
    removePlayerFromTeam(teamName, playerId) {
        const teamIdx = this.teams.findIndex(t => t.name === teamName);
        if (teamIdx === -1) return;
        this.teams[teamIdx].players = (this.teams[teamIdx].players || []).filter(p => p.id !== playerId);
        this.saveData();
    }

    // Maç zorluğuna göre kadro seçimi
    selectMatchSquad(teamName, opponentName, matchDifficulty) {
        // matchDifficulty: 'easy' | 'normal' | 'hard'
        const players = this.getTeamPlayers(teamName);
        if (players.length === 0) return { starting: [], bench: [] };

        // Takımın hocasını bul
        const team = this.teams.find(t => t.name === teamName);
        const coach = team?.coach;
        const formation = coach?.preferredFormation || '4-4-2';

        // Cezalı oyuncuları çıkar
        const available = players.filter(p => (p.suspendedMatches || 0) === 0);

        // Role priority: ilk11=1, kararliYedek=2, rotasyon=3, yedek=4, gencYedek=5
        // Zor maçta: ilk11 önce, kararliYedek sonra
        // Normal: ilk11 ağırlıklı, biraz rotasyon
        // Kolay: rotasyon ve kararliYedek de oynayabilir

        const byRole = {};
        available.forEach(p => {
            if (!byRole[p.role]) byRole[p.role] = [];
            byRole[p.role].push(p);
        });

        // Her pozisyondan en iyi oyuncuyu seç
        const positionGroups = {};
        available.forEach(p => {
            if (!positionGroups[p.position]) positionGroups[p.position] = [];
            positionGroups[p.position].push(p);
        });
        // Her pozisyon grubu kendi içinde reyting + role'e göre sıralı
        Object.keys(positionGroups).forEach(pos => {
            positionGroups[pos].sort((a, b) => {
                const rolePriorityA = this.getPlayerRoles().find(r => r.id === a.role)?.priority || 5;
                const rolePriorityB = this.getPlayerRoles().find(r => r.id === b.role)?.priority || 5;
                // Zor maçta role öncelikli, kolay maçta reyting öncelikli
                if (matchDifficulty === 'hard') {
                    if (rolePriorityA !== rolePriorityB) return rolePriorityA - rolePriorityB;
                    return b.rating - a.rating;
                } else if (matchDifficulty === 'easy') {
                    // Rotasyon oyuncuları öne geçebilir
                    const adjustedA = rolePriorityA + (a.role === 'rotasyon' ? -1.5 : 0);
                    const adjustedB = rolePriorityB + (b.role === 'rotasyon' ? -1.5 : 0);
                    if (adjustedA !== adjustedB) return adjustedA - adjustedB;
                    return b.rating - a.rating;
                } else {
                    // Normal: yarı yarıya
                    if (rolePriorityA !== rolePriorityB) return rolePriorityA - rolePriorityB;
                    return b.rating - a.rating;
                }
            });
        });

        // İlk 11 seçimi: en fazla 11 oyuncu, benzersiz pozisyonlar
        const startingIds = new Set();
        const starting = [];
        // Önce kaleci
        const keepers = (positionGroups['Kaleci'] || []);
        if (keepers.length > 0) { starting.push(keepers[0]); startingIds.add(keepers[0].id); }

        // Sonra diğerleri (mevkiye göre)
        const outfieldOrder = ['Stoper','Sol Bek','Sağ Bek','Ön Libero','Merkez Orta Saha','Ofansif Orta Saha','Forvet Arkası','Sol Kanat','Sağ Kanat','Santrafor'];
        outfieldOrder.forEach(pos => {
            const group = (positionGroups[pos] || []).filter(p => !startingIds.has(p.id));
            const needed = starting.length < 11 ? 1 : 0;
            group.slice(0, needed).forEach(p => { starting.push(p); startingIds.add(p.id); });
        });

        // Eğer hâlâ 11'den az oyuncu varsa, kalan available'dan doldur
        if (starting.length < 11) {
            available.filter(p => !startingIds.has(p.id))
                .sort((a,b) => a.rating - b.rating) // Daha düşük reyting yedek gitsin
                .slice(0, 11 - starting.length)
                .forEach(p => { starting.push(p); startingIds.add(p.id); });
        }

        // Yedekler (maks 5, ilk 11 dışındakiler)
        const bench = available
            .filter(p => !startingIds.has(p.id))
            .sort((a,b) => (this.getPlayerRoles().find(r=>r.id===a.role)?.priority||5) - (this.getPlayerRoles().find(r=>r.id===b.role)?.priority||5))
            .slice(0, 5);

        return { starting, bench };
    }

    // Maç zorluğunu hesapla
    getMatchDifficulty(homeRating, awayRating, isHome) {
        const teamRating = isHome ? homeRating : awayRating;
        const opponentRating = isHome ? awayRating : homeRating;
        const diff = teamRating - opponentRating;
        if (diff > 1.5) return 'easy';
        if (diff < -1.0) return 'hard';
        return 'normal';
    }

    // ==================== GELİŞTİRİLMİŞ MAÇ SİMÜLASYONU ====================

    // Match Simulation Engine (0.5-9.9 reyting)
    simulateMatch(homeTeam, awayTeam, isEuropean = false) {
        const homeAdvantageBoost = (this.settings.homeAdvantage / 100) * 0.15;
        const homeRating = this.normalizeRating(homeTeam.rating) + (isEuropean ? homeAdvantageBoost * 0.8 : homeAdvantageBoost);
        const awayRating = this.normalizeRating(awayTeam.rating);
        
        const ratingDiff = homeRating - awayRating;
        let homeWinProb = 0.45 + (ratingDiff * 0.06) * (this.settings.ratingEffect / 100);
        const drawProb = Math.max(0.20, 0.32 - (Math.abs(ratingDiff) * 0.02));
        homeWinProb = Math.max(0.15, Math.min(0.70, homeWinProb));
        const awayWinProb = Math.max(0.15, 1 - homeWinProb - drawProb);
        const totalProb = homeWinProb + drawProb + awayWinProb;
        const normalizedHomeWin = homeWinProb / totalProb;
        const normalizedDraw = drawProb / totalProb;
        
        const random = Math.random();
        let result;
        if (random < normalizedHomeWin) result = 'H';
        else if (random < normalizedHomeWin + normalizedDraw) result = 'D';
        else result = 'A';

        let homeGoals, awayGoals;
        if (result === 'D') {
            const drawGoals = Math.floor(Math.random() * 3);
            homeGoals = drawGoals; awayGoals = drawGoals;
        } else {
            homeGoals = this.generateGoals(homeRating, awayRating, result === 'H');
            awayGoals = this.generateGoals(awayRating, homeRating, result === 'A');
            if (result === 'H' && homeGoals <= awayGoals) homeGoals = awayGoals + 1;
            else if (result === 'A' && awayGoals <= homeGoals) awayGoals = homeGoals + 1;
        }

        homeGoals = Math.min(homeGoals, 5);
        awayGoals = Math.min(awayGoals, 5);

        // Kadro seçimi
        const homeDifficulty = this.getMatchDifficulty(homeRating, awayRating, true);
        const awayDifficulty = this.getMatchDifficulty(homeRating, awayRating, false);
        const homeSquad = this.selectMatchSquad(homeTeam.name, awayTeam.name, homeDifficulty);
        const awaySquad = this.selectMatchSquad(awayTeam.name, homeTeam.name, awayDifficulty);

        // Maç istatistikleri üret
        const matchStats = this.generateMatchStats(homeTeam, awayTeam, homeGoals, awayGoals, homeRating, awayRating, homeSquad, awaySquad);

        // Oyuncu istatistikleri üret
        const playerStats = this.generatePlayerStats(homeSquad, awaySquad, homeGoals, awayGoals, result, homeRating, awayRating, homeTeam.name, awayTeam.name);

        // Ceza ve kart işlemleri
        this.processCardsAndSuspensions(homeTeam.name, awayTeam.name, playerStats, matchStats);

        // Cezalı oyunculardaki suspendedMatches'ı azalt
        this.decreaseSuspensions(homeTeam.name);
        this.decreaseSuspensions(awayTeam.name);

        const matchId = `${homeTeam.name}_${awayTeam.name}_${this.currentSeason}_${Date.now()}`;

        // Events listesini playerStats ile zenginleştir
        const enrichEvents = (events, playerStats, homeTeamName, awayTeamName, homeSquad, awaySquad) => {
            // Gol atan oyuncuları bul
            const homeScorers = Object.entries(playerStats)
                .filter(([id, ps]) => ps.teamName === homeTeamName && ps.goals > 0)
                .flatMap(([id, ps]) => {
                    const player = [...(homeSquad.starting || []), ...(homeSquad.bench || [])].find(p => String(p.id) === String(id));
                    return Array(ps.goals).fill(player?.name || '?');
                });
            const awayScorers = Object.entries(playerStats)
                .filter(([id, ps]) => ps.teamName === awayTeamName && ps.goals > 0)
                .flatMap(([id, ps]) => {
                    const player = [...(awaySquad.starting || []), ...(awaySquad.bench || [])].find(p => String(p.id) === String(id));
                    return Array(ps.goals).fill(player?.name || '?');
                });

            // Asist yapanları bul
            const homeAssistors = Object.entries(playerStats)
                .filter(([id, ps]) => ps.teamName === homeTeamName && ps.assists > 0)
                .flatMap(([id, ps]) => {
                    const player = [...(homeSquad.starting || []), ...(homeSquad.bench || [])].find(p => String(p.id) === String(id));
                    return Array(ps.assists).fill(player?.name || '?');
                });
            const awayAssistors = Object.entries(playerStats)
                .filter(([id, ps]) => ps.teamName === awayTeamName && ps.assists > 0)
                .flatMap(([id, ps]) => {
                    const player = [...(awaySquad.starting || []), ...(awaySquad.bench || [])].find(p => String(p.id) === String(id));
                    return Array(ps.assists).fill(player?.name || '?');
                });

            // Sarı kart alan oyuncuları bul
            const homeYellowPlayers = Object.entries(playerStats)
                .filter(([id, ps]) => ps.teamName === homeTeamName && ps.yellowCard)
                .map(([id]) => [...(homeSquad.starting || []), ...(homeSquad.bench || [])].find(p => String(p.id) === String(id))?.name || '?');
            const awayYellowPlayers = Object.entries(playerStats)
                .filter(([id, ps]) => ps.teamName === awayTeamName && ps.yellowCard)
                .map(([id]) => [...(awaySquad.starting || []), ...(awaySquad.bench || [])].find(p => String(p.id) === String(id))?.name || '?');

            // Kırmızı kart alan oyuncuları bul
            const homeRedPlayers = Object.entries(playerStats)
                .filter(([id, ps]) => ps.teamName === homeTeamName && ps.redCard)
                .map(([id]) => [...(homeSquad.starting || []), ...(homeSquad.bench || [])].find(p => String(p.id) === String(id))?.name || '?');
            const awayRedPlayers = Object.entries(playerStats)
                .filter(([id, ps]) => ps.teamName === awayTeamName && ps.redCard)
                .map(([id]) => [...(awaySquad.starting || []), ...(awaySquad.bench || [])].find(p => String(p.id) === String(id))?.name || '?');

            // Değişiklik yapan oyuncuları bul
            const homeSubsOut = Object.entries(playerStats)
                .filter(([id, ps]) => ps.teamName === homeTeamName && ps.subOff)
                .map(([id, ps]) => ({ name: [...(homeSquad.starting || []), ...(homeSquad.bench || [])].find(p => String(p.id) === String(id))?.name || '?', minute: ps.subMinute, playerIn: ps.subPlayer }));
            const awaySubsOut = Object.entries(playerStats)
                .filter(([id, ps]) => ps.teamName === awayTeamName && ps.subOff)
                .map(([id, ps]) => ({ name: [...(awaySquad.starting || []), ...(awaySquad.bench || [])].find(p => String(p.id) === String(id))?.name || '?', minute: ps.subMinute, playerIn: ps.subPlayer }));

            let hGoalIdx = 0, aGoalIdx = 0, hYellowIdx = 0, aYellowIdx = 0;
            let hRedIdx = 0, aRedIdx = 0;
            let hSubIdx = 0, aSubIdx = 0;

            return events.map(e => {
                const enriched = { ...e };
                if (e.type === 'goal') {
                    if (e.team === 'home') {
                        enriched.player = homeScorers[hGoalIdx] || '?';
                        enriched.assist = homeAssistors[hGoalIdx] || null;
                        hGoalIdx++;
                    } else {
                        enriched.player = awayScorers[aGoalIdx] || '?';
                        enriched.assist = awayAssistors[aGoalIdx] || null;
                        aGoalIdx++;
                    }
                } else if (e.type === 'yellow') {
                    if (e.team === 'home') { enriched.player = homeYellowPlayers[hYellowIdx] || '?'; hYellowIdx++; }
                    else { enriched.player = awayYellowPlayers[aYellowIdx] || '?'; aYellowIdx++; }
                } else if (e.type === 'red') {
                    if (e.team === 'home') { enriched.player = homeRedPlayers[hRedIdx] || '?'; hRedIdx++; }
                    else { enriched.player = awayRedPlayers[aRedIdx] || '?'; aRedIdx++; }
                } else if (e.type === 'sub') {
                    if (e.team === 'home' && homeSubsOut[hSubIdx]) {
                        enriched.playerOut = homeSubsOut[hSubIdx].name;
                        enriched.playerIn = homeSubsOut[hSubIdx].playerIn || '?';
                        hSubIdx++;
                    } else if (e.team === 'away' && awaySubsOut[aSubIdx]) {
                        enriched.playerOut = awaySubsOut[aSubIdx].name;
                        enriched.playerIn = awaySubsOut[aSubIdx].playerIn || '?';
                        aSubIdx++;
                    }
                }
                return enriched;
            });
        };

        const enrichedEvents = enrichEvents(matchStats.events, playerStats, homeTeam.name, awayTeam.name, homeSquad, awaySquad);
        matchStats.events = enrichedEvents;

        return {
            id: matchId,
            homeTeam: homeTeam.name,
            awayTeam: awayTeam.name,
            homeGoals,
            awayGoals,
            result,
            season: this.currentSeason,
            date: new Date().toISOString().split('T')[0],
            homeSquad,
            awaySquad,
            stats: matchStats,
            playerStats,
            events: matchStats.events
        };
    }

    generateMatchStats(homeTeam, awayTeam, homeGoals, awayGoals, homeRating, awayRating, homeSquad, awaySquad) {
        // Maç istatistikleri - gol, topla oynama, şut, korner, faul, ofsayt
        const homeStrength = homeRating / (homeRating + awayRating);
        const awayStrength = 1 - homeStrength;

        const homePoss = Math.round(35 + homeStrength * 30 + (Math.random() * 10 - 5));
        const awayPoss = 100 - homePoss;

        const homeShots = Math.max(homeGoals * 2, Math.round(6 + homeStrength * 12 + Math.random() * 6));
        const awayShots = Math.max(awayGoals * 2, Math.round(6 + awayStrength * 12 + Math.random() * 6));
        const homeShotsOT = Math.max(homeGoals, Math.round(homeGoals + Math.random() * (homeShots - homeGoals) * 0.5));
        const awayShotsOT = Math.max(awayGoals, Math.round(awayGoals + Math.random() * (awayShots - awayGoals) * 0.5));

        const homeCorners = Math.round(2 + homeStrength * 8 + Math.random() * 4);
        const awayCorners = Math.round(2 + awayStrength * 8 + Math.random() * 4);
        const homeFouls = Math.round(8 + Math.random() * 10);
        const awayFouls = Math.round(8 + Math.random() * 10);
        const homeOffsides = Math.round(Math.random() * 5);
        const awayOffsides = Math.round(Math.random() * 5);

        // Sarı kart sayısı (foula göre orantılı)
        const homeYellows = Math.round((homeFouls / 18) * (Math.random() * 4));
        const awayYellows = Math.round((awayFouls / 18) * (Math.random() * 4));

        // Olaylar listesi
        const events = [];

        // Gol zamanları
        const homeGoalTimes = this.randomMinutes(homeGoals, 1, 90);
        const awayGoalTimes = this.randomMinutes(awayGoals, 1, 90);

        homeGoalTimes.forEach(min => events.push({ min, type: 'goal', team: 'home', isPenalty: Math.random() < 0.08 }));
        awayGoalTimes.forEach(min => events.push({ min, type: 'goal', team: 'away', isPenalty: Math.random() < 0.08 }));

        // Sarı kartlar
        const homeYellowTimes = this.randomMinutes(homeYellows, 10, 90);
        const awayYellowTimes = this.randomMinutes(awayYellows, 10, 90);
        homeYellowTimes.forEach(min => events.push({ min, type: 'yellow', team: 'home' }));
        awayYellowTimes.forEach(min => events.push({ min, type: 'yellow', team: 'away' }));

        // Kırmızı kart (nadir)
        const homeRed = Math.random() < 0.04;
        const awayRed = Math.random() < 0.04;
        if (homeRed) events.push({ min: Math.round(30 + Math.random() * 55), type: 'red', team: 'home', direct: Math.random() < 0.5 });
        if (awayRed) events.push({ min: Math.round(30 + Math.random() * 55), type: 'red', team: 'away', direct: Math.random() < 0.5 });

        // Değişiklikler yer tutucu (oyuncu stat'larından populate edilecek)
        const homeSubs = Math.round(2 + Math.random() * 3);
        const awaySubs = Math.round(2 + Math.random() * 3);
        const homeSubTimes = this.randomMinutes(homeSubs, 46, 85);
        const awaySubTimes = this.randomMinutes(awaySubs, 46, 85);
        homeSubTimes.forEach(min => events.push({ min, type: 'sub', team: 'home', playerOut: '', playerIn: '' }));
        awaySubTimes.forEach(min => events.push({ min, type: 'sub', team: 'away', playerOut: '', playerIn: '' }));

        events.sort((a, b) => a.min - b.min);

        return {
            possession: { home: homePoss, away: awayPoss },
            shots: { home: homeShots, away: awayShots },
            shotsOnTarget: { home: homeShotsOT, away: awayShotsOT },
            corners: { home: homeCorners, away: awayCorners },
            fouls: { home: homeFouls, away: awayFouls },
            offsides: { home: homeOffsides, away: awayOffsides },
            yellowCards: { home: homeYellows, away: awayYellows },
            redCards: { home: homeRed ? 1 : 0, away: awayRed ? 1 : 0 },
            events
        };
    }

    randomMinutes(count, min, max) {
        const times = [];
        for (let i = 0; i < count; i++) {
            times.push(Math.round(min + Math.random() * (max - min)));
        }
        return times.sort((a, b) => a - b);
    }

    generatePlayerStats(homeSquad, awaySquad, homeGoals, awayGoals, result, homeRating, awayRating, homeTeamName, awayTeamName) {
        const stats = {};
        const homeStarting = homeSquad.starting || [];
        const awayStarting = awaySquad.starting || [];
        const homeBench = homeSquad.bench || [];
        const awayBench = awaySquad.bench || [];

        // İlk önce tüm oyuncular için temel istatistik kaydı oluştur
        const initPlayerStat = (player, teamName, isStarting) => {
            stats[player.id] = {
                goals: 0,
                assists: 0,
                yellowCard: false,
                redCard: false,
                redCardType: null,
                minutesPlayed: 0,
                rating: 6.0,
                teamName,
                position: player.position || '',
                isStarting,
                teamWon: false,
                teamLost: false,
                // Mevkiye özel
                saves: 0,
                cleanSheet: false,
                goalsConceded: 0,
                tackles: 0,
                interceptions: 0,
                clearances: 0,
                duelsWon: 0,
                passAccuracy: 0,
                chances: 0,
                shots: 0,
                shotsOnTarget: 0,
                keyPasses: 0,
                dribbles: 0,
                crosses: 0,
                aerialDuels: 0,
                subOn: false,
                subOff: false,
                subMinute: null,
                subPlayer: null // kimin yerine
            };
        };

        [...homeStarting, ...homeBench].forEach(p => initPlayerStat(p, homeTeamName, homeStarting.some(s => s.id === p.id)));
        [...awayStarting, ...awayBench].forEach(p => initPlayerStat(p, awayTeamName, awayStarting.some(s => s.id === p.id)));

        // Takım sonuçları
        const homeWon = result === 'H', awayWon = result === 'A';
        [...homeStarting, ...homeBench].forEach(p => {
            if (stats[p.id]) { stats[p.id].teamWon = homeWon; stats[p.id].teamLost = awayWon; }
        });
        [...awayStarting, ...awayBench].forEach(p => {
            if (stats[p.id]) { stats[p.id].teamWon = awayWon; stats[p.id].teamLost = homeWon; }
        });

        // ——— DEĞIŞIKLIKLER (tutarlı) ———
        // Her takım 2-5 değişiklik yapar, yedekten girer
        const applySubstitutions = (starting, bench, teamName) => {
            const subCount = Math.min(bench.length, Math.round(2 + Math.random() * 3));
            const shuffledBench = [...bench].sort(() => Math.random() - 0.5);
            const shuffledStarting = [...starting].filter(p => p.position !== 'Kaleci').sort(() => Math.random() - 0.5);
            for (let i = 0; i < subCount && i < shuffledStarting.length; i++) {
                const playerOut = shuffledStarting[i];
                const playerIn = shuffledBench[i];
                if (!playerOut || !playerIn) continue;
                const subMin = Math.round(46 + Math.random() * 44);
                if (stats[playerOut.id]) {
                    stats[playerOut.id].subOff = true;
                    stats[playerOut.id].subMinute = subMin;
                    stats[playerOut.id].minutesPlayed = subMin;
                    stats[playerOut.id].subPlayer = playerIn.name;
                }
                if (stats[playerIn.id]) {
                    stats[playerIn.id].subOn = true;
                    stats[playerIn.id].subMinute = subMin;
                    stats[playerIn.id].minutesPlayed = 90 - subMin;
                    stats[playerIn.id].subPlayer = playerOut.name;
                }
            }
        };
        applySubstitutions(homeStarting, homeBench, homeTeamName);
        applySubstitutions(awayStarting, awayBench, awayTeamName);

        // Oynanmayan yedeklere 0 dakika
        [...homeStarting, ...homeBench, ...awayStarting, ...awayBench].forEach(p => {
            if (stats[p.id] && stats[p.id].minutesPlayed === 0) {
                const isStart = homeStarting.some(s => s.id === p.id) || awayStarting.some(s => s.id === p.id);
                if (isStart) {
                    stats[p.id].minutesPlayed = 90; // Başladı, değiştirilmedi
                }
                // else: bench'te kaldı, 0 dakika
            }
        });

        // ——— GOL DAĞITIMI (sadece oynayan oyuncular) ———
        const playingHome = [...homeStarting, ...homeBench].filter(p => stats[p.id]?.minutesPlayed > 0);
        const playingAway = [...awayStarting, ...awayBench].filter(p => stats[p.id]?.minutesPlayed > 0);

        this.distributeGoals(playingHome, homeGoals, stats, 'home', homeTeamName);
        this.distributeGoals(playingAway, awayGoals, stats, 'away', awayTeamName);

        // ——— ASİST DAĞITIMI ———
        this.distributeAssists(playingHome, homeGoals, stats, 'home', homeTeamName);
        this.distributeAssists(playingAway, awayGoals, stats, 'away', awayTeamName);

        // ——— MEVKIYE ÖZEL İSTATİSTİKLER ———
        const applyPositionStats = (players, isHome) => {
            players.filter(p => stats[p.id]?.minutesPlayed > 0).forEach(p => {
                const ps = stats[p.id];
                const pos = p.position || '';
                const mins = ps.minutesPlayed || 0;
                const minFactor = mins / 90; // Oynama süresine göre istatistik ölçekle

                if (pos === 'Kaleci') {
                    const opponentGoals = isHome ? awayGoals : homeGoals;
                    ps.saves = Math.round((opponentGoals * 1.5 + Math.random() * 4) * minFactor);
                    ps.goalsConceded = opponentGoals;
                    ps.cleanSheet = opponentGoals === 0;
                } else if (['Stoper', 'Sol Bek', 'Sağ Bek'].includes(pos)) {
                    ps.tackles = Math.round((1 + Math.random() * 5) * minFactor);
                    ps.interceptions = Math.round((0 + Math.random() * 3) * minFactor);
                    ps.clearances = Math.round((1 + Math.random() * 6) * minFactor);
                    ps.duelsWon = Math.round((1 + Math.random() * 4) * minFactor);
                } else if (['Ön Libero', 'Merkez Orta Saha'].includes(pos)) {
                    ps.tackles = Math.round((1 + Math.random() * 4) * minFactor);
                    ps.interceptions = Math.round((0 + Math.random() * 3) * minFactor);
                    ps.passAccuracy = Math.round(70 + Math.random() * 20);
                    ps.chances = Math.round(Math.random() * 2 * minFactor);
                } else if (['Ofansif Orta Saha', 'Forvet Arkası'].includes(pos)) {
                    ps.shots = Math.round((1 + Math.random() * 3) * minFactor);
                    ps.shotsOnTarget = Math.min(ps.shots, Math.round(Math.random() * 2 * minFactor));
                    ps.keyPasses = Math.round((0 + Math.random() * 3) * minFactor);
                    ps.chances = Math.round((0 + Math.random() * 2) * minFactor);
                    ps.dribbles = Math.round(Math.random() * 3 * minFactor);
                } else if (['Sol Kanat', 'Sağ Kanat'].includes(pos)) {
                    ps.shots = Math.round((1 + Math.random() * 3) * minFactor);
                    ps.shotsOnTarget = Math.min(ps.shots, Math.round(Math.random() * 2 * minFactor));
                    ps.crosses = Math.round((1 + Math.random() * 4) * minFactor);
                    ps.dribbles = Math.round((1 + Math.random() * 4) * minFactor);
                    ps.chances = Math.round(Math.random() * 2 * minFactor);
                } else if (pos === 'Santrafor') {
                    ps.shots = Math.max(ps.goals, Math.round((1 + Math.random() * 5) * minFactor));
                    ps.shotsOnTarget = Math.min(ps.shots, Math.max(ps.goals, Math.round((1 + Math.random() * 3) * minFactor)));
                    ps.chances = Math.round((0 + Math.random() * 3) * minFactor);
                    ps.aerialDuels = Math.round((0 + Math.random() * 4) * minFactor);
                }

                // Şut istatistiğini gol sayısıyla uyumlu kıl
                if (ps.shots !== undefined) ps.shots = Math.max(ps.goals, ps.shots);
                if (ps.shotsOnTarget !== undefined) ps.shotsOnTarget = Math.max(ps.goals, Math.min(ps.shots || ps.goals, ps.shotsOnTarget));
            });
        };
        applyPositionStats([...homeStarting, ...homeBench], true);
        applyPositionStats([...awayStarting, ...awayBench], false);

        // ——— REYTING (mevkiye özel formül) ———
        [...homeStarting, ...homeBench, ...awayStarting, ...awayBench].forEach(p => {
            if (stats[p.id] && stats[p.id].minutesPlayed > 0) {
                stats[p.id].rating = this.calculatePlayerRating(stats[p.id], p.position);
            }
        });

        return stats;
    }

    distributeGoals(players, goalCount, stats, side, teamName) {
        if (goalCount === 0 || players.length === 0) return;
        // Forvetler ve kanatlara daha yüksek olasılık
        const weights = players.map(p => {
            let w = 1;
            if (p.position === 'Santrafor') w = 5;
            else if (p.position === 'Sol Kanat' || p.position === 'Sağ Kanat') w = 3;
            else if (p.position === 'Forvet Arkası' || p.position === 'Ofansif Orta Saha') w = 2;
            else if (p.position === 'Stoper' || p.position === 'Kaleci') w = 0.1;
            return w;
        });
        const totalW = weights.reduce((a, b) => a + b, 0);
        for (let g = 0; g < goalCount; g++) {
            let rand = Math.random() * totalW;
            for (let i = 0; i < players.length; i++) {
                rand -= weights[i];
                if (rand <= 0) {
                    if (!stats[players[i].id]) stats[players[i].id] = { goals: 0, assists: 0, yellowCard: false, redCard: false, redCardType: null, minutesPlayed: 90, rating: 7, teamName };
                    stats[players[i].id].goals = (stats[players[i].id].goals || 0) + 1;
                    break;
                }
            }
        }
    }

    distributeAssists(players, goalCount, stats, side, teamName) {
        if (goalCount === 0 || players.length === 0) return;
        const assistCount = Math.max(0, goalCount - Math.floor(Math.random() * 2)); // Bazen gol asistssiz olur
        const weights = players.map(p => {
            let w = 1;
            if (p.position === 'Ofansif Orta Saha' || p.position === 'Forvet Arkası') w = 4;
            else if (p.position === 'Sol Kanat' || p.position === 'Sağ Kanat') w = 3;
            else if (p.position === 'Merkez Orta Saha') w = 2;
            else if (p.position === 'Santrafor') w = 1.5;
            else if (p.position === 'Kaleci') w = 0.05;
            return w;
        });
        const totalW = weights.reduce((a, b) => a + b, 0);
        for (let a = 0; a < assistCount; a++) {
            let rand = Math.random() * totalW;
            for (let i = 0; i < players.length; i++) {
                rand -= weights[i];
                if (rand <= 0) {
                    if (!stats[players[i].id]) stats[players[i].id] = { goals: 0, assists: 0, yellowCard: false, redCard: false, redCardType: null, minutesPlayed: 90, rating: 7, teamName };
                    stats[players[i].id].assists = (stats[players[i].id].assists || 0) + 1;
                    break;
                }
            }
        }
    }

    processCardsAndSuspensions(homeTeamName, awayTeamName, playerStats, matchStats) {
        // matchStats.yellowCards.home / .away → maç genelindeki sarı kart sayısı
        const homeYellows = matchStats?.yellowCards?.home || 0;
        const awayYellows = matchStats?.yellowCards?.away || 0;

        const applyCards = (teamName, yellowQuota) => {
            const teamIdx = this.teams.findIndex(t => t.name === teamName);
            if (teamIdx === -1) return;
            const players = this.teams[teamIdx].players || [];
            const teamPlayerIds = Object.keys(playerStats)
                .filter(id => playerStats[id]?.teamName === teamName && playerStats[id]?.minutesPlayed > 0);

            if (teamPlayerIds.length === 0) return;

            // Sarı kart alan oyuncuları belirle (yellowQuota adedince)
            const shuffled = [...teamPlayerIds].sort(() => Math.random() - 0.5);
            const yellowReceivers = shuffled.slice(0, Math.min(yellowQuota, teamPlayerIds.length));

            yellowReceivers.forEach(pid => {
                playerStats[pid].yellowCard = true;
                const pIdx = players.findIndex(p => String(p.id) === String(pid));
                if (pIdx !== -1) {
                    players[pIdx].yellowCards = (players[pIdx].yellowCards || 0) + 1;
                    if (!players[pIdx].cardsHistory) players[pIdx].cardsHistory = [];
                    players[pIdx].cardsHistory.push({ type: 'yellow', season: this.currentSeason });
                    // 5 sarı = 1 maç ceza (daha gerçekçi)
                    if (players[pIdx].yellowCards % 5 === 0) {
                        players[pIdx].suspendedMatches = (players[pIdx].suspendedMatches || 0) + 1;
                    }
                }
            });

            // İkinci sarıdan kırmızı (%5 ihtimal, sadece yellow alan birinde)
            if (yellowReceivers.length > 0 && Math.random() < 0.05) {
                const targetPid = yellowReceivers[Math.floor(Math.random() * yellowReceivers.length)];
                if (targetPid && !playerStats[targetPid]?.redCard) {
                    playerStats[targetPid].redCard = true;
                    playerStats[targetPid].redCardType = 'second-yellow';
                    const pIdx = players.findIndex(p => String(p.id) === String(targetPid));
                    if (pIdx !== -1) {
                        players[pIdx].redCards = (players[pIdx].redCards || 0) + 1;
                        players[pIdx].suspendedMatches = (players[pIdx].suspendedMatches || 0) + 1;
                    }
                }
            }

            // Direkt kırmızı kart (%3)
            if (Math.random() < 0.03) {
                const notYellow = teamPlayerIds.filter(id => !yellowReceivers.includes(id));
                const directRedTarget = notYellow[Math.floor(Math.random() * notYellow.length)];
                if (directRedTarget && !playerStats[directRedTarget]?.redCard) {
                    if (!playerStats[directRedTarget]) playerStats[directRedTarget] = { goals: 0, assists: 0, yellowCard: false, redCard: false, minutesPlayed: 90, rating: 7, teamName };
                    playerStats[directRedTarget].redCard = true;
                    playerStats[directRedTarget].redCardType = 'direct';
                    const pIdx = players.findIndex(p => String(p.id) === String(directRedTarget));
                    if (pIdx !== -1) {
                        players[pIdx].redCards = (players[pIdx].redCards || 0) + 1;
                        players[pIdx].suspendedMatches = (players[pIdx].suspendedMatches || 0) + 2;
                    }
                }
            }
            this.teams[teamIdx].players = players;
        };

        applyCards(homeTeamName, homeYellows);
        applyCards(awayTeamName, awayYellows);
    }

    decreaseSuspensions(teamName) {
        const teamIdx = this.teams.findIndex(t => t.name === teamName);
        if (teamIdx === -1) return;
        const players = this.teams[teamIdx].players || [];
        players.forEach(p => {
            if ((p.suspendedMatches || 0) > 0) {
                p.suspendedMatches--;
            }
        });
    }

    // Maça özel oyuncu istatistikleri (maç ekranından tıklanınca)
    showMatchPlayerStats(playerId, teamName, matchId) {
        const match = this.matches.find(m => m.id === matchId);
        if (!match) return;
        const teamIdx = this.teams.findIndex(t => t.name === teamName);
        if (teamIdx === -1) return;
        const player = (this.teams[teamIdx].players || []).find(p => String(p.id) === String(playerId));
        if (!player) return;

        const ps = (match.playerStats || {})[playerId];
        if (!ps) { alert('Bu maça ait istatistik bulunamadı.'); return; }

        const statKeys = this.getPositionStats(player.position);
        const isHome = match.homeTeam === teamName;
        const scored = isHome ? match.homeGoals : match.awayGoals;
        const conceded = isHome ? match.awayGoals : match.homeGoals;
        const resText = scored > conceded ? '✅ Galibiyet' : scored === conceded ? '🟡 Beraberlik' : '❌ Mağlubiyet';

        const statRowsHtml = statKeys.map(key => {
            let val;
            if (key === 'yellowCard') val = ps.yellowCard ? '🟨 Sarı Kart Aldı' : 'Almadı';
            else if (key === 'redCard') val = ps.redCard ? (ps.redCardType === 'direct' ? '🟥 Direkt Kırmızı' : '🟨🟥 2. Sarıdan Kırmızı') : 'Almadı';
            else if (key === 'cleanSheet') val = ps.cleanSheet ? '✅ Gol Yemedi' : '❌ Gol Yedi';
            else if (key === 'minutesPlayed') val = `${ps.minutesPlayed || 0}'${ps.subOn ? ' (Girdi)' : ps.subOff ? ' (Çıktı)' : ''}`;
            else if (key === 'rating') val = `${ps.rating || '-'} / 10`;
            else val = ps[key] !== undefined ? ps[key] : '-';

            return `<div class="mps-stat-row">
                <span class="mps-stat-label">${this.getStatLabel(key)}</span>
                <span class="mps-stat-val">${val}</span>
            </div>`;
        }).join('');

        const subInfo = ps.subOn
            ? `<div class="mps-sub-info">⬆️ <strong>${ps.subMinute}'</strong> dk'da <em>${ps.subPlayer || '?'}</em> yerine girdi</div>`
            : ps.subOff
            ? `<div class="mps-sub-info">⬇️ <strong>${ps.subMinute}'</strong> dk'da <em>${ps.subPlayer || '?'}</em> yerine çıktı</div>`
            : '';

        const html = `
        <h3 style="margin:0 0 .5rem;font-size:1.1rem">
            <span style="color:#667eea">#${player.number || '?'}</span> ${player.name}
            <span style="font-size:.8rem;color:#888;font-weight:400;margin-left:.5rem">${player.position || ''}</span>
        </h3>
        <div style="color:#888;font-size:.85rem;margin-bottom:.75rem">${match.homeTeam} vs ${match.awayTeam} — ${match.season} H${match.week || '?'} — ${resText}</div>
        ${subInfo}
        <div class="mps-stats-grid">
            ${statRowsHtml}
        </div>
        <div style="margin-top:1rem;border-top:1px solid #eee;padding-top:.75rem">
            <button class="btn btn-sm btn-secondary" onclick="window.footballSim.showPlayerProfile('${playerId}', '${teamName.replace(/'/g,"\\'")}')">
                📊 Genel Sezon İstatistikleri
            </button>
        </div>`;

        document.getElementById('match-player-stats-content').innerHTML = html;
        document.getElementById('match-player-stats-modal').classList.add('show');
    }

    // Oyuncu profili göster (genel istatistikler - normal kadro görünümünden)
    showPlayerProfile(playerId, teamName) {
        const teamIdx = this.teams.findIndex(t => t.name === teamName);
        if (teamIdx === -1) return;
        const player = (this.teams[teamIdx].players || []).find(p => String(p.id) === String(playerId));
        if (!player) return;

        // Bu oyuncunun oynadığı tüm maçları bul
        const playerMatches = this.matches.filter(m =>
            (m.homeTeam === teamName || m.awayTeam === teamName) &&
            m.playerStats && m.playerStats[playerId]
        );

        const playedMatches = playerMatches.filter(m => (m.playerStats[playerId]?.minutesPlayed || 0) > 0);
        const totalGoals = playedMatches.reduce((sum, m) => sum + (m.playerStats[playerId]?.goals || 0), 0);
        const totalAssists = playedMatches.reduce((sum, m) => sum + (m.playerStats[playerId]?.assists || 0), 0);
        const totalMinutes = playedMatches.reduce((sum, m) => sum + (m.playerStats[playerId]?.minutesPlayed || 0), 0);
        const totalYellows = (player.cardsHistory || []).filter(c => c.type === 'yellow').length;
        const totalReds = player.redCards || 0;
        const avgRating = playedMatches.length > 0
            ? (playedMatches.reduce((sum, m) => sum + (m.playerStats[playerId]?.rating || 0), 0) / playedMatches.length).toFixed(1)
            : '-';
        const matchesPlayed = playedMatches.length;

        // Mevkiye özel kümülatif istatistikler
        const posStatKeys = this.getPositionStats(player.position).filter(k => !['minutesPlayed','goals','assists','yellowCard','redCard','rating'].includes(k));
        const cumStats = {};
        posStatKeys.forEach(key => {
            cumStats[key] = playedMatches.reduce((sum, m) => {
                const val = m.playerStats[playerId]?.[key];
                if (typeof val === 'boolean') return sum + (val ? 1 : 0);
                return sum + (val || 0);
            }, 0);
        });

        const posStatsHtml = posStatKeys.length > 0 ? `
        <div class="pp-pos-stats">
            <div class="pp-section-title">Mevki İstatistikleri (${player.position})</div>
            <div class="pp-pos-stats-grid">
                ${posStatKeys.map(key => `
                    <div class="pp-pos-stat">
                        <div class="pp-pos-num">${cumStats[key]}</div>
                        <div class="pp-pos-lbl">${this.getStatLabel(key)}</div>
                    </div>
                `).join('')}
            </div>
        </div>` : '';

        const roleLabelMap = {};
        this.getPlayerRoles().forEach(r => roleLabelMap[r.id] = r.label);

        const matchHistoryHTML = playedMatches.slice(-8).reverse().map(m => {
            const isHome = m.homeTeam === teamName;
            const opp = isHome ? m.awayTeam : m.homeTeam;
            const ms = m.playerStats[playerId] || {};
            const scored = isHome ? m.homeGoals : m.awayGoals;
            const conceded = isHome ? m.awayGoals : m.homeGoals;
            const resText = scored > conceded ? 'G' : scored === conceded ? 'B' : 'M';
            const resCls = scored > conceded ? 'form-w' : scored === conceded ? 'form-d' : 'form-l';
            const clickFn = m.id ? `onclick="window.footballSim.showMatchPlayerStats('${playerId}', '${teamName.replace(/'/g,"\\'")}', '${m.id}')"` : '';
            return `<div class="pp-match-row" ${clickFn} style="${m.id ? 'cursor:pointer' : ''}">
                <span class="form-badge ${resCls}">${resText}</span>
                <span class="pp-opp">${opp}</span>
                <span class="pp-score">${scored}-${conceded}</span>
                <span class="pp-mins">${ms.minutesPlayed || 0}'</span>
                <span class="pp-goals">${ms.goals > 0 ? '⚽ '+ms.goals : ''}</span>
                <span class="pp-assists">${ms.assists > 0 ? '🎯 '+ms.assists : ''}</span>
                ${ms.yellowCard ? '<span class="pp-card pp-yellow">🟨</span>' : ''}
                ${ms.redCard ? '<span class="pp-card pp-red">🟥</span>' : ''}
                <span class="pp-rating" style="color:${ms.rating >= 8 ? '#22c55e' : ms.rating >= 6.5 ? '#667eea' : '#ef4444'};font-weight:700">${ms.rating || '-'}</span>
            </div>`;
        }).join('') || '<p class="no-data">Henüz maç istatistiği yok.</p>';

        const html = `
        <div class="player-profile">
            <div class="pp-header">
                <div class="pp-number">${player.number || '?'}</div>
                <div class="pp-info">
                    <h2>${player.name}</h2>
                    <div class="pp-meta">
                        <span class="pp-position-badge">${player.position || '-'}</span>
                        <span class="pp-role-badge">${roleLabelMap[player.role] || player.role || '-'}</span>
                    </div>
                    <div class="pp-team">${teamName}</div>
                </div>
                <div class="pp-rating-big">
                    <div class="pp-rating-num">${player.rating}</div>
                    <div class="pp-rating-lbl">Puan (1-100)</div>
                </div>
            </div>
            <div class="pp-stats-grid">
                <div class="pp-stat"><div class="pp-stat-num">${matchesPlayed}</div><div class="pp-stat-lbl">Maç</div></div>
                <div class="pp-stat"><div class="pp-stat-num">${totalGoals}</div><div class="pp-stat-lbl">Gol</div></div>
                <div class="pp-stat"><div class="pp-stat-num">${totalAssists}</div><div class="pp-stat-lbl">Asist</div></div>
                <div class="pp-stat"><div class="pp-stat-num">${totalMinutes}'</div><div class="pp-stat-lbl">Dakika</div></div>
                <div class="pp-stat"><div class="pp-stat-num" style="color:#f59e0b">${totalYellows}</div><div class="pp-stat-lbl">Sarı Kart</div></div>
                <div class="pp-stat"><div class="pp-stat-num" style="color:#ef4444">${totalReds}</div><div class="pp-stat-lbl">Kırmızı</div></div>
                <div class="pp-stat"><div class="pp-stat-num" style="color:#667eea">${avgRating}</div><div class="pp-stat-lbl">Ort. Puan</div></div>
                <div class="pp-stat"><div class="pp-stat-num" style="color:${(player.suspendedMatches||0) > 0 ? '#ef4444' : '#22c55e'}">${(player.suspendedMatches||0) > 0 ? player.suspendedMatches+' maç' : '✓'}</div><div class="pp-stat-lbl">Ceza</div></div>
            </div>
            ${posStatsHtml}
            <div class="pp-matches-section">
                <div class="pp-section-title">Son Maçlar <small style="color:#aaa;font-weight:400">(Detay için tıkla)</small></div>
                ${matchHistoryHTML}
            </div>
        </div>`;

        // Mevcut modal içeriğini player profile ile değiştir
        const modal = document.getElementById('player-profile-modal');
        document.getElementById('player-profile-content').innerHTML = html;
        modal.classList.add('show');
    }

    // Takım profili içinde kadro göster
    renderSquadForProfile(teamName) {
        const players = this.getTeamPlayers(teamName);
        if (players.length === 0) {
            return `<div class="squad-empty">
                <p>Bu takımda henüz oyuncu yok.</p>
                <button class="btn btn-primary btn-sm" onclick="window.footballSim.showAddPlayerModal('${teamName.replace(/'/g,"\\'")}')">
                    <i class="fas fa-plus"></i> Oyuncu Ekle
                </button>
            </div>`;
        }

        const byPosition = {};
        players.forEach(p => {
            const pos = p.position || 'Diğer';
            if (!byPosition[pos]) byPosition[pos] = [];
            byPosition[pos].push(p);
        });

        const roleLabelMap = {};
        this.getPlayerRoles().forEach(r => roleLabelMap[r.id] = r.label);

        const posOrder = ['Kaleci','Stoper','Sol Bek','Sağ Bek','Ön Libero','Merkez Orta Saha','Ofansif Orta Saha','Forvet Arkası','Sol Kanat','Sağ Kanat','Santrafor'];
        let html = `<div class="squad-container">
            <div class="squad-header-row">
                <button class="btn btn-sm btn-primary" onclick="window.footballSim.showAddPlayerModal('${teamName.replace(/'/g,"\\'")}')">
                    <i class="fas fa-plus"></i> Oyuncu Ekle
                </button>
                <span style="color:#888;font-size:.8rem">${players.length} oyuncu</span>
            </div>`;

        posOrder.forEach(pos => {
            const group = byPosition[pos];
            if (!group) return;
            html += `<div class="squad-position-group">
                <div class="squad-position-label">${pos}</div>`;
            group.forEach(p => {
                const suspended = (p.suspendedMatches || 0) > 0;
                html += `<div class="squad-player-row ${suspended ? 'suspended' : ''}" onclick="window.footballSim.showPlayerProfile('${p.id}', '${teamName.replace(/'/g,"\\'")}')">
                    <span class="squad-num">${p.number || '?'}</span>
                    <span class="squad-name">${p.name}</span>
                    <span class="squad-role" title="${roleLabelMap[p.role] || ''}">${p.role === 'ilk11' ? '⭐' : p.role === 'rotasyon' ? '🔄' : p.role === 'yedek' ? '🪑' : p.role === 'kararliYedek' ? '↕' : '🌱'}</span>
                    <span class="squad-rating">${p.rating}</span>
                    ${suspended ? `<span class="squad-suspended" title="${p.suspendedMatches} maç cezalı">🚫${p.suspendedMatches}</span>` : ''}
                    <button class="btn-edit-player" title="Düzenle" onclick="event.stopPropagation(); window.footballSim.showEditPlayerModal('${teamName.replace(/'/g,"\\'")}', '${p.id}')">✏️</button>
                    <button class="btn-remove-player" onclick="event.stopPropagation(); window.footballSim.removePlayerConfirm('${teamName.replace(/'/g,"\\'")}', '${p.id}')">✕</button>
                </div>`;
            });
            html += '</div>';
        });

        html += '</div>';
        return html;
    }

    removePlayerConfirm(teamName, playerId) {
        if (confirm('Bu oyuncuyu kadrodan çıkarmak istiyor musunuz?')) {
            this.removePlayerFromTeam(teamName, playerId);
            // Profil modalını yenile
            this.showTeamProfile(teamName);
        }
    }

    showAddPlayerModal(teamName) {
        const positions = this.getPositions();
        const roles = this.getPlayerRoles();
        const modalHtml = `
        <div class="modal-content">
            <span class="close" onclick="document.getElementById('add-player-modal').classList.remove('show')">&times;</span>
            <h3><i class="fas fa-user-plus"></i> Oyuncu Ekle - ${teamName}</h3>
            <form id="add-player-form" onsubmit="event.preventDefault(); window.footballSim.submitAddPlayer('${teamName.replace(/'/g,"\\'")}')">
                <div class="form-group">
                    <label>Forma Numarası:</label>
                    <input type="number" id="player-number" min="1" max="99" required placeholder="Örn: 9">
                </div>
                <div class="form-group">
                    <label>Oyuncu Adı:</label>
                    <input type="text" id="player-name" required placeholder="Oyuncu adı">
                </div>
                <div class="form-group">
                    <label>Mevki:</label>
                    <select id="player-position" required>
                        <option value="">Mevki Seçin</option>
                        ${positions.map(p => `<option value="${p}">${p}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Oyuncu Reytingi (1-100):</label>
                    <input type="number" id="player-rating" min="1" max="100" required placeholder="Örn: 82">
                </div>
                <div class="form-group">
                    <label>Oyuncu Tipi:</label>
                    <select id="player-role" required>
                        <option value="">Tip Seçin</option>
                        ${roles.map(r => `<option value="${r.id}">${r.label}</option>`).join('')}
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('add-player-modal').classList.remove('show')">İptal</button>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Kaydet</button>
                </div>
            </form>
        </div>`;
        document.getElementById('add-player-modal').innerHTML = modalHtml;
        document.getElementById('add-player-modal').classList.add('show');
    }

    submitAddPlayer(teamName) {
        const number = parseInt(document.getElementById('player-number').value);
        const name = document.getElementById('player-name').value.trim();
        const position = document.getElementById('player-position').value;
        const rating = parseInt(document.getElementById('player-rating').value);
        const role = document.getElementById('player-role').value;

        if (!name || !position || !role || isNaN(number) || isNaN(rating)) {
            alert('Lütfen tüm alanları doldurun.'); return;
        }
        if (rating < 1 || rating > 100) {
            alert('Reyting 1-100 arasında olmalıdır.'); return;
        }

        this.addPlayerToTeam(teamName, { number, name, position, rating, role });
        document.getElementById('add-player-modal').classList.remove('show');
        this.showTeamProfile(teamName); // Profili yenile
        this.addActivity(`${teamName} kadrosuna ${name} eklendi`);
    }

    showEditPlayerModal(teamName, playerId) {
        const teamIdx = this.teams.findIndex(t => t.name === teamName);
        if (teamIdx === -1) return;
        const player = (this.teams[teamIdx].players || []).find(p => String(p.id) === String(playerId));
        if (!player) return;

        const positions = this.getPositions();
        const roles = this.getPlayerRoles();

        const modalHtml = `
        <div class="modal-content">
            <span class="close" onclick="document.getElementById('edit-player-modal').classList.remove('show')">&times;</span>
            <h3><i class="fas fa-user-edit"></i> Oyuncu Düzenle - ${player.name}</h3>
            <form id="edit-player-form" onsubmit="event.preventDefault(); window.footballSim.submitEditPlayer('${teamName.replace(/'/g,"\\'")}', '${String(playerId).replace(/'/g,"\\'")}')">
                <div class="form-group">
                    <label>Forma Numarası:</label>
                    <input type="number" id="edit-player-number" min="1" max="99" required value="${player.number || ''}">
                </div>
                <div class="form-group">
                    <label>Oyuncu Adı:</label>
                    <input type="text" id="edit-player-name" required value="${player.name || ''}">
                </div>
                <div class="form-group">
                    <label>Mevki:</label>
                    <select id="edit-player-position" required>
                        <option value="">Mevki Seçin</option>
                        ${positions.map(p => `<option value="${p}" ${p === player.position ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Oyuncu Reytingi (1-100):</label>
                    <input type="number" id="edit-player-rating" min="1" max="100" required value="${player.rating || 75}">
                </div>
                <div class="form-group">
                    <label>Oyuncu Tipi:</label>
                    <select id="edit-player-role" required>
                        <option value="">Tip Seçin</option>
                        ${roles.map(r => `<option value="${r.id}" ${r.id === player.role ? 'selected' : ''}>${r.label}</option>`).join('')}
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('edit-player-modal').classList.remove('show')">İptal</button>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Kaydet</button>
                </div>
            </form>
        </div>`;
        document.getElementById('edit-player-modal').innerHTML = modalHtml;
        document.getElementById('edit-player-modal').classList.add('show');
    }

    submitEditPlayer(teamName, playerId) {
        const number = parseInt(document.getElementById('edit-player-number').value);
        const name = document.getElementById('edit-player-name').value.trim();
        const position = document.getElementById('edit-player-position').value;
        const rating = parseInt(document.getElementById('edit-player-rating').value);
        const role = document.getElementById('edit-player-role').value;

        if (!name || !position || !role || isNaN(number) || isNaN(rating)) {
            alert('Lütfen tüm alanları doldurun.'); return;
        }
        if (rating < 1 || rating > 100) {
            alert('Reyting 1-100 arasında olmalıdır.'); return;
        }

        const teamIdx = this.teams.findIndex(t => t.name === teamName);
        if (teamIdx === -1) { alert('Takım bulunamadı.'); return; }
        const playerIdx = (this.teams[teamIdx].players || []).findIndex(p => String(p.id) === String(playerId));
        if (playerIdx === -1) { alert('Oyuncu bulunamadı.'); return; }

        const oldPlayer = this.teams[teamIdx].players[playerIdx];
        this.teams[teamIdx].players[playerIdx] = { ...oldPlayer, number, name, position, rating, role };
        this.saveData();
        document.getElementById('edit-player-modal').classList.remove('show');
        this.showTeamProfile(teamName);
        this.addActivity(`${teamName} - ${name} oyuncu bilgileri güncellendi`);
    }

    // Maç detaylarını göster
    showMatchDetailsEnhanced(matchId) {
        const match = this.matches.find(m => m.id === matchId);
        if (!match) return;

        const homeSquad = match.homeSquad || { starting: [], bench: [] };
        const awaySquad = match.awaySquad || { starting: [], bench: [] };
        const stats = match.stats || {};
        const playerStats = match.playerStats || {};

        const renderSquadList = (players, teamName, title) => {
            if (!players || players.length === 0) return `<div class="no-data">Kadro bilgisi yok</div>`;
            return players.map(p => {
                const ps = playerStats[p.id] || {};
                const suspended = (p.suspendedMatches || 0) > 0;
                const notPlayed = ps.minutesPlayed === 0;
                const subInfo = ps.subOn ? `↑${ps.subMinute}'` : ps.subOff ? `↓${ps.subMinute}'` : '';
                return `<div class="md-player-row ${notPlayed ? 'md-player-bench' : ''}" onclick="window.footballSim.showMatchPlayerStats('${p.id}', '${teamName.replace(/'/g,"\\'")}', '${matchId}')">
                    <span class="md-num">${p.number || '?'}</span>
                    <span class="md-name">${p.name}</span>
                    <span class="md-pos">${p.position || ''}</span>
                    <span class="md-mins" title="Oynanan dakika">${ps.minutesPlayed > 0 ? ps.minutesPlayed + "'" : (notPlayed ? 'Oynamadı' : '-')} ${subInfo ? `<small style="color:#888">${subInfo}</small>` : ''}</span>
                    ${ps.goals > 0 ? `<span class="md-event">⚽${ps.goals}</span>` : ''}
                    ${ps.assists > 0 ? `<span class="md-event">🎯${ps.assists}</span>` : ''}
                    ${ps.yellowCard ? '<span class="md-event">🟨</span>' : ''}
                    ${ps.redCard ? `<span class="md-event">${ps.redCardType === 'direct' ? '🟥' : '🟨🟥'}</span>` : ''}
                    <span class="md-rating" style="${ps.rating >= 8 ? 'color:#22c55e' : ps.rating >= 6.5 ? 'color:#667eea' : 'color:#ef4444'}">${ps.minutesPlayed > 0 && ps.rating ? ps.rating : '-'}</span>
                </div>`;
            }).join('');
        };

        const renderEvents = (events) => {
            if (!events || events.length === 0) return '<p class="no-data">Olay kaydı yok.</p>';
            return events.map(e => {
                let icon = '';
                let text = '';
                if (e.type === 'goal') {
                    icon = '⚽';
                    text = `<strong>${e.player || '?'}</strong>${e.assist ? ` <span style="color:#888;font-size:.85em">(Asist: ${e.assist})</span>` : ''}${e.isPenalty ? ' <span class="md-event-badge">P</span>' : ''}`;
                }
                else if (e.type === 'yellow') { icon = '🟨'; text = `<strong>${e.player || '?'}</strong> <span style="color:#888;font-size:.85em">Sarı kart</span>`; }
                else if (e.type === 'red') {
                    icon = e.direct ? '🟥' : '🟨🟥';
                    text = `<strong>${e.player || '?'}</strong> <span style="color:#888;font-size:.85em">${e.direct ? 'Direkt kırmızı' : 'İkinci sarıdan kırmızı'}</span>`;
                }
                else if (e.type === 'sub') {
                    icon = '🔄';
                    text = e.playerOut
                        ? `<span style="color:#ef4444">↓ ${e.playerOut}</span> <span style="color:#22c55e">↑ ${e.playerIn || '?'}</span>`
                        : 'Değişiklik';
                }
                return `<div class="md-event-row">
                    <span class="md-event-min">${e.min}'</span>
                    <span class="md-event-icon">${icon}</span>
                    <span class="md-event-text">${text}</span>
                    <span class="md-event-team">${e.team === 'home' ? match.homeTeam : match.awayTeam}</span>
                </div>`;
            }).join('');
        };

        const statBar = (label, home, away) => `
            <div class="stat-bar-row">
                <span class="stat-val">${home}</span>
                <div class="stat-bar-wrap">
                    <div class="stat-bar-home" style="width:${home/(home+away+0.01)*100}%"></div>
                    <div class="stat-bar-away" style="width:${away/(home+away+0.01)*100}%"></div>
                </div>
                <span class="stat-val">${away}</span>
                <span class="stat-label">${label}</span>
            </div>`;

        const html = `
        <div class="match-detail-full">
            <div class="md-scoreboard">
                <div class="md-team">${match.homeTeam}</div>
                <div class="md-score-big">${match.homeGoals} - ${match.awayGoals}</div>
                <div class="md-team">${match.awayTeam}</div>
            </div>
            <div class="md-meta">${match.league} · Hafta ${match.week || '?'} · ${match.season}</div>

            <div class="md-tabs">
                <button class="md-tab active" onclick="this.closest('.md-tabs').querySelectorAll('.md-tab').forEach(t=>t.classList.remove('active')); this.classList.add('active'); this.closest('.match-detail-full').querySelectorAll('.md-panel').forEach(p=>p.classList.remove('active')); this.closest('.match-detail-full').querySelector('#md-panel-stats').classList.add('active')">İstatistikler</button>
                <button class="md-tab" onclick="this.closest('.md-tabs').querySelectorAll('.md-tab').forEach(t=>t.classList.remove('active')); this.classList.add('active'); this.closest('.match-detail-full').querySelectorAll('.md-panel').forEach(p=>p.classList.remove('active')); this.closest('.match-detail-full').querySelector('#md-panel-squads').classList.add('active')">Kadrolar</button>
                <button class="md-tab" onclick="this.closest('.md-tabs').querySelectorAll('.md-tab').forEach(t=>t.classList.remove('active')); this.classList.add('active'); this.closest('.match-detail-full').querySelectorAll('.md-panel').forEach(p=>p.classList.remove('active')); this.closest('.match-detail-full').querySelector('#md-panel-events').classList.add('active')">Olaylar</button>
            </div>

            <div id="md-panel-stats" class="md-panel active">
                <div class="md-stats-container">
                    ${stats.possession ? statBar('Topla Oynama %', stats.possession.home, stats.possession.away) : ''}
                    ${stats.shots ? statBar('Şut', stats.shots.home, stats.shots.away) : ''}
                    ${stats.shotsOnTarget ? statBar('İsabetli Şut', stats.shotsOnTarget.home, stats.shotsOnTarget.away) : ''}
                    ${stats.corners ? statBar('Korner', stats.corners.home, stats.corners.away) : ''}
                    ${stats.fouls ? statBar('Faul', stats.fouls.home, stats.fouls.away) : ''}
                    ${stats.offsides ? statBar('Ofsayt', stats.offsides.home, stats.offsides.away) : ''}
                    ${stats.yellowCards ? statBar('Sarı Kart', stats.yellowCards.home, stats.yellowCards.away) : ''}
                </div>
            </div>

            <div id="md-panel-squads" class="md-panel">
                <div class="md-squads-layout">
                    <div class="md-squad-col">
                        <h4>${match.homeTeam} - İlk 11</h4>
                        ${renderSquadList(homeSquad.starting, match.homeTeam, 'home')}
                        <h4 style="margin-top:1rem">Yedekler</h4>
                        ${renderSquadList(homeSquad.bench, match.homeTeam, 'home')}
                    </div>
                    <div class="md-squad-col">
                        <h4>${match.awayTeam} - İlk 11</h4>
                        ${renderSquadList(awaySquad.starting, match.awayTeam, 'away')}
                        <h4 style="margin-top:1rem">Yedekler</h4>
                        ${renderSquadList(awaySquad.bench, match.awayTeam, 'away')}
                    </div>
                </div>
            </div>

            <div id="md-panel-events" class="md-panel">
                <div class="md-events-list">
                    ${renderEvents(match.events)}
                </div>
            </div>
        </div>`;

        document.getElementById('match-details-content').innerHTML = html;
        document.getElementById('match-details-modal').classList.add('show');
    }

    // Match Simulation Engine (0.5-9.9 reyting)

    generateGoals(attackRating, defenseRating, isWinner) {
        const attackStrength = Math.max(0.5, Math.min(9.9, attackRating));
        const defenseStrength = Math.max(0.5, Math.min(9.9, defenseRating));
        
        // Balanced expectancy - typically 0.5 to 2.5 goals
        const ratingRatio = attackStrength / defenseStrength;
        let baseExpectancy = 1.0 + ((ratingRatio - 1) * 0.6);
        
        // Cap expectancy to prevent too many goals
        baseExpectancy = Math.max(0.4, Math.min(2.2, baseExpectancy));
        
        // Add controlled randomness
        const randomFactor = 0.85 + (Math.random() * 0.3); // 0.85 to 1.15
        let goalExpectancy = baseExpectancy * randomFactor;
        
        // Simplified goal generation with realistic weights
        const random = Math.random();
        let goals = 0;
        
        if (random < Math.exp(-goalExpectancy)) {
            goals = 0;
        } else if (random < Math.exp(-goalExpectancy) + goalExpectancy * Math.exp(-goalExpectancy)) {
            goals = 1;
        } else if (random < 0.85) {
            goals = 2;
        } else if (random < 0.95) {
            goals = 3;
        } else {
            goals = Math.floor(Math.random() * 2) + 4; // 4 or 5
        }
        
        // Ensure winners usually score
        if (isWinner && goals === 0 && Math.random() > 0.2) {
            goals = 1;
        }
        
        return goals;
    }

    // Season Simulation
    simulateFullSeason() {
        this.addActivity('Tam sezon simülasyonu başlatıldı');
        
        // Simulate all leagues
        Object.keys(this.leagues).forEach(leagueName => {
            this.simulateLeague(leagueName);
        });

        this.renderSeasonProgress();
        this.renderRecentMatches();
        this.updateStats();
        this.addActivity('Tam sezon simülasyonu tamamlandı');
    }

    simulateLeague(leagueName) {
        const leagueTeams = this.teams.filter(team => team.league === leagueName);
        const matches = [];

        // Generate double round-robin fixture
        for (let i = 0; i < leagueTeams.length; i++) {
            for (let j = 0; j < leagueTeams.length; j++) {
                if (i !== j) {
                    const match = this.simulateMatch(leagueTeams[i], leagueTeams[j]);
                    match.league = leagueName;
                    match.week = Math.floor(matches.length / (leagueTeams.length / 2)) + 1;
                    matches.push(match);
                }
            }
        }

        this.matches = this.matches.filter(m => m.season !== this.currentSeason || m.league !== leagueName);
        this.matches.push(...matches);
        this.saveData();
    }

    simulateWeek() {
        // Simulate one week across all leagues
        const weekMatches = [];
        
        Object.keys(this.leagues).forEach(leagueName => {
            const leagueMatches = this.getLeagueMatches(leagueName);
            const currentWeek = Math.floor(leagueMatches.length / this.leagues[leagueName].teams) + 1;
            const maxWeeks = this.leagues[leagueName].matches;
            
            if (currentWeek <= maxWeeks) {
                const leagueTeams = this.teams.filter(team => team.league === leagueName);
                // Simulate fixtures for current week
                for (let i = 0; i < Math.min(leagueTeams.length / 2, 5); i++) {
                    if (leagueTeams.length > i * 2 + 1) {
                        const match = this.simulateMatch(leagueTeams[i * 2], leagueTeams[i * 2 + 1]);
                        match.league = leagueName;
                        match.week = currentWeek;
                        weekMatches.push(match);
                    }
                }
            }
        });

        this.matches.push(...weekMatches);
        this.saveData();
        this.renderRecentMatches();
        this.renderSeasonProgress();
        this.addActivity(`${weekMatches.length} haftalık maç simüle edildi`);
    }

    getLeagueMatches(leagueName, season) {
        const s = season !== undefined ? season : this.currentSeason;
        return this.matches.filter(m => m.league === leagueName && m.season === s);
    }

    getAvailableSeasons() {
        const set = new Set();
        this.matches.forEach(m => set.add(m.season));
        const arr = Array.from(set).sort().reverse();
        return arr.length ? arr : [this.currentSeason];
    }

    // European Competition Management
    simulateEuropeanCompetitions() {
        // This would implement the European competition logic
        // For now, we'll generate some sample data
        const sampleResults = [
            { team: 'Manchester City', competition: 'UCL', stage: 'Winner', points: 10, season: this.currentSeason },
            { team: 'Real Madrid', competition: 'UCL', stage: 'Final', points: 8, season: this.currentSeason },
            { team: 'Bayern Munich', competition: 'UCL', stage: 'SF', points: 7, season: this.currentSeason },
            { team: 'PSG', competition: 'UCL', stage: 'QF', points: 6, season: this.currentSeason },
        ];

        this.europeanResults.push(...sampleResults);
        this.calculateCountryCoefficients();
        this.saveData();
    }

    getEuropeanStagePoints(competition, stage) {
        const comp = (competition || '').toUpperCase().replace('UECL', 'UECL');
        const map = this.europeanPoints[comp];
        if (!map) return 0;
        return map[stage] ?? map[stage.replace(/ /g, '_')] ?? 0;
    }

    calculateCountryCoefficients(season) {
        const s = season !== undefined ? season : this.currentSeason;
        const seasonPoints = {};
        
        this.europeanResults
            .filter(result => result.season === s)
            .forEach(result => {
                const team = this.teams.find(t => t.name === result.team);
                if (team) {
                    const pts = this.getEuropeanStagePoints(result.competition, result.stage);
                    if (!seasonPoints[team.country]) {
                        seasonPoints[team.country] = { points: 0, teams: new Set() };
                    }
                    seasonPoints[team.country].points += pts;
                    seasonPoints[team.country].teams.add(result.team);
                    if (result.points === undefined) result.points = pts;
                }
            });

        Object.keys(seasonPoints).forEach(country => {
            const numTeams = seasonPoints[country].teams.size;
            const totalPoints = seasonPoints[country].points;
            const coefficient = numTeams > 0 ? totalPoints / numTeams : 0;
            
            let countryData = this.countryCoefficients.find(c => c.country === country);
            if (!countryData) {
                countryData = { country, seasons: {} };
                this.countryCoefficients.push(countryData);
            }
            countryData.seasons[s] = {
                coefficient,
                points: totalPoints,
                teams: numTeams
            };
        });
        this.saveData();
    }

    // Rendering Methods
    renderDashboard() {
        this.updateStats();
        this.renderRecentActivity();
    }

    updateStats() {
        document.getElementById('total-teams').textContent = this.teams.length;
        document.getElementById('total-matches').textContent = this.matches.length;
        document.getElementById('current-season').textContent = this.currentSeason;
        document.getElementById('current-season-display').textContent = this.currentSeason;
        const totalLeaguesEl = document.getElementById('total-leagues');
        if (totalLeaguesEl) totalLeaguesEl.textContent = Object.keys(this.leagues).length;
    }

    renderRecentActivity() {
        const activityList = document.getElementById('activity-list');
        const activities = JSON.parse(localStorage.getItem('activities')) || [];
        
        if (activities.length === 0) {
            activityList.innerHTML = '<p class="no-data">Henüz aktivite bulunmuyor.</p>';
            return;
        }

        activityList.innerHTML = activities
            .slice(-10)
            .reverse()
            .map(activity => `
                <div class="activity-item">
                    <i class="fas fa-clock"></i>
                    <span>${activity.message}</span>
                    <small>${new Date(activity.timestamp).toLocaleString('tr-TR')}</small>
                </div>
            `).join('');
    }

    addActivity(message) {
        const activities = JSON.parse(localStorage.getItem('activities')) || [];
        activities.push({
            message,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('activities', JSON.stringify(activities));
        this.renderRecentActivity();
    }

    renderTeams() {
        const teamsList = document.getElementById('teams-list');
        const leagueFilter = document.getElementById('league-filter')?.value || '';
        const searchFilter = document.getElementById('team-search')?.value.toLowerCase() || '';

        let filteredTeams = this.teams;

        if (leagueFilter) {
            filteredTeams = filteredTeams.filter(team => team.league === leagueFilter);
        }

        if (searchFilter) {
            filteredTeams = filteredTeams.filter(team => 
                team.name.toLowerCase().includes(searchFilter) || 
                team.country.toLowerCase().includes(searchFilter)
            );
        }

        if (filteredTeams.length === 0) {
            teamsList.innerHTML = '<div class="no-data">Hiç takım bulunamadı.</div>';
            return;
        }

        teamsList.innerHTML = filteredTeams.map(team => `
            <div class="team-card" onclick="showTeamProfile('${team.name.replace(/'/g, "\\'")}')" style="cursor:pointer">
                <div class="team-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-sm btn-secondary" onclick="editTeam(${team.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTeam(${team.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <h4>${team.name}</h4>
                <div class="league">${team.league}</div>
                <div class="country">${team.country}</div>
                <div class="rating">⭐ ${team.rating}</div>
            </div>
        `).join('');
    }

    showLeagueTable(leagueName, season) {
        const viewSeason = season !== undefined ? season : this.currentSeason;

        document.querySelectorAll('.league-tab').forEach(tab => tab.classList.remove('active'));
        const tabEl = document.querySelector(`[data-league="${leagueName}"]`);
        if (tabEl) tabEl.classList.add('active');

        const leagueTeams = this.teams.filter(team => team.league === leagueName);
        const leagueMatches = this.getLeagueMatches(leagueName, viewSeason);
        const standings = this.calculateStandings(leagueTeams, leagueMatches);
        const leagueRanking = this.getLeagueRanking(leagueName);
        const europeanSpots = this.getEuropeanSpots(leagueRanking);
        const availableSeasons = this.getAvailableSeasons();

        // Build week data
        const byWeekAll = {};
        leagueMatches.forEach(m => { const w = m.week || 1; if (!byWeekAll[w]) byWeekAll[w] = []; byWeekAll[w].push(m); });
        const allWeeks = Object.keys(byWeekAll).map(Number).sort((a,b)=>a-b);
        const lastPlayedWeek = allWeeks.length > 0 ? allWeeks[allWeeks.length - 1] : null;

        const standingsRows = standings.map((team, index) => {
            const position = index + 1;
            let rowClass = this.getPositionClass(position, leagueName, europeanSpots);
            return `<tr class="${rowClass}" onclick="showTeamProfile('${team.name.replace(/'/g, "\\'")}')" style="cursor:pointer">
                <td>${position}</td>
                <td><strong>${team.name}</strong></td>
                <td>${team.played}</td>
                <td>${team.won}</td>
                <td>${team.drawn}</td>
                <td>${team.lost}</td>
                <td>${team.goalsFor}</td>
                <td>${team.goalsAgainst}</td>
                <td>${team.goalsFor - team.goalsAgainst}</td>
                <td><strong>${team.points}</strong></td>
            </tr>`;
        }).join('');

        const weekBtns = allWeeks.map(w => `<button class="week-btn ${w === lastPlayedWeek ? 'active' : ''}" onclick="window.footballSim.showWeekFixtures(${w}, this)">${w}. Hafta</button>`).join('');

        const tableContainer = document.getElementById('league-table');
        tableContainer.innerHTML = `
            <h3>${leagueName} - ${viewSeason}</h3>
            <div class="section-controls league-table-controls">
                <label>Sezon:</label>
                <select id="league-season-select" onchange="onLeagueSeasonChange('${leagueName}')">
                    ${availableSeasons.map(s => `<option value="${s}" ${s === viewSeason ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
                ${viewSeason === this.currentSeason ? `
                <button class="btn btn-warning" onclick="deleteLeagueSeason('${leagueName}')">
                    <i class="fas fa-trash"></i> Bu Ligin Sezonunu Sil
                </button>
                ` : ''}
            </div>
            <div class="league-content-layout">
                <div class="league-table-col">
                    <div class="table-responsive">
                        <table class="league-table">
                            <thead>
                                <tr>
                                    <th>Pos</th><th>Takım</th><th>O</th><th>G</th><th>B</th><th>M</th><th>A</th><th>Y</th><th>AV</th><th>P</th>
                                </tr>
                            </thead>
                            <tbody>${standingsRows}</tbody>
                        </table>
                        <div class="legend">
                            <div class="legend-item champion">Şampiyon (UCL)</div>
                            <div class="legend-item uel-champion">Şampiyon (UEL)</div>
                            <div class="legend-item ucl-qualification">Şampiyonlar Ligi</div>
                            <div class="legend-item uel-qualification">Avrupa Ligi</div>
                            <div class="legend-item uecl-qualification">Konferans Ligi</div>
                            ${leagueName === 'Bundesliga' ? '<div class="legend-item playoff-zone">Playoff</div>' : ''}
                            <div class="legend-item relegation-zone">Küme Düşme</div>
                        </div>
                    </div>
                </div>
                <div class="league-fixtures-col">
                    <h4>📅 Haftalık Maç Sonuçları</h4>
                    <div class="fixtures-week-selector">
                        ${weekBtns || '<span style="color:#888;font-size:.85rem">Henüz maç oynanmadı</span>'}
                    </div>
                    <div id="week-fixtures-display">
                        ${lastPlayedWeek ? this.renderWeekFixtures(byWeekAll, lastPlayedWeek) : '<p class="no-data">Henüz maç oynanmadı.</p>'}
                    </div>
                </div>
            </div>
        `;
        // Store byWeek data for week switching
        this._currentLeagueByWeek = byWeekAll;
    }
    renderWeekFixtures(byWeek, week) {
        const matches = byWeek[week] || [];
        if (matches.length === 0) return '<p class="no-data">Bu haftaya ait maç yok.</p>';
        return `<div class="week-results-block">
            <div class="week-results-header"><strong>${week}. Hafta</strong></div>
            <ul class="week-results-list">
                ${matches.map(m => {
                    const matchId = m.id || '';
                    const clickFn = matchId ? `onclick="window.footballSim.showMatchDetailsEnhanced('${matchId}')" style="cursor:pointer"` : '';
                    return `<li class="wrf-row ${matchId ? 'wrf-clickable' : ''}" ${clickFn}>
                        <span class="wrf-home">${m.homeTeam}</span>
                        <span class="wrf-score">${m.homeGoals} - ${m.awayGoals}</span>
                        <span class="wrf-away">${m.awayTeam}</span>
                        ${matchId ? '<span class="wrf-detail-hint">📋</span>' : ''}
                    </li>`;
                }).join('')}
            </ul>
        </div>`;
    }

    showWeekFixtures(week, btnEl) {
        const byWeek = this._currentLeagueByWeek || {};
        const display = document.getElementById('week-fixtures-display');
        if (display) display.innerHTML = this.renderWeekFixtures(byWeek, week);
        // Update active button
        if (btnEl) {
            btnEl.closest('.fixtures-week-selector').querySelectorAll('.week-btn').forEach(b => b.classList.remove('active'));
            btnEl.classList.add('active');
        }
    }

    getPositionClass(position, leagueName, europeanSpots) {
        const teamCount = this.leagues[leagueName].teams;
        
        if (position === 1) {
            // Check if champion goes to UEL (dark orange) or UCL (dark blue)
            if (europeanSpots.ucl > 0) {
                return 'champion'; // UCL - dark blue
            } else {
                return 'uel-champion'; // UEL - dark orange
            }
        } else if (position <= europeanSpots.ucl) {
            return 'ucl-qualification';
        } else if (position <= europeanSpots.ucl + europeanSpots.uel) {
            return 'uel-qualification';
        } else if (position <= europeanSpots.ucl + europeanSpots.uel + europeanSpots.uecl) {
            return 'uecl-qualification';
        } else if (leagueName === 'Bundesliga' && position === teamCount - 2) {
            return 'playoff-zone'; // Bundesliga playoff zone
        } else if (this.isRelegationZone(position, leagueName)) {
            return 'relegation-zone';
        }
        return 'safe-zone';
    }
    
    isRelegationZone(position, leagueName) {
        const teamCount = this.leagues[leagueName].teams;
        
        if (leagueName === 'Bundesliga') {
            return position > teamCount - 2; // Last 2 teams relegated
        } else if (teamCount === 8) {
            return position > teamCount - 1; // Last 1 team relegated in 8-team leagues
        } else {
            return position > teamCount - 3; // Last 3 teams relegated in 18/20-team leagues
        }
    }
    
    getCountryRanking(country) {
        const idx = this.coefficientRanking.findIndex(r => r.country === country);
        return idx >= 0 ? idx + 1 : 25;
    }
    
    getLeagueRanking(leagueName) {
        const country = this.leagueToCountry[leagueName] || this.leagues[leagueName]?.country;
        if (!country) return 25;
        const idx = this.coefficientRanking.findIndex(r => r.country === country);
        return idx >= 0 ? idx + 1 : 25;
    }
    
    getEuropeanSpots(countryRanking) {
        return {
            ucl: this.europeanAllocation.UCL[countryRanking] || 0,
            uel: this.europeanAllocation.UEL[countryRanking] || 0,
            uecl: this.europeanAllocation.UECL[countryRanking] || 0
        };
    }

    calculateStandings(teams, matches) {
        const standings = teams.map(team => ({
            name: team.name,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0
        }));

        matches.forEach(match => {
            const homeTeam = standings.find(t => t.name === match.homeTeam);
            const awayTeam = standings.find(t => t.name === match.awayTeam);

            if (homeTeam && awayTeam) {
                homeTeam.played++;
                awayTeam.played++;
                
                homeTeam.goalsFor += match.homeGoals;
                homeTeam.goalsAgainst += match.awayGoals;
                awayTeam.goalsFor += match.awayGoals;
                awayTeam.goalsAgainst += match.homeGoals;

                if (match.result === 'H') {
                    homeTeam.won++;
                    homeTeam.points += 3;
                    awayTeam.lost++;
                } else if (match.result === 'A') {
                    awayTeam.won++;
                    awayTeam.points += 3;
                    homeTeam.lost++;
                } else {
                    homeTeam.drawn++;
                    awayTeam.drawn++;
                    homeTeam.points += 1;
                    awayTeam.points += 1;
                }
            }
        });

        // Sort by points, then goal difference, then goals for
        return standings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if ((b.goalsFor - b.goalsAgainst) !== (a.goalsFor - a.goalsAgainst)) {
                return (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
            }
            return b.goalsFor - a.goalsFor;
        });
    }

    renderSeasonProgress() {
        const progressContainer = document.getElementById('season-progress-bars');
        
        const progressHTML = Object.keys(this.leagues).map(leagueName => {
            const totalMatches = this.leagues[leagueName].matches * this.leagues[leagueName].teams / 2;
            const playedMatches = this.getLeagueMatches(leagueName).length;
            const progress = (playedMatches / totalMatches) * 100;

            return `
                <div class="league-progress">
                    <h4>${leagueName}</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                        <div class="progress-label">${playedMatches}/${totalMatches}</div>
                    </div>
                </div>
            `;
        }).join('');

        progressContainer.innerHTML = progressHTML;
    }

    renderRecentMatches() {
        const matchesContainer = document.getElementById('recent-matches');
        const recentMatches = this.matches
            .filter(m => m.season === this.currentSeason)
            .slice(-12)
            .reverse();

        if (recentMatches.length === 0) {
            matchesContainer.innerHTML = '<div class="no-data">Henüz maç sonucu yok.</div>';
            return;
        }

        matchesContainer.innerHTML = recentMatches.map(match => `
            <div class="match-card ${match.id ? 'match-card-clickable' : ''}" ${match.id ? `onclick="window.footballSim.showMatchDetailsEnhanced('${match.id}')"` : ''}>
                <div class="match-header">${match.league} - Hafta ${match.week || 1}</div>
                <div class="match-teams">
                    <div class="team">
                        <div class="team-name">${match.homeTeam}</div>
                    </div>
                    <div class="match-score">${match.homeGoals} - ${match.awayGoals}</div>
                    <div class="team">
                        <div class="team-name">${match.awayTeam}</div>
                    </div>
                </div>
                ${match.id ? '<div class="match-card-hint">Detaylar için tıkla</div>' : ''}
            </div>
        `).join('');
    }

    getEuropeanParticipants2028_29() {
        const participants = { UCL: [], UEL: [], UECL: [] };
        Object.keys(this.leagues).forEach(leagueName => {
            const rank = this.getLeagueRanking(leagueName);
            const spots = this.getEuropeanSpots(rank);
            const leagueTeams = this.teams.filter(t => t.league === leagueName);
            const matches = this.getLeagueMatches(leagueName);
            const standings = this.calculateStandings(leagueTeams, matches);
            let sorted = standings.sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
            if (matches.length === 0) sorted = standings.sort((a, b) => (this.teams.find(t => t.name === b.name)?.rating || 0) - (this.teams.find(t => t.name === a.name)?.rating || 0));
            let idx = 0;
            for (let i = 0; i < (spots.ucl || 0) && idx < sorted.length; i++) participants.UCL.push({ team: sorted[idx++].name, league: leagueName });
            for (let i = 0; i < (spots.uel || 0) && idx < sorted.length; i++) participants.UEL.push({ team: sorted[idx++].name, league: leagueName });
            for (let i = 0; i < (spots.uecl || 0) && idx < sorted.length; i++) participants.UECL.push({ team: sorted[idx++].name, league: leagueName });
        });
        return participants;
    }

    showEuropeanCompetition(competition) {
        document.querySelectorAll('.european-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-competition="${competition}"]`)?.classList.add('active');

        const content = document.getElementById('european-content');
        const compKey = competition.toUpperCase();
        const comp = competition.toLowerCase();
        let part = this.europeanSeason2028_29[compKey];
        if (!part || part.length === 0) part = this.getEuropeanParticipants2028_29()[compKey];
        const state = this.getEuropeanPlayableState(compKey);
        const partList = (part || []).slice(0, 36);
        const has36 = partList.length >= 36;

        let html = `
            <div class="european-competition-content">
                <h3>${this.europeanCompetitions[compKey].name} 2028-29</h3>
                <div class="qualification-info">
                    <h4>Katılımcılar (36 Takım)</h4>
                    <button class="btn btn-primary mb-3" onclick="window.footballSim.setEuropeanParticipants2028_29(); window.footballSim.showEuropeanCompetition('${comp}');">
                        <i class="fas fa-sync"></i> Katılımcıları Güncelle
                    </button>
                    <div class="european-participants-grid">
                        ${partList.map(p => `
                            <div class="participant-item">
                                <div class="team-name">${this._getTeamName(p)}</div>
                                ${p && typeof p === 'object' && p.league ? `<div class="team-league">${p.league}</div>` : ''}
                            </div>
                        `).join('')}
                        ${partList.length < 36 ? Array(36 - partList.length).fill('<div class="participant-item" style="opacity: 0.3; border-style: dashed;">-</div>').join('') : ''}
                    </div>
                    ${(!part || part.length === 0) ? '<p class="no-data">Önce Katılımcıları Güncelle ile lig sıralamasına göre atanır.</p>' : ''}
                </div>
        `;

        if (state.phase === 'none') {
            if (has36) {
                const swapSelected = this._potSwapSelected ? this._potSwapSelected[comp] : null;
                html += `
                    <div class="european-pots-container">
                        <h4>Torbalara Ayırma</h4>
                        ${swapSelected ? `
                            <div class="pot-swap-hint active">
                                ✅ <strong>${swapSelected.team}</strong> seçildi (Torba ${swapSelected.pot}) — Yer değiştirmek istediğin takıma tıkla
                                <button class="btn-cancel-swap" onclick="window.footballSim.cancelPotSwap('${comp}')">✕ İptal</button>
                            </div>
                        ` : `
                            <div class="pot-swap-hint">
                                💡 Yer değiştirmek için önce bir takıma, ardından diğerine tıkla
                            </div>
                        `}
                        <div class="pots-controls">
                            <button class="btn btn-success mb-3" onclick="window.footballSim.startEuropeanGroupStage('${comp}');">
                                <i class="fas fa-play"></i> Grup Aşaması Başlat
                            </button>
                            <button class="btn btn-primary mb-3" onclick="window.footballSim.shufflePots('${comp}');">
                                <i class="fas fa-random"></i> Torbaları Karıştır
                            </button>
                        </div>
                        <div class="pots-grid">
                            ${[1, 2, 3, 4].map(potNum => {
                                const potTeams = partList.slice((potNum - 1) * 9, potNum * 9);
                                return `
                                    <div class="pot-section pot-${potNum}" data-pot="${potNum}">
                                        <div class="pot-header">
                                            Torba ${potNum}
                                            <span class="pot-count">(${potTeams.length}/9)</span>
                                        </div>
                                        <div class="pot-teams" id="pot-${potNum}-teams">
                                            ${potTeams.map(p => {
                                                const teamName = this._getTeamName(p);
                                                const isSelected = swapSelected && swapSelected.team === teamName;
                                                const isTarget = swapSelected && !isSelected;
                                                return `
                                                    <div class="pot-team ${isSelected ? 'pot-team-selected' : ''} ${isTarget ? 'pot-team-target' : ''}"
                                                         onclick="window.footballSim.handlePotTeamClick('${teamName.replace(/'/g, "\\'")}', ${potNum}, '${comp}')">
                                                        <span class="pot-team-name">${teamName}</span>
                                                        ${isSelected ? '<span class="pot-team-badge">✓</span>' : ''}
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }
        }

        if (state.phase === 'group') {
            const standings = this.getEuropeanGroupStandings(compKey);
            const totalPlayed = state.groupMatches.filter(m => m.homeGoals != null).length;
            const totalMatches = state.groupMatches.length;
            const allPlayed = totalPlayed >= totalMatches;
            const maxMatchday = totalMatches > 0
                ? Math.max(...state.groupMatches.map(m => m.matchday || 0), 8)
                : 8;

            html += `<div class="european-match-container">`;

            // Sol: Maç günleri
            html += `
                <div class="european-matches-section">
                    <h4>📅 Lig Fazı Maçları</h4>
                    <div class="match-progress-info">
                        <p>${totalPlayed}/${totalMatches} maç oynandı</p>
                        <div class="draw-progress">
                            <div class="draw-progress-fill" style="width:${totalMatches ? Math.round(totalPlayed/totalMatches*100) : 0}%"></div>
                        </div>
                    </div>
            `;

            for (let md = 1; md <= maxMatchday; md++) {
                const dayMatches = state.groupMatches.filter(m => m.matchday === md);
                if (dayMatches.length === 0) continue;
                const dayPlayed = dayMatches.filter(m => m.homeGoals != null).length;
                const dayDone = dayPlayed === dayMatches.length;

                html += `
                    <div class="european-matchday-block">
                        <div class="matchday-header">
                            <span class="matchday-title">${md}. Maç Günü</span>
                            <span class="matchday-progress">${dayPlayed}/${dayMatches.length}</span>
                            ${!dayDone ? `<button class="btn btn-xs btn-primary" onclick="window.footballSim.simulateEuropeanMatchday('${comp}',${md})">Tümünü Simüle Et</button>` : '<span class="matchday-done">✓</span>'}
                        </div>
                        <ul class="european-fixtures-list">
                            ${dayMatches.map(m => {
                                const scored = m.homeGoals != null;
                                const score = scored
                                    ? `<span class="european-match-score">${m.homeGoals}-${m.awayGoals}</span>`
                                    : `<span class="european-match-score unplayed">vs</span>`;
                                const btn = !scored
                                    ? `<button class="btn btn-xs btn-success" onclick="window.footballSim.simulateEuropeanGroupMatch('${comp}','${m.homeTeam.replace(/'/g,"\\'")}','${m.awayTeam.replace(/'/g,"\\'")}',${md})">▶</button>`
                                    : '';
                                return `
                                    <li class="${scored ? 'played' : ''}">
                                        <span class="match-team home">${m.homeTeam}</span>
                                        ${score}
                                        <span class="match-team away">${m.awayTeam}</span>
                                        ${btn}
                                    </li>`;
                            }).join('')}
                        </ul>
                    </div>`;
            }

            html += `</div>`; // european-matches-section

            // Sağ: Puan durumu
            html += `
                <div class="european-live-standings">
                    <h4>📊 Puan Durumu</h4>
                    <div class="european-standings-table-wrap">
                        <table class="european-standings-table">
                            <thead><tr><th>#</th><th>Takım</th><th>O</th><th>G</th><th>B</th><th>M</th><th>A</th><th>P</th></tr></thead>
                            <tbody>
                                ${standings.map((s, i) => {
                                    const pos = i + 1;
                                    let cls = '';
                                    if (pos <= 8)       cls = 'standing-position-1-8';
                                    else if (pos <= 16) cls = 'standing-position-9-16';
                                    else if (pos <= 24) cls = 'standing-position-17-24';
                                    else                cls = 'standing-position-25-36';
                                    return `<tr class="${cls}">
                                        <td><strong>${pos}</strong></td>
                                        <td>${s.name}</td>
                                        <td>${s.played}</td><td>${s.won}</td><td>${s.drawn}</td><td>${s.lost}</td>
                                        <td>${s.goalsFor}-${s.goalsAgainst}</td>
                                        <td><strong>${s.points}</strong></td>
                                    </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="standings-legend">
                        <span class="legend-item standing-position-1-8">1-8: Direkt Son 16</span>
                        <span class="legend-item standing-position-9-16">9-16: Playoff</span>
                        <span class="legend-item standing-position-17-24">17-24: Playoff (Eleme)</span>
                        <span class="legend-item standing-position-25-36">25-36: Elendi</span>
                    </div>
                </div>
            </div>`; // european-live-standings + european-match-container

            if (allPlayed) {
                html += `<div style="text-align:center;margin-top:1rem;">
                    <button class="btn btn-success" onclick="window.footballSim.openPlayoffDraw('${comp}');">
                        <i class="fas fa-random"></i> Playoff Kura Çekimi
                    </button></div>`;
            } else {
                html += `<div style="text-align:center;margin-top:1rem;">
                    <button class="btn btn-warning" onclick="window.footballSim.simulateAllEuropeanMatchdays('${comp}')">
                        <i class="fas fa-forward"></i> Tüm Sezonu Simüle Et
                    </button>
                    <p style="color:#666;margin-top:.5rem;font-size:.85rem;">Playoff için tüm maçların bitmesi gerekiyor (${totalPlayed}/${totalMatches})</p>
                </div>`;
            }
        }

        if (state.phase === 'playoff_draw') {
            const st = state.standingsOrder || [];
            // 4 havuz: her havuzda 2 üst + 2 alt takım → havuzdan 2 eşleşme çıkar
            const poolDefs = [
                { label: 'Havuz A (9-10 vs 23-24)', highRange: '9-10', lowRange: '23-24',
                  high: [st[8], st[9]].filter(Boolean), low: [st[22], st[23]].filter(Boolean) },
                { label: 'Havuz B (11-12 vs 21-22)', highRange: '11-12', lowRange: '21-22',
                  high: [st[10], st[11]].filter(Boolean), low: [st[20], st[21]].filter(Boolean) },
                { label: 'Havuz C (13-14 vs 19-20)', highRange: '13-14', lowRange: '19-20',
                  high: [st[12], st[13]].filter(Boolean), low: [st[18], st[19]].filter(Boolean) },
                { label: 'Havuz D (15-16 vs 17-18)', highRange: '15-16', lowRange: '17-18',
                  high: [st[14], st[15]].filter(Boolean), low: [st[16], st[17]].filter(Boolean) },
            ].filter(g => g.high.length > 0 && g.low.length > 0);

            const drawn = new Set(state.playoffPairs.flatMap(p => [p.team1, p.team2]));
            const temp    = state._playoffTemp || {};
            const selHigh = temp.selHigh || null;
            const selLow  = temp.selLow  || null;
            const hidHigh = temp.hidHigh || null;
            const hidLow  = temp.hidLow  || null;
            const getTeamLeague = (n) => this.teams.find(t => t.name === n)?.league || '';
            const totalPairs = state.playoffPairs.length;
            const activePoolIdx = Math.floor(totalPairs / 2);
            const activePool = activePoolIdx < poolDefs.length ? poolDefs[activePoolIdx] : null;

            const renderBall = (team, side, selH, selL, hidH, hidL, gtl) => {
                const revealed  = side === 'high' ? selH : selL;
                const hidden    = side === 'high' ? hidH : hidL;
                const otherRev  = side === 'high' ? selL : selH;
                const thisLig   = gtl(team);
                const safeTeam  = team.replace(/'/g, "\\'");
                if (drawn.has(team)) {
                    return `<div class="lottery-ball ball-disabled"><span class="ball-icon">✅</span><span class="ball-hint" style="font-size:0.65rem">Eşleşti</span></div>`;
                }
                if (hidden === team) {
                    return `<div class="lottery-ball ball-hidden" onclick="window.footballSim._poReveal('${side}')">
                        <span class="ball-icon">⚽</span><span class="ball-hint">Tıkla &amp; Aç</span>
                    </div>`;
                }
                if (revealed === team) {
                    const cls = otherRev ? 'ball-confirmed' : 'ball-revealed';
                    return `<div class="lottery-ball ${cls}">
                        <span class="ball-name">${team}</span><span class="ball-league">${thisLig}</span>
                    </div>`;
                }
                return `<div class="lottery-ball ball-available" onclick="window.footballSim._poSelect('${safeTeam}','${side}')">
                    <span class="ball-icon">⚽</span><span class="ball-hint">Seç</span>
                </div>`;
            };

            html += `<div class="draw-ceremony">
                <h4>🎯 Playoff Kura Çekimi</h4>
                <p>Her havuzdan sol (üst sıra) ve sağ (alt sıra) taraftan birer top seç. Önce tıkla seç (gizli), sonra tekrar tıkla aç. 2 eşleşme dolunca sonraki havuz açılır.</p>
                <div class="draw-progress"><div class="draw-progress-fill" style="width:${totalPairs/8*100}%"></div></div>

                <div class="draw-pairs-container">
                    ${state.playoffPairs.map(pair => `
                        <div class="draw-pair completed">
                            <div class="draw-pair-teams">${pair.team1} <span class="vs">vs</span> ${pair.team2}</div>
                            <div class="draw-pair-league">${getTeamLeague(pair.team1)} — ${getTeamLeague(pair.team2)}</div>
                        </div>`).join('')}
                    ${totalPairs < 8 ? Array(8 - totalPairs).fill(0).map((_,idx) => `
                        <div class="draw-pair pending">
                            <div class="draw-pair-teams"><span>Eşleşme ${totalPairs + idx + 1} bekleniyor</span></div>
                        </div>`).join('') : ''}
                </div>`;

            if (activePool) {
                const highTeams = activePool.high;
                const lowTeams  = activePool.low;
                const pairsInPool = totalPairs % 2;
                const statusMsg = (selHigh && selLow)
                    ? `<div class="draw-status success">✅ Eşleşme hazır: <strong>${selHigh}</strong> <span class="vs">vs</span> <strong>${selLow}</strong>
                        <button class="btn btn-success btn-sm" onclick="window.footballSim._poConfirm()" style="margin-left:.5rem">Onayla</button>
                        <button class="btn btn-secondary btn-sm" onclick="window.footballSim._poReset()" style="margin-left:.25rem">İptal</button>
                       </div>`
                    : (hidHigh || hidLow)
                    ? `<div class="draw-status warning">⚠️ Seçilen topa tıklayarak açın</div>`
                    : `<div class="draw-status">🎯 Sol taraftan 1 top seç (${activePool.highRange}. sıra), ardından sağ taraftan 1 top seç (${activePool.lowRange}. sıra)</div>`;

                html += `<div class="draw-selection-area">
                    <h5>${activePool.label} — ${pairsInPool === 0 ? '1. Eşleşme' : '2. Eşleşme'}</h5>
                    ${statusMsg}
                    <div class="balls-arena">
                        <div class="balls-bowl">
                            <div class="bowl-label">🥇 Üst Sıra (${activePool.highRange})</div>
                            <div class="balls-row">
                                ${highTeams.map(t => renderBall(t,'high',selHigh,selLow,hidHigh,hidLow,getTeamLeague)).join('')}
                            </div>
                        </div>
                        <div class="balls-vs">VS</div>
                        <div class="balls-bowl">
                            <div class="bowl-label">🎯 Alt Sıra (${activePool.lowRange})</div>
                            <div class="balls-row">
                                ${lowTeams.map(t => renderBall(t,'low',selHigh,selLow,hidHigh,hidLow,getTeamLeague)).join('')}
                            </div>
                        </div>
                    </div>
                    ${(selHigh||selLow||hidHigh||hidLow)?`<div style="text-align:center;margin-top:.5rem"><button class="btn btn-secondary btn-sm" onclick="window.footballSim._poReset()">Seçimi Sıfırla</button></div>`:''}                </div>`;
            } else {
                html += `<div class="draw-status success" style="margin-top:1rem">🏆 Tüm eşleşmeler tamamlandı!
                    <button class="btn btn-success" onclick="window.footballSim.finishPlayoffDraw('${comp}')" style="margin-left:.5rem">Playoff Turu Başlat</button>
                </div>`;
            }
            html += `</div>`;
        }
        if (state.phase === 'playoff') {
            html += `<h4>⚔️ Playoff Turu (8 Eşleşme, 2 Maçlı)</h4>
            <div class="playoff-ties-container">`;
            (state.playoffResults || []).forEach((pair, i) => {
                const l1 = pair.leg1Home != null ? `${pair.leg1Home}-${pair.leg1Away}` : '-';
                const l2 = pair.leg2Home != null ? `${pair.leg2Home}-${pair.leg2Away}` : '-';
                const leg1Btn = pair.leg1Home == null
                    ? `<button class="btn btn-sm btn-primary" onclick="window.footballSim.simulatePlayoffLeg('${comp}', ${i}, 1);">▶ 1. Maç</button>`
                    : '';
                const leg2Btn = pair.leg2Home == null && pair.leg1Home != null
                    ? `<button class="btn btn-sm btn-primary" onclick="window.footballSim.simulatePlayoffLeg('${comp}', ${i}, 2);">▶ 2. Maç</button>`
                    : (pair.leg2Home == null ? `<button class="btn btn-sm btn-secondary" disabled title="Önce 1. maçı oynayın">▶ 2. Maç</button>` : '');
                let totalInfo = '';
                if (pair.leg1Home != null && pair.leg2Home != null) {
                    const total1 = pair.leg1Home + pair.leg2Away;
                    const total2 = pair.leg1Away + pair.leg2Home;
                    if (total1 > total2) {
                        totalInfo = `<div class="playoff-total">Toplam: ${pair.team1} <strong>${total1}</strong> - <strong>${total2}</strong> ${pair.team2} 🏆 <strong>${pair.team1}</strong></div>`;
                    } else if (total2 > total1) {
                        totalInfo = `<div class="playoff-total">Toplam: ${pair.team1} <strong>${total1}</strong> - <strong>${total2}</strong> ${pair.team2} 🏆 <strong>${pair.team2}</strong></div>`;
                    } else if (pair.penaltyWinner) {
                        totalInfo = `<div class="playoff-total">Toplam: ${pair.team1} <strong>${total1}</strong> - <strong>${total2}</strong> ${pair.team2} — Penaltılar: ${pair.team1} <strong>${pair.pen1||0}</strong> - <strong>${pair.pen2||0}</strong> ${pair.team2} 🏆 <strong>${pair.penaltyWinner}</strong></div>`;
                    } else if (pair.penaltyInProgress) {
                        const shots1 = pair.penaltyShots1 || [];
                        const shots2 = pair.penaltyShots2 || [];
                        const penHtml = `<div class="penalty-shootout">
                            <strong>🥅 Penaltı Atışları</strong>
                            <div class="penalty-grid">
                                <div class="penalty-team"><span class="pen-team-name">${pair.team1}</span><div class="pen-shots">${shots1.map(x=>x?'✅':'❌').join(' ')}</div><span class="pen-score">${shots1.filter(Boolean).length}</span></div>
                                <div class="penalty-team"><span class="pen-team-name">${pair.team2}</span><div class="pen-shots">${shots2.map(x=>x?'✅':'❌').join(' ')}</div><span class="pen-score">${shots2.filter(Boolean).length}</span></div>
                            </div>
                            <button class="btn btn-sm btn-danger" onclick="window.footballSim.shootPenaltyPlayoff('${comp}', ${i})">🥅 Penaltı At</button>
                        </div>`;
                        totalInfo = `<div class="playoff-total">Toplam: ${pair.team1} <strong>${total1}</strong> - <strong>${total2}</strong> ${pair.team2} — <strong>Penaltılara gidiliyor!</strong></div>${penHtml}`;
                    } else {
                        totalInfo = `<div class="playoff-total">Toplam: ${pair.team1} <strong>${total1}</strong> - <strong>${total2}</strong> ${pair.team2} — <strong>Beraberlik!</strong>
                            <button class="btn btn-sm btn-danger" onclick="window.footballSim.startPenaltyPlayoff('${comp}', ${i})">🥅 Penaltılara Git</button></div>`;
                    }
                }
                html += `<div class="playoff-tie">
                    <div class="playoff-tie-header"><strong>E${i+1}:</strong> ${pair.team1} vs ${pair.team2}</div>
                    <div class="playoff-legs">
                        <span class="leg-label">1. Maç (Ev: ${pair.team1}):</span> <span class="leg-score">${l1}</span> ${leg1Btn}
                        &nbsp;
                        <span class="leg-label">2. Maç (Ev: ${pair.team2}):</span> <span class="leg-score">${l2}</span> ${leg2Btn}
                    </div>
                    ${totalInfo}
                </div>`;
            });
            html += `</div>`;
            const allPlayoffDone = (state.playoffResults || []).every(p => {
                if (p.leg1Home == null || p.leg2Home == null) return false;
                const t1 = (p.leg1Home||0) + (p.leg2Away||0);
                const t2 = (p.leg1Away||0) + (p.leg2Home||0);
                return t1 !== t2 || p.penaltyWinner != null;
            });
            if (allPlayoffDone) {
                html += `<div style="text-align:center;margin-top:1rem"><button class="btn btn-success" onclick="window.footballSim.openR16Draw('${comp}');"><i class="fas fa-random"></i> Son 16 Kura Çekimi</button></div>`;
            } else {
                html += `<div style="text-align:center;margin-top:1rem"><button class="btn btn-warning" onclick="window.footballSim.simulateAllPlayoffLegs('${comp}')"><i class="fas fa-forward"></i> Tüm Playoff Maçlarını Simüle Et</button></div>`;
            }
        }

        if (state.phase === 'r16_draw') {
            const seeded   = (state.r16Seeded   || []).filter(Boolean);
            const unseeded = (state.r16Unseeded  || []).filter(Boolean);
            const usedS    = new Set(state.r16Pairs.map(p => p.team1));
            const usedU    = new Set(state.r16Pairs.map(p => p.team2));
            const getTeamLeague = (n) => this.teams.find(t => t.name === n)?.league || '';
            const r16temp  = (state._r16Temp && state._r16Temp[comp]) || {};
            const selS     = r16temp.selS  || null;  // seri başı revealed
            const selU     = r16temp.selU  || null;  // unseeded revealed
            const hidS     = r16temp.hidS  || null;  // seri başı hidden-selected
            const hidU     = r16temp.hidU  || null;  // unseeded hidden-selected

            const renderR16Ball = (team, side) => {
                const isS       = side === 's';
                const revealed  = isS ? selS : selU;
                const hidden    = isS ? hidS : hidU;
                const otherRev  = isS ? selU : selS;
                const thisLig   = getTeamLeague(team);
                const otherLig  = otherRev ? getTeamLeague(otherRev) : null;
                const sameLeague = otherLig && otherLig === thisLig && otherLig !== '';
                const safeTeam  = team.replace(/'/g, "\\'");

                if (hidden === team) {
                    return `<div class="lottery-ball ball-hidden" onclick="window.footballSim._r16Reveal('${side}','${comp}')">
                        <span class="ball-icon">⚽</span><span class="ball-hint">Tıkla &amp; Aç</span>
                    </div>`;
                }
                if (revealed === team) {
                    const cls = otherRev ? 'ball-confirmed' : 'ball-revealed';
                    return `<div class="lottery-ball ${cls}">
                        <span class="ball-name">${team}</span><span class="ball-league">${thisLig}</span>
                    </div>`;
                }
                if (sameLeague) {
                    return `<div class="lottery-ball ball-disabled" title="Aynı lig: ${thisLig}">
                        <span class="ball-icon">⚽</span><span class="ball-hint" style="color:#f87171;font-size:0.65rem">Aynı lig</span>
                    </div>`;
                }
                return `<div class="lottery-ball ball-available" onclick="window.footballSim._r16BallSelect('${safeTeam}','${side}','${comp}')">
                    <span class="ball-icon">⚽</span><span class="ball-hint">Seç</span>
                </div>`;
            };

            const availableS = seeded.filter(t => !usedS.has(t));
            const availableU = unseeded.filter(t => !usedU.has(t));

            const statusMsg = (selS && selU)
                ? `<div class="draw-status success">✅ Eşleşme hazır: <strong>${selS}</strong> <span class="vs">vs</span> <strong>${selU}</strong>
                    <button class="btn btn-success btn-sm" onclick="window.footballSim._r16BallConfirm('${comp}')" style="margin-left:.5rem">Onayla</button>
                    <button class="btn btn-secondary btn-sm" onclick="window.footballSim._r16BallReset('${comp}')" style="margin-left:.25rem">İptal</button>
                   </div>`
                : (hidS || hidU)
                ? `<div class="draw-status warning">⚠️ Seçilen topa tıklayarak açın</div>`
                : `<div class="draw-status">🎯 Sol (seri başı) veya sağ (playoff kazananı) taraftan bir topa tıkla</div>`;

            html += `<div class="draw-ceremony">
                <h4>🏆 Son 16 Kura Çekimi</h4>
                <p>Seri başları (1-8) sol, playoff kazananları sağ. Topa tıkla aç, soldan 1 + sağdan 1 eşleşir. Aynı ligden takımlar eşleşemez.</p>
                <div class="draw-progress"><div class="draw-progress-fill" style="width:${state.r16Pairs.length/8*100}%"></div></div>

                <div class="draw-pairs-container">
                    ${state.r16Pairs.map(pair => `
                        <div class="draw-pair completed">
                            <div class="draw-pair-teams">${pair.team1} <span class="vs">vs</span> ${pair.team2}</div>
                            <div class="draw-pair-league">${getTeamLeague(pair.team1)} — ${getTeamLeague(pair.team2)}</div>
                        </div>`).join('')}
                    ${Array(8 - state.r16Pairs.length).fill(0).map((_,i) => `
                        <div class="draw-pair pending">
                            <div class="draw-pair-teams"><span>Eşleşme ${state.r16Pairs.length + i + 1} bekleniyor</span></div>
                        </div>`).join('')}
                </div>

                ${availableS.length > 0 ? `
                <div class="draw-selection-area">
                    <h5>Sıra ${state.r16Pairs.length + 1}. Eşleşme</h5>
                    ${statusMsg}
                    <div class="balls-arena">
                        <div class="balls-bowl">
                            <div class="bowl-label">🥇 Seri Başları (1-8)</div>
                            <div class="balls-row">
                                ${availableS.map(t => renderR16Ball(t,'s')).join('')}
                            </div>
                        </div>
                        <div class="balls-vs">VS</div>
                        <div class="balls-bowl">
                            <div class="bowl-label">🎯 Playoff Kazananları</div>
                            <div class="balls-row">
                                ${availableU.map(t => renderR16Ball(t,'u')).join('')}
                            </div>
                        </div>
                    </div>
                    ${(selS||selU||hidS||hidU)?`<div style="text-align:center;margin-top:.5rem"><button class="btn btn-secondary btn-sm" onclick="window.footballSim._r16BallReset('${comp}')">Seçimi Sıfırla</button></div>`:''}
                </div>` : `<div class="draw-status success" style="margin-top:1rem">🏆 Son 16 kura tamamlandı!
                    <button class="btn btn-success" onclick="window.footballSim.finishR16Draw('${comp}')" style="margin-left:.5rem">Son 16 Başlat</button>
                </div>`}
            </div>`;
        }


        if (state.phase === 'r16') {
            html += `<h4>🏆 Son 16 Turu (8 Eşleşme, 2 Maçlı)</h4>
            <div class="playoff-ties-container">`;
            const r16Results = state.knockoutResults.r16 || [];
            (state.r16Pairs || []).forEach((pair, i) => {
                const res = r16Results[i] || {};
                const l1 = res.leg1Home != null ? `${res.leg1Home}-${res.leg1Away}` : '-';
                const l2 = res.leg2Home != null ? `${res.leg2Home}-${res.leg2Away}` : '-';
                const leg1Btn = res.leg1Home == null
                    ? `<button class="btn btn-sm btn-primary" onclick="window.footballSim.simulateR16Leg('${comp}', ${i}, 1);">▶ 1. Maç</button>`
                    : '';
                const leg2Btn = res.leg2Home == null && res.leg1Home != null
                    ? `<button class="btn btn-sm btn-primary" onclick="window.footballSim.simulateR16Leg('${comp}', ${i}, 2);">▶ 2. Maç</button>`
                    : (res.leg2Home == null ? `<button class="btn btn-sm btn-secondary" disabled title="Önce 1. maçı oynayın">▶ 2. Maç</button>` : '');
                let totalInfo = '';
                if (res.leg1Home != null && res.leg2Home != null) {
                    const total1 = res.leg1Home + res.leg2Away;
                    const total2 = res.leg1Away + res.leg2Home;
                    if (total1 !== total2) {
                        const winner = total1 > total2 ? pair.team1 : pair.team2;
                        totalInfo = `<div class="playoff-total">Toplam: ${pair.team1} <strong>${total1}</strong> - <strong>${total2}</strong> ${pair.team2} 🏆 <strong>${winner}</strong></div>`;
                    } else if (res.penaltyWinner) {
                        totalInfo = `<div class="playoff-total">Toplam: ${pair.team1} <strong>${total1}</strong> - <strong>${total2}</strong> ${pair.team2} — Penaltılar: ${pair.team1} <strong>${res.pen1||0}</strong> - <strong>${res.pen2||0}</strong> ${pair.team2} 🏆 <strong>${res.penaltyWinner}</strong></div>`;
                    } else if (res.penaltyInProgress) {
                        const shots1 = res.penaltyShots1 || [];
                        const shots2 = res.penaltyShots2 || [];
                        const penHtml = `<div class="penalty-shootout">
                            <h6>⚽ Penaltı Atışları</h6>
                            <div class="penalty-grid">
                                <div class="penalty-team">
                                    <span class="pen-team-name">${pair.team1}</span>
                                    <div class="pen-shots">${shots1.map(s => s ? '✅' : '❌').join(' ')}</div>
                                    <span class="pen-score">${shots1.filter(s=>s).length}</span>
                                </div>
                                <div class="penalty-team">
                                    <span class="pen-team-name">${pair.team2}</span>
                                    <div class="pen-shots">${shots2.map(s => s ? '✅' : '❌').join(' ')}</div>
                                    <span class="pen-score">${shots2.filter(s=>s).length}</span>
                                </div>
                            </div>
                            <button class="btn btn-danger btn-sm mt-2" onclick="window.footballSim.shootPenaltyR16('${comp}', ${i})">⚽ Sonraki Atış</button>
                        </div>`;
                        totalInfo = `<div class="playoff-total">Toplam: ${pair.team1} <strong>${total1}</strong> - <strong>${total2}</strong> ${pair.team2} — <strong>Penaltılara gidiliyor!</strong></div>${penHtml}`;
                    } else {
                        totalInfo = `<div class="playoff-total">Toplam: ${pair.team1} <strong>${total1}</strong> - <strong>${total2}</strong> ${pair.team2} — <strong>Beraberlik!</strong>
                            <button class="btn btn-danger btn-sm" style="margin-left:.5rem" onclick="window.footballSim.startPenaltyShootoutR16('${comp}', ${i})">⚽ Penaltılara Başla</button>
                        </div>`;
                    }
                }
                html += `<div class="playoff-tie">
                    <div class="playoff-tie-header"><strong>E${i+1}:</strong> ${pair.team1} <em>(Seri Başı)</em> vs ${pair.team2}</div>
                    <div class="playoff-legs">
                        <span class="leg-label">1. Maç (Ev: ${pair.team1}):</span> <span class="leg-score">${l1}</span> ${leg1Btn}
                        &nbsp;
                        <span class="leg-label">2. Maç (Ev: ${pair.team2}):</span> <span class="leg-score">${l2}</span> ${leg2Btn}
                    </div>
                    ${totalInfo}
                </div>`;
            });
            html += `</div>`;
            const allR16Played = r16Results.length === 8 && r16Results.every(r => {
                if (r.leg1Home == null || r.leg2Home == null) return false;
                const t1 = (r.leg1Home||0) + (r.leg2Away||0);
                const t2 = (r.leg1Away||0) + (r.leg2Home||0);
                return t1 !== t2 || r.penaltyWinner != null;
            });
            if (allR16Played) {
                html += `<div style="text-align: center; margin-top: 1rem;">
                    <button class="btn btn-success" onclick="window.footballSim.startQFDirect('${comp}');">
                        <i class="fas fa-trophy"></i> Çeyrek Final Başlat
                    </button>
                </div>`;
            } else {
                html += `<div style="text-align:center;margin-top:1rem"><button class="btn btn-warning" onclick="window.footballSim.simulateAllR16Legs('${comp}')"><i class="fas fa-forward"></i> Tüm Son 16 Maçlarını Simüle Et</button></div>`;
            }
        }

        if (state.phase === 'qf' || state.phase === 'sf' || state.phase === 'final' || state.phase === 'done') {
            const renderKnockoutRound = (roundKey, roundLabel, pairs, results, nextFn, isFinal) => {
                if (!pairs || pairs.length === 0) return '';
                let rHtml = `<h4>⚔️ ${roundLabel}</h4><div class="playoff-ties-container">`;
                pairs.forEach((pair, i) => {
                    const res = (results && results[i]) || {};
                    const l1 = res.leg1Home != null ? `${res.leg1Home}-${res.leg1Away}` : '-';
                    const l2 = !isFinal ? (res.leg2Home != null ? `${res.leg2Home}-${res.leg2Away}` : '-') : null;
                    const leg1Btn = res.leg1Home == null
                        ? `<button class="btn btn-sm btn-primary" onclick="window.footballSim.simulateKOLeg('${comp}','${roundKey}',${i},1);">▶ 1. Maç</button>`
                        : '';
                    const leg2Btn = !isFinal ? (res.leg2Home == null && res.leg1Home != null
                        ? `<button class="btn btn-sm btn-primary" onclick="window.footballSim.simulateKOLeg('${comp}','${roundKey}',${i},2);">▶ 2. Maç</button>`
                        : (res.leg2Home == null ? `<button class="btn btn-sm btn-secondary" disabled>▶ 2. Maç</button>` : '')) : '';
                    let totalInfo = '';
                    const bothPlayed = isFinal ? res.leg1Home != null : (res.leg1Home != null && res.leg2Home != null);
                    if (bothPlayed) {
                        const total1 = isFinal ? res.leg1Home : (res.leg1Home + res.leg2Away);
                        const total2 = isFinal ? res.leg1Away : (res.leg1Away + res.leg2Home);
                        if (total1 !== total2) {
                            const winner = total1 > total2 ? pair.team1 : pair.team2;
                            totalInfo = `<div class="playoff-total">Toplam: ${pair.team1} <strong>${total1}</strong> - <strong>${total2}</strong> ${pair.team2} 🏆 <strong>${winner}</strong></div>`;
                        } else if (res.penaltyWinner) {
                            totalInfo = `<div class="playoff-total">Toplam: ${pair.team1} <strong>${total1}</strong> - <strong>${total2}</strong> ${pair.team2} — Penaltılar: <strong>${res.pen1||0}</strong>-<strong>${res.pen2||0}</strong> 🏆 <strong>${res.penaltyWinner}</strong></div>`;
                        } else if (res.penaltyInProgress) {
                            const s1 = res.penaltyShots1||[], s2 = res.penaltyShots2||[];
                            totalInfo = `<div class="playoff-total">Toplam: ${pair.team1} <strong>${total1}</strong> - <strong>${total2}</strong> ${pair.team2} — Penaltılara gidiliyor!</div>
                            <div class="penalty-shootout">
                                <h6>⚽ Penaltı Atışları</h6>
                                <div class="penalty-grid">
                                    <div class="penalty-team"><span class="pen-team-name">${pair.team1}</span><div class="pen-shots">${s1.map(x=>x?'✅':'❌').join(' ')}</div><span class="pen-score">${s1.filter(Boolean).length}</span></div>
                                    <div class="penalty-team"><span class="pen-team-name">${pair.team2}</span><div class="pen-shots">${s2.map(x=>x?'✅':'❌').join(' ')}</div><span class="pen-score">${s2.filter(Boolean).length}</span></div>
                                </div>
                                <button class="btn btn-danger btn-sm mt-2" onclick="window.footballSim.shootPenaltyKO('${comp}','${roundKey}',${i})">⚽ Sonraki Atış</button>
                            </div>`;
                        } else {
                            totalInfo = `<div class="playoff-total">Toplam: ${pair.team1} <strong>${total1}</strong> - <strong>${total2}</strong> ${pair.team2} — <strong>Beraberlik!</strong>
                                <button class="btn btn-danger btn-sm" style="margin-left:.5rem" onclick="window.footballSim.startPenaltyKO('${comp}','${roundKey}',${i})">⚽ Penaltılara Başla</button></div>`;
                        }
                    }
                    rHtml += `<div class="playoff-tie">
                        <div class="playoff-tie-header"><strong>E${i+1}:</strong> ${pair.team1} vs ${pair.team2}</div>
                        <div class="playoff-legs">
                            <span class="leg-label">1. Maç (Ev: ${pair.team1}):</span> <span class="leg-score">${l1}</span> ${leg1Btn}
                            ${!isFinal ? `&nbsp;<span class="leg-label">2. Maç (Ev: ${pair.team2}):</span> <span class="leg-score">${l2}</span> ${leg2Btn}` : ''}
                        </div>
                        ${totalInfo}
                    </div>`;
                });
                rHtml += '</div>';
                // Check all done
                const allDone = pairs.every((p,i) => {
                    const r = (results && results[i]) || {};
                    const bothPlayed = isFinal ? r.leg1Home != null : (r.leg1Home != null && r.leg2Home != null);
                    if (!bothPlayed) return false;
                    const t1 = isFinal ? r.leg1Home : (r.leg1Home + r.leg2Away);
                    const t2 = isFinal ? r.leg1Away : (r.leg1Away + r.leg2Home);
                    return t1 !== t2 || r.penaltyWinner != null;
                });
                if (allDone && nextFn) rHtml += `<div style="text-align:center;margin-top:1rem">${nextFn}</div>`;
                else if (!allDone) rHtml += `<div style="text-align:center;margin-top:1rem"><button class="btn btn-warning" onclick="window.footballSim.simulateAllKOLegs('${comp}','${roundKey}')"><i class="fas fa-forward"></i> Tümünü Simüle Et</button></div>`;
                return rHtml;
            };

            const qfPairs = state.qfPairs || [];
            const qfResults = state.knockoutResults.qf || qfPairs.map(()=>({}));
            const sfPairs = state.sfPairs || [];
            const sfResults = state.knockoutResults.sf || sfPairs.map(()=>({}));
            const finalPairs = state.finalPair ? [state.finalPair] : [];
            const finalResults = state.knockoutResults.final || [{}];

            html += renderKnockoutRound('qf', '🏆 Çeyrek Final (2 Maçlı)', qfPairs, qfResults,
                qfPairs.length === 4 ? `<button class="btn btn-success" onclick="window.footballSim.advanceToSF('${comp}')"><i class="fas fa-trophy"></i> Yarı Final Başlat</button>` : null, false);

            if (state.phase === 'sf' || state.phase === 'final' || state.phase === 'done') {
                html += renderKnockoutRound('sf', '🏆 Yarı Final (2 Maçlı)', sfPairs, sfResults,
                    sfPairs.length === 2 ? `<button class="btn btn-success" onclick="window.footballSim.advanceToFinal('${comp}')"><i class="fas fa-trophy"></i> Final Başlat</button>` : null, false);
            }
            if (state.phase === 'final' || state.phase === 'done') {
                html += renderKnockoutRound('final', '🏆 FİNAL (Tek Maç)', finalPairs, finalResults, null, true);
                const fr = finalResults[0] || {};
                if (fr.leg1Home != null && (fr.leg1Home !== fr.leg1Away || fr.penaltyWinner)) {
                    const winner = fr.penaltyWinner || (fr.leg1Home > fr.leg1Away ? finalPairs[0]?.team1 : finalPairs[0]?.team2);
                    if (winner) html += `<div class="champion-banner">🏆 ŞAMPİYON: ${winner} 🏆</div>`;
                }
            }
        }

        html += `
                <div class="european-points mt-4">
                    <h4>Puan Sistemi</h4>
                    <table class="european-table">
                        <thead><tr><th>Aşama</th><th>Puan</th></tr></thead>
                        <tbody>${Object.entries(this.europeanPoints[compKey]).map(([stage, points]) => `<tr><td>${this.europeanStageLabels[stage] || stage}</td><td>${points}</td></tr>`).join('')}</tbody>
                    </table>
                </div>
            </div>`;
        content.innerHTML = html;
    }

    // Manuel torba düzenleme fonksiyonları
    // Torbada takıma tıklanınca çalışır (seç + yer değiştir)
    handlePotTeamClick(teamName, potNum, comp) {
        if (!this._potSwapSelected) this._potSwapSelected = {};
        const current = this._potSwapSelected[comp];

        if (!current) {
            // İlk tıklama: takımı seç
            this._potSwapSelected[comp] = { team: teamName, pot: potNum };
            this.showEuropeanCompetition(comp);
        } else if (current.team === teamName) {
            // Aynı takıma tekrar tıklandı: seçimi iptal et
            this._potSwapSelected[comp] = null;
            this.showEuropeanCompetition(comp);
        } else {
            // İkinci tıklama: yer değiştir
            this.executeSwap(current.team, teamName, comp);
            this._potSwapSelected[comp] = null;
        }
    }

    // Seçimi iptal et
    cancelPotSwap(comp) {
        if (!this._potSwapSelected) this._potSwapSelected = {};
        this._potSwapSelected[comp] = null;
        this.showEuropeanCompetition(comp);
    }

    // Takım adını normalize et (string ya da {team/name: ...} objesinden ismi çıkar)
    _getTeamName(p) {
        if (typeof p === 'string') return p;
        if (p && typeof p === 'object') return p.name || p.team || '';
        return '';
    }

    // İki takım arasında yer değiştirme
    executeSwap(team1, team2, comp) {
        const compKey = comp.toUpperCase();

        // Her iki kaynaktan da part listesini al, ama her zaman europeanSeason2028_29'a yaz
        let part = this.europeanSeason2028_29[compKey];
        if (!part || part.length === 0) {
            part = this.getEuropeanParticipants2028_29()[compKey];
            this.europeanSeason2028_29[compKey] = part;
        }
        if (!part || part.length === 0) {
            alert('Katılımcı listesi boş!');
            return;
        }

        const index1 = part.findIndex(p => this._getTeamName(p) === team1);
        const index2 = part.findIndex(p => this._getTeamName(p) === team2);

        if (index1 === -1 || index2 === -1) {
            // Debug için hangi isimlerin bulunduğunu konsola yazdır
            console.error('Swap başarısız:', { team1, team2, index1, index2 });
            console.log('Part listesi:', part.slice(0, 5).map(p => this._getTeamName(p)));
            alert(`Takım bulunamadı!\n"${team1}" (${index1})\n"${team2}" (${index2})`);
            return;
        }

        // Yer değiştir
        [part[index1], part[index2]] = [part[index2], part[index1]];

        // State varsa participants ve pots'u da güncelle
        const state = this.getEuropeanPlayableState(compKey);
        if (state) {
            const newParticipants = part.slice(0, 36).map(p => {
                const teamName = this._getTeamName(p);
                const teamData = this.teams.find(t => t.name === teamName);
                return {
                    name: teamName,
                    league: (typeof p === 'object' && p.league) ? p.league : (teamData?.league || ''),
                    country: teamData ? (teamData.country || this.leagueToCountry[teamData.league] || '') : '',
                    rating: this.normalizeRating(teamData?.rating) || 7
                };
            });
            state.participants = newParticipants;
            state.pots = { 1: [], 2: [], 3: [], 4: [] };
            newParticipants.forEach((t, i) => {
                const pot = Math.floor(i / 9) + 1;
                if (state.pots[pot]) state.pots[pot].push(t.name);
            });
        }

        this.europeanSeason2028_29[compKey] = part;
        this.saveData();
        this.showEuropeanCompetition(comp);
        this.addActivity(`${team1} ↔ ${team2} yer değiştirildi`);
    }

    shufflePots(comp) {
        const part = this.europeanSeason2028_29[comp.toUpperCase()] || this.getEuropeanParticipants2028_29()[comp.toUpperCase()];
        if (!part || part.length < 36) {
            alert('Önce katılımcıları güncelleyin!');
            return;
        }
        
        // Tüm takımları karıştır
        const shuffled = [...part].sort(() => Math.random() - 0.5);
        
        // Torbalara yeniden dağıt (her torbada 9 takım)
        this.europeanSeason2028_29[comp.toUpperCase()] = shuffled;
        
        // State'i güncelle
        const state = this.getEuropeanPlayableState(comp.toUpperCase());
        if (state && state.participants) {
            // State'teki participants listesini güncelle
            const newParticipants = shuffled.slice(0, 36).map(p => {
                const teamName = typeof p === 'string' ? p : (p.team || p);
                const team = this.teams.find(t => t.name === teamName);
                return { 
                    name: teamName, 
                    league: typeof p === 'object' ? p.league : '', 
                    country: team ? (team.country || this.leagueToCountry[team.league] || '') : '',
                    rating: this.normalizeRating(team?.rating) || 7 
                };
            });
            
            // Torbaları yeniden oluştur
            state.participants = newParticipants;
            state.pots = { 1: [], 2: [], 3: [], 4: [] };
            newParticipants.forEach((t, i) => {
                const pot = Math.floor(i / 9) + 1;
                state.pots[pot].push(t.name);
            });
            
            // Eğer grup aşaması başlamadıysa, fikstürü yeniden oluştur
            if (state.phase === 'none') {
                state.groupMatches = this.buildEuropeanGroupFixtures(state);
            }
        }
        
        this.saveData();
        this.showEuropeanCompetition(comp);
        
        this.addActivity(`${this.europeanCompetitions[comp.toUpperCase()].name} torbaları karıştırıldı`);
    }

    getCurrentEuropeanCompetition() {
        const activeTab = document.querySelector('.european-tab.active');
        return activeTab ? activeTab.dataset.competition : null;
    }

    initDragAndDrop() {
        // Drag-drop kaldırıldı, tıkla-tıkla swap sistemi kullanılıyor
    }

    // ─── PLAYOFF KURA TOP SİSTEMİ ───────────────────────────────────────────

    // Bir top seçildi (henüz gizli)
    _poSelect(teamName, side) {
        const comp  = this.getCurrentEuropeanCompetition() || 'ucl';
        const state = this.getEuropeanPlayableState(comp.toUpperCase());
        if (!state._playoffTemp) state._playoffTemp = {};
        const t = state._playoffTemp;
        // Sadece ilgili tarafı kaydet, zaten açılmış tarafın seçimini bozma
        if (side === 'high') {
            if (t.selHigh) return; // zaten açık, tekrar seçme
            t.hidHigh = teamName;
            t.selHigh = null;
        } else {
            if (t.selLow) return;
            t.hidLow = teamName;
            t.selLow = null;
        }
        this.saveData();
        this.showEuropeanCompetition(comp);
    }

    // Gizli topa tıklandı → aç
    _poReveal(side) {
        const comp  = this.getCurrentEuropeanCompetition() || 'ucl';
        const state = this.getEuropeanPlayableState(comp.toUpperCase());
        if (!state._playoffTemp) state._playoffTemp = {};
        const t = state._playoffTemp;
        if (side === 'high' && t.hidHigh) {
            t.selHigh = t.hidHigh;
            t.hidHigh = null;
        } else if (side === 'low' && t.hidLow) {
            t.selLow  = t.hidLow;
            t.hidLow  = null;
        }

        this.saveData();
        this.showEuropeanCompetition(comp);
    }

    // Eşleşmeyi onayla
    _poConfirm() {
        const comp  = this.getCurrentEuropeanCompetition() || 'ucl';
        const state = this.getEuropeanPlayableState(comp.toUpperCase());
        const t = state._playoffTemp || {};
        if (!t.selHigh || !t.selLow) return;
        if (!state.playoffPairs) state.playoffPairs = [];
        state.playoffPairs.push({ team1: t.selHigh, team2: t.selLow });
        state._playoffTemp = {};
        this.saveData();
        this.addActivity(`Playoff eşleşme: ${t.selHigh} vs ${t.selLow}`);
        this.showEuropeanCompetition(comp);
    }

    // Seçimi sıfırla
    _poReset() {
        const comp  = this.getCurrentEuropeanCompetition() || 'ucl';
        const state = this.getEuropeanPlayableState(comp.toUpperCase());
        state._playoffTemp = {};
        this.saveData();
        this.showEuropeanCompetition(comp);
    }

    // ─── SON 16 KURA TOP SİSTEMİ ────────────────────────────────────────────

    _r16BallSelect(teamName, side, comp) {
        const state = this.getEuropeanPlayableState(comp.toUpperCase());
        if (!state._r16Temp) state._r16Temp = {};
        if (!state._r16Temp[comp]) state._r16Temp[comp] = {};
        const t = state._r16Temp[comp];
        if (side === 's') {
            if (t.selS) return;
            t.hidS = teamName; t.selS = null;
        } else {
            if (t.selU) return;
            t.hidU = teamName; t.selU = null;
        }
        this.saveData();
        this.showEuropeanCompetition(comp);
    }

    _r16Reveal(side, comp) {
        const state = this.getEuropeanPlayableState(comp.toUpperCase());
        if (!state._r16Temp) state._r16Temp = {};
        if (!state._r16Temp[comp]) state._r16Temp[comp] = {};
        const t = state._r16Temp[comp];
        if (side === 's' && t.hidS) { t.selS = t.hidS; t.hidS = null; }
        if (side === 'u' && t.hidU) { t.selU = t.hidU; t.hidU = null; }
        if (t.selS && t.selU) {
            const lgS = this.teams.find(x => x.name === t.selS)?.league || '';
            const lgU = this.teams.find(x => x.name === t.selU)?.league || '';
            if (lgS && lgU && lgS === lgU) {
                alert(`Aynı ligden takımlar eşleşemez! (${lgS})\nBir seçimi sıfırlayın.`);
                if (side === 's') { t.selS = null; } else { t.selU = null; }
            }
        }
        this.saveData();
        this.showEuropeanCompetition(comp);
    }

    _r16BallConfirm(comp) {
        const state = this.getEuropeanPlayableState(comp.toUpperCase());
        const t = (state._r16Temp && state._r16Temp[comp]) || {};
        if (!t.selS || !t.selU) return;
        const lgS = this.teams.find(x => x.name === t.selS)?.league || '';
        const lgU = this.teams.find(x => x.name === t.selU)?.league || '';
        if (lgS && lgU && lgS === lgU) { alert(`Aynı ligden takımlar eşleşemez! (${lgS})`); return; }

        // r16Seeded ve r16Unseeded dizilerinde null yap
        const si = state.r16Seeded.indexOf(t.selS);
        const ui = state.r16Unseeded.indexOf(t.selU);
        if (si !== -1) state.r16Seeded[si]   = null;
        if (ui !== -1) state.r16Unseeded[ui]  = null;

        state.r16Pairs.push({ team1: t.selS, team2: t.selU });
        state._r16Temp[comp] = {};
        this.saveData();
        this.addActivity(`Son 16 eşleşme: ${t.selS} vs ${t.selU}`);
        this.showEuropeanCompetition(comp);
    }

    _r16BallReset(comp) {
        const state = this.getEuropeanPlayableState(comp.toUpperCase());
        if (state._r16Temp) state._r16Temp[comp] = {};
        this.saveData();
        this.showEuropeanCompetition(comp);
    }


    // Seçili takımı göster — aktif kupaya göre çalışır
    revealSelectedTeam() {
        const comp = this.getCurrentEuropeanCompetition() || 'ucl';
        const state = this.getEuropeanPlayableState(comp.toUpperCase());
        if (state._playoffTemp && state._playoffTemp.selectedTeam) {
            state._playoffTemp.revealedTeam = state._playoffTemp.selectedTeam;
            this.showEuropeanCompetition(comp);
        }
    }

    _playoffPick(groupIndex, teamA, teamB) {
        const comp = this.getCurrentEuropeanCompetition() || 'ucl';
        const state = this.getEuropeanPlayableState(comp.toUpperCase());
        
        if (!state._playoffTemp) state._playoffTemp = {};
        
        if (teamA && !teamB) {
            // İlk takım seçimi - gizli yap
            state._playoffTemp.selectedTeam = teamA;
            state._playoffTemp.currentGroup = groupIndex;
            state._playoffTemp.revealedTeam = null;
            this.saveData();
            this.showEuropeanCompetition(comp);
            return;
        }
        
        if (teamA && teamB) {
            // İkinci takım seçimi - aynı lig kontrolü
            const getTeamLeague = (teamName) => {
                const team = this.teams.find(t => t.name === teamName);
                return team ? team.league : '';
            };
            
            const leagueA = getTeamLeague(teamA);
            const leagueB = getTeamLeague(teamB);
            
            if (!state.playoffPairs) state.playoffPairs = [];
            state.playoffPairs.push({ team1: teamA, team2: teamB });
            state._playoffTemp.selectedTeam = null;
            state._playoffTemp.currentGroup = null;
            state._playoffTemp.revealedTeam = null;
            
            this.saveData();
            this.showEuropeanCompetition(comp);
            return;
        }
        
        // İptal
        state._playoffTemp.selectedTeam = null;
        state._playoffTemp.currentGroup = null;
        state._playoffTemp.revealedTeam = null;
        this.saveData();
        this.showEuropeanCompetition(comp);
    }

    // Otomatik playoff eşleştirme (aynı ligden takımlar varsa, comp-generic)
    autoPlayoffPairing(groupIndex, comp) {
        const activeComp = comp || this.getCurrentEuropeanCompetition() || 'ucl';
        const state = this.getEuropeanPlayableState(activeComp.toUpperCase());
        const st = state.standingsOrder || [];
        
        // 8 tek eşleşme: sıra 9 vs 24, 10 vs 23, ..., 16 vs 17
        const playoffSlots = [
            { high: st[8],  low: st[23] },
            { high: st[9],  low: st[22] },
            { high: st[10], low: st[21] },
            { high: st[11], low: st[20] },
            { high: st[12], low: st[19] },
            { high: st[13], low: st[18] },
            { high: st[14], low: st[17] },
            { high: st[15], low: st[16] },
        ];
        
        const drawn = new Set(state.playoffPairs.flatMap(p => [p.team1, p.team2]));
        const getTeamLeague = (teamName) => {
            const team = this.teams.find(t => t.name === teamName);
            return team ? team.league : '';
        };
        
        const slot = playoffSlots[groupIndex];
        if (!slot || !slot.high || !slot.low) { alert('Geçersiz slot!'); return; }
        if (drawn.has(slot.high) || drawn.has(slot.low)) { alert('Bu takımlar zaten eşleşti!'); return; }
        
        state.playoffPairs.push({ team1: slot.high, team2: slot.low });
        if (!state._playoffTemp) state._playoffTemp = {};
        state._playoffTemp.selHigh = null; state._playoffTemp.selLow = null;
        state._playoffTemp.hidHigh = null; state._playoffTemp.hidLow = null;
        this.saveData();
        this.showEuropeanCompetition(activeComp);
    }

    _r16Pick(comp, which, index) {
        const state = this.getEuropeanPlayableState(comp.toUpperCase());
        if (!state._r16Temp) state._r16Temp = {};

        // null/null = iptal
        if (which === null) {
            state._r16Temp[comp] = null;
            this.saveData();
            this.showEuropeanCompetition(comp);
            return;
        }

        if (which === 's') state._r16Temp[comp] = { seeded: index, unseeded: state._r16Temp[comp]?.unseeded ?? null };
        if (which === 'u') state._r16Temp[comp] = { seeded: state._r16Temp[comp]?.seeded ?? null, unseeded: index };

        const t = state._r16Temp[comp];
        if (t && t.seeded != null && t.unseeded != null) {
            const seededName   = state.r16Seeded[t.seeded];
            const unseededName = state.r16Unseeded[t.unseeded];
            const leagueS = this.teams.find(x => x.name === seededName)?.league  || '';
            const leagueU = this.teams.find(x => x.name === unseededName)?.league || '';

            if (leagueS && leagueU && leagueS === leagueU) {
                alert(`Aynı ligden takımlar eşleşemez! (${leagueS})\nBaşka bir takım seçin.`);
                // Sadece en son seçilen tarafı temizle, diğerini koru
                if (which === 's') state._r16Temp[comp] = { seeded: null, unseeded: t.unseeded };
                else               state._r16Temp[comp] = { seeded: t.seeded, unseeded: null };
                this.saveData();
                this.showEuropeanCompetition(comp);
                return;
            }

            this.drawR16Pair(comp, t.seeded, t.unseeded);
            state._r16Temp[comp] = null;
        }
        this.saveData();
        this.showEuropeanCompetition(comp);
    }

    setEuropeanParticipants2028_29() {
        this.europeanSeason2028_29 = this.getEuropeanParticipants2028_29();
        this.saveData();
        this.addActivity('2028-29 Avrupa katılımcıları güncellendi');
    }

    getEuropeanPlayableState(comp) {
        const c = comp.toUpperCase();
        if (!this.europeanPlayable[c]) this.europeanPlayable[c] = { phase: 'none', participants: [], pots: { 1: [], 2: [], 3: [], 4: [] }, groupMatches: [], playoffPairs: [], playoffResults: [], r16Pairs: [], knockoutResults: {} };
        return this.europeanPlayable[c];
    }

    startEuropeanGroupStage(comp) {
        const c = comp.toUpperCase();
        let part = this.europeanSeason2028_29[c];
        if (!part || part.length < 36) part = this.getEuropeanParticipants2028_29()[c];
        if (!part || part.length < 36) {
            alert('Bu kupada 36 takım olmalı. Önce "Katılımcıları Güncelle" ile lig sıralamasına göre takımları doldurun.');
            return;
        }
        const state = this.getEuropeanPlayableState(comp);
        const list = part.slice(0, 36).map(p => ({ name: typeof p === 'string' ? p : (p.team || p), league: typeof p === 'object' ? p.league : '' }));
        const withRating = list.map(p => ({ ...p, country: (this.teams.find(t => t.name === p.name)?.country) || this.leagueToCountry[p.league] || '', rating: this.normalizeRating(this.teams.find(t => t.name === p.name)?.rating) || 7 }));
        withRating.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        state.participants = withRating;
        state.pots = { 1: [], 2: [], 3: [], 4: [] };
        withRating.forEach((t, i) => {
            const pot = Math.floor(i / 9) + 1;
            state.pots[pot].push(t.name);
        });
        state.groupMatches = this.buildEuropeanGroupFixtures(state);
        state.phase = 'group';
        state.playoffPairs = [];
        state.playoffResults = [];
        state.r16Pairs = [];
        state.knockoutResults = {};
        this.saveData();
        this.addActivity(`${this.europeanCompetitions[c].name} grup aşaması başlatıldı (8 maç günü)`);
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    buildEuropeanGroupFixtures(state) {
        // state.pots: { 1:[9 isim], 2:[9 isim], 3:[9 isim], 4:[9 isim] }
        const allNames = [
            ...state.pots[1], ...state.pots[2],
            ...state.pots[3], ...state.pots[4]
        ];

        // Takım adından lig bilgisini al
        const getLeague = (name) => {
            const p = (state.participants || []).find(t => t.name === name);
            if (p && p.league) return p.league;
            const t = this.teams.find(t => t.name === name);
            return t ? t.league : '';
        };

        // ── Berger Table Round Robin (8 tur, her tur 18 maç) ─────────────
        // n=36 takım, sabit T0, diğerleri döner
        // Her turda 18 benzersiz eşleşme, her takım her turda tam 1 maç
        // 8 turda her takım tam 8 farklı rakiple oynuyor (tekrar yok)
        // KURAL: aynı ligden iki takım aynı maç gününde eşleşemez.
        // Eğer Berger Table'dan gelen çiftte aynı lig çakışması varsa,
        // o tur içinde çakışmayan başka bir çiftle swap yapılır.
        const n = allNames.length; // 36
        const circle = [...allNames.slice(1)]; // 35 eleman, dönen daire
        const ROUNDS = 8;

        const fixtures = [];

        for (let r = 0; r < ROUNDS; r++) {
            const matchday = r + 1;

            // Ham Berger çiftlerini üret
            const rawPairs = [];
            const fixed = allNames[0];
            const opp   = circle[r % circle.length];
            rawPairs.push([fixed, opp]);

            for (let i = 1; i <= 17; i++) {
                const a = circle[(r + i)          % 35];
                const b = circle[(r - i + 35 * 3) % 35];
                rawPairs.push([a, b]);
            }

            // Aynı lig çakışmalarını tespit et ve swap ile gider
            // Her çift: [home, away] — ligler çakışıyorsa bu turdaki başka bir çiftle swap dene
            const resolvedPairs = this._resolveLeagueConflicts(rawPairs, getLeague);

            // Fixtures dizisine ekle (ev/deplasman: tur çift → normal, tur tek → ters)
            resolvedPairs.forEach((pair, i) => {
                const flip = (r + i) % 2 === 1;
                fixtures.push({
                    homeTeam:  flip ? pair[1] : pair[0],
                    awayTeam:  flip ? pair[0] : pair[1],
                    homeGoals: null,
                    awayGoals: null,
                    matchday
                });
            });
        }

        return fixtures;
    }

    // Bir turdaki çiftlerde aynı lig çakışması varsa swap ile çöz
    _resolveLeagueConflicts(pairs, getLeague) {
        const result = pairs.map(p => [...p]); // derin kopya
        const MAX_PASSES = 50;

        for (let pass = 0; pass < MAX_PASSES; pass++) {
            let changed = false;

            for (let i = 0; i < result.length; i++) {
                const [a, b] = result[i];
                if (getLeague(a) !== getLeague(b)) continue; // çakışma yok

                // Çakışma var — başka bir çift j ile swap dene
                let swapped = false;
                for (let j = i + 1; j < result.length; j++) {
                    const [c, d] = result[j];

                    // Seçenek 1: a-c / b-d swap (i'nin away ile j'nin home)
                    // i → [a, d], j → [c, b]
                    if (getLeague(a) !== getLeague(d) && getLeague(c) !== getLeague(b)) {
                        result[i] = [a, d];
                        result[j] = [c, b];
                        swapped = true;
                        changed = true;
                        break;
                    }
                    // Seçenek 2: a-d / c-b  (j'nin home ile swap)
                    // i → [a, c], j → [d, b]  — burada d away'e geçiyor
                    if (getLeague(a) !== getLeague(c) && getLeague(d) !== getLeague(b)) {
                        result[i] = [a, c];
                        result[j] = [d, b];
                        swapped = true;
                        changed = true;
                        break;
                    }
                }

                if (!swapped) {
                    // Swap bulunamadı — zorunlu çakışma, olduğu gibi bırak
                    // (örneğin bir torbada aynı ligden 5+ takım varsa kaçınılmaz)
                    console.warn(`[EuropeanDraw] Kaçınılmaz çakışma: ${a} vs ${b} (${getLeague(a)})`);
                }
            }

            if (!changed) break; // daha fazla çakışma kalmadı
        }

        return result;
    }

    getEuropeanGroupStandings(comp) {
        const state = this.getEuropeanPlayableState(comp);
        const standings = {};
        state.participants.forEach(p => { standings[p.name] = { name: p.name, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }; });
        state.groupMatches.filter(m => m.homeGoals != null).forEach(m => {
            if (!standings[m.homeTeam] || !standings[m.awayTeam]) return;
            standings[m.homeTeam].played++; standings[m.awayTeam].played++;
            standings[m.homeTeam].goalsFor += m.homeGoals; standings[m.homeTeam].goalsAgainst += m.awayGoals;
            standings[m.awayTeam].goalsFor += m.awayGoals; standings[m.awayTeam].goalsAgainst += m.homeGoals;
            if (m.homeGoals > m.awayGoals) { standings[m.homeTeam].won++; standings[m.homeTeam].points += 3; standings[m.awayTeam].lost++; }
            else if (m.homeGoals < m.awayGoals) { standings[m.awayTeam].won++; standings[m.awayTeam].points += 3; standings[m.homeTeam].lost++; }
            else { standings[m.homeTeam].drawn++; standings[m.awayTeam].drawn++; standings[m.homeTeam].points++; standings[m.awayTeam].points++; }
        });
        return Object.values(standings).sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || b.goalsFor - a.goalsFor);
    }

    simulateEuropeanGroupMatch(comp, homeTeam, awayTeam, matchday) {
        const state = this.getEuropeanPlayableState(comp);
        const m = state.groupMatches.find(x => x.homeTeam === homeTeam && x.awayTeam === awayTeam && (matchday == null || x.matchday === matchday));
        if (!m || m.homeGoals != null) return;
        const home = this.teams.find(t => t.name === homeTeam) || { rating: 7 };
        const away = this.teams.find(t => t.name === awayTeam) || { rating: 7 };
        const res = this.simulateMatch(home, away, true);
        m.homeGoals = res.homeGoals;
        m.awayGoals = res.awayGoals;
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    simulateAllEuropeanMatchdays(comp) {
        const state = this.getEuropeanPlayableState(comp.toUpperCase());
        const unplayed = state.groupMatches.filter(m => m.homeGoals == null);
        unplayed.forEach(m => {
            const home = this.teams.find(t => t.name === m.homeTeam) || { rating: 7 };
            const away = this.teams.find(t => t.name === m.awayTeam) || { rating: 7 };
            const res = this.simulateMatch(home, away, true);
            m.homeGoals = res.homeGoals;
            m.awayGoals = res.awayGoals;
        });
        this.saveData();
        this.addActivity(`${this.europeanCompetitions[comp.toUpperCase()].name} lig fazı tamamlandı`);
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    simulateEuropeanMatchday(comp, matchday) {
        const state = this.getEuropeanPlayableState(comp);
        const toPlay = state.groupMatches.filter(m => m.matchday === matchday && m.homeGoals == null);
        toPlay.forEach(m => this.simulateEuropeanGroupMatch(comp, m.homeTeam, m.awayTeam, matchday));
        this.addActivity(`${this.europeanCompetitions[comp.toUpperCase()].name} ${matchday}. maç günü simüle edildi`);
    }

    openPlayoffDraw(comp) {
        const state = this.getEuropeanPlayableState(comp);
        const standings = this.getEuropeanGroupStandings(comp);
        const totalPlayed = state.groupMatches.filter(m => m.homeGoals != null).length;
        if (totalPlayed < state.groupMatches.length) {
            alert('Önce tüm grup maçlarını oynatın.');
            return;
        }
        state.phase = 'playoff_draw';
        state.standingsOrder = standings.map(s => s.name);
        state.playoffPairs = [];
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    drawPlayoffPair(comp, pairIndex, teamA, teamB) {
        const state = this.getEuropeanPlayableState(comp);
        if (state.phase !== 'playoff_draw') return;
        const st = state.standingsOrder || [];
        // 8 slot: sıra[8..15] vs sıra[23..16]
        const highTeams = st.slice(8, 16);
        const lowTeams  = [st[23], st[22], st[21], st[20], st[19], st[18], st[17], st[16]];
        const pi = parseInt(pairIndex, 10);
        if (pi < 0 || pi > 7) return;
        if (!highTeams[pi] || !lowTeams[pi]) return;
        if (!highTeams.includes(teamA) || !lowTeams.includes(teamB)) return;
        const league1 = this.teams.find(t => t.name === teamA)?.league || '';
        const league2 = this.teams.find(t => t.name === teamB)?.league || '';
        if (state.playoffPairs.some(p => p.team1 === teamA || p.team2 === teamA || p.team1 === teamB || p.team2 === teamB)) return;
        state.playoffPairs.push({ team1: teamA, team2: teamB });
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    finishPlayoffDraw(comp) {
        const state = this.getEuropeanPlayableState(comp);
        if (state.phase !== 'playoff_draw' || state.playoffPairs.length < 8) return;
        state.phase = 'playoff';
        state.playoffResults = state.playoffPairs.map(p => ({ ...p, leg1Home: null, leg1Away: null, leg2Home: null, leg2Away: null }));
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    simulatePlayoffLeg(comp, pairIndex, leg) {
        const state = this.getEuropeanPlayableState(comp);
        const pair = state.playoffResults[pairIndex];
        if (!pair) return;
        const [home, away] = leg === 1 ? [pair.team1, pair.team2] : [pair.team2, pair.team1];
        const h = this.teams.find(t => t.name === home) || { rating: 7 };
        const a = this.teams.find(t => t.name === away) || { rating: 7 };
        const res = this.simulateMatch(h, a, true);
        if (leg === 1) { pair.leg1Home = res.homeGoals; pair.leg1Away = res.awayGoals; } else { pair.leg2Home = res.homeGoals; pair.leg2Away = res.awayGoals; }
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    simulateAllPlayoffLegs(comp) {
        const state = this.getEuropeanPlayableState(comp);
        (state.playoffResults || []).forEach((pair, i) => {
            if (pair.leg1Home == null) {
                const h = this.teams.find(t => t.name === pair.team1) || { rating: 7 };
                const a = this.teams.find(t => t.name === pair.team2) || { rating: 7 };
                const res = this.simulateMatch(h, a, true);
                pair.leg1Home = res.homeGoals; pair.leg1Away = res.awayGoals;
            }
            if (pair.leg2Home == null) {
                const h = this.teams.find(t => t.name === pair.team2) || { rating: 7 };
                const a = this.teams.find(t => t.name === pair.team1) || { rating: 7 };
                const res = this.simulateMatch(h, a, true);
                pair.leg2Home = res.homeGoals; pair.leg2Away = res.awayGoals;
            }
            // Eşitlik varsa otomatik penaltı
            const t1 = (pair.leg1Home||0) + (pair.leg2Away||0);
            const t2 = (pair.leg1Away||0) + (pair.leg2Home||0);
            if (t1 === t2 && !pair.penaltyWinner) {
                const ch1 = Math.min(0.85, Math.max(0.55, 0.65 + ((this.normalizeRating(this.teams.find(t=>t.name===pair.team1)?.rating)||7)-7)*0.025));
                const ch2 = Math.min(0.85, Math.max(0.55, 0.65 + ((this.normalizeRating(this.teams.find(t=>t.name===pair.team2)?.rating)||7)-7)*0.025));
                let p1=0, p2=0; const s1=[], s2=[];
                for (let r=0; r<5; r++) { const g1=Math.random()<ch1; s1.push(g1); if(g1)p1++; const g2=Math.random()<ch2; s2.push(g2); if(g2)p2++; }
                while(p1===p2) { const g1=Math.random()<ch1; s1.push(g1); if(g1)p1++; const g2=Math.random()<ch2; s2.push(g2); if(g2)p2++; }
                pair.penaltyShots1=s1; pair.penaltyShots2=s2; pair.pen1=p1; pair.pen2=p2;
                pair.penaltyWinner = p1>p2 ? pair.team1 : pair.team2;
            }
        });
        this.saveData();
        this.addActivity(`${this.europeanCompetitions[comp.toUpperCase()].name} tüm playoff maçları simüle edildi`);
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    startPenaltyPlayoff(comp, pairIndex) {
        const state = this.getEuropeanPlayableState(comp);
        const pair = state.playoffResults && state.playoffResults[pairIndex];
        if (!pair) return;
        pair.penaltyInProgress = true;
        pair.penaltyShots1 = []; pair.penaltyShots2 = [];
        pair.pen1 = 0; pair.pen2 = 0;
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    shootPenaltyPlayoff(comp, pairIndex) {
        const state = this.getEuropeanPlayableState(comp);
        const pair = state.playoffResults && state.playoffResults[pairIndex];
        if (!pair || !pair.penaltyInProgress) return;
        const s1 = pair.penaltyShots1 || [], s2 = pair.penaltyShots2 || [];
        const isTeam1Turn = s1.length <= s2.length;
        const teamName = isTeam1Turn ? pair.team1 : pair.team2;
        const rating = this.normalizeRating(this.teams.find(t=>t.name===teamName)?.rating) || 7;
        const chance = Math.min(0.85, Math.max(0.55, 0.65 + (rating-7)*0.025));
        const scored = Math.random() < chance;
        if (isTeam1Turn) { s1.push(scored); if(scored) pair.pen1=(pair.pen1||0)+1; }
        else { s2.push(scored); if(scored) pair.pen2=(pair.pen2||0)+1; }
        pair.penaltyShots1 = s1; pair.penaltyShots2 = s2;
        const maxR = 5;
        if (s1.length === s2.length) {
            const rem1 = Math.max(0, maxR - s1.length), rem2 = Math.max(0, maxR - s2.length);
            if ((s1.length >= maxR && s2.length >= maxR && pair.pen1 !== pair.pen2) ||
                (pair.pen1 - pair.pen2 > rem2) || (pair.pen2 - pair.pen1 > rem1)) {
                pair.penaltyWinner = pair.pen1 > pair.pen2 ? pair.team1 : pair.team2;
                pair.penaltyInProgress = false;
            }
        }
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    openR16Draw(comp) {
        const state = this.getEuropeanPlayableState(comp);
        const seeded = (state.standingsOrder || []).slice(0, 8);
        // Tüm playoff maçlarının (leg1 + leg2) tamamlandığını kontrol et
        const allLegsPlayed = (state.playoffResults || []).length === 8 &&
            state.playoffResults.every(p => p.leg1Home != null && p.leg2Home != null);
        if (!allLegsPlayed) {
            alert('Önce tüm playoff eşleşmelerini tamamlayın (8 eşleşme, her biri 2 maç).');
            return;
        }
        let playoffWinners = state.playoffResults.map(p => {
            const g1 = (p.leg1Home || 0) + (p.leg2Away || 0);
            const g2 = (p.leg1Away || 0) + (p.leg2Home || 0);
            if (g1 > g2) return p.team1;
            if (g2 > g1) return p.team2;
            return p.penaltyWinner || null;
        }).filter(Boolean);
        if (seeded.length !== 8 || playoffWinners.length !== 8) {
            alert('Playoff tamamlanamadı. Lütfen kontrol edin.');
            return;
        }
        state.phase = 'r16_draw';
        state.r16Seeded = seeded;
        state.r16Unseeded = playoffWinners;
        state.r16Pairs = [];
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    drawR16Pair(comp, seededIdx, unseededIdx) {
        const state = this.getEuropeanPlayableState(comp);
        if (state.phase !== 'r16_draw') return;
        const s = state.r16Seeded[seededIdx];
        const u = state.r16Unseeded[unseededIdx];
        if (!s || !u) return;
        state.r16Pairs.push({ team1: s, team2: u });
        state.r16Seeded[seededIdx] = null;
        state.r16Unseeded[unseededIdx] = null;
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    finishR16Draw(comp) {
        const state = this.getEuropeanPlayableState(comp);
        if (state.phase !== 'r16_draw' || state.r16Pairs.length !== 8) return;
        state.phase = 'r16';
        // Her eşleşme için leg1 ve leg2 formatında sonuç objesi oluştur
        state.knockoutResults.r16 = state.r16Pairs.map(() => ({ leg1Home: null, leg1Away: null, leg2Home: null, leg2Away: null }));
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    simulateR16Leg(comp, pairIndex, leg) {
        const state = this.getEuropeanPlayableState(comp);
        const pair = state.r16Pairs[pairIndex];
        if (!pair) return;
        if (!state.knockoutResults.r16) state.knockoutResults.r16 = state.r16Pairs.map(() => ({ leg1Home: null, leg1Away: null, leg2Home: null, leg2Away: null }));
        const res = state.knockoutResults.r16[pairIndex];
        if (!res) return;
        // Leg 1: seri başı (team1) ev sahibi; Leg 2: playoff kazananı (team2) ev sahibi
        const [home, away] = leg === 1 ? [pair.team1, pair.team2] : [pair.team2, pair.team1];
        const h = this.teams.find(t => t.name === home) || { rating: 7 };
        const a = this.teams.find(t => t.name === away) || { rating: 7 };
        const result = this.simulateMatch(h, a, true);
        if (leg === 1) { res.leg1Home = result.homeGoals; res.leg1Away = result.awayGoals; }
        else           { res.leg2Home = result.homeGoals; res.leg2Away = result.awayGoals; }
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    simulateAllR16Legs(comp) {
        const state = this.getEuropeanPlayableState(comp);
        if (!state.knockoutResults.r16) state.knockoutResults.r16 = state.r16Pairs.map(() => ({ leg1Home: null, leg1Away: null, leg2Home: null, leg2Away: null }));
        (state.r16Pairs || []).forEach((pair, i) => {
            const res = state.knockoutResults.r16[i];
            if (!res) return;
            if (res.leg1Home == null) {
                const h = this.teams.find(t => t.name === pair.team1) || { rating: 7 };
                const a = this.teams.find(t => t.name === pair.team2) || { rating: 7 };
                const result = this.simulateMatch(h, a, true);
                res.leg1Home = result.homeGoals; res.leg1Away = result.awayGoals;
            }
            if (res.leg2Home == null) {
                const h = this.teams.find(t => t.name === pair.team2) || { rating: 7 };
                const a = this.teams.find(t => t.name === pair.team1) || { rating: 7 };
                const result = this.simulateMatch(h, a, true);
                res.leg2Home = result.homeGoals; res.leg2Away = result.awayGoals;
            }
        });
        this.saveData();
        this.addActivity(`${this.europeanCompetitions[comp.toUpperCase()].name} tüm Son 16 maçları simüle edildi`);
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    // Son 16 kazananlarını belirle (iki maçlı sistem)
    getR16Winners(comp) {
        const state = this.getEuropeanPlayableState(comp);
        const r16Results = state.knockoutResults.r16 || [];
        const winners = [];
        
        if (r16Results.length === 8) {
            r16Results.forEach((res, index) => {
                if (res.leg1Home != null && res.leg2Home != null) {
                    const pair = state.r16Pairs[index];
                    if (pair) {
                        const total1 = res.leg1Home + res.leg2Away;
                        const total2 = res.leg1Away + res.leg2Home;
                        const winner = total1 > total2 ? pair.team1 : total2 > total1 ? pair.team2 : (Math.random() > 0.5 ? pair.team1 : pair.team2);
                        winners.push(winner);
                    }
                }
            });
        }
        
        return winners;
    }

    // Çeyrek final kurasını aç
    openQFDraw(comp) {
        const state = this.getEuropeanPlayableState(comp);
        const winners = this.getR16Winners(comp);
        
        if (winners.length !== 8) {
            alert('Önce Son 16 maçlarının tamamını oynatın.');
            return;
        }
        
        state.phase = 'qf_draw';
        state.qfPairs = [];
        state._qfTemp = {};
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    // Çeyrek final eşleşmesi seçimi
    _qfPick(comp, teamA, teamB) {
        const state = this.getEuropeanPlayableState(comp);
        
        if (!state._qfTemp) state._qfTemp = {};
        
        if (teamA && !teamB) {
            // İlk takım seçimi
            state._qfTemp[comp] = { teamA };
        } else if (teamA && teamB) {
            // Eşleşme tamamlandı
            if (!state.qfPairs) state.qfPairs = [];
            state.qfPairs.push({ team1: teamA, team2: teamB });
            state._qfTemp[comp] = null;
        } else {
            // İptal
            state._qfTemp[comp] = null;
        }
        
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    // Çeyrek final kurasını bitir
    finishQFDraw(comp) {
        const state = this.getEuropeanPlayableState(comp);
        if (state.phase !== 'qf_draw' || !state.qfPairs || state.qfPairs.length !== 4) return;
        
        state.phase = 'qf';
        state.knockoutResults.qf = state.qfPairs.map(() => ({}));
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }


    // ─── KNOCKOUT DIRECT (QF/SF/FINAL - NO DRAW) ─────────────────────

    startQFDirect(comp) {
        const state = this.getEuropeanPlayableState(comp);
        const winners = this.getR16WinnersWithPenalty(comp);
        if (winners.length !== 8) {
            alert('Önce tüm Son 16 maçlarını ve gerekirse penaltıları tamamlayın.');
            return;
        }
        // Pair up sequentially: 1vs2, 3vs4, 5vs6, 7vs8
        state.qfPairs = [
            { team1: winners[0], team2: winners[1] },
            { team1: winners[2], team2: winners[3] },
            { team1: winners[4], team2: winners[5] },
            { team1: winners[6], team2: winners[7] },
        ];
        state.knockoutResults.qf = state.qfPairs.map(() => ({ leg1Home: null, leg1Away: null, leg2Home: null, leg2Away: null }));
        state.phase = 'qf';
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    getR16WinnersWithPenalty(comp) {
        const state = this.getEuropeanPlayableState(comp);
        const r16Results = state.knockoutResults.r16 || [];
        const winners = [];
        r16Results.forEach((res, i) => {
            const pair = state.r16Pairs[i];
            if (!pair || res.leg1Home == null || res.leg2Home == null) return;
            const t1 = res.leg1Home + res.leg2Away;
            const t2 = res.leg1Away + res.leg2Home;
            if (t1 > t2) winners.push(pair.team1);
            else if (t2 > t1) winners.push(pair.team2);
            else if (res.penaltyWinner) winners.push(res.penaltyWinner);
        });
        return winners;
    }

    simulateKOLeg(comp, roundKey, pairIndex, leg) {
        const state = this.getEuropeanPlayableState(comp);
        const pairs = roundKey === 'qf' ? state.qfPairs : roundKey === 'sf' ? state.sfPairs : [state.finalPair];
        const pair = pairs && pairs[pairIndex];
        if (!pair) return;
        if (!state.knockoutResults[roundKey]) state.knockoutResults[roundKey] = pairs.map(() => ({ leg1Home: null, leg1Away: null, leg2Home: null, leg2Away: null }));
        const res = state.knockoutResults[roundKey][pairIndex];
        if (!res) return;
        const isFinal = roundKey === 'final';
        const [home, away] = leg === 1 ? [pair.team1, pair.team2] : [pair.team2, pair.team1];
        const h = this.teams.find(t => t.name === home) || { rating: 7 };
        const a = this.teams.find(t => t.name === away) || { rating: 7 };
        const result = this.simulateMatch(h, a, true);
        if (leg === 1) { res.leg1Home = result.homeGoals; res.leg1Away = result.awayGoals; }
        else { res.leg2Home = result.homeGoals; res.leg2Away = result.awayGoals; }
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    simulateAllKOLegs(comp, roundKey) {
        const state = this.getEuropeanPlayableState(comp);
        const pairs = roundKey === 'qf' ? state.qfPairs : roundKey === 'sf' ? state.sfPairs : [state.finalPair];
        if (!pairs) return;
        if (!state.knockoutResults[roundKey]) state.knockoutResults[roundKey] = pairs.map(() => ({ leg1Home: null, leg1Away: null, leg2Home: null, leg2Away: null }));
        const isFinal = roundKey === 'final';
        pairs.forEach((pair, i) => {
            const res = state.knockoutResults[roundKey][i];
            if (!res) return;
            if (res.leg1Home == null) {
                const h = this.teams.find(t => t.name === pair.team1) || { rating: 7 };
                const a = this.teams.find(t => t.name === pair.team2) || { rating: 7 };
                const r = this.simulateMatch(h, a, true);
                res.leg1Home = r.homeGoals; res.leg1Away = r.awayGoals;
            }
            if (!isFinal && res.leg2Home == null) {
                const h = this.teams.find(t => t.name === pair.team2) || { rating: 7 };
                const a = this.teams.find(t => t.name === pair.team1) || { rating: 7 };
                const r = this.simulateMatch(h, a, true);
                res.leg2Home = r.homeGoals; res.leg2Away = r.awayGoals;
            }
            // Handle tie - auto penalty
            const t1 = isFinal ? res.leg1Home : (res.leg1Home + res.leg2Away);
            const t2 = isFinal ? res.leg1Away : (res.leg1Away + res.leg2Home);
            if (t1 === t2 && !res.penaltyWinner) {
                const ch1 = Math.min(0.85, Math.max(0.55, 0.65 + ((this.normalizeRating(this.teams.find(t=>t.name===pair.team1)?.rating)||7)-7)*0.025));
                const ch2 = Math.min(0.85, Math.max(0.55, 0.65 + ((this.normalizeRating(this.teams.find(t=>t.name===pair.team2)?.rating)||7)-7)*0.025));
                let p1=0, p2=0; const s1=[], s2=[];
                for (let r=0; r<5; r++) { const g1=Math.random()<ch1; s1.push(g1); if(g1)p1++; const g2=Math.random()<ch2; s2.push(g2); if(g2)p2++; }
                while(p1===p2) { const g1=Math.random()<ch1; s1.push(g1); if(g1)p1++; const g2=Math.random()<ch2; s2.push(g2); if(g2)p2++; }
                res.penaltyShots1=s1; res.penaltyShots2=s2; res.pen1=p1; res.pen2=p2;
                res.penaltyWinner = p1>p2 ? pair.team1 : pair.team2;
            }
        });
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    startPenaltyKO(comp, roundKey, pairIndex) {
        const state = this.getEuropeanPlayableState(comp);
        const pairs = roundKey === 'qf' ? state.qfPairs : roundKey === 'sf' ? state.sfPairs : [state.finalPair];
        const pair = pairs && pairs[pairIndex];
        if (!pair) return;
        const res = state.knockoutResults[roundKey] && state.knockoutResults[roundKey][pairIndex];
        if (!res) return;
        res.penaltyInProgress = true;
        res.penaltyShots1 = []; res.penaltyShots2 = [];
        res.pen1 = 0; res.pen2 = 0;
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    shootPenaltyKO(comp, roundKey, pairIndex) {
        const state = this.getEuropeanPlayableState(comp);
        const pairs = roundKey === 'qf' ? state.qfPairs : roundKey === 'sf' ? state.sfPairs : [state.finalPair];
        const pair = pairs && pairs[pairIndex];
        if (!pair) return;
        const res = state.knockoutResults[roundKey] && state.knockoutResults[roundKey][pairIndex];
        if (!res || !res.penaltyInProgress) return;
        const s1 = res.penaltyShots1 || [], s2 = res.penaltyShots2 || [];
        const isTeam1Turn = s1.length <= s2.length;
        const teamName = isTeam1Turn ? pair.team1 : pair.team2;
        const rating = this.normalizeRating(this.teams.find(t=>t.name===teamName)?.rating) || 7;
        const chance = Math.min(0.85, Math.max(0.55, 0.65 + (rating-7)*0.025));
        const scored = Math.random() < chance;
        if (isTeam1Turn) { s1.push(scored); if(scored) res.pen1=(res.pen1||0)+1; }
        else { s2.push(scored); if(scored) res.pen2=(res.pen2||0)+1; }
        res.penaltyShots1 = s1; res.penaltyShots2 = s2;
        const maxR = 5;
        if (s1.length === s2.length) {
            const rem1 = Math.max(0, maxR - s1.length), rem2 = Math.max(0, maxR - s2.length);
            if ((s1.length >= maxR && s2.length >= maxR && res.pen1 !== res.pen2) ||
                (res.pen1 - res.pen2 > rem2) || (res.pen2 - res.pen1 > rem1)) {
                res.penaltyWinner = res.pen1 > res.pen2 ? pair.team1 : pair.team2;
                res.penaltyInProgress = false;
            }
        }
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    // R16 penalty variants
    startPenaltyShootoutR16(comp, pairIndex) {
        const state = this.getEuropeanPlayableState(comp);
        const res = state.knockoutResults.r16 && state.knockoutResults.r16[pairIndex];
        if (!res) return;
        res.penaltyInProgress = true; res.penaltyShots1 = []; res.penaltyShots2 = []; res.pen1 = 0; res.pen2 = 0;
        this.saveData(); this.showEuropeanCompetition(comp.toLowerCase());
    }

    shootPenaltyR16(comp, pairIndex) {
        const state = this.getEuropeanPlayableState(comp);
        const pair = state.r16Pairs[pairIndex];
        const res = state.knockoutResults.r16 && state.knockoutResults.r16[pairIndex];
        if (!pair || !res || !res.penaltyInProgress) return;
        const s1=res.penaltyShots1||[], s2=res.penaltyShots2||[];
        const isTeam1Turn = s1.length <= s2.length;
        const teamName = isTeam1Turn ? pair.team1 : pair.team2;
        const rating = this.normalizeRating(this.teams.find(t=>t.name===teamName)?.rating)||7;
        const chance = Math.min(0.85, Math.max(0.55, 0.65+(rating-7)*0.025));
        const scored = Math.random() < chance;
        if (isTeam1Turn) { s1.push(scored); if(scored) res.pen1=(res.pen1||0)+1; }
        else { s2.push(scored); if(scored) res.pen2=(res.pen2||0)+1; }
        res.penaltyShots1=s1; res.penaltyShots2=s2;
        const maxR=5;
        if (s1.length === s2.length) {
            const rem1=Math.max(0,maxR-s1.length), rem2=Math.max(0,maxR-s2.length);
            if ((s1.length>=maxR && s2.length>=maxR && res.pen1!==res.pen2)||
                (res.pen1-res.pen2>rem2)||(res.pen2-res.pen1>rem1)) {
                res.penaltyWinner = res.pen1>res.pen2 ? pair.team1 : pair.team2;
                res.penaltyInProgress = false;
            }
        }
        this.saveData(); this.showEuropeanCompetition(comp.toLowerCase());
    }

    getKOWinners(comp, roundKey) {
        const state = this.getEuropeanPlayableState(comp);
        const pairs = roundKey === 'qf' ? state.qfPairs : roundKey === 'sf' ? state.sfPairs : [state.finalPair];
        const results = state.knockoutResults[roundKey] || [];
        const isFinal = roundKey === 'final';
        return (pairs || []).map((pair, i) => {
            const res = results[i] || {};
            if (res.leg1Home == null) return null;
            if (!isFinal && res.leg2Home == null) return null;
            const t1 = isFinal ? res.leg1Home : (res.leg1Home + res.leg2Away);
            const t2 = isFinal ? res.leg1Away : (res.leg1Away + res.leg2Home);
            if (t1 > t2) return pair.team1;
            if (t2 > t1) return pair.team2;
            return res.penaltyWinner || null;
        }).filter(Boolean);
    }

    advanceToSF(comp) {
        const state = this.getEuropeanPlayableState(comp);
        const qfWinners = this.getKOWinners(comp, 'qf');
        if (qfWinners.length !== 4) { alert('Önce tüm çeyrek final maçlarını tamamlayın.'); return; }
        state.sfPairs = [
            { team1: qfWinners[0], team2: qfWinners[1] },
            { team1: qfWinners[2], team2: qfWinners[3] },
        ];
        state.knockoutResults.sf = state.sfPairs.map(() => ({ leg1Home: null, leg1Away: null, leg2Home: null, leg2Away: null }));
        state.phase = 'sf';
        this.saveData(); this.showEuropeanCompetition(comp.toLowerCase());
    }

    advanceToFinal(comp) {
        const state = this.getEuropeanPlayableState(comp);
        const sfWinners = this.getKOWinners(comp, 'sf');
        if (sfWinners.length !== 2) { alert('Önce tüm yarı final maçlarını tamamlayın.'); return; }
        state.finalPair = { team1: sfWinners[0], team2: sfWinners[1] };
        state.knockoutResults.final = [{ leg1Home: null, leg1Away: null }];
        state.phase = 'final';
        this.saveData(); this.showEuropeanCompetition(comp.toLowerCase());
    }

    renderCoefficients() {
        const rankingContainer = document.getElementById('coefficients-ranking');
        const countryToLeague = {};
        Object.keys(this.leagueToCountry).forEach(leagueName => {
            const c = this.leagueToCountry[leagueName];
            if (!countryToLeague[c]) countryToLeague[c] = leagueName;
        });
        const rows = this.coefficientRanking.map((row, index) => {
            const ranking = index + 1;
            return {
                ranking,
                country: row.countryTr,
                leagueName: countryToLeague[row.country] || row.country,
                flag: row.flag,
                coefficient: row.coefficient,
                ucl: this.europeanAllocation.UCL[ranking] || 0,
                uel: this.europeanAllocation.UEL[ranking] || 0,
                uecl: this.europeanAllocation.UECL[ranking] || 0
            };
        });
        rankingContainer.innerHTML = `
            <h3>UEFA Katsayıları (Tek Liste)</h3>
            <table class="coefficients-table">
                <thead>
                    <tr>
                        <th>Sıra</th>
                        <th>Ülke / Lig</th>
                        <th>Katsayı</th>
                        <th>UCL</th>
                        <th>UEL</th>
                        <th>UECL</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(r => `
                        <tr>
                            <td><strong>${r.ranking}</strong></td>
                            <td>${r.flag} ${r.country}</td>
                            <td><strong>${r.coefficient}</strong></td>
                            <td><span class="ucl-spots">${r.ucl}</span></td>
                            <td><span class="uel-spots">${r.uel}</span></td>
                            <td><span class="uecl-spots">${r.uecl}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="legend" style="margin-top: 1rem;">
                <div class="legend-item" style="background: #3b82f6; color: white;">UCL: Şampiyonlar Ligi</div>
                <div class="legend-item" style="background: #f97316; color: white;">UEL: Avrupa Ligi</div>
                <div class="legend-item" style="background: #22c55e; color: white;">UECL: Konferans Ligi</div>
            </div>
        `;
    }

    // Utility Methods
    filterTeams() {
        this.renderTeams();
    }

    showAddTeamModal() {
        document.getElementById('add-team-modal').classList.add('show');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    clearForm(formId) {
        document.getElementById(formId).reset();
    }

    resetSeason() {
        if (confirm('Mevcut sezonu sıfırlamak istediğinizden emin misiniz?')) {
            this.matches = this.matches.filter(m => m.season !== this.currentSeason);
            this.saveData();
            this.renderSeasonProgress();
            this.renderRecentMatches();
            this.addActivity('Sezon sıfırlandı');
        }
    }

    advanceSeason() {
        if (confirm('Sonraki sezona geçmek istediğinizden emin misiniz?')) {
            const endingSeason = this.currentSeason;
            this.calculateCountryCoefficients(endingSeason);
            const currentYear = parseInt(endingSeason.split('-')[0]);
            this.currentSeason = `${currentYear + 1}-${(currentYear + 2).toString().slice(-2)}`;
            this.settings.currentSeason = this.currentSeason;
            this.saveSettings();
            this.updateStats();
            this.addActivity(`${endingSeason} ülke puanları hesaplandı; ${this.currentSeason} sezonuna geçildi`);
        }
    }

    // Weekly Fixture Management
    updateFixtureView() {
        const selectedLeague = document.getElementById('fixture-league').value;
        if (!selectedLeague) {
            document.getElementById('weekly-fixtures').innerHTML = '<p class="no-data">Lütfen bir lig seçin.</p>';
            return;
        }
        
        this.currentFixtureLeague = selectedLeague;
        this.currentFixtureWeek = 1;
        this.renderWeeklyFixtures();
    }
    
    renderLiveStandings() {
        const panel = document.getElementById('live-standings');
        if (!panel) return;
        if (!this.currentFixtureLeague) {
            panel.innerHTML = '<h4>Anlık Puan Durumu</h4><p class="no-data">Lig seçin.</p>';
            return;
        }
        const leagueTeams = this.teams.filter(t => t.league === this.currentFixtureLeague);
        const leagueMatches = this.getLeagueMatches(this.currentFixtureLeague);
        const standings = this.calculateStandings(leagueTeams, leagueMatches);
        const leagueRanking = this.getLeagueRanking(this.currentFixtureLeague);
        const europeanSpots = this.getEuropeanSpots(leagueRanking);
        panel.innerHTML = `
            <h4>${this.currentFixtureLeague} - Anlık Puan Durumu</h4>
            <div class="live-standings-table-wrap">
                <table class="league-table live-standings-table">
                    <thead><tr><th>#</th><th>Takım</th><th>O</th><th>G</th><th>B</th><th>M</th><th>A</th><th>Y</th><th>AV</th><th>P</th></tr></thead>
                    <tbody>
                        ${standings.map((t, i) => {
                            const pos = i + 1;
                            const rowClass = this.getPositionClass(pos, this.currentFixtureLeague, europeanSpots);
                            return `<tr class="${rowClass}"><td>${pos}</td><td>${t.name}</td><td>${t.played}</td><td>${t.won}</td><td>${t.drawn}</td><td>${t.lost}</td><td>${t.goalsFor}</td><td>${t.goalsAgainst}</td><td>${t.goalsFor - t.goalsAgainst}</td><td><strong>${t.points}</strong></td></tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    renderWeeklyFixtures() {
        if (!this.currentFixtureLeague) return;
        
        const fixtures = this.generateLeagueFixtures(this.currentFixtureLeague);
        const weekFixtures = fixtures.filter(f => f.week === this.currentFixtureWeek);
        const maxWeeks = Math.max(...fixtures.map(f => f.week), 1);
        
        // Update week display and navigation
        document.getElementById('current-week-display').textContent = `Hafta ${this.currentFixtureWeek}`;
        document.getElementById('prev-week-btn').disabled = this.currentFixtureWeek <= 1;
        document.getElementById('next-week-btn').disabled = this.currentFixtureWeek >= maxWeeks;
        
        const fixturesContainer = document.getElementById('weekly-fixtures');
        
        this.renderLiveStandings();
        
        if (weekFixtures.length === 0) {
            fixturesContainer.innerHTML = '<p class="no-data">Bu hafta için fikstür bulunamadı.</p>';
            return;
        }
        
        fixturesContainer.innerHTML = `
            <div class="week-header">
                <h4>${this.currentFixtureLeague} - Hafta ${this.currentFixtureWeek}</h4>
                <p>${weekFixtures.length} maç</p>
            </div>
            <div class="fixtures-grid">
                ${weekFixtures.map((fixture, index) => {
                    const existingMatch = this.matches.find(m => 
                        m.league === this.currentFixtureLeague &&
                        m.season === this.currentSeason &&
                        m.homeTeam === fixture.homeTeam.name &&
                        m.awayTeam === fixture.awayTeam.name
                    );
                    
                    return `
                        <div class="fixture-card ${existingMatch ? 'played' : 'unplayed'}">
                            <div class="fixture-teams">
                                <div class="home-team">
                                    <span class="team-name">${fixture.homeTeam.name}</span>
                                    <span class="team-rating">${this.normalizeRating(fixture.homeTeam.rating)}</span>
                                </div>
                                <div class="fixture-center">
                                    ${existingMatch ? 
                                        `<div class="match-result">${existingMatch.homeGoals} - ${existingMatch.awayGoals}</div>` :
                                        '<div class="vs">vs</div>'
                                    }
                                </div>
                                <div class="away-team">
                                    <span class="team-rating">${this.normalizeRating(fixture.awayTeam.rating)}</span>
                                    <span class="team-name">${fixture.awayTeam.name}</span>
                                </div>
                            </div>
                            <div class="fixture-actions">
                                ${existingMatch ? 
                                    `<button class="btn btn-sm btn-danger" onclick="removeMatchResult('${existingMatch.homeTeam}', '${existingMatch.awayTeam}', '${this.currentFixtureLeague}')">
                                        <i class="fas fa-trash"></i> Sonucu Sil
                                    </button>` :
                                    `<button class="btn btn-sm btn-success" onclick="simulateSingleMatch('${fixture.homeTeam.name}', '${fixture.awayTeam.name}', '${this.currentFixtureLeague}', ${this.currentFixtureWeek})">
                                        <i class="fas fa-play"></i> Simüle Et
                                    </button>`
                                }
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    previousWeek() {
        if (this.currentFixtureWeek > 1) {
            this.currentFixtureWeek--;
            this.renderWeeklyFixtures();
        }
    }
    
    nextWeek() {
        const fixtures = this.generateLeagueFixtures(this.currentFixtureLeague);
        const maxWeeks = Math.max(...fixtures.map(f => f.week), 1);
        
        if (this.currentFixtureWeek < maxWeeks) {
            this.currentFixtureWeek++;
            this.renderWeeklyFixtures();
        }
    }
    
    simulateCurrentWeek() {
        if (!this.currentFixtureLeague) return;
        
        this.simulateWeekFixtures(this.currentFixtureLeague, this.currentFixtureWeek);
        this.renderWeeklyFixtures(); // Refresh view
    }
    
    simulateSingleMatch(homeTeamName, awayTeamName, leagueName, week) {
        const homeTeam = this.teams.find(t => t.name === homeTeamName);
        const awayTeam = this.teams.find(t => t.name === awayTeamName);
        
        if (!homeTeam || !awayTeam) return;
        
        const match = this.simulateMatch(homeTeam, awayTeam);
        match.league = leagueName;
        match.week = week;
        
        this.matches.push(match);
        this.saveData();
        this.renderWeeklyFixtures();
        this.renderSeasonProgress();
        this.addActivity(`${homeTeamName} vs ${awayTeamName} simüle edildi`);
    }

    // Coefficient Tab Management
    showCoefficientTab(tabName) {
        // Update active tab
        document.querySelectorAll('.coefficient-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content visibility
        document.querySelectorAll('.coefficient-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Load appropriate data
        switch(tabName) {
            case 'league-rankings':
                this.renderCoefficients();
                break;
            case 'team-points':
                this.renderTeamPoints();
                break;
            case 'historical':
                this.renderHistoricalCoefficients();
                break;
        }
    }

    getTeamPointsList() {
        return (this.europeanResults || []).map(r => {
            const team = this.teams.find(t => t.name === r.team);
            const points = r.points != null ? r.points : this.getEuropeanStagePoints(r.competition, r.stage);
            const stageLabel = this.europeanStageLabels[r.stage] || r.stage;
            return {
                team: r.team,
                league: team?.league || '',
                season: r.season,
                competition: r.competition,
                stage: r.stage,
                stageLabel,
                points
            };
        });
    }

    getLast5Seasons() {
        const seasons = [...new Set(this.europeanResults.map(r => r.season).filter(Boolean))].sort().reverse();
        return seasons.slice(0, 5);
    }

    renderTeamPoints() {
        const container = document.getElementById('team-points-table');
        const teamPoints = this.getTeamPointsList();
        const selectedLeague = document.getElementById('team-points-league')?.value || '';
        const selectedSeason = document.getElementById('team-points-season')?.value || '';
        let filteredPoints = teamPoints;
        if (selectedLeague) filteredPoints = filteredPoints.filter(tp => tp.league === selectedLeague);
        if (selectedSeason) filteredPoints = filteredPoints.filter(tp => tp.season === selectedSeason);
        filteredPoints.sort((a, b) => b.points - a.points);

        const last5 = this.getLast5Seasons();
        const seasonOptions = last5.length ? last5 : [this.currentSeason];
        const seasonSelect = document.getElementById('team-points-season');
        if (seasonSelect) {
            seasonSelect.innerHTML = '<option value="">Tüm Sezonlar</option>' + seasonOptions.map(s => `<option value="${s}" ${s === selectedSeason ? 'selected' : ''}>${s}</option>`).join('');
        }
        
        container.innerHTML = `
            <div class="team-points-summary">
                <h3>Takım Avrupa Puanları (Son 5 sezon)</h3>
                <p>Toplam ${filteredPoints.length} kayıt. Puanlar aşamaya göre otomatik hesaplanır.</p>
            </div>
            <table class="coefficients-table">
                <thead>
                    <tr>
                        <th>Sıra</th>
                        <th>Takım</th>
                        <th>Lig</th>
                        <th>Sezon</th>
                        <th>Kupa</th>
                        <th>Aşama</th>
                        <th>Puan</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredPoints.length ? filteredPoints.map((tp, index) => `
                        <tr>
                            <td><strong>${index + 1}</strong></td>
                            <td>${tp.team}</td>
                            <td>${this.leagues[tp.league]?.flag || ''} ${tp.league}</td>
                            <td>${tp.season}</td>
                            <td><span class="competition-${(tp.competition || '').toLowerCase()}">${tp.competition || ''}</span></td>
                            <td>${tp.stageLabel}</td>
                            <td><strong>${tp.points}</strong></td>
                        </tr>
                    `).join('') : '<tr><td colspan="7" class="no-data">Henüz Avrupa puanı kaydı yok. Sezon sonu otomatik hesaplanır.</td></tr>'}
                </tbody>
            </table>
        `;
    }
    
    renderHistoricalCoefficients() {
        const container = document.getElementById('historical-coefficients');
        const allSeasons = [...new Set(Object.values(this.countryCoefficients).flatMap(c => Object.keys(c.seasons || {})))].sort().reverse().slice(0, 5);
        
        if (allSeasons.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                    <h3>Son 5 Sezon Ülke Puanları</h3>
                    <p>Henüz hesaplanmış sezon yok. "Sonraki Sezon" ile sezonu bitirdiğinizde o sezonun ülke puanları (toplam takım puanı / o ülkenin Avrupa'ya gönderdiği takım sayısı) otomatik eklenir.</p>
                </div>
            `;
            return;
        }

        const rows = allSeasons.map(season => {
            const byCountry = this.countryCoefficients.filter(c => c.seasons && c.seasons[season]).map(c => ({
                country: c.country,
                coefficient: c.seasons[season].coefficient,
                points: c.seasons[season].points,
                teams: c.seasons[season].teams
            })).sort((a, b) => b.coefficient - a.coefficient);
            return { season, byCountry };
        });

        container.innerHTML = `
            <h3>Son ${allSeasons.length} Sezon Ülke Puanları</h3>
            <p>Ülke puanı = o sezon o ülkenin takımlarının toplam Avrupa puanı / Avrupa kupalarına gönderilen takım sayısı.</p>
            ${rows.map(({ season, byCountry }) => `
                <div class="historical-season-block">
                    <h4>${season}</h4>
                    <table class="coefficients-table">
                        <thead><tr><th>Sıra</th><th>Ülke</th><th>Toplam Puan</th><th>Takım Sayısı</th><th>Ülke Puanı</th></tr></thead>
                        <tbody>
                            ${byCountry.map((row, i) => `
                                <tr>
                                    <td><strong>${i + 1}</strong></td>
                                    <td>${this.coefficientRanking.find(r => r.country === row.country)?.flag || ''} ${row.country}</td>
                                    <td>${row.points}</td>
                                    <td>${row.teams}</td>
                                    <td><strong>${row.coefficient.toFixed(2)}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
            </div>
            `).join('')}
        `;
    }
    
    filterTeamPoints() {
        this.renderTeamPoints();
    }
    
    removeMatchResult(homeTeamName, awayTeamName, leagueName) {
        const matchIndex = this.matches.findIndex(m => 
            m.league === leagueName &&
            m.season === this.currentSeason &&
            m.homeTeam === homeTeamName &&
            m.awayTeam === awayTeamName
        );
        
        if (matchIndex !== -1) {
            this.matches.splice(matchIndex, 1);
            this.saveData();
            this.renderWeeklyFixtures();
            this.renderSeasonProgress();
            this.addActivity(`${homeTeamName} vs ${awayTeamName} maç sonucu silindi`);
        }
    }

    showTeamProfile(teamName) {
        const team = this.teams.find(t => t.name === teamName);
        if (!team) return;

        // Fetch all matches for this team in current season
        const teamMatches = this.matches.filter(m =>
            m.season === this.currentSeason &&
            (m.homeTeam === teamName || m.awayTeam === teamName)
        ).sort((a, b) => (a.week || 0) - (b.week || 0));

        // Last 5 played matches
        const playedMatches = teamMatches.filter(m => m.homeGoals !== undefined && m.homeGoals !== null);
        const last5 = playedMatches.slice(-5);

        // Upcoming = generate fixtures and find unplayed ones
        const fixtures = this.generateLeagueFixtures(team.league);
        const upcomingFixtures = fixtures.filter(f => {
            const isThisTeam = f.homeTeam.name === teamName || f.awayTeam.name === teamName;
            if (!isThisTeam) return false;
            const played = this.matches.find(m =>
                m.season === this.currentSeason &&
                m.league === team.league &&
                ((m.homeTeam === f.homeTeam.name && m.awayTeam === f.awayTeam.name) ||
                 (m.homeTeam === f.awayTeam.name && m.awayTeam === f.homeTeam.name))
            );
            return !played;
        }).slice(0, 5);

        // League standings
        const leagueTeams = this.teams.filter(t => t.league === team.league);
        const leagueMatches = this.getLeagueMatches(team.league);
        const standings = this.calculateStandings(leagueTeams, leagueMatches);
        const teamStanding = standings.find(s => s.name === teamName);
        const teamPosition = standings.findIndex(s => s.name === teamName) + 1;
        const leagueRanking = this.getLeagueRanking(team.league);
        const europeanSpots = this.getEuropeanSpots(leagueRanking);

        // Form badges (last 5)
        const formBadges = last5.map(m => {
            const isHome = m.homeTeam === teamName;
            const scored = isHome ? m.homeGoals : m.awayGoals;
            const conceded = isHome ? m.awayGoals : m.homeGoals;
            let res, cls;
            if (scored > conceded) { res = 'G'; cls = 'form-w'; }
            else if (scored === conceded) { res = 'B'; cls = 'form-d'; }
            else { res = 'M'; cls = 'form-l'; }
            const opp = isHome ? m.awayTeam : m.homeTeam;
            return `<span class="form-badge ${cls}" title="${opp} (${scored}-${conceded})">${res}</span>`;
        }).join('');

        // History matches HTML
        const historyHTML = playedMatches.length === 0
            ? '<p class="no-data" style="font-size:.82rem">Henüz maç oynanmadı.</p>'
            : playedMatches.map(m => {
                const isHome = m.homeTeam === teamName;
                const scored = isHome ? m.homeGoals : m.awayGoals;
                const conceded = isHome ? m.awayGoals : m.homeGoals;
                const opp = isHome ? m.awayTeam : m.homeTeam;
                let resCls = scored > conceded ? 'res-w' : scored === conceded ? 'res-d' : 'res-l';
                let resText = scored > conceded ? 'G' : scored === conceded ? 'B' : 'M';
                const loc = isHome ? 'Ev' : 'Dep';
                const clickAttr = m.id ? `onclick="window.footballSim.showMatchDetailsEnhanced('${m.id}')" style="cursor:pointer"` : '';
                return `<div class="tp-match-row" ${clickAttr}>
                    <span class="tp-week">H${m.week||'?'}</span>
                    <span class="tp-loc ${isHome ? 'loc-home' : 'loc-away'}">${loc}</span>
                    <span class="tp-opp">${opp}</span>
                    <span class="tp-score">${scored}-${conceded}</span>
                    <span class="form-badge ${resCls}" style="font-size:.72rem;min-width:18px;height:18px;line-height:18px">${resText}</span>
                </div>`;
            }).join('');

        // Upcoming matches HTML
        const upcomingHTML = upcomingFixtures.length === 0
            ? '<p class="no-data" style="font-size:.82rem">Maç kalmadı.</p>'
            : upcomingFixtures.map(f => {
                const isHome = f.homeTeam.name === teamName;
                const opp = isHome ? f.awayTeam.name : f.homeTeam.name;
                const loc = isHome ? 'Ev' : 'Dep';
                return `<div class="tp-match-row">
                    <span class="tp-week">H${f.week}</span>
                    <span class="tp-loc ${isHome ? 'loc-home' : 'loc-away'}">${loc}</span>
                    <span class="tp-opp">${opp}</span>
                    <span class="tp-score" style="color:#aaa">vs</span>
                </div>`;
            }).join('');

        // Mini standings (show all, highlight this team)
        const flag = this.leagues[team.league]?.flag || '';
        const standingsHTML = standings.map((s, i) => {
            const pos = i + 1;
            const cls = this.getPositionClass(pos, team.league, europeanSpots);
            const isThis = s.name === teamName;
            return `<tr class="${cls} ${isThis ? 'tp-standing-highlight' : ''}">
                <td>${pos}</td>
                <td style="font-weight:${isThis ? '700' : '400'};font-size:${isThis ? '.82rem' : '.78rem'}">${s.name}</td>
                <td>${s.played}</td>
                <td>${s.won}</td>
                <td>${s.drawn}</td>
                <td>${s.lost}</td>
                <td><strong>${s.points}</strong></td>
            </tr>`;
        }).join('');

        const ratingBar = Math.round((this.normalizeRating(team.rating) / 9.9) * 100);

        const html = `
        <div class="team-profile">
            <div class="tp-header">
                <div class="tp-avatar">${teamName.charAt(0)}</div>
                <div class="tp-title-block">
                    <h2 class="tp-name">${teamName}</h2>
                    <div class="tp-meta">${flag} ${team.league} &nbsp;·&nbsp; ${team.country}</div>
                    <div class="tp-rating-row">
                        <span class="tp-rating-label">Reyting</span>
                        <div class="tp-rating-bar"><div class="tp-rating-fill" style="width:${ratingBar}%"></div></div>
                        <span class="tp-rating-val">${this.normalizeRating(team.rating)}</span>
                    </div>
                </div>
                <div class="tp-stat-badges">
                    <div class="tp-stat-badge">
                        <div class="tp-stat-num">${teamPosition || '?'}</div>
                        <div class="tp-stat-lbl">Sıra</div>
                    </div>
                    <div class="tp-stat-badge">
                        <div class="tp-stat-num">${teamStanding?.points ?? 0}</div>
                        <div class="tp-stat-lbl">Puan</div>
                    </div>
                    <div class="tp-stat-badge">
                        <div class="tp-stat-num">${teamStanding?.played ?? 0}</div>
                        <div class="tp-stat-lbl">Maç</div>
                    </div>
                    <div class="tp-stat-badge">
                        <div class="tp-stat-num">${teamStanding ? teamStanding.goalsFor - teamStanding.goalsAgainst : 0}</div>
                        <div class="tp-stat-lbl">AG</div>
                    </div>
                </div>
            </div>

            <div class="tp-body">
                <!-- Form -->
                <div class="tp-section tp-form-section">
                    <div class="tp-section-title">Son 5 Maç Formu</div>
                    <div class="tp-form-badges">
                        ${formBadges || '<span style="color:#aaa;font-size:.82rem">Henüz maç yok</span>'}
                    </div>
                </div>

                <div class="tp-grid">
                    <!-- Past Matches -->
                    <div class="tp-section">
                        <div class="tp-section-title">Sezon Maçları</div>
                        <div class="tp-matches-list">
                            ${historyHTML}
                        </div>
                    </div>

                    <!-- Upcoming -->
                    <div class="tp-section">
                        <div class="tp-section-title">Önümüzdeki Maçlar</div>
                        <div class="tp-matches-list">
                            ${upcomingHTML}
                        </div>
                    </div>

                    <!-- Standings -->
                    <div class="tp-section tp-standings-section">
                        <div class="tp-section-title">${flag} ${team.league} Puan Durumu</div>
                        <div class="tp-standings-wrap">
                            <table class="tp-standings-table">
                                <thead><tr><th>#</th><th>Takım</th><th>O</th><th>G</th><th>B</th><th>M</th><th>P</th></tr></thead>
                                <tbody>${standingsHTML}</tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Squad -->
                    <div class="tp-section tp-squad-section">
                        <div class="tp-section-title">
                            Kadro
                            <button class="btn btn-sm btn-outline" onclick="window.footballSim.showCoachModal('${teamName.replace(/'/g,"\\'")}')">
                                ⚽ Hoca Profili
                            </button>
                        </div>
                        ${this.renderCoachCard(teamName)}
                        ${this.renderSquadForProfile(teamName)}
                    </div>
                </div>
            </div>
        </div>`;

        document.getElementById('team-profile-content').innerHTML = html;
        document.getElementById('team-profile-modal').classList.add('show');
    }

    // ==================== KOÇ SİSTEMİ ====================

    getFormations() {
        return ['4-4-2', '4-3-3', '4-2-3-1', '4-1-4-1', '3-5-2', '3-4-3', '5-3-2', '5-4-1', '4-5-1', '3-5-3'];
    }

    getTeamCoach(teamName) {
        const team = this.teams.find(t => t.name === teamName);
        return team?.coach || null;
    }

    renderCoachCard(teamName) {
        const coach = this.getTeamCoach(teamName);
        if (!coach) {
            return `<div class="coach-card coach-empty">
                <span style="color:#aaa;font-size:.85rem">Henüz hoca atanmamış</span>
                <button class="btn btn-sm btn-primary" onclick="window.footballSim.showCoachModal('${teamName.replace(/'/g,"\\'")}')">
                    <i class="fas fa-plus"></i> Hoca Ekle
                </button>
            </div>`;
        }
        return `<div class="coach-card" onclick="window.footballSim.showCoachModal('${teamName.replace(/'/g,"\\'")}')">
            <div class="coach-avatar">👔</div>
            <div class="coach-info">
                <div class="coach-name">${coach.name}</div>
                <div class="coach-formation">⚙️ Tercih Formasyon: <strong>${coach.preferredFormation || '4-4-2'}</strong></div>
                <div class="coach-style">${coach.style || ''}</div>
            </div>
        </div>`;
    }

    showCoachModal(teamName) {
        const team = this.teams.find(t => t.name === teamName);
        if (!team) return;
        const coach = team.coach || {};
        const formations = this.getFormations();

        const modalHtml = `
        <div class="modal-content">
            <span class="close" onclick="document.getElementById('coach-modal').classList.remove('show')">&times;</span>
            <h3><i class="fas fa-user-tie"></i> Hoca - ${teamName}</h3>
            <form id="coach-form" onsubmit="event.preventDefault(); window.footballSim.saveCoach('${teamName.replace(/'/g,"\\'")}')">
                <div class="form-group">
                    <label>Hoca Adı:</label>
                    <input type="text" id="coach-name" required placeholder="Örn: Pep Guardiola" value="${coach.name || ''}">
                </div>
                <div class="form-group">
                    <label>Tercih Edilen Formasyon:</label>
                    <select id="coach-formation" required>
                        ${formations.map(f => `<option value="${f}" ${f === (coach.preferredFormation || '4-4-2') ? 'selected' : ''}>${f}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Taktik Stil (opsiyonel):</label>
                    <select id="coach-style">
                        <option value="" ${!coach.style ? 'selected' : ''}>Belirtilmemiş</option>
                        <option value="Yüksek Baskı" ${'Yüksek Baskı' === coach.style ? 'selected' : ''}>Yüksek Baskı</option>
                        <option value="Pres Futbolu" ${'Pres Futbolu' === coach.style ? 'selected' : ''}>Pres Futbolu</option>
                        <option value="Pozisyon Oyunu" ${'Pozisyon Oyunu' === coach.style ? 'selected' : ''}>Pozisyon Oyunu</option>
                        <option value="Kontr Atak" ${'Kontr Atak' === coach.style ? 'selected' : ''}>Kontr Atak</option>
                        <option value="Savunma Ağırlıklı" ${'Savunma Ağırlıklı' === coach.style ? 'selected' : ''}>Savunma Ağırlıklı</option>
                        <option value="Direkt Oyun" ${'Direkt Oyun' === coach.style ? 'selected' : ''}>Direkt Oyun</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('coach-modal').classList.remove('show')">İptal</button>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Kaydet</button>
                </div>
            </form>
            ${coach.name ? `<div style="margin-top:1.5rem;border-top:1px solid #eee;padding-top:1rem">
                <h4 style="font-size:.95rem;margin-bottom:.5rem">Hoca İstatistikleri</h4>
                ${this.renderCoachStats(teamName)}
            </div>` : ''}
        </div>`;
        document.getElementById('coach-modal').innerHTML = modalHtml;
        document.getElementById('coach-modal').classList.add('show');
    }

    saveCoach(teamName) {
        const name = document.getElementById('coach-name').value.trim();
        const preferredFormation = document.getElementById('coach-formation').value;
        const style = document.getElementById('coach-style').value;

        if (!name) { alert('Hoca adı gerekli.'); return; }

        const teamIdx = this.teams.findIndex(t => t.name === teamName);
        if (teamIdx === -1) return;

        this.teams[teamIdx].coach = { name, preferredFormation, style };
        this.saveData();
        document.getElementById('coach-modal').classList.remove('show');
        this.showTeamProfile(teamName);
        this.addActivity(`${teamName} - Hoca: ${name} (${preferredFormation})`);
    }

    renderCoachStats(teamName) {
        const team = this.teams.find(t => t.name === teamName);
        if (!team?.coach) return '<p class="no-data">-</p>';
        const teamMatches = this.matches.filter(m =>
            m.season === this.currentSeason &&
            (m.homeTeam === teamName || m.awayTeam === teamName) &&
            m.homeGoals !== undefined
        );
        let wins = 0, draws = 0, losses = 0;
        teamMatches.forEach(m => {
            const isHome = m.homeTeam === teamName;
            const gs = isHome ? m.homeGoals : m.awayGoals;
            const gc = isHome ? m.awayGoals : m.homeGoals;
            if (gs > gc) wins++;
            else if (gs === gc) draws++;
            else losses++;
        });
        const total = wins + draws + losses;
        const pts = wins * 3 + draws;
        return `<div class="coach-stats-grid">
            <div class="cs-item"><div class="cs-num">${total}</div><div class="cs-lbl">Maç</div></div>
            <div class="cs-item" style="color:#22c55e"><div class="cs-num">${wins}</div><div class="cs-lbl">Galibiyet</div></div>
            <div class="cs-item" style="color:#f59e0b"><div class="cs-num">${draws}</div><div class="cs-lbl">Beraberlik</div></div>
            <div class="cs-item" style="color:#ef4444"><div class="cs-num">${losses}</div><div class="cs-lbl">Mağlubiyet</div></div>
            <div class="cs-item" style="color:#667eea"><div class="cs-num">${pts}</div><div class="cs-lbl">Puan</div></div>
        </div>`;
    }

    // ==================== GELİŞTİRİLMİŞ İSTATİSTİK SİSTEMİ ====================

    // Mevkiye göre istatistik anahtarları
    getPositionStats(position) {
        const pos = position || '';
        if (pos === 'Kaleci') {
            return ['minutesPlayed', 'goals', 'assists', 'yellowCard', 'redCard', 'saves', 'cleanSheet', 'goalsConceded', 'rating'];
        } else if (['Stoper', 'Sol Bek', 'Sağ Bek'].includes(pos)) {
            return ['minutesPlayed', 'goals', 'assists', 'yellowCard', 'redCard', 'tackles', 'interceptions', 'clearances', 'duelsWon', 'rating'];
        } else if (['Ön Libero', 'Merkez Orta Saha'].includes(pos)) {
            return ['minutesPlayed', 'goals', 'assists', 'yellowCard', 'redCard', 'tackles', 'interceptions', 'passAccuracy', 'chances', 'rating'];
        } else if (['Ofansif Orta Saha', 'Forvet Arkası'].includes(pos)) {
            return ['minutesPlayed', 'goals', 'assists', 'yellowCard', 'redCard', 'shots', 'keyPasses', 'chances', 'dribbles', 'rating'];
        } else if (['Sol Kanat', 'Sağ Kanat'].includes(pos)) {
            return ['minutesPlayed', 'goals', 'assists', 'yellowCard', 'redCard', 'shots', 'crosses', 'dribbles', 'chances', 'rating'];
        } else if (pos === 'Santrafor') {
            return ['minutesPlayed', 'goals', 'assists', 'yellowCard', 'redCard', 'shots', 'shotsOnTarget', 'chances', 'aerialDuels', 'rating'];
        }
        return ['minutesPlayed', 'goals', 'assists', 'yellowCard', 'redCard', 'rating'];
    }

    getStatLabel(key) {
        const labels = {
            minutesPlayed: 'Dakika',
            goals: 'Gol',
            assists: 'Asist',
            yellowCard: 'Sarı Kart',
            redCard: 'Kırmızı',
            saves: 'Kurtarış',
            cleanSheet: 'Gol Yememe',
            goalsConceded: 'Yenilen Gol',
            tackles: 'Top Kapma',
            interceptions: 'Müdahale',
            clearances: 'Uzaklaştırma',
            duelsWon: 'İkili Kazanma',
            passAccuracy: 'Pas İsabeti %',
            chances: 'Şans Yaratan',
            shots: 'Şut',
            shotsOnTarget: 'İsabetli Şut',
            keyPasses: 'Kilit Pas',
            dribbles: 'Dribbling',
            crosses: 'Orta',
            aerialDuels: 'Hava Topu',
            rating: 'Puan'
        };
        return labels[key] || key;
    }

    // Oyuncu için mevkiye özel reyting hesapla
    calculatePlayerRating(playerStats, position) {
        const pos = position || '';
        let score = 6.0;

        if (pos === 'Kaleci') {
            score += (playerStats.saves || 0) * 0.2;
            score += (playerStats.cleanSheet ? 0.8 : 0);
            score -= (playerStats.goalsConceded || 0) * 0.15;
        } else if (['Stoper', 'Sol Bek', 'Sağ Bek'].includes(pos)) {
            score += (playerStats.tackles || 0) * 0.12;
            score += (playerStats.interceptions || 0) * 0.1;
            score += (playerStats.clearances || 0) * 0.08;
            score += (playerStats.goals || 0) * 0.5;
            score += (playerStats.assists || 0) * 0.3;
        } else if (['Ön Libero', 'Merkez Orta Saha'].includes(pos)) {
            score += (playerStats.tackles || 0) * 0.1;
            score += (playerStats.interceptions || 0) * 0.1;
            score += (playerStats.goals || 0) * 0.5;
            score += (playerStats.assists || 0) * 0.4;
            score += ((playerStats.passAccuracy || 75) - 75) * 0.02;
        } else if (['Ofansif Orta Saha', 'Forvet Arkası'].includes(pos)) {
            score += (playerStats.goals || 0) * 0.6;
            score += (playerStats.assists || 0) * 0.5;
            score += (playerStats.keyPasses || 0) * 0.12;
            score += (playerStats.chances || 0) * 0.1;
        } else if (['Sol Kanat', 'Sağ Kanat'].includes(pos)) {
            score += (playerStats.goals || 0) * 0.55;
            score += (playerStats.assists || 0) * 0.45;
            score += (playerStats.dribbles || 0) * 0.08;
            score += (playerStats.crosses || 0) * 0.06;
        } else if (pos === 'Santrafor') {
            score += (playerStats.goals || 0) * 0.7;
            score += (playerStats.assists || 0) * 0.3;
            score += (playerStats.shotsOnTarget || 0) * 0.1;
        } else {
            score += (playerStats.goals || 0) * 0.5;
            score += (playerStats.assists || 0) * 0.35;
        }

        // Kart cezaları
        if (playerStats.yellowCard) score -= 0.3;
        if (playerStats.redCard) score -= 1.0;

        // Takım sonucu bonusu (playerStats'ta teamWon/teamLost var)
        if (playerStats.teamWon) score += 0.4;
        else if (playerStats.teamLost) score -= 0.2;

        // Rastgele varyasyon
        score += (Math.random() * 0.8 - 0.4);

        return Math.min(10, Math.max(3.5, parseFloat(score.toFixed(1))));
    }

    exportAllData() {
        const data = {
            teams: this.teams,
            seasons: this.seasons,
            matches: this.matches,
            europeanResults: this.europeanResults,
            countryCoefficients: this.countryCoefficients,
            settings: this.settings
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `football_simulation_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    resetAllData() {
        if (confirm('TÜM VERİLER SİLİNECEK! Bu işlem geri alınamaz. Emin misiniz?')) {
            localStorage.clear();
            location.reload();
        }
    }
}

// Global functions for HTML onclick handlers
function showSection(section) {
    window.footballSim.showSection(section);
}

function onLeagueSeasonChange(leagueName) {
    const sel = document.getElementById('league-season-select');
    if (sel) window.footballSim.showLeagueTable(leagueName, sel.value);
}

function showAddTeamModal() {
    window.footballSim.showAddTeamModal();
}

function closeModal(modalId) {
    window.footballSim.closeModal(modalId);
}

function initializeDefaultTeams() {
    if (confirm('Varsayılan takımları yüklemek istediğinizden emin misiniz? Bu işlem mevcut takımları değiştirmez.')) {
        window.footballSim.initializeDefaultTeams();
    }
}

function filterTeams() {
    window.footballSim.filterTeams();
}

function simulateSeason() {
    window.footballSim.simulateFullSeason();
}

function simulateFullSeason() {
    window.footballSim.simulateFullSeason();
}

function simulateWeek() {
    window.footballSim.simulateWeek();
}

function resetSeason() {
    window.footballSim.resetSeason();
}

function advanceSeason() {
    window.footballSim.advanceSeason();
}

function exportData() {
    window.footballSim.exportAllData();
}

function exportAllData() {
    window.footballSim.exportAllData();
}

function resetAllData() {
    window.footballSim.resetAllData();
}

function editTeam(teamId) {
    window.footballSim.editTeam(teamId);
}

function deleteTeam(teamId) {
    window.footballSim.deleteTeam(teamId);
}

function deleteLeagueSeason(leagueName) {
    window.footballSim.deleteLeagueSeason(leagueName);
}

function deleteCompleteSeason(seasonName) {
    window.footballSim.deleteCompleteSeason(seasonName);
}

function resetMatchResult(matchIndex) {
    window.footballSim.resetMatchResult(matchIndex);
}

function simulateWeekFixtures(leagueName, week) {
    window.footballSim.simulateWeekFixtures(leagueName, week);
}

function updateFixtureView() {
    window.footballSim.updateFixtureView();
}

function previousWeek() {
    window.footballSim.previousWeek();
}

function nextWeek() {
    window.footballSim.nextWeek();
}

function simulateCurrentWeek() {
    window.footballSim.simulateCurrentWeek();
}

function simulateSingleMatch(homeTeamName, awayTeamName, leagueName, week) {
    window.footballSim.simulateSingleMatch(homeTeamName, awayTeamName, leagueName, week);
}

function removeMatchResult(homeTeamName, awayTeamName, leagueName) {
    window.footballSim.removeMatchResult(homeTeamName, awayTeamName, leagueName);
}

function filterTeamPoints() {
    window.footballSim.filterTeamPoints();
}

function showTeamProfile(teamName) {
    window.footballSim.showTeamProfile(teamName);
}

function showMatchDetails(homeTeam, awayTeam, date) {
    // Legacy - try to find match by teams
    const match = window.footballSim.matches.find(m => m.homeTeam === homeTeam && m.awayTeam === awayTeam);
    if (match && match.id) {
        window.footballSim.showMatchDetailsEnhanced(match.id);
    }
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    // Validate and import data
                    if (data.teams && Array.isArray(data.teams)) {
                        window.footballSim.teams = data.teams;
                    }
                    if (data.matches && Array.isArray(data.matches)) {
                        window.footballSim.matches = data.matches;
                    }
                    // Import other data...
                    window.footballSim.saveData();
                    alert('Veri başarıyla içe aktarıldı!');
                    location.reload();
                } catch (error) {
                    alert('Dosya formatı hatalı!');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Initialize the application when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.footballSim = new FootballSimulation();
});
