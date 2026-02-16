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
        
        this.leagues = {
            'La Liga': { country: 'Spain', teams: 20, matches: 38, coefficient: 23.4, flag: '🇪🇸' },
            'Bundesliga': { country: 'Germany', teams: 18, matches: 34, coefficient: 19.2, flag: '🇩🇪' },
            'Premier League': { country: 'England', teams: 20, matches: 38, coefficient: 19.1, flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
            'Serie A': { country: 'Italy', teams: 20, matches: 38, coefficient: 18.3, flag: '🇮🇹' },
            'Süper Lig': { country: 'Turkey', teams: 18, matches: 34, coefficient: 18.0, flag: '🇹🇷' },
            'Ligue 1': { country: 'France', teams: 18, matches: 34, coefficient: 15.3, flag: '🇫🇷' },
            'Liga Portugal': { country: 'Portugal', teams: 8, matches: 14, coefficient: 15.2, flag: '🇵🇹' },
            'Scottish Premiership': { country: 'Scotland', teams: 12, matches: 22, coefficient: 12.0, flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
            'Czech First League': { country: 'Czech Republic', teams: 16, matches: 30, coefficient: 11.6, flag: '🇨🇿' },
            'Belgium Pro League': { country: 'Belgium', teams: 8, matches: 14, coefficient: 11.2, flag: '🇧🇪' },
            'Super League Greece': { country: 'Greece', teams: 14, matches: 26, coefficient: 10.5, flag: '🇬🇷' },
            'Austrian Bundesliga': { country: 'Austria', teams: 12, matches: 22, coefficient: 10.0, flag: '🇦🇹' },
            'Danish Superliga': { country: 'Denmark', teams: 12, matches: 22, coefficient: 8.7, flag: '🇩🇰' },
            'Ukrainian Premier League': { country: 'Ukraine', teams: 16, matches: 30, coefficient: 8.5, flag: '🇺🇦' },
            'Swiss Super League': { country: 'Switzerland', teams: 12, matches: 22, coefficient: 8.3, flag: '🇨🇭' },
            'Allsvenskan': { country: 'Sweden', teams: 16, matches: 30, coefficient: 8.3, flag: '🇸🇪' },
            'Eredivisie': { country: 'Netherlands', teams: 8, matches: 14, coefficient: 7.5, flag: '🇳🇱' },
            'Cypriot First Division': { country: 'Cyprus', teams: 12, matches: 22, coefficient: 6.7, flag: '🇨🇾' },
            'Ekstraklasa': { country: 'Poland', teams: 18, matches: 34, coefficient: 6.0, flag: '🇵🇱' },
            'Eliteserien': { country: 'Norway', teams: 16, matches: 30, coefficient: 6.0, flag: '🇳🇴' },
            'NB I': { country: 'Hungary', teams: 12, matches: 22, coefficient: 5.3, flag: '🇭🇺' },
            'HNL': { country: 'Croatia', teams: 10, matches: 18, coefficient: 4.3, flag: '🇭🇷' },
            'Liga 1': { country: 'Romania', teams: 16, matches: 30, coefficient: 4.3, flag: '🇷🇴' },
            'SuperLiga': { country: 'Serbia', teams: 16, matches: 30, coefficient: 3.5, flag: '🇷🇸' }
        };

        this.europeanCompetitions = {
            'UCL': { name: 'Champions League', stages: ['Group', 'R16', 'QF', 'SF', 'Final', 'Winner'] },
            'UEL': { name: 'Europa League', stages: ['Group', 'R16', 'QF', 'SF', 'Final', 'Winner'] },
            'UECL': { name: 'Conference League', stages: ['Group', 'R16', 'QF', 'SF', 'Final', 'Winner'] }
        };

        // New detailed European point system
        this.europeanPoints = {
            'UCL': {
                'Winner': 34, 'Final': 31, 'SF': 28, 'QF': 25,
                'R16_Direct': 22, 'R16_Playoff': 20, 'R24_Playoff': 17,
                'Group_25_26': 10, 'Group_27_28': 9, 'Group_29_30': 8,
                'Group_31_33': 7, 'Group_34_36': 6
            },
            'UEL': {
                'Winner': 30, 'Final': 27, 'SF': 24, 'QF': 21,
                'R16_Direct': 18, 'R16_Playoff': 16, 'R24_Playoff': 13,
                'Group_25_28': 6, 'Group_29_32': 5, 'Group_33_36': 4
            },
            'UECL': {
                'Winner': 27, 'Final': 24, 'SF': 21, 'QF': 18,
                'R16_Direct': 15, 'R16_Playoff': 13, 'R24_Playoff': 10,
                'Group_25_28': 4, 'Group_29_32': 3, 'Group_33_36': 2
            }
        };

        // European qualification allocation by country coefficient ranking
        this.europeanAllocation = {
            'UCL': {
                1: 5, 2: 5, 3: 4, 4: 4, 5: 3, 6: 3,
                7: 2, 8: 2, 9: 2, 10: 2, 11: 1, 12: 1, 13: 1, 14: 1
            },
            'UEL': {
                1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2,
                13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 1, 19: 1, 20: 1, 21: 1, 22: 1, 23: 1, 24: 1
            },
            'UECL': {
                1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1,
                11: 2, 12: 1, 13: 2, 14: 2, 15: 3, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2,
                23: 1, 24: 1
            }
        };

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
        this.updateStats();
        this.loadDefaultTeams();
        this.renderTeams();
        this.renderDashboard();
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
                this.renderTeams();
                break;
            case 'leagues':
                this.showLeagueTable('La Liga');
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

    initializeDefaultTeams() {
        const defaultTeams = [
            // Premier League (ratings converted to 0.5-9.9 scale)
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

            // Serie A (ratings converted to 0.5-9.9 scale)
            { name: 'Inter Milan', league: 'Serie A', country: 'Italy', rating: 9.3 },
            { name: 'Juventus', league: 'Serie A', country: 'Italy', rating: 9.2 },
            { name: 'AC Milan', league: 'Serie A', country: 'Italy', rating: 2650 },
            { name: 'Napoli', league: 'Serie A', country: 'Italy', rating: 2600 },
            { name: 'AS Roma', league: 'Serie A', country: 'Italy', rating: 2550 },
            { name: 'Lazio', league: 'Serie A', country: 'Italy', rating: 2500 },
            { name: 'Atalanta', league: 'Serie A', country: 'Italy', rating: 2450 },
            { name: 'Fiorentina', league: 'Serie A', country: 'Italy', rating: 2400 },
            { name: 'Bologna', league: 'Serie A', country: 'Italy', rating: 2350 },
            { name: 'Torino', league: 'Serie A', country: 'Italy', rating: 2300 },
            { name: 'Monza', league: 'Serie A', country: 'Italy', rating: 2250 },
            { name: 'Genoa', league: 'Serie A', country: 'Italy', rating: 2200 },
            { name: 'Lecce', league: 'Serie A', country: 'Italy', rating: 2150 },
            { name: 'Verona', league: 'Serie A', country: 'Italy', rating: 2100 },
            { name: 'Udinese', league: 'Serie A', country: 'Italy', rating: 2050 },
            { name: 'Cagliari', league: 'Serie A', country: 'Italy', rating: 2000 },
            { name: 'Empoli', league: 'Serie A', country: 'Italy', rating: 1950 },
            { name: 'Frosinone', league: 'Serie A', country: 'Italy', rating: 1900 },
            { name: 'Sassuolo', league: 'Serie A', country: 'Italy', rating: 1850 },
            { name: 'Salernitana', league: 'Serie A', country: 'Italy', rating: 1800 },

            // Bundesliga
            { name: 'Bayern Munich', league: 'Bundesliga', country: 'Germany', rating: 2850 },
            { name: 'Borussia Dortmund', league: 'Bundesliga', country: 'Germany', rating: 2700 },
            { name: 'RB Leipzig', league: 'Bundesliga', country: 'Germany', rating: 2600 },
            { name: 'Bayer Leverkusen', league: 'Bundesliga', country: 'Germany', rating: 2550 },
            { name: 'Eintracht Frankfurt', league: 'Bundesliga', country: 'Germany', rating: 2500 },
            { name: 'VfB Stuttgart', league: 'Bundesliga', country: 'Germany', rating: 2450 },
            { name: 'Borussia Monchengladbach', league: 'Bundesliga', country: 'Germany', rating: 2400 },
            { name: 'Union Berlin', league: 'Bundesliga', country: 'Germany', rating: 2350 },
            { name: 'SC Freiburg', league: 'Bundesliga', country: 'Germany', rating: 2300 },
            { name: '1. FC Koln', league: 'Bundesliga', country: 'Germany', rating: 2250 },
            { name: 'VfL Wolfsburg', league: 'Bundesliga', country: 'Germany', rating: 2200 },
            { name: 'Werder Bremen', league: 'Bundesliga', country: 'Germany', rating: 2150 },
            { name: 'FC Augsburg', league: 'Bundesliga', country: 'Germany', rating: 2100 },
            { name: 'Mainz 05', league: 'Bundesliga', country: 'Germany', rating: 2050 },
            { name: 'Hoffenheim', league: 'Bundesliga', country: 'Germany', rating: 2000 },
            { name: 'VfL Bochum', league: 'Bundesliga', country: 'Germany', rating: 1950 },
            { name: 'FC Heidenheim', league: 'Bundesliga', country: 'Germany', rating: 1900 },
            { name: 'SV Darmstadt', league: 'Bundesliga', country: 'Germany', rating: 1850 },

            // Ligue 1
            { name: 'Paris Saint-Germain', league: 'Ligue 1', country: 'France', rating: 2800 },
            { name: 'AS Monaco', league: 'Ligue 1', country: 'France', rating: 2550 },
            { name: 'Marseille', league: 'Ligue 1', country: 'France', rating: 2500 },
            { name: 'Lyon', league: 'Ligue 1', country: 'France', rating: 2450 },
            { name: 'Nice', league: 'Ligue 1', country: 'France', rating: 2400 },
            { name: 'Lille', league: 'Ligue 1', country: 'France', rating: 2350 },
            { name: 'Rennes', league: 'Ligue 1', country: 'France', rating: 2300 },
            { name: 'Lens', league: 'Ligue 1', country: 'France', rating: 2250 },
            { name: 'Montpellier', league: 'Ligue 1', country: 'France', rating: 2200 },
            { name: 'Reims', league: 'Ligue 1', country: 'France', rating: 2150 },
            { name: 'Strasbourg', league: 'Ligue 1', country: 'France', rating: 2100 },
            { name: 'Nantes', league: 'Ligue 1', country: 'France', rating: 2050 },
            { name: 'Brest', league: 'Ligue 1', country: 'France', rating: 2000 },
            { name: 'Le Havre', league: 'Ligue 1', country: 'France', rating: 1950 },
            { name: 'Toulouse', league: 'Ligue 1', country: 'France', rating: 1900 },
            { name: 'Metz', league: 'Ligue 1', country: 'France', rating: 1850 },
            { name: 'Lorient', league: 'Ligue 1', country: 'France', rating: 1800 },
            { name: 'Clermont', league: 'Ligue 1', country: 'France', rating: 1750 }
        ];

        // Shorter leagues (ratings converted to 0.5-9.9 scale)
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
            { name: 'Ajax', league: 'Eredivisie', country: 'Netherlands', rating: 2600 },
            { name: 'PSV Eindhoven', league: 'Eredivisie', country: 'Netherlands', rating: 2650 },
            { name: 'Feyenoord', league: 'Eredivisie', country: 'Netherlands', rating: 2550 },
            { name: 'AZ Alkmaar', league: 'Eredivisie', country: 'Netherlands', rating: 2400 },
            { name: 'FC Twente', league: 'Eredivisie', country: 'Netherlands', rating: 2250 },
            { name: 'Utrecht', league: 'Eredivisie', country: 'Netherlands', rating: 2100 },
            { name: 'Vitesse', league: 'Eredivisie', country: 'Netherlands', rating: 2000 },
            { name: 'Go Ahead Eagles', league: 'Eredivisie', country: 'Netherlands', rating: 1900 }
        ];

        const superLigTeams = [
            { name: 'Galatasaray', league: 'Süper Lig', country: 'Turkey', rating: 2500 },
            { name: 'Fenerbahce', league: 'Süper Lig', country: 'Turkey', rating: 2450 },
            { name: 'Besiktas', league: 'Süper Lig', country: 'Turkey', rating: 2400 },
            { name: 'Trabzonspor', league: 'Süper Lig', country: 'Turkey', rating: 2300 },
            { name: 'Basaksehir', league: 'Süper Lig', country: 'Turkey', rating: 2200 },
            { name: 'Sivasspor', league: 'Süper Lig', country: 'Turkey', rating: 2100 },
            { name: 'Adana Demirspor', league: 'Süper Lig', country: 'Turkey', rating: 2000 },
            { name: 'Antalyaspor', league: 'Süper Lig', country: 'Turkey', rating: 1950 },
            { name: 'Alanyaspor', league: 'Süper Lig', country: 'Turkey', rating: 1900 },
            { name: 'Kasimpasa', league: 'Süper Lig', country: 'Turkey', rating: 1850 },
            { name: 'Konyaspor', league: 'Süper Lig', country: 'Turkey', rating: 1800 },
            { name: 'Gaziantep FK', league: 'Süper Lig', country: 'Turkey', rating: 1750 },
            { name: 'Kayserispor', league: 'Süper Lig', country: 'Turkey', rating: 1700 },
            { name: 'Rizespor', league: 'Süper Lig', country: 'Turkey', rating: 1650 },
            { name: 'Hatayspor', league: 'Süper Lig', country: 'Turkey', rating: 1600 },
            { name: 'Fatih Karagumruk', league: 'Süper Lig', country: 'Turkey', rating: 1550 },
            { name: 'Pendikspor', league: 'Süper Lig', country: 'Turkey', rating: 1500 },
            { name: 'Istanbulspor', league: 'Süper Lig', country: 'Turkey', rating: 1450 }
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
            { name: 'Dundee United', league: 'Scottish Premiership', country: 'Scotland', rating: 5.8 },
            { name: 'St Johnstone', league: 'Scottish Premiership', country: 'Scotland', rating: 5.6 },
            { name: 'Ross County', league: 'Scottish Premiership', country: 'Scotland', rating: 5.4 },
            { name: 'Kilmarnock', league: 'Scottish Premiership', country: 'Scotland', rating: 5.2 },
            { name: 'Livingston', league: 'Scottish Premiership', country: 'Scotland', rating: 5.0 }
        ];

        // Czech First League Teams
        const czechTeams = [
            { name: 'Slavia Prague', league: 'Czech First League', country: 'Czech Republic', rating: 7.5 },
            { name: 'Sparta Prague', league: 'Czech First League', country: 'Czech Republic', rating: 7.3 },
            { name: 'Viktoria Plzen', league: 'Czech First League', country: 'Czech Republic', rating: 7.0 },
            { name: 'Banik Ostrava', league: 'Czech First League', country: 'Czech Republic', rating: 6.5 },
            { name: 'Jablonec', league: 'Czech First League', country: 'Czech Republic', rating: 6.3 },
            { name: 'Sigma Olomouc', league: 'Czech First League', country: 'Czech Republic', rating: 6.1 },
            { name: 'Slovan Liberec', league: 'Czech First League', country: 'Czech Republic', rating: 5.9 },
            { name: 'Hradec Kralove', league: 'Czech First League', country: 'Czech Republic', rating: 5.7 },
            { name: 'Fastav Zlin', league: 'Czech First League', country: 'Czech Republic', rating: 5.5 },
            { name: 'Bohemians', league: 'Czech First League', country: 'Czech Republic', rating: 5.3 },
            { name: 'Ceske Budejovice', league: 'Czech First League', country: 'Czech Republic', rating: 5.1 },
            { name: 'Karvina', league: 'Czech First League', country: 'Czech Republic', rating: 4.9 },
            { name: 'Pardubice', league: 'Czech First League', country: 'Czech Republic', rating: 4.7 },
            { name: 'Slovacko', league: 'Czech First League', country: 'Czech Republic', rating: 4.5 },
            { name: 'Teplice', league: 'Czech First League', country: 'Czech Republic', rating: 4.3 },
            { name: 'Dukla Prague', league: 'Czech First League', country: 'Czech Republic', rating: 4.1 }
        ];

        // Greek Super League Teams
        const greekTeams = [
            { name: 'Olympiacos', league: 'Super League Greece', country: 'Greece', rating: 7.4 },
            { name: 'Panathinaikos', league: 'Super League Greece', country: 'Greece', rating: 7.2 },
            { name: 'AEK Athens', league: 'Super League Greece', country: 'Greece', rating: 7.0 },
            { name: 'PAOK', league: 'Super League Greece', country: 'Greece', rating: 6.8 },
            { name: 'Aris', league: 'Super League Greece', country: 'Greece', rating: 6.3 },
            { name: 'Atromitos', league: 'Super League Greece', country: 'Greece', rating: 6.1 },
            { name: 'Volos', league: 'Super League Greece', country: 'Greece', rating: 5.9 },
            { name: 'OFI', league: 'Super League Greece', country: 'Greece', rating: 5.7 },
            { name: 'Asteras Tripolis', league: 'Super League Greece', country: 'Greece', rating: 5.5 },
            { name: 'Lamia', league: 'Super League Greece', country: 'Greece', rating: 5.3 },
            { name: 'Panserraikos', league: 'Super League Greece', country: 'Greece', rating: 5.1 },
            { name: 'Levadiakos', league: 'Super League Greece', country: 'Greece', rating: 4.9 },
            { name: 'Kifisia', league: 'Super League Greece', country: 'Greece', rating: 4.7 },
            { name: 'Athens Kallithea', league: 'Super League Greece', country: 'Greece', rating: 4.5 }
        ];

        // Additional leagues teams
        const austrianTeams = [
            { name: 'Red Bull Salzburg', league: 'Austrian Bundesliga', country: 'Austria', rating: 7.0 },
            { name: 'Sturm Graz', league: 'Austrian Bundesliga', country: 'Austria', rating: 6.5 },
            { name: 'Austria Wien', league: 'Austrian Bundesliga', country: 'Austria', rating: 6.3 },
            { name: 'LASK Linz', league: 'Austrian Bundesliga', country: 'Austria', rating: 6.1 },
            { name: 'Rapid Wien', league: 'Austrian Bundesliga', country: 'Austria', rating: 5.9 },
            { name: 'Wolfsberger AC', league: 'Austrian Bundesliga', country: 'Austria', rating: 5.7 },
            { name: 'TSV Hartberg', league: 'Austrian Bundesliga', country: 'Austria', rating: 5.5 },
            { name: 'WSG Tirol', league: 'Austrian Bundesliga', country: 'Austria', rating: 5.3 },
            { name: 'Altach', league: 'Austrian Bundesliga', country: 'Austria', rating: 5.1 },
            { name: 'Austria Klagenfurt', league: 'Austrian Bundesliga', country: 'Austria', rating: 4.9 },
            { name: 'Blau-Weiss Linz', league: 'Austrian Bundesliga', country: 'Austria', rating: 4.7 },
            { name: 'Rheindorf Altach', league: 'Austrian Bundesliga', country: 'Austria', rating: 4.5 }
        ];

        const danishTeams = [
            { name: 'FC Copenhagen', league: 'Danish Superliga', country: 'Denmark', rating: 6.8 },
            { name: 'FC Midtjylland', league: 'Danish Superliga', country: 'Denmark', rating: 6.6 },
            { name: 'Brondby IF', league: 'Danish Superliga', country: 'Denmark', rating: 6.4 },
            { name: 'AGF Aarhus', league: 'Danish Superliga', country: 'Denmark', rating: 6.2 },
            { name: 'Silkeborg IF', league: 'Danish Superliga', country: 'Denmark', rating: 6.0 },
            { name: 'FC Nordsjaelland', league: 'Danish Superliga', country: 'Denmark', rating: 5.8 },
            { name: 'Randers FC', league: 'Danish Superliga', country: 'Denmark', rating: 5.6 },
            { name: 'Viborg FF', league: 'Danish Superliga', country: 'Denmark', rating: 5.4 },
            { name: 'OB Odense', league: 'Danish Superliga', country: 'Denmark', rating: 5.2 },
            { name: 'Aalborg BK', league: 'Danish Superliga', country: 'Denmark', rating: 5.0 },
            { name: 'Lyngby BK', league: 'Danish Superliga', country: 'Denmark', rating: 4.8 },
            { name: 'Vejle BK', league: 'Danish Superliga', country: 'Denmark', rating: 4.6 }
        ];

        // Combine all teams
        this.teams = [
            ...defaultTeams, ...portugalTeams, ...eredivisieTeams, ...superLigTeams, 
            ...belgiumTeams, ...scottishTeams, ...czechTeams, ...greekTeams,
            ...austrianTeams, ...danishTeams
        ];
        this.saveData();
        this.updateStats();
        this.renderTeams();
    }

    addTeam() {
        const name = document.getElementById('team-name').value;
        const league = document.getElementById('team-league').value;
        const rating = parseFloat(document.getElementById('team-rating').value);
        const country = document.getElementById('team-country').value;

        if (name && league && rating && country && rating >= 0.5 && rating <= 9.9) {
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
        
        // Populate form with current team's values
        document.getElementById('edit-team-name').value = team.name;
        document.getElementById('edit-team-league').value = team.league;
        document.getElementById('edit-team-rating').value = team.rating;
        
        // Store the team ID for saving
        this.editingTeamId = teamId;
        
        // Show modal
        document.getElementById('edit-team-modal').classList.add('show');
        
        console.log('Editing team:', team);
    }

    saveEditedTeam() {
        const name = document.getElementById('edit-team-name').value.trim();
        const league = document.getElementById('edit-team-league').value;
        const rating = parseFloat(document.getElementById('edit-team-rating').value);

        // Validate inputs
        if (!name || !league || isNaN(rating) || rating < 0.5 || rating > 9.9 || !this.editingTeamId) {
            alert('Lütfen tüm alanları doğru şekilde doldurun. Reyting 0.5-9.9 arasında olmalıdır.');
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
                rating: Number(rating.toFixed(1)) // Ensure proper number format
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

    // Match Simulation Engine (Balanced for realistic results)
    simulateMatch(homeTeam, awayTeam, isEuropean = false) {
        // More subtle home advantage
        const homeAdvantageBoost = (this.settings.homeAdvantage / 100) * 0.15;
        const homeRating = homeTeam.rating + (isEuropean ? homeAdvantageBoost * 0.8 : homeAdvantageBoost);
        const awayRating = awayTeam.rating;
        
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
        // More realistic goal calculation for 0.5-9.9 rating system
        const attackStrength = Math.max(0.5, attackRating);
        const defenseStrength = Math.max(0.5, defenseRating);
        
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

    getLeagueMatches(leagueName) {
        return this.matches.filter(m => m.league === leagueName && m.season === this.currentSeason);
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

    calculateCountryCoefficients() {
        const seasonPoints = {};
        
        this.europeanResults
            .filter(result => result.season === this.currentSeason)
            .forEach(result => {
                const team = this.teams.find(t => t.name === result.team);
                if (team) {
                    if (!seasonPoints[team.country]) {
                        seasonPoints[team.country] = { points: 0, teams: new Set() };
                    }
                    seasonPoints[team.country].points += this.europeanPoints[result.competition][result.stage];
                    seasonPoints[team.country].teams.add(result.team);
                }
            });

        // Calculate coefficients (total points / participating teams)
        Object.keys(seasonPoints).forEach(country => {
            const coefficient = seasonPoints[country].points / seasonPoints[country].teams.size;
            
            let countryData = this.countryCoefficients.find(c => c.country === country);
            if (!countryData) {
                countryData = { country, seasons: {} };
                this.countryCoefficients.push(countryData);
            }
            
            countryData.seasons[this.currentSeason] = {
                coefficient,
                points: seasonPoints[country].points,
                teams: seasonPoints[country].teams.size
            };
        });
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

    showLeagueTable(leagueName) {
        // Update active tab
        document.querySelectorAll('.league-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-league="${leagueName}"]`).classList.add('active');

        // Get league teams and matches
        const leagueTeams = this.teams.filter(team => team.league === leagueName);
        const leagueMatches = this.getLeagueMatches(leagueName);

        // Calculate standings
        const standings = this.calculateStandings(leagueTeams, leagueMatches);
        
        // Get European qualification spots for this league
        const leagueRanking = this.getLeagueRanking(leagueName);
        const europeanSpots = this.getEuropeanSpots(leagueRanking);

        const tableContainer = document.getElementById('league-table');
        tableContainer.innerHTML = `
            <h3>${leagueName} - ${this.currentSeason}</h3>
            <div class="section-controls">
                <button class="btn btn-warning" onclick="deleteLeagueSeason('${leagueName}')">
                    <i class="fas fa-trash"></i> Bu Ligin Sezonunu Sil
                </button>
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
                    <div class="legend-item ucl-qualification">Şampiyonlar Ligi</div>
                    <div class="legend-item uel-qualification">Avrupa Ligi</div>
                    <div class="legend-item uecl-qualification">Konferans Ligi</div>
                    ${leagueName === 'Bundesliga' ? '<div class="legend-item playoff-zone">Playoff</div>' : ''}
                    <div class="legend-item relegation-zone">Küme Düşme</div>
                </div>
            </div>
        `;
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
        // Get ranking based on coefficient (2027-28 season)
        const leaguesByCoefficient = Object.entries(this.leagues)
            .sort((a, b) => b[1].coefficient - a[1].coefficient);
        
        for (let i = 0; i < leaguesByCoefficient.length; i++) {
            if (leaguesByCoefficient[i][1].country === country) {
                return i + 1;
            }
        }
        return 25; // Default for unknown countries
    }
    
    getLeagueRanking(leagueName) {
        const leaguesByCoefficient = Object.entries(this.leagues)
            .sort((a, b) => b[1].coefficient - a[1].coefficient);
        
        for (let i = 0; i < leaguesByCoefficient.length; i++) {
            if (leaguesByCoefficient[i][0] === leagueName) {
                return i + 1;
            }
        }
        return 25;
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

    showEuropeanCompetition(competition) {
        // Update active tab
        document.querySelectorAll('.european-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-competition="${competition}"]`).classList.add('active');

        const content = document.getElementById('european-content');
        const comp = competition.toUpperCase();
        
        content.innerHTML = `
            <div class="european-competition-content">
                <h3>${this.europeanCompetitions[comp].name}</h3>
                <div class="qualification-info">
                    <h4>Katılım Durumu</h4>
                    <p>Bu özellik yakında eklenecek...</p>
                </div>
                <div class="european-points">
                    <h4>Puan Sistemi</h4>
                    <table class="european-table">
                        <thead>
                            <tr>
                                <th>Aşama</th>
                                <th>Puan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(this.europeanPoints[comp]).map(([stage, points]) => `
                                <tr>
                                    <td>${stage}</td>
                                    <td>${points}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderCoefficients() {
        const rankingContainer = document.getElementById('coefficients-ranking');
        
        // Get league rankings based on current coefficients
        const leaguesByCoefficient = Object.entries(this.leagues)
            .sort((a, b) => b[1].coefficient - a[1].coefficient);

        const europeanAllocationTable = leaguesByCoefficient.map(([leagueName, leagueData], index) => {
            const ranking = index + 1;
            const uclSpots = this.europeanAllocation.UCL[ranking] || 0;
            const uelSpots = this.europeanAllocation.UEL[ranking] || 0;
            const ueclSpots = this.europeanAllocation.UECL[ranking] || 0;
            
            return {
                ranking,
                leagueName,
                flag: leagueData.flag,
                coefficient: leagueData.coefficient,
                ucl: uclSpots,
                uel: uelSpots,
                uecl: ueclSpots
            };
        });

        rankingContainer.innerHTML = `
            <h3>2027-28 Sezonu UEFA Katsayıları</h3>
            <table class="coefficients-table">
                <thead>
                    <tr>
                        <th>Sıra</th>
                        <th>Lig</th>
                        <th>Katsayı</th>
                        <th>UCL</th>
                        <th>UEL</th>
                        <th>UECL</th>
                    </tr>
                </thead>
                <tbody>
                    ${europeanAllocationTable.map(league => `
                        <tr>
                            <td><strong>${league.ranking}</strong></td>
                            <td>${league.flag} ${league.leagueName}</td>
                            <td><strong>${league.coefficient}</strong></td>
                            <td><span class="ucl-spots">${league.ucl}</span></td>
                            <td><span class="uel-spots">${league.uel}</span></td>
                            <td><span class="uecl-spots">${league.uecl}</span></td>
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
            const currentYear = parseInt(this.currentSeason.split('-')[0]);
            this.currentSeason = `${currentYear + 1}-${(currentYear + 2).toString().slice(-2)}`;
            this.settings.currentSeason = this.currentSeason;
            this.saveSettings();
            this.updateStats();
            this.addActivity(`${this.currentSeason} sezonuna geçildi`);
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
                                    <span class="team-rating">${fixture.homeTeam.rating}</span>
                                </div>
                                <div class="fixture-center">
                                    ${existingMatch ? 
                                        `<div class="match-result">${existingMatch.homeGoals} - ${existingMatch.awayGoals}</div>` :
                                        '<div class="vs">vs</div>'
                                    }
                                </div>
                                <div class="away-team">
                                    <span class="team-rating">${fixture.awayTeam.rating}</span>
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

    renderTeamPoints() {
        const container = document.getElementById('team-points-table');
        
        // Generate sample team points data
        const teamPoints = this.generateSampleTeamPoints();
        
        // Filter by selected league and season
        const selectedLeague = document.getElementById('team-points-league')?.value || '';
        const selectedSeason = document.getElementById('team-points-season')?.value || '';
        
        let filteredPoints = teamPoints;
        if (selectedLeague) {
            filteredPoints = filteredPoints.filter(tp => tp.league === selectedLeague);
        }
        if (selectedSeason) {
            filteredPoints = filteredPoints.filter(tp => tp.season === selectedSeason);
        }
        
        // Sort by points descending
        filteredPoints.sort((a, b) => b.points - a.points);
        
        container.innerHTML = `
            <div class="team-points-summary">
                <h3>Takım Avrupa Puanları</h3>
                <p>Toplam ${filteredPoints.length} takım</p>
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
                    ${filteredPoints.map((tp, index) => `
                        <tr>
                            <td><strong>${index + 1}</strong></td>
                            <td>${tp.team}</td>
                            <td>${this.leagues[tp.league]?.flag || ''} ${tp.league}</td>
                            <td>${tp.season}</td>
                            <td><span class="competition-${tp.competition.toLowerCase()}">${tp.competition}</span></td>
                            <td>${tp.stage}</td>
                            <td><strong>${tp.points}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    generateSampleTeamPoints() {
        // Return empty array - will be populated with real European results
        return this.europeanResults || [];
    }
    
    renderHistoricalCoefficients() {
        const container = document.getElementById('historical-coefficients');
        
        container.innerHTML = `
            <div class="no-data">
                <h3>Geçmiş Veriler</h3>
                <p>Henüz geçmiş sezon verileri mevcut değil. Avrupa kupaları oynandıkça buraya veriler eklenecek.</p>
                <div class="current-coefficients" style="margin-top: 2rem;">
                    <h4>2027-28 Sezonu Son Durumu</h4>
                    <p>Mevcut katsayı sıralamasına göre bir sonraki sezon için Avrupa kupaları katylımı:</p>
                </div>
            </div>
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