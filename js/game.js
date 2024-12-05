class WerewolfGame {
    constructor() {
        this.players = new Map();
        this.assignedRoles = new Map();
        this.lockedRoles = new Map();
        this.maxPlayers = 20;
        
        this.initializeEventListeners();
        this.updatePlayerCount();
    }

    initializeEventListeners() {
        const playerForm = document.getElementById('player-form');
        const assignRolesBtn = document.getElementById('assign-roles');
        const resetGameBtn = document.getElementById('reset-game');
        const modal = document.getElementById('modal');
        const closeModal = document.querySelector('.close');

        playerForm.addEventListener('submit', (e) => this.handlePlayerSubmit(e));
        assignRolesBtn.addEventListener('click', () => this.assignRoles());
        resetGameBtn.addEventListener('click', () => this.resetGame());
        closeModal.addEventListener('click', () => modal.classList.remove('show'));
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('show');
        });
    }

    handlePlayerSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('player-name');
        const playerName = input.value.trim();

        if (!playerName) {
            alert('Veuillez entrer un nom de joueur');
            return;
        }

        // Check for duplicate names
        const isDuplicate = Array.from(this.players.values()).some(name => name.toLowerCase() === playerName.toLowerCase());
        if (isDuplicate) {
            alert('Ce nom de joueur existe déjà');
            return;
        }

        if (this.players.size >= this.maxPlayers) {
            alert('Nombre maximum de joueurs atteint (20)');
            return;
        }

        this.addPlayer(playerName);
        input.value = '';
        input.focus();
        this.updatePlayerCount();
        this.renderPlayers();
    }

    addPlayer(name) {
        const playerId = `player_${Date.now()}`;
        this.players.set(playerId, name);
        return playerId;
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        this.lockedRoles.delete(playerId);
        this.updatePlayerCount();
        this.renderPlayers();
    }

    lockRole(playerId, role) {
        if (this.players.has(playerId)) {
            this.lockedRoles.set(playerId, role);
        }
    }

    unlockRole(playerId) {
        this.lockedRoles.delete(playerId);
    }

    assignRoles() {
        if (this.players.size < 8) {
            alert('Il faut au moins 8 joueurs pour commencer une partie!');
            return;
        }

        try {
            const distribution = calculateRoleDistribution(this.players.size);
            if (!isBalanced(distribution)) {
                alert('Attention: La distribution des rôles n\'est pas équilibrée!');
                return;
            }

            // Create array of available roles based on distribution
            let availableRoles = [];
            distribution.forEach((count, roleKey) => {
                for (let i = 0; i < count; i++) {
                    availableRoles.push(roleKey);
                }
            });

            // Assign locked roles first
            this.assignedRoles.clear();
            this.lockedRoles.forEach((role, playerId) => {
                this.assignedRoles.set(playerId, role);
                const index = availableRoles.indexOf(role);
                if (index > -1) {
                    availableRoles.splice(index, 1);
                }
            });

            // Randomly assign remaining roles
            const unassignedPlayers = Array.from(this.players.keys())
                .filter(id => !this.lockedRoles.has(id));

            for (const playerId of unassignedPlayers) {
                if (availableRoles.length === 0) break;
                const randomIndex = Math.floor(Math.random() * availableRoles.length);
                const role = availableRoles.splice(randomIndex, 1)[0];
                this.assignedRoles.set(playerId, role);
            }

            this.showRoleAssignments();
        } catch (error) {
            alert(error.message);
        }
    }

    showRoleAssignments() {
        const modal = document.getElementById('modal');
        const roleAssignments = document.getElementById('role-assignments');
        roleAssignments.innerHTML = '';

        const assignmentsList = document.createElement('ul');
        assignmentsList.style.listStyle = 'none';
        assignmentsList.style.padding = '0';

        this.assignedRoles.forEach((roleKey, playerId) => {
            const playerName = this.players.get(playerId);
            const role = ROLES[roleKey];
            
            const li = document.createElement('li');
            li.style.padding = '0.5rem';
            li.style.marginBottom = '0.5rem';
            li.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            li.style.borderRadius = '4px';
            
            li.innerHTML = `
                <strong>${playerName}</strong>: ${role.name}
                <div style="font-size: 0.9em; opacity: 0.8">${role.description}</div>
            `;
            
            assignmentsList.appendChild(li);
        });

        roleAssignments.appendChild(assignmentsList);
        modal.classList.add('show');
    }

    resetGame() {
        if (confirm('Êtes-vous sûr de vouloir recommencer une nouvelle partie?')) {
            this.players.clear();
            this.assignedRoles.clear();
            this.lockedRoles.clear();
            this.updatePlayerCount();
            this.renderPlayers();
        }
    }

    updatePlayerCount() {
        const counter = document.getElementById('current-players');
        if (counter) {
            counter.textContent = this.players.size.toString();
        }
    }

    renderPlayers() {
        const container = document.querySelector('.players-container');
        if (!container) return;

        container.innerHTML = '';

        this.players.forEach((name, id) => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = name;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn-secondary';
            removeBtn.style.padding = '0.3rem 0.6rem';
            removeBtn.textContent = '×';
            removeBtn.onclick = () => this.removePlayer(id);
            
            playerCard.appendChild(nameSpan);
            playerCard.appendChild(removeBtn);
            container.appendChild(playerCard);
        });
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new WerewolfGame();
});
