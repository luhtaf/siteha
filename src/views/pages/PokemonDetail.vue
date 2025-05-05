<template>
    <div class="pokemon-card">
        <div v-if="detailLoading" class="loading">Loading Pokémon data...</div>
        <div v-else-if="error" class="error">Error: {{ error.message }}</div>
        <div v-else-if="currentPokemon" class="pokemon-details">
            <div class="navigation-controls">
                <button @click="goBack" class="back-btn">← Back</button>
            </div>
            <div class="pokemon-header">
                <h2>{{ currentPokemon.name.toUpperCase() }}</h2>
                <p>ID: #{{ currentPokemon.id }}</p>
            </div>

            <div class="pokemon-image">
                <img :src="currentPokemon.sprites.front_default" alt="Pokemon sprite" />
                <img :src="currentPokemon.sprites.back_default" alt="Pokemon back sprite" />
            </div>

            <div class="pokemon-info">
                <div class="types">
                    <span v-for="(typeInfo, index) in currentPokemon.types" :key="index" :class="['type-badge', typeInfo.type.name]">
                        {{ typeInfo.type.name }}
                    </span>
                </div>

                <div class="abilities">
                    <h3>Abilities:</h3>
                    <ul>
                        <li v-for="(abilityInfo, index) in currentPokemon.abilities" :key="index">
                            {{ abilityInfo.ability.name }}
                            <span v-if="abilityInfo.is_hidden">(Hidden)</span>
                        </li>
                    </ul>
                </div>

                <div class="stats">
                    <h3>Stats:</h3>
                    <div v-for="(statInfo, index) in currentPokemon.stats" :key="index" class="stat-bar">
                        <span class="stat-name">{{ statInfo.stat.name }}:</span>
                        <div class="stat-value-container">
                            <div class="stat-value" :style="{ width: statInfo.base_stat + 'px' }"></div>
                            <span>{{ statInfo.base_stat }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <button @click="loadPokemon" class="reload-btn">Reload Data</button>
    </div>
</template>

<script setup>
import { usePokemon } from '@/composables/usePokemon';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const router = useRouter();
const route = useRoute();
const pokemonId = route.params.poke;

const { currentPokemon, detailLoading, error, getPokemonDetail } = usePokemon();

const loadPokemon = async () => {
    await getPokemonDetail(pokemonId);
};

const goBack = () => {
    router.back();
};

onMounted(loadPokemon);
</script>

<style scoped>
.pokemon-card {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background-color: #fff;
}

.loading,
.error {
    text-align: center;
    padding: 20px;
}

.error {
    color: red;
}

.pokemon-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.pokemon-image {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 20px;
}

.pokemon-image img {
    width: 120px;
    height: 120px;
}

.types {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}

.type-badge {
    padding: 5px 10px;
    border-radius: 4px;
    color: white;
    text-transform: capitalize;
    font-weight: bold;
    background-color: #999;
}

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

.stat-bar {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.stat-name {
    width: 120px;
    text-transform: capitalize;
}

.stat-value-container {
    flex: 1;
    display: flex;
    align-items: center;
}

.stat-value {
    height: 10px;
    background-color: #78c850;
    border-radius: 5px;
    margin-right: 10px;
}

.reload-btn {
    margin-top: 20px;
    padding: 8px 16px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.reload-btn:hover {
    background-color: #2980b9;
}
</style>
