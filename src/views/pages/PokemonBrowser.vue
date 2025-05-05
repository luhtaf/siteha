<template>
    <div class="pokemon-browser">
        <h1>Pokemon Browser</h1>

        <!-- Pokemon List Section -->
        <div class="pokemon-list-section">
            <h2>Pokemon List</h2>
            <div class="list-controls">
                <div class="page-size-selector">
                    <label for="pageSize">Items per page:</label>
                    <select id="pageSize" v-model="itemsPerPage" @change="handlePageSizeChange">
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
            </div>

            <div v-if="listLoading" class="loading-indicator">Loading Pokemon list...</div>
            <div v-else-if="error" class="error-message">{{ error.message }}</div>
            <div v-else class="pokemon-grid">
                <div v-for="pokemon in pokemonList" :key="pokemon.id" class="pokemon-item" @click="navigateToPokemonDetail(pokemon.id)">
                    <img :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`" :alt="pokemon.name" />
                    <p>{{ pokemon.name }}</p>
                    <span class="pokemon-id">#{{ pokemon.id }}</span>
                </div>
            </div>

            <div class="pagination">
                <button @click="loadFirstPage" :disabled="currentPage === 1" class="pagination-button">&laquo; First</button>
                <button @click="loadPreviousPage" :disabled="currentPage === 1" class="pagination-button">&lsaquo; Previous</button>

                <div class="pagination-info">
                    <span>Page</span>
                    <input type="number" v-model="pageInput" min="1" :max="totalPages || 99999" @change="goToPage" class="page-input" />
                    <span>of {{ totalPages || '?' }}</span>
                </div>

                <button @click="loadNextPage" :disabled="!hasNextPage" class="pagination-button">Next &rsaquo;</button>
                <button @click="loadLastPage" :disabled="!hasNextPage || !totalPages" class="pagination-button">Last &raquo;</button>
            </div>

            <div class="pagination-summary" v-if="totalCount">Showing {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalCount) }} of {{ totalCount }} Pokémon</div>
        </div>

        <!-- Pokemon Details Section -->
        <div class="pokemon-detail-section" v-if="currentPokemon">
            <h2>Pokemon Details</h2>
            <div v-if="detailLoading" class="loading-indicator">Loading details...</div>
            <div v-else-if="error" class="error-message">{{ error.message }}</div>
            <div v-else class="pokemon-detail-card">
                <div class="pokemon-header">
                    <h3>{{ currentPokemon.name.toUpperCase() }}</h3>
                    <span class="pokemon-id">#{{ currentPokemon.id }}</span>
                </div>

                <div class="pokemon-images">
                    <img :src="currentPokemon.sprites.front_default" alt="Front view" />
                    <img :src="currentPokemon.sprites.back_default" alt="Back view" />
                </div>

                <div class="pokemon-types">
                    <span v-for="(typeInfo, index) in currentPokemon.types" :key="index" :class="['type-badge', typeInfo.type.name]">
                        {{ typeInfo.type.name }}
                    </span>
                </div>

                <div class="pokemon-stats">
                    <h4>Base Stats</h4>
                    <div v-for="(statInfo, index) in currentPokemon.stats" :key="index" class="stat-bar">
                        <span class="stat-name">{{ formatStatName(statInfo.stat.name) }}</span>
                        <div class="stat-bar-container">
                            <div class="stat-bar-fill" :style="{ width: `${(statInfo.base_stat / 255) * 100}%` }"></div>
                        </div>
                        <span class="stat-value">{{ statInfo.base_stat }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { usePokemon } from '@/composables/usePokemon';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const itemsPerPage = ref(20);
const currentOffset = ref(0);
const currentPage = ref(1);
const pageInput = ref(1);
const hasNextPage = ref(true);
const totalCount = ref(0); // Total number of Pokémon (approximately 1118 in the PokeAPI)
const totalPages = computed(() => {
    return totalCount.value ? Math.ceil(totalCount.value / itemsPerPage.value) : null;
});

const { pokemonList, currentPokemon, listLoading, detailLoading, error, getListPokemon, getPokemonDetail } = usePokemon();

// Format nama stat untuk tampilan yang lebih baik
const formatStatName = (statName) => {
    return statName
        .replace('-', ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const loadPokemonList = async () => {
    const result = await getListPokemon({
        limit: itemsPerPage.value,
        offset: currentOffset.value
    });

    // Check if we have a next page
    hasNextPage.value = !!result?.next;

    // Update total count if available
    if (result && result.count) {
        totalCount.value = result.count;
    }
};

const loadPokemonDetail = async (id) => {
    await getPokemonDetail(id);
};

// Navigation to Pokemon detail page
const navigateToPokemonDetail = (id) => {
    router.push(`/pokemon/${id}`);
};

const handlePageSizeChange = () => {
    // Reset to first page when page size changes
    currentPage.value = 1;
    pageInput.value = 1;
    currentOffset.value = 0;
    loadPokemonList();
};

const loadNextPage = () => {
    currentOffset.value += itemsPerPage.value;
    currentPage.value++;
    pageInput.value = currentPage.value;
    loadPokemonList();
};

const loadPreviousPage = () => {
    currentOffset.value = Math.max(0, currentOffset.value - itemsPerPage.value);
    currentPage.value = Math.max(1, currentPage.value - 1);
    pageInput.value = currentPage.value;
    loadPokemonList();
};

const loadFirstPage = () => {
    currentOffset.value = 0;
    currentPage.value = 1;
    pageInput.value = 1;
    loadPokemonList();
};

const loadLastPage = () => {
    if (totalPages.value) {
        currentPage.value = totalPages.value;
        pageInput.value = totalPages.value;
        currentOffset.value = (totalPages.value - 1) * itemsPerPage.value;
        loadPokemonList();
    }
};

const goToPage = () => {
    // Make sure input is valid
    let targetPage = parseInt(pageInput.value);
    if (isNaN(targetPage) || targetPage < 1) {
        targetPage = 1;
    } else if (totalPages.value && targetPage > totalPages.value) {
        targetPage = totalPages.value;
    }

    pageInput.value = targetPage;
    currentPage.value = targetPage;
    currentOffset.value = (targetPage - 1) * itemsPerPage.value;
    loadPokemonList();
};

// Keep pageInput in sync with currentPage
watch(currentPage, (newValue) => {
    pageInput.value = newValue;
});

onMounted(() => {
    loadPokemonList();

    // Check if we have an ID in the route and load that pokemon
    if (route.params.id) {
        loadPokemonDetail(route.params.id);
    }

    // Set initial total count (this is the approximate number from PokeAPI)
    totalCount.value = 1118;
});
</script>

<style scoped>
.pokemon-browser {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
}

.pokemon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.list-controls {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 15px;
}

.page-size-selector {
    display: flex;
    align-items: center;
    gap: 8px;
}

.page-size-selector select {
    padding: 6px;
    border-radius: 4px;
    border: 1px solid #ddd;
}

.pokemon-item {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.2s;
}

.pokemon-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.pokemon-item img {
    width: 96px;
    height: 96px;
}

.pokemon-item p {
    margin: 10px 0 5px;
    font-weight: bold;
    text-transform: capitalize;
}

.pokemon-id {
    color: #777;
    font-size: 0.9em;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
    gap: 10px;
}

.pagination-button {
    padding: 8px 15px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.pagination-button:hover:not(:disabled) {
    background-color: #2980b9;
}

.pagination-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.pagination-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.page-input {
    width: 50px;
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
    text-align: center;
}

.pagination-summary {
    text-align: center;
    margin-top: 10px;
    color: #666;
    font-size: 0.9em;
}

.pokemon-detail-section {
    margin-top: 40px;
    padding-top: 30px;
    border-top: 1px solid #eee;
}

.pokemon-detail-card {
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.pokemon-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.pokemon-header h3 {
    margin: 0;
    text-transform: capitalize;
}

.pokemon-images {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 20px;
}

.pokemon-images img {
    width: 120px;
    height: 120px;
}

.pokemon-types {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
}

.type-badge {
    padding: 5px 10px;
    border-radius: 4px;
    color: white;
    font-size: 0.9em;
    text-transform: capitalize;
}

/* Type colors */
.normal {
    background-color: #a8a878;
}
.fire {
    background-color: #f08030;
}
.water {
    background-color: #6890f0;
}
.grass {
    background-color: #78c850;
}
.electric {
    background-color: #f8d030;
}
.ice {
    background-color: #98d8d8;
}
.fighting {
    background-color: #c03028;
}
.poison {
    background-color: #a040a0;
}
.ground {
    background-color: #e0c068;
}
.flying {
    background-color: #a890f0;
}
.psychic {
    background-color: #f85888;
}
.bug {
    background-color: #a8b820;
}
.rock {
    background-color: #b8a038;
}
.ghost {
    background-color: #705898;
}
.dragon {
    background-color: #7038f8;
}
.dark {
    background-color: #705848;
}
.steel {
    background-color: #b8b8d0;
}
.fairy {
    background-color: #ee99ac;
}

.pokemon-stats {
    margin-top: 20px;
}

.stat-bar {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.stat-name {
    width: 120px;
    font-size: 0.9em;
}

.stat-bar-container {
    flex: 1;
    height: 12px;
    background-color: #f0f0f0;
    border-radius: 6px;
    overflow: hidden;
    margin: 0 10px;
}

.stat-bar-fill {
    height: 100%;
    background-color: #78c850;
}

.stat-value {
    width: 30px;
    text-align: right;
    font-size: 0.9em;
}

.loading-indicator,
.error-message {
    text-align: center;
    padding: 20px;
}

.error-message {
    color: red;
}
</style>
