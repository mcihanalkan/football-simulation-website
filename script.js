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

    // Match Simulation Engine (0.5-9.9 reyting)
    simulateMatch(homeTeam, awayTeam, isEuropean = false) {
        const homeAdvantageBoost = (this.settings.homeAdvantage / 100) * 0.15;
        const homeRating = this.normalizeRating(homeTeam.rating) + (isEuropean ? homeAdvantageBoost * 0.8 : homeAdvantageBoost);
        const awayRating = this.normalizeRating(awayTeam.rating);
        
        // More balanced probability calculation
        const ratingDiff = homeRating - awayRating;
        
        // Reduced sensitivity to prevent extreme results
        let homeWinProb = 0.45 + (ratingDiff * 0.06) * (this.settings.ratingEffect / 100);
        
        // Consistent draw probability
        const drawProb = Math.max(0.20, 0.32 - (Math.abs(ratingDiff) * 0.02));
        
        // Ensure more balanced probabilities
        homeWinProb = Math.max(0.15, Math.min(0.70, homeWinProb));
        const awayWinProb = Math.max(0.15, 1 - homeWinProb - drawProb);
        
        // Normalize probabilities
        const totalProb = homeWinProb + drawProb + awayWinProb;
        const normalizedHomeWin = homeWinProb / totalProb;
        const normalizedDraw = drawProb / totalProb;
        
        const random = Math.random();
        let result;
        
        if (random < normalizedHomeWin) {
            result = 'H';
        } else if (random < normalizedHomeWin + normalizedDraw) {
            result = 'D';
        } else {
            result = 'A';
        }

        // More realistic goal generation
        let homeGoals, awayGoals;
        
        if (result === 'D') {
            // For draws, ensure both teams have same goals
            const drawGoals = Math.floor(Math.random() * 3); // 0, 1, or 2 goals typically
            homeGoals = drawGoals;
            awayGoals = drawGoals;
        } else {
            homeGoals = this.generateGoals(homeRating, awayRating, result === 'H');
            awayGoals = this.generateGoals(awayRating, homeRating, result === 'A');
            
            // Ensure winner has more goals
            if (result === 'H' && homeGoals <= awayGoals) {
                homeGoals = awayGoals + 1;
            } else if (result === 'A' && awayGoals <= homeGoals) {
                awayGoals = homeGoals + 1;
            }
        }

        return {
            homeTeam: homeTeam.name,
            awayTeam: awayTeam.name,
            homeGoals: Math.min(homeGoals, 5), // Cap at 5 goals max
            awayGoals: Math.min(awayGoals, 5), // Cap at 5 goals max
            result,
            season: this.currentSeason,
            date: new Date().toISOString().split('T')[0]
        };
    }

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
            <div class="team-card">
                <div class="team-actions">
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
            <div class="table-responsive">
                <table class="league-table">
                    <thead>
                        <tr>
                            <th>Pos</th>
                            <th>Takım</th>
                            <th>O</th>
                            <th>G</th>
                            <th>B</th>
                            <th>M</th>
                            <th>A</th>
                            <th>Y</th>
                            <th>AV</th>
                            <th>P</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${standings.map((team, index) => {
                            const position = index + 1;
                            let rowClass = this.getPositionClass(position, leagueName, europeanSpots);
                            
                            return `
                                <tr class="${rowClass}">
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
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
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
            <div class="season-fixtures-section">
                <h4>${viewSeason} Sezonu Maç Sonuçları</h4>
                <div id="league-season-fixtures">${this.renderSeasonFixturesByWeek(leagueName, viewSeason, leagueMatches)}</div>
            </div>
        `;
    }

    renderSeasonFixturesByWeek(leagueName, season, leagueMatches) {
        const byWeek = {};
        leagueMatches.forEach(m => {
            const w = m.week || 1;
            if (!byWeek[w]) byWeek[w] = [];
            byWeek[w].push(m);
        });
        const weeks = Object.keys(byWeek).map(Number).sort((a, b) => a - b);
        if (weeks.length === 0) return '<p class="no-data">Bu sezona ait maç kaydı yok.</p>';
        return weeks.map(week => `
            <div class="week-results-block">
                <strong>Hafta ${week}</strong>
                <ul class="week-results-list">
                    ${byWeek[week].map(m => `<li>${m.homeTeam} ${m.homeGoals} - ${m.awayGoals} ${m.awayTeam}</li>`).join('')}
                </ul>
            </div>
        `).join('');
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
            <div class="match-card" onclick="showMatchDetails('${match.homeTeam}', '${match.awayTeam}', '${match.date}')">
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
            
            html += `
                <div class="european-match-container">
                    <div class="european-matches-section">
                        <h4>🏆 Grup Maçları</h4>
                        <div class="match-progress-info">
                            <p>Maç Durumu: ${totalPlayed}/${totalMatches} (${Math.round(totalPlayed/totalMatches*100)}%)</p>
                            <div class="draw-progress">
                                <div class="draw-progress-fill" style="width: ${(totalPlayed/totalMatches*100)}%"></div>
                            </div>
                        </div>
            `;
            
            // Maç günlerini göster (9 maç günü)
            const maxMatchday = Math.max(...state.groupMatches.map(m => m.matchday), 9);
            for (let md = 1; md <= maxMatchday; md++) {
                const matches = state.groupMatches.filter(m => m.matchday === md);
                const played = matches.filter(m => m.homeGoals != null).length;
                
                // Gruplara göre maçları ayır
                const groupMatches = { 1: [], 2: [], 3: [], 4: [] };
                matches.forEach(m => {
                    if (groupMatches[m.group]) {
                        groupMatches[m.group].push(m);
                    }
                });
                
                html += `
                    <div class="european-matchday-block">
                        <h5>${md}. Maç Günü (${played}/${matches.length} maç oynandı)</h5>
                        ${played < matches.length ? `<button class="btn btn-xs btn-primary mb-2" onclick="window.footballSim.simulateEuropeanMatchday('${comp}', ${md});">Bu günü simüle et</button>` : ''}
                        
                        <div class="groups-grid">
                            ${Object.entries(groupMatches).map(([groupNum, groupMatches]) => `
                                <div class="group-section">
                                    <h6>🏆 Grup ${groupNum}</h6>
                                    <ul class="european-fixtures-list">
                                        ${groupMatches.map(m => {
                                            const score = m.homeGoals != null ? `<span class="european-match-score">${m.homeGoals}-${m.awayGoals}</span>` : '';
                                            const btn = m.homeGoals == null ? `<button class="btn btn-xs btn-primary" onclick="window.footballSim.simulateEuropeanGroupMatch('${comp}', '${m.homeTeam.replace(/'/g, "\\'")}', '${m.awayTeam.replace(/'/g, "\\'")}', ${md});">Simüle et</button>` : '';
                                            return `
                                                <li>
                                                    <div class="european-match-teams">
                                                        ${m.homeTeam} - ${m.awayTeam} ${score}
                                                    </div>
                                                    <div class="european-match-actions">
                                                        ${btn}
                                                    </div>
                                                </li>
                                            `;
                                        }).join('')}
                                    </ul>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            
            html += `</div>`;
            
            // Anlık puan durumu paneli (36 takım genel sıralama)
            html += `
                <div class="european-live-standings">
                    <h4>🏆 Genel Puan Durumu (36 Takım)</h4>
                    <div class="european-standings-table-wrap">
                        <table class="european-standings-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Takım</th>
                                    <th>O</th>
                                    <th>G</th>
                                    <th>B</th>
                                    <th>M</th>
                                    <th>A</th>
                                    <th>P</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            standings.forEach((s, i) => {
                const pos = i + 1;
                let positionClass = '';
                if (pos >= 1 && pos <= 9) positionClass = 'standing-position-1-9'; // Grup 1. ve 2.
                else if (pos >= 10 && pos <= 18) positionClass = 'standing-position-10-18'; // Grup 3. ve 4.
                else if (pos >= 19 && pos <= 27) positionClass = 'standing-position-19-27'; // Grup 5. ve 6.
                else if (pos >= 28 && pos <= 36) positionClass = 'standing-position-28-36'; // Grup 7. ve 8.
                
                html += `
                    <tr class="${positionClass}">
                        <td><strong>${pos}</strong></td>
                        <td>${s.name}</td>
                        <td>${s.played}</td>
                        <td>${s.won}</td>
                        <td>${s.drawn}</td>
                        <td>${s.lost}</td>
                        <td>${s.goalsFor}-${s.goalsAgainst}</td>
                        <td><strong>${s.points}</strong></td>
                    </tr>
                `;
            });
            
            html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            `;
            
            // Tüm maçlar bittiğinde playoff kurası butonu
            if (allPlayed) {
                html += `<div style="text-align: center; margin-top: 1rem;">
                    <button class="btn btn-success" onclick="window.footballSim.openPlayoffDraw('${comp}');">
                        <i class="fas fa-random"></i> Playoff Kura Çekimi
                    </button>
                </div>`;
            } else {
                html += `<div style="text-align: center; margin-top: 1rem;">
                    <p style="color: #666;">Playoff kurası için tüm maçların bitmesi gerekli (${totalPlayed}/${totalMatches})</p>
                </div>`;
            }
        }

        if (state.phase === 'playoff_draw') {
            const st = state.standingsOrder || [];
            
            // Sıralı eşleşme grupları
            const playoffGroups = [
                { name: 'Eşleşme 1', high: st.slice(8, 10), low: st.slice(22, 24) }, // 9-10 vs 23-24
                { name: 'Eşleşme 2', high: st.slice(10, 12), low: st.slice(20, 22) }, // 11-12 vs 21-22
                { name: 'Eşleşme 3', high: st.slice(12, 14), low: st.slice(18, 20) }, // 13-14 vs 19-20
                { name: 'Eşleşme 4', high: st.slice(14, 16), low: st.slice(16, 18) }  // 15-16 vs 17-18
            ];
            
            const drawn = new Set(state.playoffPairs.flatMap(p => [p.team1, p.team2]));
            
            // Takımların lig bilgilerini al
            const getTeamLeague = (teamName) => {
                const team = this.teams.find(t => t.name === teamName);
                return team ? team.league : '';
            };
            
            html += `
                <div class="draw-ceremony">
                    <h4>🎯 Playoff Kura Çekimi</h4>
                    <p>Sıralı playoff eşleşmeleri (9-24 arası takımlar)</p>
                    
                    <div class="draw-progress">
                        <div class="draw-progress-fill" style="width: ${(state.playoffPairs.length / 4 * 100)}%"></div>
                    </div>
                    
                    <div class="draw-pairs-container">
                        ${state.playoffPairs.map(pair => `
                            <div class="draw-pair">
                                <div class="draw-pair-teams">
                                    ${pair.team1} <span class="vs">vs</span> ${pair.team2}
                                </div>
                                <div class="draw-pair-league">${getTeamLeague(pair.team1)} vs ${getTeamLeague(pair.team2)}</div>
                            </div>
                        `).join('')}
                        
                        ${Array(4 - state.playoffPairs.length).fill(0).map((_, index) => {
                            const groupIndex = state.playoffPairs.length;
                            if (groupIndex < playoffGroups.length) {
                                const group = playoffGroups[groupIndex];
                                return `
                                    <div class="draw-pair" style="opacity: 0.6; border-style: dashed;">
                                        <div class="draw-pair-teams">
                                            <span style="color: #94a3b8;">${group.name} bekleniyor</span>
                                        </div>
                                        <div class="draw-pair-league" style="font-size: 0.7rem;">
                                            Sıra ${groupIndex === 0 ? '9-10' : groupIndex === 1 ? '11-12' : groupIndex === 2 ? '13-14' : '15-16'} vs 
                                            Sıra ${groupIndex === 0 ? '23-24' : groupIndex === 1 ? '21-22' : groupIndex === 2 ? '19-20' : '17-18'}
                                        </div>
                                    </div>
                                `;
                            }
                            return '';
                        }).join('')}
                    </div>
            `;
            
            // Sadece tamamlanmamış eşleşmeler için seçim alanı
            if (state.playoffPairs.length < 4) {
                const currentGroup = playoffGroups[state.playoffPairs.length];
                if (currentGroup) {
                    const selectedTeam = state._playoffTemp?.selectedTeam;
                    const revealedTeam = state._playoffTemp?.revealedTeam;
                    
                    html += `
                        <div class="draw-selection-area">
                            <h5>${currentGroup.name}: Sıralı Eşleşme</h5>
                            <p style="text-align: center; margin-bottom: 1rem;">
                                Sıra ${state.playoffPairs.length === 0 ? '9-10' : state.playoffPairs.length === 1 ? '11-12' : state.playoffPairs.length === 2 ? '13-14' : '15-16'} vs 
                                Sıra ${state.playoffPairs.length === 0 ? '23-24' : state.playoffPairs.length === 1 ? '21-22' : state.playoffPairs.length === 2 ? '19-20' : '17-18'}
                            </p>
                            
                            ${selectedTeam && !revealedTeam ? `
                                <div class="draw-status warning">
                                    ⚠️ Bir takım seçtiniz. Topa basarak takımı görün.
                                    <br><small>Seçilen takım: <strong>????</strong></small>
                                </div>
                            ` : selectedTeam && revealedTeam ? `
                                <div class="draw-status">
                                    ✅ Seçilen takım: <strong>${revealedTeam}</strong> - Şimdi rakibini seçin
                                </div>
                            ` : `
                                <div class="draw-status">
                                    🎯 İlk takımı seçin (üst sıra veya alt sıra)
                                </div>
                            `}
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div>
                                    <h6 style="text-align: center; margin-bottom: 0.5rem;">🥇 Üst Sıra (9-16)</h6>
                                    <div class="draw-teams-grid">
                                        ${currentGroup.high.map((team, index) => {
                                            if (drawn.has(team)) return '';
                                            
                                            // Seçili takım ise gizle
                                            if (selectedTeam === team && !revealedTeam) {
                                                return `
                                                    <div class="draw-team-button selected" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; cursor: pointer;" onclick="window.footballSim.revealSelectedTeam()">
                                                        🔒 Seçildi (Tıkla Göster)
                                                    </div>
                                                `;
                                            }
                                            
                                            // Seçili ve gösterilmiş takım
                                            if (selectedTeam === team && revealedTeam) {
                                                return `
                                                    <div class="draw-team-button selected" style="background: linear-gradient(135deg, #10b981, #059669); color: white;">
                                                        ✅ ${team}
                                                    </div>
                                                `;
                                            }
                                            
                                            // Seçili takım varsa ve bu rakip adayı ise
                                            if (selectedTeam && team !== selectedTeam) {
                                                const teamLeague = getTeamLeague(team);
                                                const selectedLeague = getTeamLeague(selectedTeam);
                                                const isDisabled = teamLeague === selectedLeague;
                                                
                                                return `
                                                    <button class="draw-team-button ${isDisabled ? 'disabled' : ''}" 
                                                            onclick="window.footballSim._playoffPick('${state.playoffPairs.length}', null, '${team.replace(/'/g, "\\'")}')"
                                                            ${isDisabled ? 'disabled title="Aynı ligden takımlar eşleşemez"' : ''}>
                                                        ${team}
                                                        ${isDisabled ? '<span class="team-league">' + teamLeague + '</span>' : ''}
                                                    </button>
                                                `;
                                            }
                                            
                                            // Normal seçim
                                            return `
                                                <button class="draw-team-button" 
                                                        onclick="window.footballSim._playoffPick('${state.playoffPairs.length}', '${team.replace(/'/g, "\\'")}', null)">
                                                    ${team}
                                                </button>
                                            `;
                                        }).filter(Boolean).join('')}
                                    </div>
                                </div>
                                
                                <div>
                                    <h6 style="text-align: center; margin-bottom: 0.5rem;">🎯 Alt Sıra (17-24)</h6>
                                    <div class="draw-teams-grid">
                                        ${currentGroup.low.map((team, index) => {
                                            if (drawn.has(team)) return '';
                                            
                                            // Seçili takım ise gizle
                                            if (selectedTeam === team && !revealedTeam) {
                                                return `
                                                    <div class="draw-team-button selected" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; cursor: pointer;" onclick="window.footballSim.revealSelectedTeam()">
                                                        🔒 Seçildi (Tıkla Göster)
                                                    </div>
                                                `;
                                            }
                                            
                                            // Seçili ve gösterilmiş takım
                                            if (selectedTeam === team && revealedTeam) {
                                                return `
                                                    <div class="draw-team-button selected" style="background: linear-gradient(135deg, #10b981, #059669); color: white;">
                                                        ✅ ${team}
                                                    </div>
                                                `;
                                            }
                                            
                                            // Seçili takım varsa ve bu rakip adayı ise
                                            if (selectedTeam && team !== selectedTeam) {
                                                const teamLeague = getTeamLeague(team);
                                                const selectedLeague = getTeamLeague(selectedTeam);
                                                const isDisabled = teamLeague === selectedLeague;
                                                
                                                return `
                                                    <button class="draw-team-button ${isDisabled ? 'disabled' : ''}" 
                                                            onclick="window.footballSim._playoffPick('${state.playoffPairs.length}', null, '${team.replace(/'/g, "\\'")}')"
                                                            ${isDisabled ? 'disabled title="Aynı ligden takımlar eşleşemez"' : ''}>
                                                        ${team}
                                                        ${isDisabled ? '<span class="team-league">' + teamLeague + '</span>' : ''}
                                                    </button>
                                                `;
                                            }
                                            
                                            // Normal seçim
                                            return `
                                                <button class="draw-team-button" 
                                                        onclick="window.footballSim._playoffPick('${state.playoffPairs.length}', null, '${team.replace(/'/g, "\\'")}')">
                                                    ${team}
                                                </button>
                                            `;
                                        }).filter(Boolean).join('')}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="draw-actions">
                                ${selectedTeam ? `
                                    <button class="btn btn-secondary" onclick="window.footballSim._playoffPick('${state.playoffPairs.length}', null, null)">
                                        Seçimi İptal Et
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }
            }
            
            html += `</div>`;
        }

        if (state.phase === 'playoff') {
            html += `<h4>Playoff (İki maçlı)</h4>`;
            (state.playoffResults || []).forEach((pair, i) => {
                const l1 = pair.leg1Home != null ? `${pair.leg1Home}-${pair.leg1Away}` : '-';
                const l2 = pair.leg2Home != null ? `${pair.leg2Home}-${pair.leg2Away}` : '-';
                const leg1Btn = pair.leg1Home == null ? `<button class="btn btn-sm" onclick="window.footballSim.simulatePlayoffLeg('${comp}', ${i}, 1);">1. maç simüle</button>` : '';
                const leg2Btn = pair.leg2Home == null ? `<button class="btn btn-sm" onclick="window.footballSim.simulatePlayoffLeg('${comp}', ${i}, 2);">2. maç simüle</button>` : '';
                html += `<div class="playoff-tie">${pair.team1} vs ${pair.team2} — 1. maç: ${l1} ${leg1Btn} | 2. maç: ${l2} ${leg2Btn}</div>`;
            });
            const allPlayoffDone = (state.playoffResults || []).every(p => p.leg1Home != null && p.leg2Home != null);
            if (allPlayoffDone) html += `<button class="btn btn-success mt-2" onclick="window.footballSim.openR16Draw('${comp}');"><i class="fas fa-random"></i> Son 16 Kura Çekimi</button>`;
        }

        if (state.phase === 'r16_draw') {
            const seeded = state.r16Seeded || [];
            const unseeded = state.r16Unseeded || [];
            const usedS = new Set(state.r16Pairs.flatMap(p => [p.team1]));
            const usedU = new Set(state.r16Pairs.flatMap(p => [p.team2]));
            
            // Takımların lig bilgilerini al
            const getTeamLeague = (teamName) => {
                const team = this.teams.find(t => t.name === teamName);
                return team ? team.league : '';
            };
            
            html += `
                <div class="draw-ceremony">
                    <h4>🏆 Son 16 Kura Çekimi</h4>
                    <p>Seri başı (1-8) ve playoff kazananları eşleşiyor (aynı ligden takımlar eşleşemez)</p>
                    
                    <div class="draw-progress">
                        <div class="draw-progress-fill" style="width: ${(state.r16Pairs.length / 8 * 100)}%"></div>
                    </div>
                    
                    <div class="draw-pairs-container">
                        ${state.r16Pairs.map(pair => `
                            <div class="draw-pair">
                                <div class="draw-pair-teams">
                                    ${pair.team1} <span class="vs">vs</span> ${pair.team2}
                                </div>
                                <div class="draw-pair-league">${getTeamLeague(pair.team1)} vs ${getTeamLeague(pair.team2)}</div>
                            </div>
                        `).join('')}
                        
                        ${Array(8 - state.r16Pairs.length).fill(0).map((_, index) => `
                            <div class="draw-pair" style="opacity: 0.6; border-style: dashed;">
                                <div class="draw-pair-teams">
                                    <span style="color: #94a3b8;">Eşleşme ${state.r16Pairs.length + index + 1} bekleniyor</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="draw-selection-area">
                        <h5>Sıra ${state.r16Pairs.length + 1}. Eşleşme İçin Takım Seçimi</h5>
                        ${state._r16Temp && state._r16Temp[comp] ? `
                            <div class="draw-status">
                                Seçilen takım: <strong>${state._r16Temp[comp].seeded != null ? seeded[state._r16Temp[comp].seeded] : unseeded[state._r16Temp[comp].unseeded]}</strong> - Şimdi rakibini seçin
                            </div>
                        ` : ''}
                        
                        <div class="r16-draw-wrap">
                            <div class="bowl">
                                <strong>🥇 Seri Başları (1-8)</strong>
                                <div class="draw-teams-grid">
                                    ${seeded.map((t, i) => {
                                        if (!t || usedS.has(t)) return '';
                                        
                                        const teamLeague = getTeamLeague(t);
                                        const selectedUnseed = state._r16Temp && state._r16Temp[comp] && state._r16Temp[comp].unseeded != null ? unseeded[state._r16Temp[comp].unseeded] : null;
                                        const selectedLeague = selectedUnseed ? getTeamLeague(selectedUnseed) : '';
                                        const isDisabled = selectedUnseed && teamLeague === selectedLeague;
                                        
                                        return `
                                            <button class="draw-team-button ${state._r16Temp && state._r16Temp[comp] && state._r16Temp[comp].seeded === i ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}" 
                                                    onclick="window.footballSim._r16Pick('${comp}', 's', ${i})"
                                                    ${isDisabled ? 'disabled title="Aynı ligden takımlar eşleşemez"' : ''}>
                                                ${t}
                                                ${isDisabled ? '<span class="team-league">' + teamLeague + '</span>' : ''}
                                            </button>
                                        `;
                                    }).filter(Boolean).join('')}
                                </div>
                            </div>
                            
                            <div class="bowl">
                                <strong>🎯 Playoff Kazananları</strong>
                                <div class="draw-teams-grid">
                                    ${unseeded.map((t, i) => {
                                        if (!t || usedU.has(t)) return '';
                                        
                                        const teamLeague = getTeamLeague(t);
                                        const selectedSeed = state._r16Temp && state._r16Temp[comp] && state._r16Temp[comp].seeded != null ? seeded[state._r16Temp[comp].seeded] : null;
                                        const selectedLeague = selectedSeed ? getTeamLeague(selectedSeed) : '';
                                        const isDisabled = selectedSeed && teamLeague === selectedLeague;
                                        
                                        return `
                                            <button class="draw-team-button ${state._r16Temp && state._r16Temp[comp] && state._r16Temp[comp].unseeded === i ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}" 
                                                    onclick="window.footballSim._r16Pick('${comp}', 'u', ${i})"
                                                    ${isDisabled ? 'disabled title="Aynı ligden takımlar eşleşemez"' : ''}>
                                                ${t}
                                                ${isDisabled ? '<span class="team-league">' + teamLeague + '</span>' : ''}
                                            </button>
                                        `;
                                    }).filter(Boolean).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <div class="draw-actions">
                            ${state._r16Temp && state._r16Temp[comp] ? `
                                <button class="btn btn-secondary" onclick="window.footballSim._r16Pick('${comp}', null, null)">
                                    Seçimi İptal Et
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }

        if (state.phase === 'r16') {
            html += `<h4>Son 16</h4><p>Kura tamamlandı. Maç simülasyonu bu aşamada eklenebilir.</p>`;
            
            // Son 16 maçları varsa ve hepsi oynandıysa çeyrek final kurası butonu
            const r16Results = state.knockoutResults.r16 || [];
            const allR16Played = r16Results.length === 8 && r16Results.every(r => r.homeGoals != null && r.awayGoals != null);
            
            if (allR16Played) {
                html += `<div style="text-align: center; margin-top: 1rem;">
                    <button class="btn btn-success" onclick="window.footballSim.openQFDraw('${comp}');">
                        <i class="fas fa-random"></i> Çeyrek Final Kura Çekimi
                    </button>
                </div>`;
            }
        }

        if (state.phase === 'qf_draw') {
            const r16Winners = this.getR16Winners(comp);
            if (r16Winners.length === 8) {
                const used = new Set(state.qfPairs || []);
                
                // Takımların lig bilgilerini al
                const getTeamLeague = (teamName) => {
                    const team = this.teams.find(t => t.name === teamName);
                    return team ? team.league : '';
                };
                
                html += `
                    <div class="draw-ceremony">
                        <h4>🏆 Çeyrek Final Kura Çekimi</h4>
                        <p>Son 16 kazananları eşleşiyor (aynı ligden takımlar eşleşemez)</p>
                        
                        <div class="draw-progress">
                            <div class="draw-progress-fill" style="width: ${(state.qfPairs.length / 4 * 100)}%"></div>
                        </div>
                        
                        <div class="draw-pairs-container">
                            ${state.qfPairs.map(pair => `
                                <div class="draw-pair">
                                    <div class="draw-pair-teams">
                                        ${pair.team1} <span class="vs">vs</span> ${pair.team2}
                                    </div>
                                    <div class="draw-pair-league">${getTeamLeague(pair.team1)} vs ${getTeamLeague(pair.team2)}</div>
                                </div>
                            `).join('')}
                            
                            ${Array(4 - state.qfPairs.length).fill(0).map((_, index) => `
                                <div class="draw-pair" style="opacity: 0.6; border-style: dashed;">
                                    <div class="draw-pair-teams">
                                        <span style="color: #94a3b8;">Eşleşme ${state.qfPairs.length + index + 1} bekleniyor</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="draw-selection-area">
                            <h5>Sıra ${state.qfPairs.length + 1}. Eşleşme İçin Takım Seçimi</h5>
                            ${state._qfTemp && state._qfTemp[comp] ? `
                                <div class="draw-status">
                                    Seçilen takım: <strong>${state._qfTemp[comp].teamA}</strong> - Şimdi rakibini seçin
                                </div>
                            ` : ''}
                            
                            <div class="qf-draw-container">
                                ${r16Winners.map((team, index) => {
                                    if (used.has(team)) return '';
                                    
                                    const teamLeague = getTeamLeague(team);
                                    const selectedTeam = state._qfTemp && state._qfTemp[comp] ? state._qfTemp[comp].teamA : null;
                                    const selectedLeague = selectedTeam ? getTeamLeague(selectedTeam) : '';
                                    const isDisabled = selectedTeam && teamLeague === selectedLeague;
                                    
                                    if (selectedTeam && team !== selectedTeam) {
                                        // Rakip seçimi
                                        return `
                                            <button class="draw-team-button qf-opponent ${isDisabled ? 'disabled' : ''}" 
                                                    onclick="window.footballSim._qfPick('${comp}', '${selectedTeam.replace(/'/g, "\\'")}', '${team.replace(/'/g, "\\'")}')"
                                                    ${isDisabled ? 'disabled title="Aynı ligden takımlar eşleşemez"' : ''}>
                                                ${team}
                                                ${isDisabled ? '<span class="team-league">' + teamLeague + '</span>' : ''}
                                            </button>
                                        `;
                                    } else if (!selectedTeam) {
                                        // İlk takım seçimi
                                        return `
                                            <button class="draw-team-button qf-first" 
                                                    onclick="window.footballSim._qfPick('${comp}', '${team.replace(/'/g, "\\'")}', null)">
                                                ${team}
                                            </button>
                                        `;
                                    }
                                    return '';
                                }).filter(Boolean).join('')}
                            </div>
                            
                            <div class="draw-actions">
                                ${state._qfTemp && state._qfTemp[comp] ? `
                                    <button class="btn btn-secondary" onclick="window.footballSim._qfPick('${comp}', null, null)">
                                        Seçimi İptal Et
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        if (state.phase === 'qf') {
            html += `<h4>Çeyrek Final</h4><p>Çeyrek final eşleşmeleri tamamlandı. Yarı final için maçlar simüle edilebilir.</p>`;
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

    // Seçili takımı göster
    revealSelectedTeam() {
        const state = this.getEuropeanPlayableState('UCL');
        if (state._playoffTemp && state._playoffTemp.selectedTeam) {
            state._playoffTemp.revealedTeam = state._playoffTemp.selectedTeam;
            this.showEuropeanCompetition('ucl');
        }
    }

    _playoffPick(groupIndex, teamA, teamB) {
        const state = this.getEuropeanPlayableState('UCL'); // Tüm kupalar aynı state'i kullanıyor
        
        if (!state._playoffTemp) state._playoffTemp = {};
        
        if (teamA && !teamB) {
            // İlk takım seçimi - gizli yap
            state._playoffTemp.selectedTeam = teamA;
            state._playoffTemp.currentGroup = groupIndex;
            state._playoffTemp.revealedTeam = null; // Yeni seçimde revealed sıfırla
            this.showEuropeanCompetition('ucl');
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
            
            if (leagueA === leagueB) {
                alert('Aynı ligden takımlar eşleşemez! Otomatik olarak başka takımlar eşleştiriliyor.');
                this.autoPlayoffPairing(groupIndex);
                return;
            }
            
            // Eşleşmeyi kaydet
            if (!state.playoffPairs) state.playoffPairs = [];
            state.playoffPairs.push({ team1: teamA, team2: teamB });
            state._playoffTemp.selectedTeam = null;
            state._playoffTemp.currentGroup = null;
            
            this.saveData();
            this.showEuropeanCompetition('ucl');
            return;
        }
        
        // İptal
        state._playoffTemp.selectedTeam = null;
        state._playoffTemp.currentGroup = null;
        this.showEuropeanCompetition('ucl');
    }

    // Otomatik playoff eşleştirme (aynı ligden takımlar varsa)
    autoPlayoffPairing(groupIndex) {
        const state = this.getEuropeanPlayableState('UCL');
        const st = state.standingsOrder || [];
        
        const playoffGroups = [
            { high: st.slice(8, 10), low: st.slice(22, 24) }, // 9-10 vs 23-24
            { high: st.slice(10, 12), low: st.slice(20, 22) }, // 11-12 vs 21-22
            { high: st.slice(12, 14), low: st.slice(18, 20) }, // 13-14 vs 19-20
            { high: st.slice(14, 16), low: st.slice(16, 18) }  // 15-16 vs 17-18
        ];
        
        const drawn = new Set(state.playoffPairs.flatMap(p => [p.team1, p.team2]));
        const getTeamLeague = (teamName) => {
            const team = this.teams.find(t => t.name === teamName);
            return team ? team.league : '';
        };
        
        const currentGroup = playoffGroups[groupIndex];
        const availableHigh = currentGroup.high.filter(t => !drawn.has(t));
        const availableLow = currentGroup.low.filter(t => !drawn.has(t));
        
        // Aynı ligden takımları engelleyerek otomatik eşleştir
        for (let highTeam of availableHigh) {
            const highLeague = getTeamLeague(highTeam);
            for (let lowTeam of availableLow) {
                const lowLeague = getTeamLeague(lowTeam);
                
                if (highLeague !== lowLeague) {
                    // Eşleşmeyi kaydet
                    state.playoffPairs.push({ team1: highTeam, team2: lowTeam });
                    state._playoffTemp.selectedTeam = null;
                    state._playoffTemp.currentGroup = null;
                    
                    this.saveData();
                    this.showEuropeanCompetition('ucl');
                    return;
                }
            }
        }
        
        alert('Bu grup için uygun eşleşme bulunamadı!');
    }

    _r16Pick(comp, which, index) {
        const state = this.getEuropeanPlayableState(comp.toUpperCase());
        if (!state._r16Temp) state._r16Temp = {};
        if (which === 's') state._r16Temp[comp] = { seeded: index, unseeded: state._r16Temp[comp]?.unseeded };
        if (which === 'u') state._r16Temp[comp] = { seeded: state._r16Temp[comp]?.seeded, unseeded: index };
        const t = state._r16Temp[comp];
        if (t && t.seeded != null && t.unseeded != null) {
            this.drawR16Pair(comp, t.seeded, t.unseeded);
            state._r16Temp[comp] = null;
        }
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
        const getCountry = (name) => { 
            const t = this.teams.find(x => x.name === name); 
            return t ? (t.country || this.leagueToCountry[t.league] || '') : ''; 
        };
        
        // YENİ SİSTEM: 4 GRUPLU YAPI
        const byPot = {
            1: state.pots[1].map(n => ({ 
                id: n, 
                pot: 1, 
                total_match_count: 0, 
                home_count: 0, 
                away_count: 0, 
                opponents: new Set(), 
                pot_count: { 1: 0, 2: 0, 3: 0, 4: 0 },
                country: getCountry(n)
            })),
            2: state.pots[2].map(n => ({ 
                id: n, 
                pot: 2, 
                total_match_count: 0, 
                home_count: 0, 
                away_count: 0, 
                opponents: new Set(), 
                pot_count: { 1: 0, 2: 0, 3: 0, 4: 0 },
                country: getCountry(n)
            })),
            3: state.pots[3].map(n => ({ 
                id: n, 
                pot: 3, 
                total_match_count: 0, 
                home_count: 0, 
                away_count: 0, 
                opponents: new Set(), 
                pot_count: { 1: 0, 2: 0, 3: 0, 4: 0 },
                country: getCountry(n)
            })),
            4: state.pots[4].map(n => ({ 
                id: n, 
                pot: 4, 
                total_match_count: 0, 
                home_count: 0, 
                away_count: 0, 
                opponents: new Set(), 
                pot_count: { 1: 0, 2: 0, 3: 0, 4: 0 },
                country: getCountry(n)
            }))
        };
        
        const fixtures = [];
        
        // GRUP OLUŞTURMA
        const groups = {
            1: { teams: [], countryCount: {} },
            2: { teams: [], countryCount: {} },
            3: { teams: [], countryCount: {} },
            4: { teams: [], countryCount: {} }
        };
        
        // İlk 2 lig (İspanya, Almanya) - 5 takım gönderir
        const topCountries = ['Spain', 'Germany'];
        
        // Grup 1: Torba 1'den 3 takım + diğer torbalardan 2'şer takım
        this.distributeToGroup(groups[1], byPot[1].slice(0, 3), topCountries, 2);
        this.distributeToGroup(groups[1], byPot[2].slice(0, 2), topCountries, 1);
        this.distributeToGroup(groups[1], byPot[3].slice(0, 2), topCountries, 1);
        this.distributeToGroup(groups[1], byPot[4].slice(0, 2), topCountries, 1);
        
        // Grup 2: Torba 2'den 3 takım + diğer torbalardan 2'şer takım
        this.distributeToGroup(groups[2], byPot[2].slice(3, 6), topCountries, 2);
        this.distributeToGroup(groups[2], byPot[1].slice(3, 5), topCountries, 1);
        this.distributeToGroup(groups[2], byPot[3].slice(2, 4), topCountries, 1);
        this.distributeToGroup(groups[2], byPot[4].slice(2, 4), topCountries, 1);
        
        // Grup 3: Torba 3'ten 3 takım + diğer torbalardan 2'şer takım
        this.distributeToGroup(groups[3], byPot[3].slice(4, 7), topCountries, 2);
        this.distributeToGroup(groups[3], byPot[1].slice(5, 7), topCountries, 1);
        this.distributeToGroup(groups[3], byPot[2].slice(5, 7), topCountries, 1);
        this.distributeToGroup(groups[3], byPot[4].slice(4, 6), topCountries, 1);
        
        // Grup 4: Torba 4'ten 3 takım + diğer torbalardan 3'er takım
        this.distributeToGroup(groups[4], byPot[4].slice(6, 9), topCountries, 3);
        this.distributeToGroup(groups[4], byPot[1].slice(7, 9), topCountries, 1);
        this.distributeToGroup(groups[4], byPot[2].slice(7, 9), topCountries, 1);
        this.distributeToGroup(groups[4], byPot[3].slice(7, 9), topCountries, 1);
        
        // GRUP İÇİ FİKSTÜR OLUŞTURMA (9 maç günü)
        Object.keys(groups).forEach(groupNum => {
            const group = groups[groupNum];
            const groupFixtures = this.createGroupFixtures(group.teams);
            
            // Maç günlerini dağıt (her günde bir takım bay)
            groupFixtures.forEach((match, index) => {
                match.matchday = Math.floor(index / 6) + 1; // Her günde 6 maç (3 grup, 2 maç/grup)
                match.group = parseInt(groupNum);
                fixtures.push(match);
            });
        });
        
        // İç saha/deplasman dağılımı
        this.distributeHomeAway(fixtures);
        
        return fixtures;
    }
    
    // Gruba takım dağıtma (lig kısıtlaması ile)
    distributeToGroup(group, teams, topCountries, maxPerCountry) {
        teams.forEach(team => {
            const country = team.country;
            
            // Ülke kontrolü
            if (topCountries.includes(country)) {
                // İlk 2 lig için: bir grupta en fazla 2 takım
                if ((group.countryCount[country] || 0) < maxPerCountry) {
                    group.teams.push(team);
                    group.countryCount[country] = (group.countryCount[country] || 0) + 1;
                }
            } else {
                // Diğer ülkeler için: bir grupta en fazla 1 takım
                if ((group.countryCount[country] || 0) < 1) {
                    group.teams.push(team);
                    group.countryCount[country] = (group.countryCount[country] || 0) + 1;
                }
            }
        });
    }
    
    // Grup içi fikstür oluşturma
    createGroupFixtures(teams) {
        const fixtures = [];
        const teamCount = teams.length;
        
        // Her takım diğer tüm takımlarla 1 maç yapacak
        for (let i = 0; i < teamCount; i++) {
            for (let j = i + 1; j < teamCount; j++) {
                fixtures.push({
                    homeTeam: teams[i].id,
                    awayTeam: teams[j].id,
                    homeGoals: null,
                    awayGoals: null,
                    matchday: null
                });
            }
        }
        
        return fixtures;
    }
    
    // İç saha/deplasman dağılımı
    distributeHomeAway(fixtures) {
        const teamHomeCount = {};
        const teamAwayCount = {};
        
        fixtures.forEach(match => {
            const homeTeam = match.homeTeam;
            const awayTeam = match.awayTeam;
            
            teamHomeCount[homeTeam] = (teamHomeCount[homeTeam] || 0) + 1;
            teamAwayCount[awayTeam] = (teamAwayCount[awayTeam] || 0) + 1;
        });
        
        // Dengeli dağıtım için takas yap
        fixtures.forEach(match => {
            const homeTeam = match.homeTeam;
            const awayTeam = match.awayTeam;
            
            const homeDiff = (teamHomeCount[homeTeam] || 0) - (teamAwayCount[homeTeam] || 0);
            const awayDiff = (teamHomeCount[awayTeam] || 0) - (teamAwayCount[awayTeam] || 0);
            
            // Eğer ev sahibi çok fazla iç saha maçı yapıyorsa, takas yap
            if (homeDiff > 1 && awayDiff < -1) {
                match.homeTeam = awayTeam;
                match.awayTeam = homeTeam;
                
                teamHomeCount[homeTeam]--;
                teamAwayCount[homeTeam]++;
                teamHomeCount[awayTeam]++;
                teamAwayCount[awayTeam]--;
            }
        });
    }
    
    // KONTROL FONKSİYONU
    canCreateMatch(teamA, teamB, potB) {
        // ADIM 4 - KISIT KONTROLLERİ
        if (teamA.id === teamB.id) return false; // teamA ≠ teamB
        if (teamA.opponents.has(teamB.id)) return false; // teamB teamA.opponents içinde değil
        if (teamA.total_match_count >= 8) return false; // teamA.total_match_count < 8
        if (teamB.total_match_count >= 8) return false; // teamB.total_match_count < 8
        if (teamA.pot_count[potB] >= 2) return false; // teamA.pot_count[ilgiliPot] < 2
        if (teamB.pot_count[teamA.pot] >= 2) return false; // teamB.pot_count[ilgiliPot] < 2
        
        // AYNI LİG KONTROLÜ
        if (teamA.country === teamB.country) {
            // Aynı ülke takımları genellikle eşleşemez
            // Ancak mecburiyet durumunda en fazla 1 maç olabilir
            // Bu kontrolü daha üst seviyede yöneteceğiz
            return false; // Şimdilik tüm aynı lig maçlarını engelle
        }
        
        return true;
    }
    
    // TAKIM İSTATİSTİKLERİNİ GÜNCELLE
    updateTeamStats(teamA, teamB, potB) {
        teamA.opponents.add(teamB.id);
        teamB.opponents.add(teamA.id);
        
        teamA.pot_count[potB]++;
        teamB.pot_count[teamA.pot]++;
        
        teamA.total_match_count++;
        teamB.total_match_count++;
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
        const groups = [
            st.slice(8, 10), st.slice(10, 12), st.slice(12, 14), st.slice(14, 16),
            st.slice(16, 18), st.slice(18, 20), st.slice(20, 22), st.slice(22, 24)
        ];
        const pairOpponent = [7, 6, 5, 4, 3, 2, 1, 0];
        const pi = parseInt(pairIndex, 10);
        if (pi < 0 || pi > 3) return;
        const high = groups[pi], low = groups[pairOpponent[pi]];
        if (!high || !low || !high.includes(teamA) || !low.includes(teamB)) return;
        const country1 = this.teams.find(t => t.name === teamA)?.country || this.leagueToCountry[this.teams.find(t => t.name === teamA)?.league];
        const country2 = this.teams.find(t => t.name === teamB)?.country || this.leagueToCountry[this.teams.find(t => t.name === teamB)?.league];
        if (country1 === country2) { alert('Aynı ülke eşleşemez.'); return; }
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

    openR16Draw(comp) {
        const state = this.getEuropeanPlayableState(comp);
        const seeded = (state.standingsOrder || []).slice(0, 8);
        let playoffWinners = [];
        if (state.playoffResults) playoffWinners = state.playoffResults.map(p => {
            const g1 = (p.leg1Home || 0) + (p.leg2Away || 0);
            const g2 = (p.leg1Away || 0) + (p.leg2Home || 0);
            return g1 > g2 ? p.team1 : g2 > g1 ? p.team2 : (Math.random() > 0.5 ? p.team1 : p.team2);
        }).filter(Boolean);
        if (seeded.length !== 8 || playoffWinners.length !== 8) {
            alert('Önce playoff turlarını tamamlayın (8 eşleşme, her biri 2 maç).');
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
        const countryS = this.teams.find(t => t.name === s)?.country;
        const countryU = this.teams.find(t => t.name === u)?.country;
        if (countryS === countryU) return;
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
        state.knockoutResults.r16 = state.r16Pairs.map(() => ({}));
        this.saveData();
        this.showEuropeanCompetition(comp.toLowerCase());
    }

    // Son 16 kazananlarını belirle
    getR16Winners(comp) {
        const state = this.getEuropeanPlayableState(comp);
        const r16Results = state.knockoutResults.r16 || [];
        const winners = [];
        
        if (r16Results.length === 8) {
            r16Results.forEach((result, index) => {
                if (result.homeGoals != null && result.awayGoals != null) {
                    const pair = state.r16Pairs[index];
                    if (pair) {
                        const winner = result.homeGoals > result.awayGoals ? pair.team1 : pair.team2;
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

function showMatchDetails(homeTeam, awayTeam, date) {
    // This would show detailed match information
    console.log('Match details:', homeTeam, 'vs', awayTeam, date);
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
