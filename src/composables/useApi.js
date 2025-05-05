import { ref, reactive, toRefs } from 'vue';
import axios from 'axios';

export function useApi() {
    const data = ref(null);
    const state = reactive({
        loading: false,
        error: null
    });

    const fetchData = async (url, options = {}) => {
        state.loading = true;
        state.error = null;

        try {
            const response = await axios(url, options);
            data.value = response.data;
            return response.data;
        } catch (error) {
            state.error = error;
            console.error('API Error:', error);
            return null;
        } finally {
            state.loading = false;
        }
    };

    const post = (url, payload, options = {}) => {
        return fetchData(url, {
            method: 'POST',
            data: payload,
            ...options
        });
    };

    const get = (url, options = {}) => {
        return fetchData(url, {
            method: 'GET',
            ...options
        });
    };

    return {
        ...toRefs(state),
        data,
        fetchData,
        post,
        get
    };
}
