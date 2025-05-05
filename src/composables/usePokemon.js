import { reactive, ref, toRefs } from 'vue';
import { BASE_URL } from './url';
import { useApi } from './useApi';

export function usePokemon() {
    const pokemonList = ref([]);
    const currentPokemon = ref(null);
    const state = reactive({
        listLoading: false,
        detailLoading: false,
        error: null
    });

    const { get } = useApi();

    /**
     * Mengambil detail Pokemon berdasarkan ID atau nama
     * @param {string|number} idOrName - ID atau nama Pokemon
     * @returns {Promise} - Data detail Pokemon
     */
    const getPokemonDetail = async (idOrName) => {
        if (!idOrName) {
            state.error = new Error('Pokemon ID atau nama diperlukan');
            return null;
        }

        state.detailLoading = true;
        state.error = null;

        try {
            const result = await get(`${BASE_URL}/pokemon/${idOrName}`);
            currentPokemon.value = result;
            return result;
        } catch (error) {
            state.error = error;
            console.error(`Error fetching Pokemon ${idOrName}:`, error);
            return null;
        } finally {
            state.detailLoading = false;
        }
    };

    /**
     * Mengambil daftar Pokemon dengan pagination
     * @param {Object} options - Opsi paginasi
     * @param {number} options.limit - Jumlah Pokemon per halaman
     * @param {number} options.offset - Offset untuk paginasi
     * @returns {Promise} - Data list Pokemon
     */
    const getListPokemon = async (options = { limit: 20, offset: 0 }) => {
        state.listLoading = true;
        state.error = null;

        try {
            const { limit = 20, offset = 0 } = options;
            const result = await get(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);

            // Tambahkan ID ke setiap Pokemon dari URL mereka
            if (result && result.results) {
                result.results = result.results.map((pokemon) => {
                    const urlParts = pokemon.url.split('/');
                    // Extract ID dari URL
                    const id = urlParts[urlParts.length - 2];
                    return {
                        ...pokemon,
                        id
                    };
                });

                pokemonList.value = result.results;
            }

            return result;
        } catch (error) {
            state.error = error;
            console.error('Error fetching Pokemon list:', error);
            return null;
        } finally {
            state.listLoading = false;
        }
    };

    return {
        ...toRefs(state),
        pokemonList,
        currentPokemon,
        getPokemonDetail,
        getListPokemon
    };
}
