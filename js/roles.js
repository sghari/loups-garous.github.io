const ROLES = {
    WEREWOLF: {
        name: 'Loup-Garou',
        team: 'werewolves',
        description: 'Se réveille la nuit pour éliminer un villageois',
        minPlayers: 8,
        scaling: {
            8: 2,  // 8-11 players: 2 werewolves
            12: 3, // 12-15 players: 3 werewolves
            16: 4  // 16-20 players: 4 werewolves
        }
    },
    VILLAGER: {
        name: 'Villageois',
        team: 'villagers',
        description: 'Doit découvrir qui sont les Loups-Garous',
        minPlayers: 0,
        scaling: {
            0: 1  // Always exactly 1 villager
        }
    },
    SEER: {
        name: 'Voyante',
        team: 'villagers',
        description: 'Peut découvrir le rôle d\'un joueur chaque nuit',
        minPlayers: 8,
        scaling: {
            8: 1,
            12: 2
        }
    },
    WITCH: {
        name: 'Sorcière',
        team: 'villagers',
        description: 'Possède deux potions: une pour sauver, une pour tuer',
        minPlayers: 8,
        scaling: {
            8: 1,
            14: 2
        }
    },
    HUNTER: {
        name: 'Chasseur',
        team: 'villagers',
        description: 'Peut éliminer un joueur en mourant',
        minPlayers: 8,
        scaling: {
            8: 1
        }
    },
    CUPID: {
        name: 'Cupidon',
        team: 'villagers',
        description: 'Désigne deux amoureux au début du jeu',
        minPlayers: 10,
        scaling: {
            10: 1
        }
    },
    LITTLE_GIRL: {
        name: 'Petite Fille',
        team: 'villagers',
        description: 'Peut espionner les Loups-Garous',
        minPlayers: 10,
        scaling: {
            10: 1
        }
    },
    THIEF: {
        name: 'Voleur',
        team: 'neutral',
        description: 'Choisit son rôle parmi deux cartes au début',
        minPlayers: 12,
        scaling: {
            12: 1
        }
    },
    ELDER: {
        name: 'L\'Ancien',
        team: 'villagers',
        description: 'Peut survivre à une première attaque des Loups-Garous',
        minPlayers: 12,
        scaling: {
            12: 1
        }
    },
    RAVEN: {
        name: 'Corbeau',
        team: 'villagers',
        description: 'Désigne un joueur suspect chaque nuit',
        minPlayers: 12,
        scaling: {
            12: 1
        }
    },
    SAVIOR: {
        name: 'Salvateur',
        team: 'villagers',
        description: 'Protège un joueur chaque nuit',
        minPlayers: 14,
        scaling: {
            14: 1
        }
    },
    DEVOTED_SERVANT: {
        name: 'Servante Dévouée',
        team: 'villagers',
        description: 'Connaît l\'identité d\'un joueur au début',
        minPlayers: 14,
        scaling: {
            14: 1
        }
    }
};

const calculateRoleDistribution = (playerCount) => {
    if (playerCount < 8 || playerCount > 20) {
        throw new Error('Le nombre de joueurs doit être entre 8 et 20');
    }

    let distribution = new Map();
    
    // Step 1: Add exactly one villager
    distribution.set('VILLAGER', 1);
    
    // Step 2: Add werewolves based on player count
    let werewolfCount;
    if (playerCount <= 11) werewolfCount = 2;
    else if (playerCount <= 15) werewolfCount = 3;
    else werewolfCount = 4;
    distribution.set('WEREWOLF', werewolfCount);
    
    // Step 3: Add mandatory roles for balance
    distribution.set('SEER', 1);  // Always have one seer
    distribution.set('WITCH', 1); // Always have one witch
    
    // Step 4: Calculate remaining slots
    let remainingSlots = playerCount - (1 + werewolfCount + 2); // villager + werewolves + seer + witch
    
    // Step 5: Fill remaining slots with special roles
    const specialRoles = ['HUNTER', 'CUPID', 'LITTLE_GIRL', 'ELDER', 'RAVEN'];
    let roleIndex = 0;
    
    while (remainingSlots > 0) {
        const roleKey = specialRoles[roleIndex % specialRoles.length];
        if (!distribution.has(roleKey)) {
            distribution.set(roleKey, 1);
            remainingSlots--;
        }
        roleIndex++;
    }

    return distribution;
};

const isBalanced = (distribution) => {
    let werewolfCount = distribution.get('WEREWOLF') || 0;
    let villagerTeamCount = 0;

    distribution.forEach((count, roleKey) => {
        if (ROLES[roleKey].team === 'villagers') {
            villagerTeamCount += count;
        }
    });

    // Always allow the distribution if it matches the expected ratios
    const totalPlayers = Array.from(distribution.values()).reduce((a, b) => a + b, 0);
    
    // Simplified balance check:
    // 1. Must have at least one villager (already guaranteed)
    // 2. Must have appropriate number of werewolves
    // 3. Must have enough total roles
    
    if (totalPlayers < 8) return false;
    
    // Check if we have the right number of werewolves
    let expectedWerewolves;
    if (totalPlayers <= 11) expectedWerewolves = 2;
    else if (totalPlayers <= 15) expectedWerewolves = 3;
    else expectedWerewolves = 4;

    if (werewolfCount !== expectedWerewolves) return false;

    // Check if we have enough roles for all players
    if (Array.from(distribution.values()).reduce((a, b) => a + b, 0) !== totalPlayers) return false;

    // Check if village team is larger than werewolf team
    return villagerTeamCount > werewolfCount;
};
